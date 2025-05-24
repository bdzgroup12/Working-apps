const express = require('express');
const router = express.Router();

// POST /api/contact - receive contact form submissions
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    // TODO: Save contact form data to database or send email notification
    console.log('Contact form submission:', { name, email, phone, message });
    res.status(200).json({ message: 'Contact form submitted successfully' });
  } catch (error) {
    console.error('Error processing contact form:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
