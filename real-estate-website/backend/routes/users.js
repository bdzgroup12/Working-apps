const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { sendVerificationEmail } = require('../services/emailService');
const crypto = require('crypto');
const { verifyToken } = require('../middleware/auth');
const { processImage, isValidImage } = require('../services/imageService');

const connectionString = process.env.DATABASE_URL;
const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false }
});

const secretKey = process.env.JWT_SECRET || 'your-secret-key';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

// Register endpoint
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, accountType, agencyId, adminApproved, isVerified } = req.body;

  try {
    // Check if user already exists
    const userExists = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Validate account type
    if (!['admin', 'client', 'agency'].includes(accountType)) {
      return res.status(400).json({ error: 'Invalid account type' });
    }

    // If client selected an agency, verify it exists
    if (accountType === 'client' && agencyId && agencyId !== 'none') {
      const agencyExists = await pool.query(
        'SELECT id FROM agencies WHERE id = $1',
        [agencyId]
      );
      if (agencyExists.rows.length === 0) {
        return res.status(400).json({ error: 'Selected agency does not exist' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get email verification setting
    const { emailVerificationEnabled } = require('./settings').settings;

    // Generate verification token only if email verification is enabled
    const verificationToken = emailVerificationEnabled ? crypto.randomBytes(32).toString('hex') : null;
    const tokenExpiry = emailVerificationEnabled ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null; // 24 hours

    // Start a transaction
    await pool.query('BEGIN');

    // Create user
    const query = `
      INSERT INTO users (
        first_name, 
        last_name, 
        email, 
        password, 
        account_type,
        agency_id,
        verification_token,
        token_expiry,
        admin_approved,
        is_verified
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, email, account_type
    `;

    const values = [
      firstName,
      lastName,
      email,
      hashedPassword,
      accountType,
      accountType === 'client' && agencyId !== 'none' ? agencyId : null,
      verificationToken,
      tokenExpiry,
      accountType === 'client', // Only clients are auto-approved
      accountType === 'client' && !emailVerificationEnabled // Only clients can be auto-verified
    ];

    const result = await pool.query(query, values);
    const user = result.rows[0];

    // If user is registering as an agency, create the agency entry
    if (accountType === 'agency') {
      const agencyQuery = `
        INSERT INTO agencies (
          name, 
          email,
          user_id,
          description,
          contact_email,
          contact_phone
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;
      const agencyValues = [
        `${firstName} ${lastName}'s Agency`, // Default agency name
        email,
        user.id,
        'New Real Estate Agency', // Default description
        email, // Use registration email as contact email
        '' // Empty contact phone by default
      ];
      await pool.query(agencyQuery, agencyValues);
    }

    // Commit transaction
    await pool.query('COMMIT');

    // Send verification email if enabled and user is not an agency
    if (emailVerificationEnabled && accountType !== 'agency') {
      const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}&id=${user.id}`;
      await sendVerificationEmail(email, verificationUrl);
      
      res.status(201).json({
        message: 'Registration successful. Please check your email to verify your account.',
        userId: user.id
      });
    } else if (accountType === 'agency') {
      res.status(201).json({
        message: 'Registration successful. Please wait for admin approval before you can log in.',
        userId: user.id
      });
    } else {
      res.status(201).json({
        message: 'Registration successful. You can now log in.',
        userId: user.id
      });
    }
  } catch (error) {
    // Rollback transaction in case of error
    await pool.query('ROLLBACK');
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Error registering user' });
  }
});

// Get user's email by ID (for verification resend)
router.get('/get-email', async (req, res) => {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  try {
    const result = await pool.query(
      'SELECT email FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ email: result.rows[0].email });
  } catch (error) {
    console.error('Error getting email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify email endpoint
router.get('/verify-email', async (req, res) => {
  const { token, id } = req.query;
  
  if (!token || !id) {
    return res.status(400).json({ error: 'Missing verification parameters' });
  }

  try {
    // Get user by id and verify token
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1 AND verification_token = $2',
      [id, token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    const user = result.rows[0];

    // Check if token is expired
    if (new Date() > new Date(user.token_expiry)) {
      return res.status(400).json({ error: 'Verification token expired' });
    }

    // Update user to verified
    await pool.query(
      'UPDATE users SET is_verified = true, verification_token = NULL, token_expiry = NULL WHERE id = $1',
      [id]
    );

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  try {
    // Find user by email
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Skip verification check for admin users
    if (user.account_type !== 'admin') {
      // Check if email is verified
      if (user.is_verified === false) {
        return res.status(403).json({ 
          error: 'Email not verified',
          needsVerification: true,
          userId: user.id
        });
      }
      
      // Check if admin approval is required for non-admin users
      // The admin must manually approve clients/agencies after they've verified their email
      if (!user.admin_approved) {
        return res.status(403).json({
          error: 'Your account is pending admin approval',
          awaitingApproval: true,
          userId: user.id
        });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.account_type },
      secretKey,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Login successful', token, user: { id: user.id, email: user.email, role: user.account_type } });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh token endpoint
router.post('/refresh-token', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Find user by ID
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Generate new JWT token
    const token = jwt.sign(
      { id: user.id, role: user.account_type },
      secretKey,
      { expiresIn: '1h' }
    );

    res.json({ 
      message: 'Token refreshed successfully', 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.account_type 
      } 
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Check if user exists
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Check if already verified
    if (user.is_verified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // Token expires in 24 hours

    // Update user with new token
    await pool.query(
      'UPDATE users SET verification_token = $1, token_expiry = $2 WHERE id = $3',
      [verificationToken, tokenExpiry, user.id]
    );

    // Send verification email
    await sendVerificationEmail(email, verificationToken, user.id);

    res.json({ message: 'Verification email resent. Please check your inbox.' });
  } catch (error) {
    console.error('Error resending verification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin approval endpoints
// List users pending approval (admin only)
router.get('/pending-approval', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const result = await pool.query(
      'SELECT id, first_name, last_name, email, account_type, is_verified, created_at FROM users WHERE is_verified = true AND admin_approved = false AND account_type != $1',
      ['admin']
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve a user (admin only)
router.post('/approve/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const result = await pool.query(
      'UPDATE users SET admin_approved = true WHERE id = $1 RETURNING id, email, account_type',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User approved successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Manual verification by admin (can bypass email verification)
router.post('/admin-verify/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const result = await pool.query(
      'UPDATE users SET is_verified = true, verification_token = NULL, token_expiry = NULL WHERE id = $1 RETURNING id, email, account_type',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User verified successfully by admin', user: result.rows[0] });
  } catch (error) {
    console.error('Error verifying user by admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin user management endpoints
// Get all users (admin sees all, agency sees only their clients)
router.get('/all', verifyToken, async (req, res) => {
  try {
    // Only admin and agency roles can access user management
    if (req.userRole !== 'admin' && req.userRole !== 'agency') {
      return res.status(403).json({ error: 'Access denied. Admin or Agency only.' });
    }

    let result;
    if (req.userRole === 'admin') {
      // Admin can see all users
      result = await pool.query(
        'SELECT u.id, u.first_name, u.last_name, u.email, u.account_type, u.is_verified, u.admin_approved, u.created_at, ' +
        'a.first_name as agency_first_name, a.last_name as agency_last_name ' +
        'FROM users u ' +
        'LEFT JOIN users a ON u.agency_id = a.id ' +
        'ORDER BY u.created_at DESC'
      );
    } else {
      // Agency can only see their own clients
      result = await pool.query(
        'SELECT id, first_name, last_name, email, account_type, is_verified, admin_approved, created_at ' +
        'FROM users WHERE agency_id = $1 AND account_type = $2 ORDER BY created_at DESC',
        [req.userId, 'client']
      );
    }

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new user (admin can create any user, agency can only create clients)
router.post('/create', verifyToken, async (req, res) => {
  try {
    // Only admin and agency roles can create users
    if (req.userRole !== 'admin' && req.userRole !== 'agency') {
      return res.status(403).json({ error: 'Access denied. Admin or Agency only.' });
    }

    const { firstName, lastName, email, password, accountType } = req.body;
    
    if (!firstName || !lastName || !email || !password || !accountType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Normalize account type
    const normalizedAccountType = accountType.toLowerCase();
    
    // Validate account type
    const validRoles = ['admin', 'client', 'agency'];
    if (!validRoles.includes(normalizedAccountType)) {
      return res.status(400).json({ error: 'Invalid account type' });
    }

    // Check permissions based on role
    if (req.userRole === 'agency' && normalizedAccountType !== 'client') {
      return res.status(403).json({ error: 'Agencies can only create client accounts' });
    }

    // Check if user already exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Set agency_id for clients created by agencies
    const agencyId = req.userRole === 'agency' ? req.userId : null;

    // Users created by admin or agency are automatically verified and approved
    const query = `
      INSERT INTO users (
        first_name, last_name, email, password, account_type, 
        is_verified, admin_approved, agency_id
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING id, email, account_type, agency_id`;

    const values = [
      firstName,
      lastName,
      email,
      hashedPassword,
      normalizedAccountType,
      true, // is_verified
      true, // admin_approved
      agencyId
    ];

    const newUser = await pool.query(query, values);

    res.status(201).json({ 
      message: 'User created successfully',
      user: newUser.rows[0] 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, first_name, last_name, email, account_type, address, zip_code, phone_number, ' +
      'whatsapp, teams, telegram, discord, bio, profile_image ' +
      'FROM users WHERE id = $1',
      [req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile - ALL USERS CAN ACCESS THIS ROUTE
router.put('/profile', verifyToken, async (req, res) => {
  try {
    console.log('Profile update request received');
    console.log('User role:', req.userRole);
    console.log('User ID:', req.userId);
    console.log('Request body:', req.body);
    console.log('Files attached:', req.files ? Object.keys(req.files) : 'none');
    
    const { 
      firstName, lastName, address, zipCode, phoneNumber, 
      whatsapp, teams, telegram, discord, bio 
    } = req.body;
    
    console.log('Received fields:', req.body);
    
    // Validate required fields
    if (!firstName || !lastName || !address || !zipCode || !phoneNumber) {
      console.log('Missing required fields');
      console.log('firstName:', firstName);
      console.log('lastName:', lastName);
      console.log('address:', address);
      console.log('zipCode:', zipCode);
      console.log('phoneNumber:', phoneNumber);
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Prepare update fields and values
    const updates = [];
    const values = [];
    let paramCount = 1;

    // Add required fields
    updates.push(`first_name = $${paramCount}`);
    values.push(firstName);
    paramCount++;

    updates.push(`last_name = $${paramCount}`);
    values.push(lastName);
    paramCount++;

    updates.push(`address = $${paramCount}`);
    values.push(address);
    paramCount++;

    updates.push(`zip_code = $${paramCount}`);
    values.push(zipCode);
    paramCount++;

    updates.push(`phone_number = $${paramCount}`);
    values.push(phoneNumber);
    paramCount++;

    // Add optional fields
    if (whatsapp !== undefined) {
      updates.push(`whatsapp = $${paramCount}`);
      values.push(whatsapp);
      paramCount++;
    }

    if (teams !== undefined) {
      updates.push(`teams = $${paramCount}`);
      values.push(teams);
      paramCount++;
    }

    if (telegram !== undefined) {
      updates.push(`telegram = $${paramCount}`);
      values.push(telegram);
      paramCount++;
    }

    if (discord !== undefined) {
      updates.push(`discord = $${paramCount}`);
      values.push(discord);
      paramCount++;
    }

    if (bio !== undefined) {
      updates.push(`bio = $${paramCount}`);
      values.push(bio);
      paramCount++;
    }

    // Handle profile image upload if it exists
    if (req.files && req.files.profileImage) {
      console.log('Processing profile image');
      const profileImage = req.files.profileImage;
      
      // Validate image type
      if (!isValidImage(profileImage)) {
        console.log('Invalid image type');
        return res.status(400).json({ error: 'Invalid file type. Please upload a valid image.' });
      }
      
      try {
        // Process image and get paths
        const imagePaths = await processImage(profileImage);
        
        // Store the original image path in the database
        updates.push(`profile_image = $${paramCount}`);
        values.push(imagePaths.original);
        paramCount++;
        
        // Store the thumbnail path for front-end use
        updates.push(`profile_thumbnail = $${paramCount}`);
        values.push(imagePaths.thumbnail);
        paramCount++;
        
        // Store the dashboard (small) thumbnail
        updates.push(`profile_dashboard = $${paramCount}`);
        values.push(imagePaths.dashboard);
        paramCount++;
        
        console.log('Image processed successfully');
      } catch (imageError) {
        console.error('Error processing image:', imageError);
        return res.status(500).json({ error: 'Error processing image' });
      }
    }
    
    // Add user ID to values
    values.push(req.userId);
    
    // Execute update query
    const query = `
      UPDATE users 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${paramCount} 
      RETURNING id, first_name, last_name, email, account_type, profile_image, profile_thumbnail, profile_dashboard`;
    
    console.log('Executing update query for user ID:', req.userId);
    console.log('SQL Query:', query);
    console.log('SQL Values:', values);
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      console.log('User not found');
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('Profile updated successfully for user ID:', req.userId);
    res.json({ 
      message: 'Profile updated successfully',
      user: result.rows[0] 
    });
    
  } catch (error) {
    console.error('Error updating profile:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test route to check user roles and permissions
router.get('/test-role', verifyToken, async (req, res) => {
  try {
    console.log('Test role route accessed');
    console.log('User ID:', req.userId);
    console.log('User role:', req.userRole);
    
    // Simple response to confirm user has access
    res.json({
      success: true,
      message: 'Role test successful',
      userId: req.userId,
      userRole: req.userRole,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in test role endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user (admin can update any user, agency can only update their clients)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    console.log('⚠️ User ID update route accessed');
    console.log('⚠️ URL params ID:', req.params.id);
    console.log('⚠️ User role:', req.userRole);
    console.log('⚠️ User ID from token:', req.userId);
    console.log('⚠️ Request body:', req.body);
    
    // Only admin and agency roles can update users
    if (req.userRole !== 'admin' && req.userRole !== 'agency') {
      console.log('⚠️ Access denied - not admin or agency');
      return res.status(403).json({ error: 'Access denied. Admin or Agency only.' });
    }

    const { id } = req.params;
    const { firstName, lastName, email, accountType, isVerified, adminApproved } = req.body;
    
    // Check permissions for agency users
    if (req.userRole === 'agency') {
      // Check if the user being updated is a client of this agency
      const clientCheck = await pool.query(
        'SELECT * FROM users WHERE id = $1 AND agency_id = $2 AND account_type = $3',
        [id, req.userId, 'client']
      );
      
      if (clientCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied. You can only update your own clients.' });
      }
      
      // Agencies cannot change account types
      if (accountType && accountType !== 'client') {
        return res.status(403).json({ error: 'Agencies cannot change account types' });
      }
    }
    
    // Prepare update fields and values
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (firstName !== undefined) {
      updates.push(`first_name = $${paramCount}`);
      values.push(firstName);
      paramCount++;
    }
    
    if (lastName !== undefined) {
      updates.push(`last_name = $${paramCount}`);
      values.push(lastName);
      paramCount++;
    }
    
    if (email !== undefined) {
      updates.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }
    
    // Only admin can update account type
    if (accountType !== undefined && req.userRole === 'admin') {
      updates.push(`account_type = $${paramCount}`);
      values.push(accountType.toLowerCase());
      paramCount++;
    }
    
    // Only admin can update verification status
    if (isVerified !== undefined && req.userRole === 'admin') {
      updates.push(`is_verified = $${paramCount}`);
      values.push(isVerified);
      paramCount++;
    }
    
    // Only admin can update approval status
    if (adminApproved !== undefined && req.userRole === 'admin') {
      updates.push(`admin_approved = $${paramCount}`);
      values.push(adminApproved);
      paramCount++;
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(id);
    const query = `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING id, first_name, last_name, email, account_type, is_verified, admin_approved, agency_id`;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      message: 'User updated successfully',
      user: result.rows[0] 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (admin can delete any user, agency can only delete their clients)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    // Only admin and agency roles can delete users
    if (req.userRole !== 'admin' && req.userRole !== 'agency') {
      return res.status(403).json({ error: 'Access denied. Admin or Agency only.' });
    }

    const { id } = req.params;
    
    // Check permissions for agency users
    if (req.userRole === 'agency') {
      // Check if the user being deleted is a client of this agency
      const clientCheck = await pool.query(
        'SELECT * FROM users WHERE id = $1 AND agency_id = $2 AND account_type = $3',
        [id, req.userId, 'client']
      );
      
      if (clientCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied. You can only delete your own clients.' });
      }
    } else {
      // Admin-specific checks
      
      // Check if user exists
      const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      if (userCheck.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Don't allow deleting the last admin user
      if (userCheck.rows[0].account_type === 'admin') {
        const adminCount = await pool.query('SELECT COUNT(*) FROM users WHERE account_type = $1', ['admin']);
        if (parseInt(adminCount.rows[0].count) <= 1) {
          return res.status(400).json({ error: 'Cannot delete the last admin user' });
        }
      }
    }
    
    // Delete the user
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle user approval status (admin only)
router.put('/toggle-approval/:id', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const { id } = req.params;
    
    // Get current approval status
    const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const currentApprovalStatus = userCheck.rows[0].admin_approved;
    const newApprovalStatus = !currentApprovalStatus;
    
    const result = await pool.query(
      'UPDATE users SET admin_approved = $1 WHERE id = $2 RETURNING id, first_name, last_name, email, account_type, is_verified, admin_approved',
      [newApprovalStatus, id]
    );
    
    res.json({ 
      message: newApprovalStatus ? 'User approved successfully' : 'User approval revoked',
      user: result.rows[0] 
    });
  } catch (error) {
    console.error('Error toggling user approval:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
