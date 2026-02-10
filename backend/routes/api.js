const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ContactController = require('../controllers/contactController');
const Project = require('../models/Project');

/**
 * Validation middleware for contact form
 */
const contactValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').escape(),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('message').trim().notEmpty().withMessage('Message is required').escape(),
  body('phone').optional({ checkFalsy: true }).trim().escape(),
  body('company').optional({ checkFalsy: true }).trim().escape(),
  body('subject').optional({ checkFalsy: true }).trim().escape()
];

/**
 * PUBLIC: Submit contact form - NOW WITH EMAIL SUPPORT
 */
router.post('/contact', contactValidation, ContactController.submitContactForm);

/**
 * PUBLIC: Get all projects
 */
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find({ status: 'active' })
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(20);
    
    // If no projects in DB, return default ones
    if (!projects || projects.length === 0) {
      return res.json({
        success: true,
        count: 1,
        data: [
          {
            id: 1,
            title: "Kheir W Barke",
            description: "AI-powered supermarket management system with intelligent automation and GPS tracking.",
            technologies: ["AI/ML", "Node.js", "Python", "React", "MongoDB"],
            features: ["AI inventory management", "GPS tracking", "Automated checkout"],
            startDate: "2025-09-01",
            endDate: "Present",
            status: "active",
            githubUrl: "https://github.com/andyters/kheir-w-barke",
            liveUrl: "#",
            imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            featured: true,
            views: 1250
          }
        ]
      });
    }
    
    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    // Fallback static data
    res.json({
      success: true,
      count: 1,
      data: [
        {
          id: 1,
          title: "Kheir W Barke",
          description: "AI-powered supermarket management system with intelligent automation and GPS tracking.",
          technologies: ["AI/ML", "Node.js", "Python", "React", "MongoDB"],
          features: ["AI inventory management", "GPS tracking", "Automated checkout"],
          startDate: "2025-09-01",
          endDate: "Present",
          status: "active",
          githubUrl: "https://github.com/andyters/kheir-w-barke",
          liveUrl: "#",
          imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          featured: true,
          views: 1250
        }
      ]
    });
  }
});

/**
 * PUBLIC: Get all skills
 */
router.get('/skills', async (req, res) => {
  const skills = [
    { name: "Blender", category: "3D Design", level: 90, icon: "fas fa-cube" },
    { name: "Godot", category: "Game Development", level: 85, icon: "fas fa-gamepad" },
    { name: "Unity", category: "Game Development", level: 80, icon: "fab fa-unity" },
    { name: "C#", category: "Programming", level: 88, icon: "fas fa-code" },
    { name: "Python", category: "Programming", level: 92, icon: "fab fa-python" },
    { name: "JavaScript", category: "Programming", level: 90, icon: "fab fa-js" },
    { name: "HTML/CSS", category: "Frontend", level: 95, icon: "fab fa-html5" },
    { name: "Node.js", category: "Backend", level: 90, icon: "fab fa-node-js" },
    { name: "Express.js", category: "Backend", level: 88, icon: "fas fa-server" },
    { name: "AI/ML", category: "CS & AI", level: 87, icon: "fas fa-brain" },
    { name: "Database Design", category: "Database", level: 89, icon: "fas fa-database" },
    { name: "MongoDB", category: "Database", level: 88, icon: "fas fa-leaf" }
  ];
  
  res.json({ 
    success: true, 
    count: skills.length, 
    data: skills 
  });
});

/**
 * PUBLIC: Health check
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    emailEnabled: process.env.EMAIL_ENABLED === 'true'
  });
});

/**
 * PUBLIC: Get statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const Contact = require('../models/Contact');
    const projectCount = await Project.countDocuments({ status: 'active' });
    const contactCount = await Contact.countDocuments();
    
    res.json({
      success: true,
      data: {
        projects: projectCount || 4,
        contacts: contactCount || 0,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.json({
      success: true,
      data: {
        projects: 4,
        contacts: 0,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      }
    });
  }
});

module.exports = router;