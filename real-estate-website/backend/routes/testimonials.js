const express = require('express');
const router = express.Router();

// GET /api/testimonials - list all user testimonials (mock implementation)
router.get('/', async (req, res) => {
  try {
    // TODO: Replace with real DB query
    const testimonials = [
      {
        id: 1,
        name: 'Maria Garcia',
        country: 'Spain',
        quote: 'Finding my dream home was so easy with this site!',
        image: '/mock/app14.jpg',
      },
      {
        id: 2,
        name: 'John Smith',
        country: 'USA',
        quote: 'Great selection of properties and helpful guides.',
        image: '/mock/app15.jpg',
      },
      {
        id: 3,
        name: 'Sofia Martinez',
        country: 'Mexico',
        quote: 'The agency partners were very professional and responsive.',
        image: '/mock/app13.jpg',
      },
    ];
    res.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
