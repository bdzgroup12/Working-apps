const express = require('express');
const router = express.Router();

// GET /api/regional-guides - list all regional guides (mock implementation)
router.get('/', async (req, res) => {
  try {
    // TODO: Replace with real DB query
    const guides = [
      {
        id: 1,
        region: 'Costa Brava',
        description: 'Beautiful beaches and charming villages.',
        image: '/mock/app5.jpg',
        link: '/guides/costa-brava'
      },
      {
        id: 2,
        region: 'Barcelona',
        description: 'Vibrant city life with rich culture.',
        image: '/mock/app6.jpg',
        link: '/guides/barcelona'
      },
      {
        id: 3,
        region: 'Andalusia',
        description: 'Historic towns and stunning countryside.',
        image: '/mock/app7.jpg',
        link: '/guides/andalusia'
      },
    ];
    res.json(guides);
  } catch (error) {
    console.error('Error fetching regional guides:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
