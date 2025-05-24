const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false }
});

// GET /api/properties - list all properties (mock implementation)
router.get('/', async (req, res) => {
  try {
    // TODO: Replace with real DB query
    const properties = [
      {
        id: 1,
        title: 'Beach House in Costa Brava',
        type: 'beach-house',
        price: 350000,
        description: 'Beautiful beach house with sea view.',
        image: '/mock/app2.jpg',
      },
      {
        id: 2,
        title: 'Apartment in Barcelona',
        type: 'apartment',
        price: 250000,
        description: 'Modern apartment in city center.',
        image: '/mock/app3.jpg',
      },
      {
        id: 3,
        title: 'Country Home in Andalusia',
        type: 'country-home',
        price: 450000,
        description: 'Spacious country home with garden.',
        image: '/mock/app4.jpg',
      },
    ];
    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to check listing limits based on user role
const checkListingLimit = async (req, res, next) => {
  const { userId, userRole } = req.body; // Assuming userId and userRole are sent in request body or extracted from auth token

  if (!userId || !userRole) {
    return res.status(400).json({ error: 'Missing user information' });
  }

  try {
    if (userRole === 'admin') {
      // Admin has no limit
      return next();
    }

    // Get current listing count for user
    const result = await pool.query('SELECT COUNT(*) FROM listings WHERE user_id = $1', [userId]);
    const count = parseInt(result.rows[0].count, 10);

    if (userRole === 'client' && count >= 3) {
      return res.status(403).json({ error: 'Clients can only have up to 3 listings' });
    }

    if (userRole === 'agency' && count >= 150) {
      return res.status(403).json({ error: 'Agencies can only have up to 150 listings' });
    }

    next();
  } catch (error) {
    console.error('Error checking listing limit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/properties - create a new property listing
router.post('/', checkListingLimit, async (req, res) => {
  const { userId, title, description, price, address, city, state, zipCode } = req.body;

  if (!userId || !title) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO listings (user_id, title, description, price, address, city, state, zip_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [userId, title, description, price, address, city, state, zipCode]
    );

    res.status(201).json({ message: 'Listing created successfully', listing: result.rows[0] });
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
