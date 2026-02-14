const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB error:', err.message);
  }
};

// Contact Schema
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, default: 'Portfolio Inquiry' },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  ipAddress: String,
  userAgent: String
});

const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

// Email transporter
let transporter = null;
if (process.env.EMAIL_ENABLED === 'true') {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
}

// Routes
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'AI Brain Portfolio API',
    version: '3.0.0',
    endpoints: [
      'GET /api/health',
      'POST /api/contact'
    ]
  });
});

app.get('/api/health', async (req, res) => {
  await connectDB();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongodb: isConnected ? 'connected' : 'disconnected',
    email: process.env.EMAIL_ENABLED === 'true' ? 'enabled' : 'disabled'
  });
});

app.post('/api/contact', async (req, res) => {
  try {
    await connectDB();
    
    const { name, email, subject, message } = req.body;
    
    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message'
      });
    }
    
    // Save to database
    const contact = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject || 'Portfolio Inquiry',
      message: message.trim(),
      ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    });
    
    await contact.save();
    console.log(`✅ Contact saved: ${contact._id}`);
    
    // Send email notification
    let emailSent = false;
    if (transporter && process.env.EMAIL_ENABLED === 'true') {
      try {
        const mailOptions = {
          from: process.env.EMAIL_FROM,
          to: process.env.ADMIN_EMAIL,
          subject: `📬 New Contact: ${name} - ${subject || 'Portfolio Inquiry'}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject || 'Portfolio Inquiry'}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
            <hr>
            <p><small>ID: ${contact._id}</small></p>
          `
        };
        
        await transporter.sendMail(mailOptions);
        emailSent = true;
        console.log('✅ Email sent');
      } catch (emailError) {
        console.error('❌ Email error:', emailError.message);
      }
    }
    
    res.json({
      success: true,
      message: 'Thank you for reaching out! I will get back to you soon.',
      data: {
        id: contact._id,
        emailSent: emailSent
      }
    });
    
  } catch (error) {
    console.error('❌ Contact error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again.'
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

// Export for Vercel
module.exports = app;