const express = require('express');
const router = express.Router();
const { verifyToken, getUserRoleAndId } = require('../middleware/auth');
const pool = require('../db');

// Use authentication for dashboard routes
router.use(verifyToken);

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Dashboard test endpoint',
    timestamp: new Date().toISOString()
  });
});

// Main dashboard endpoint
router.get('/', async (req, res) => {
  try {
    // Get user info from token
    const userId = req.userId;
    const role = req.userRole;
    
    // Get user's name from database
    const userQuery = await pool.query(
      'SELECT first_name, last_name FROM users WHERE id = $1',
      [userId]
    );
    
    let name = 'User';
    if (userQuery.rows.length > 0) {
      const user = userQuery.rows[0];
      name = `${user.first_name} ${user.last_name}`;
    }
    
    // Format role for display
    const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);
    const displayName = `${formattedRole} User`;

    // Return data with actual user role and name
    res.json({
      role,
      name,
      displayName,
      propertiesCount: 0,
      regionsCount: 10,
      agenciesCount: 0,
      leadsCount: 0,
      recentLeads: [],
      message: 'Simplified dashboard data while database is being set up'
    });
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;
