const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');

// Get all agencies
router.get('/', verifyToken, async (req, res) => {
  try {
    const query = `
      SELECT a.*, u.email, u.first_name, u.last_name 
      FROM agencies a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.name ASC
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching agencies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get agency by ID with its clients
router.get('/:id/clients', verifyToken, async (req, res) => {
  try {
    // First check if user is admin or the agency owner
    const agencyQuery = 'SELECT user_id FROM agencies WHERE id = $1';
    const { rows: [agency] } = await pool.query(agencyQuery, [req.params.id]);
    
    if (!agency) {
      return res.status(404).json({ error: 'Agency not found' });
    }

    if (req.userRole !== 'admin' && req.userId !== agency.user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get agency clients
    const clientsQuery = `
      SELECT u.id, u.first_name, u.last_name, u.email, u.created_at
      FROM users u
      WHERE u.agency_id = $1 AND u.account_type = 'client'
      ORDER BY u.created_at DESC
    `;
    const { rows: clients } = await pool.query(clientsQuery, [req.params.id]);
    
    res.json(clients);
  } catch (error) {
    console.error('Error fetching agency clients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new agency (automatically created when a user registers as agency)
router.post('/', verifyToken, async (req, res) => {
  const { name, description, logo_url, contact_email, contact_phone } = req.body;

  // Check if user is registering as an agency
  if (req.userRole !== 'agency') {
    return res.status(403).json({ error: 'Only agency accounts can create agencies' });
  }

  // Check if user already has an agency
  const checkQuery = 'SELECT id FROM agencies WHERE user_id = $1';
  const { rows: existing } = await pool.query(checkQuery, [req.userId]);
  if (existing.length > 0) {
    return res.status(400).json({ error: 'User already has an agency' });
  }

  try {
    const query = `
      INSERT INTO agencies (name, description, logo_url, contact_email, contact_phone, user_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [name, description, logo_url, contact_email, contact_phone, req.userId];
    const { rows: [agency] } = await pool.query(query, values);
    res.status(201).json(agency);
  } catch (error) {
    console.error('Error creating agency:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update agency
router.put('/:id', verifyToken, async (req, res) => {
  const { name, description, logo_url, contact_email, contact_phone } = req.body;
  
  try {
    // Check if user is admin or agency owner
    const agencyQuery = 'SELECT user_id FROM agencies WHERE id = $1';
    const { rows: [agency] } = await pool.query(agencyQuery, [req.params.id]);
    
    if (!agency) {
      return res.status(404).json({ error: 'Agency not found' });
    }

    if (req.userRole !== 'admin' && req.userId !== agency.user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const query = `
      UPDATE agencies 
      SET name = $1, description = $2, logo_url = $3, contact_email = $4, contact_phone = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;
    const values = [name, description, logo_url, contact_email, contact_phone, req.params.id];
    const { rows: [updatedAgency] } = await pool.query(query, values);
    res.json(updatedAgency);
  } catch (error) {
    console.error('Error updating agency:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete agency
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    // Only admin can delete agencies
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admin can delete agencies' });
    }

    // First update all clients of this agency to have no agency
    await pool.query('UPDATE users SET agency_id = NULL WHERE agency_id = $1', [req.params.id]);
    
    // Then delete the agency
    const query = 'DELETE FROM agencies WHERE id = $1 RETURNING *';
    const { rows: [deletedAgency] } = await pool.query(query, [req.params.id]);
    
    if (!deletedAgency) {
      return res.status(404).json({ error: 'Agency not found' });
    }
    
    res.json({ message: 'Agency deleted successfully' });
  } catch (error) {
    console.error('Error deleting agency:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
