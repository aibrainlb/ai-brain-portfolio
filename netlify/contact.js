// Netlify Serverless Function - Contact Form Handler
const mongoose = require('mongoose');
const { validationResult, body } = require('express-validator');

// MongoDB Connection
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const uri = process.env.MONGODB_URI || 'mongodb+srv://aibrain:aibrain12@cluster0.ke8o8cs.mongodb.net/portfolioDB?retryWrites=true&w=majority';
  
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  });

  cachedDb = mongoose.connection;
  return cachedDb;
}

// Contact Schema
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  subject: { type: String, trim: true, default: 'Portfolio Inquiry' },
  message: { type: String, required: true, trim: true },
  phone: { type: String, trim: true, default: null },
  company: { type: String, trim: true, default: null },
  ipAddress: { type: String, trim: true },
  userAgent: { type: String, trim: true },
  status: { type: String, enum: ['new', 'read', 'replied', 'archived'], default: 'new' },
  createdAt: { type: Date, default: Date.now },
});

const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

// Email sending function
async function sendEmail(contact) {
  try {
    if (process.env.EMAIL_ENABLED !== 'true') {
      console.log('Email disabled');
      return false;
    }

    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Send admin notification
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `📬 New Contact: ${contact.name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${contact.name}</p>
        <p><strong>Email:</strong> ${contact.email}</p>
        <p><strong>Phone:</strong> ${contact.phone || 'Not provided'}</p>
        <p><strong>Company:</strong> ${contact.company || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${contact.subject}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${contact.message}</p>
        <hr>
        <p><small>Received: ${new Date().toLocaleString()}</small></p>
      `
    });

    // Send user confirmation
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: contact.email,
      subject: '✅ Thank you for contacting AI Brain Portfolio',
      html: `
        <h2>Thank You, ${contact.name}!</h2>
        <p>Thank you for reaching out! I've received your message and will get back to you soon.</p>
        <h3>Your Message:</h3>
        <p style="background: #f5f5f5; padding: 15px; border-left: 4px solid #667eea;">
          ${contact.message.substring(0, 200)}...
        </p>
        <p><strong>I'll respond within 24-48 hours.</strong></p>
        <hr>
        <p>Best regards,<br>Andy Ters<br>AI Brain Portfolio</p>
      `
    });

    return true;
  } catch (error) {
    console.error('Email error:', error.message);
    return false;
  }
}

// Main handler
exports.handler = async (event, context) => {
  // Set headers for CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  try {
    // Parse body
    const data = JSON.parse(event.body);
    
    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Name, email, and message are required'
        })
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Invalid email address'
        })
      };
    }

    // Connect to database
    await connectToDatabase();

    // Create contact
    const contact = new Contact({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      subject: data.subject?.trim() || 'Portfolio Inquiry',
      message: data.message.trim(),
      phone: data.phone?.trim() || null,
      company: data.company?.trim() || null,
      ipAddress: event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown',
      userAgent: event.headers['user-agent'] || 'unknown'
    });

    await contact.save();
    console.log('Contact saved:', contact._id);

    // Send emails (don't wait for it)
    sendEmail(contact).catch(console.error);

    // Return success
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Thank you for your message! I\'ll get back to you soon.',
        data: {
          id: contact._id,
          name: contact.name,
          email: contact.email
        }
      })
    };

  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Failed to process your message. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};
