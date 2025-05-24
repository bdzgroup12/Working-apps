const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

// Global settings state (in production this would be in a database)
let settings = {
  emailVerificationEnabled: true
};

// Get settings
router.get('/', verifyToken, async (req, res) => {
  try {
    // Only admin can access settings
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update email verification setting
router.put('/email-verification', verifyToken, async (req, res) => {
  try {
    // Only admin can update settings
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const { enabled } = req.body;
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'Invalid value for enabled' });
    }

    settings.emailVerificationEnabled = enabled;
    
    res.json({ 
      message: 'Settings updated successfully',
      emailVerificationEnabled: settings.emailVerificationEnabled 
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 