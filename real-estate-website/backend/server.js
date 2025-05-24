const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const fileUpload = require('express-fileupload');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: '*',  // Allow all origins for testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(bodyParser.json());

// File upload middleware
app.use(fileUpload({
  createParentPath: true,
  limits: { 
    fileSize: 2 * 1024 * 1024 // 2MB max file size
  },
}));

// Static files for uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

const connectionString = process.env.DATABASE_URL;

const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false }
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
  } else {
    console.log('Connected to PostgreSQL database');
    release();
  }
});

// Basic route
app.get('/', (req, res) => {
  res.send('Real Estate Backend API is running');
});

// Test endpoint that doesn't use models
app.get('/api/test', (req, res) => {
  try {
    // Just return some static data
    res.json({ 
      success: true, 
      message: 'API test endpoint is working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ error: 'Test endpoint failed' });
  }
});

// Simple health check endpoint with no auth
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

// Settings routes
const settingsRouter = require('./routes/settings');
app.use('/api/settings', settingsRouter);

// Properties routes
const propertiesRouter = require('./routes/properties');
app.use('/api/properties', propertiesRouter);

// Dashboard routes
const dashboardRouter = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRouter);

// Regional guides routes
const regionalGuidesRouter = require('./routes/regionalGuides');
app.use('/api/regional-guides', regionalGuidesRouter);

// Agencies routes
const agenciesRouter = require('./routes/agencies');
app.use('/api/agencies', agenciesRouter);

// News routes
const newsRouter = require('./routes/news');
app.use('/api/news', newsRouter);

// Testimonials routes
const testimonialsRouter = require('./routes/testimonials');
app.use('/api/testimonials', testimonialsRouter);

// Contact routes
const contactRouter = require('./routes/contact');
app.use('/api/contact', contactRouter);

// Users routes
const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);

// Regions routes
const regionsRouter = require('./routes/regions');
app.use('/api/regions', regionsRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
