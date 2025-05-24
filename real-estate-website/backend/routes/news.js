const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false }
});

// GET /api/news - list all news articles (mock implementation)
router.get('/', async (req, res) => {
  try {
    // TODO: Replace with real DB query
    const articles = [
      {
        id: 1,
        title: 'Real Estate Market Trends 2024',
        category: 'Market',
        summary: 'An overview of the latest trends in the real estate market.',
        image: '/mock/app11.jpg',
        link: '/news/market-trends-2024'
      },
      {
        id: 2,
        title: 'Tips for First-Time Home Buyers',
        category: 'Buying Tips',
        summary: 'Essential advice for those buying their first home.',
        image: '/mock/app12.jpg',
        link: '/news/first-time-buyers'
      },
      {
        id: 3,
        title: 'Renovation Ideas to Increase Property Value',
        category: 'Renovation',
        summary: 'Creative renovation ideas to boost your property’s value.',
        image: '/mock/app13.jpg',
        link: '/news/renovation-ideas'
      },
    ];
    res.json(articles);
  } catch (error) {
    console.error('Error fetching news articles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to check admin role
const checkAdmin = (req, res, next) => {
  const { userRole } = req.body; // Assuming userRole is sent in request body or extracted from auth token

  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }

  next();
};

// POST /api/news - create a news article (admin only)
router.post('/', checkAdmin, async (req, res) => {
  const { title, content, authorId } = req.body;

  if (!title || !content || !authorId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO news (title, content, author_id) VALUES ($1, $2, $3) RETURNING *',
      [title, content, authorId]
    );

    res.status(201).json({ message: 'News article created successfully', article: result.rows[0] });
  } catch (error) {
    console.error('Error creating news article:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/news/:id - update a news article (admin only)
router.put('/:id', checkAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await pool.query(
      'UPDATE news SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [title, content, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'News article not found' });
    }

    res.json({ message: 'News article updated successfully', article: result.rows[0] });
  } catch (error) {
    console.error('Error updating news article:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/news/:id - delete a news article (admin only)
router.delete('/:id', checkAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM news WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'News article not found' });
    }

    res.json({ message: 'News article deleted successfully' });
  } catch (error) {
    console.error('Error deleting news article:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
