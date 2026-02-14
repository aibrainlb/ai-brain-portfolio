const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB error:', err);
  }
};

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, default: 'Portfolio Inquiry' },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

let transporter = null;
if (process.env.EMAIL_ENABLED === 'true') {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
}

app.get('/api', (req, res) => {
  res.json({ success: true, message: 'AI Brain Portfolio API', version: '3.0.0' });
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
    
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message'
      });
    }
    
    const contact = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject || 'Portfolio Inquiry',
      message: message.trim()
    });
    
    await contact.save();
    console.log(`✅ Contact saved: ${contact._id}`);
    
    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: process.env.ADMIN_EMAIL,
          subject: `📬 New Contact: ${name} - ${subject || 'Portfolio Inquiry'}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject || 'Portfolio Inquiry'}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
            <hr>
            <p><small>ID: ${contact._id}</small></p>
          `
        });
        console.log('✅ Email sent');
      } catch (emailErr) {
        console.error('❌ Email error:', emailErr.message);
      }
    }
    
    res.json({
      success: true,
      message: 'Thank you for reaching out! I will get back to you soon.',
      data: { id: contact._id }
    });
  } catch (error) {
    console.error('❌ Contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again.'
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

module.exports = app;