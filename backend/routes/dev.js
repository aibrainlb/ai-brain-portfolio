const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

/**
 * Development-only routes for testing
 */
if (process.env.NODE_ENV === 'development' && process.env.ENABLE_DEV_ROUTES === 'true') {
  
  console.log('🔧 Development routes enabled at /api/dev');
  
  /**
   * Clear all contacts
   */
  router.delete('/contacts', async (req, res) => {
    try {
      const result = await Contact.deleteMany({});
      console.log(`🗑️  Cleared ${result.deletedCount} contacts`);
      
      res.json({
        success: true,
        message: `Cleared ${result.deletedCount} contacts`,
        deletedCount: result.deletedCount
      });
    } catch (error) {
      console.error('Error clearing contacts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear contacts'
      });
    }
  });
  
  /**
   * Get all contacts with details
   */
  router.get('/contacts/all', async (req, res) => {
    try {
      const contacts = await Contact.find()
        .sort({ createdAt: -1 })
        .limit(50);
      
      res.json({
        success: true,
        count: contacts.length,
        data: contacts
      });
    } catch (error) {
      console.error('Error getting contacts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get contacts'
      });
    }
  });
  
  /**
   * Create test contact
   */
  router.post('/test-contact', async (req, res) => {
    try {
      const { name = 'Test User', email = `test${Date.now()}@example.com` } = req.body;
      
      const contact = new Contact({
        name,
        email,
        message: 'This is a test message from the development endpoint.',
        phone: '+1234567890',
        company: 'Test Company',
        ipAddress: '127.0.0.1',
        userAgent: 'Dev-Test/1.0'
      });
      
      await contact.save();
      
      res.json({
        success: true,
        message: 'Test contact created',
        data: contact
      });
    } catch (error) {
      console.error('Error creating test contact:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create test contact'
      });
    }
  });
  
  /**
   * Check submission rate for IP/email
   */
  router.get('/check-rate', async (req, res) => {
    try {
      const { email, ip = '127.0.0.1', minutes = 5 } = req.query;
      
      const timeAgo = new Date(Date.now() - minutes * 60 * 1000);
      
      const submissions = await Contact.find({
        $or: [
          { email: email?.toLowerCase(), createdAt: { $gt: timeAgo } },
          { ipAddress: ip, createdAt: { $gt: timeAgo } }
        ]
      }).sort({ createdAt: -1 });
      
      res.json({
        success: true,
        count: submissions.length,
        timeWindow: `${minutes} minutes`,
        email: email,
        ip: ip,
        data: submissions.map(s => ({
          id: s._id,
          email: s.email,
          createdAt: s.createdAt,
          message: s.message.substring(0, 50) + '...'
        }))
      });
    } catch (error) {
      console.error('Error checking rate:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check rate'
      });
    }
  });
  
  /**
   * Simulate email sending
   */
  router.post('/simulate-email', async (req, res) => {
    const { to, subject, type = 'confirmation' } = req.body;
    
    console.log('📧 Simulating email:', { to, subject, type });
    
    setTimeout(() => {
      res.json({
        success: true,
        message: 'Email simulated (not actually sent)',
        simulatedData: {
          to,
          subject,
          type,
          timestamp: new Date().toISOString(),
          messageId: `sim-${Date.now()}`
        }
      });
    }, 500);
  });
  
  /**
   * Get database stats
   */
  router.get('/db-stats', async (req, res) => {
    try {
      const stats = await Contact.getStats();
      
      res.json({
        success: true,
        data: stats,
        collections: await mongoose.connection.db.listCollections().toArray()
      });
    } catch (error) {
      console.error('Error getting DB stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get DB stats'
      });
    }
  });
  
  /**
   * Reset contact form testing
   */
  router.post('/reset-testing', async (req, res) => {
    try {
      // Delete test submissions from last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const result = await Contact.deleteMany({
        $or: [
          { email: /test@example.com/i },
          { email: /test\d+@example.com/i },
          { createdAt: { $gt: oneHourAgo } }
        ]
      });
      
      console.log(`🔄 Reset testing: deleted ${result.deletedCount} records`);
      
      res.json({
        success: true,
        message: 'Testing reset complete',
        deletedCount: result.deletedCount
      });
    } catch (error) {
      console.error('Error resetting testing:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset testing'
      });
    }
  });
}

module.exports = router;