// routes/api.js
const express = require('express');
const router = express.Router();
const ContactController = require('../controllers/contactController');
const Contact = require('../models/Contact');
const Project = require('../models/Project');

// Public config endpoint
router.get('/config', (req, res) => {
  res.json({
    allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [],
    logRequests: process.env.LOG_REQUESTS === 'true',
  });
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    email: process.env.EMAIL_ENABLED === 'true' ? 'enabled' : 'disabled'
  });
});

// Contact form (uses your controller)
router.post('/contact', ContactController.submitContactForm);

// Example: get projects
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find({ status: 'active' }).sort({ displayOrder: 1 });
    res.json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Example: get skills (you may want to create a Skill model)
router.get('/skills', (req, res) => {
  // You can return static skills or fetch from DB
  res.json({ success: true, data: [] });
});

// Database status (optional)
router.get('/db/status', (req, res) => {
  const db = require('../config/database'); // import your database instance
  res.json({ success: true, data: db.getStatus() });
});

module.exports = router;