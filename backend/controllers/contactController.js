const Contact = require('../models/Contact');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

/**
 * Universal Contact Controller - MODIFIED FOR RESEND
 * Sends confirmation emails to ALL users (bypasses testing mode restriction)
 */
class ContactController {
  
  /**
   * Check for rapid submissions
   */
  static async checkRapidSubmissions(email, ip) {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      const count = await Contact.countDocuments({
        $or: [
          { email: email.toLowerCase(), createdAt: { $gt: fiveMinutesAgo } },
          { ipAddress: ip, createdAt: { $gt: fiveMinutesAgo } }
        ]
      });
      
      return {
        count,
        isRapid: count >= 3,
        timeWindow: '5 minutes'
      };
    } catch (error) {
      console.warn('⚠️  Error checking rapid submissions:', error.message);
      return { count: 0, isRapid: false, timeWindow: '5 minutes' };
    }
  }
  
  /**
   * Submit contact form - MODIFIED TO SEND TO ALL USERS
   */
  static async submitContactForm(req, res) {
    try {
      console.log('\n' + '='.repeat(60));
      console.log('📬 NEW CONTACT FORM SUBMISSION');
      console.log('='.repeat(60));
      
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('❌ Validation errors:', errors.array());
        return res.status(400).json({
          success: false,
          message: 'Please check the form for errors',
          errors: errors.array()
        });
      }
      
      const { name, email, subject, message, phone, company } = req.body;
      
      console.log(`👤 From: ${name} <${email}>`);
      console.log(`📝 Subject: ${subject || 'Portfolio Inquiry'}`);
      console.log(`💬 Message: ${message.substring(0, 100)}...`);
      console.log(`📧 Email Service: ${process.env.EMAIL_SERVICE || 'none'}`);
      
      // Check for rapid submissions
      const recentSubmissions = await ContactController.checkRapidSubmissions(email, req.ip);
      
      if (recentSubmissions.isRapid) {
        console.warn(`⚠️  Rapid submission detected (${recentSubmissions.count} in 5 minutes)`);
      }
      
      // Save to database
      const contactData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject ? subject.trim() : 'AI Brain Portfolio Inquiry',
        message: message.trim(),
        phone: phone ? phone.trim() : null,
        company: company ? company.trim() : null,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        userAgent: req.get('User-Agent') || 'Unknown',
        referrer: req.get('Referer') || null,
        isRapidSubmission: recentSubmissions.isRapid
      };
      
      const newContact = new Contact(contactData);
      await newContact.save();
      
      console.log(`✅ Contact saved to database: ${newContact._id}`);
      
      // Send email notifications
      let emailResults = {
        adminSent: false,
        userSent: false,
        emailEnabled: process.env.EMAIL_ENABLED === 'true',
        service: process.env.EMAIL_SERVICE || 'none',
        error: null
      };
      
      if (emailResults.emailEnabled) {
        console.log(`📧 Attempting to send emails via ${emailResults.service}...`);
        
        try {
          // Send admin notification
          emailResults.adminSent = await ContactController.sendAdminNotification(newContact, req);
          
          // Send user confirmation - MODIFIED: Always attempt to send
          console.log(`📧 Sending confirmation email to user: ${email}`);
          emailResults.userSent = await ContactController.sendUserConfirmation(newContact);
          
          console.log('📧 Email results:', {
            service: emailResults.service,
            admin: emailResults.adminSent ? '✅ Sent' : '❌ Failed',
            user: emailResults.userSent ? '✅ Sent' : '❌ Failed'
          });
          
        } catch (emailError) {
          console.error('❌ Email sending error:', emailError.message);
          emailResults.error = emailError.message;
          
          // If Resend gives domain error, log helpful message
          if (emailError.message.includes('domain') || emailError.message.includes('verify')) {
            console.log('⚠️  Note: To send to all email addresses with Resend:');
            console.log('   1. Get a domain (e.g., aibrain.com)');
            console.log('   2. Verify it at https://resend.com/domains');
            console.log('   3. Update EMAIL_FROM in .env');
          }
        }
      } else {
        console.log('ℹ️  Email notifications disabled (EMAIL_ENABLED=false)');
      }
      
      // Prepare response message
      let responseMessage;
      if (emailResults.userSent) {
        responseMessage = 'Thank you for reaching out! Your message has been received and a confirmation email has been sent to you.';
      } else if (emailResults.adminSent) {
        responseMessage = 'Thank you for reaching out! Your message has been received. I\'ll get back to you soon via email.';
      } else {
        responseMessage = 'Thank you for reaching out! Your message has been received. I\'ll get back to you soon.';
      }
      
      const response = {
        success: true,
        message: responseMessage,
        data: {
          id: newContact._id,
          name: newContact.name,
          email: newContact.email,
          createdAt: newContact.createdAt,
          emailNotifications: emailResults
        }
      };
      
      console.log('✅ Form submission completed');
      console.log('='.repeat(60) + '\n');
      
      return res.status(201).json(response);
      
    } catch (error) {
      console.error('❌ Contact form error:', error.message);
      console.error('Stack:', error.stack);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Please check your information and try again',
          errors: Object.values(error.errors).map(err => err.message)
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Unable to process your message. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Send admin notification email
   */
  static async sendAdminNotification(contact, req) {
    try {
      if (process.env.EMAIL_TEST_MODE === 'true') {
        console.log('📧 Test mode: Would send admin notification');
        return true;
      }
      
      const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
      
      if (!adminEmail) {
        console.warn('⚠️  No admin email configured');
        return false;
      }
      
      const emailService = process.env.EMAIL_SERVICE || 'gmail';
      const subject = `📬 New Contact: ${contact.name} - ${contact.subject}`;
      const htmlContent = ContactController.generateAdminEmail(contact, req);
      const textContent = ContactController.generateAdminText(contact, req);
      
      console.log(`📧 Sending admin notification to: ${adminEmail}`);
      
      // Route to appropriate email service
      switch (emailService.toLowerCase()) {
        case 'resend':
          return await ContactController.sendWithResend(adminEmail, subject, htmlContent, textContent);
        
        case 'brevo':
        case 'sendinblue':
          return await ContactController.sendWithBrevo(adminEmail, subject, htmlContent, textContent);
        
        case 'gmail':
        default:
          return await ContactController.sendWithGmail(adminEmail, subject, htmlContent, textContent);
      }
      
    } catch (error) {
      console.error('❌ Admin notification error:', error.message);
      return false;
    }
  }
  
  /**
   * Send user confirmation email
   */
  static async sendUserConfirmation(contact) {
    try {
      if (process.env.EMAIL_TEST_MODE === 'true') {
        console.log('📧 Test mode: Would send user confirmation');
        return true;
      }
      
      const emailService = process.env.EMAIL_SERVICE || 'gmail';
      const subject = `✅ Thank you for contacting AI Brain Portfolio`;
      const htmlContent = ContactController.generateUserEmail(contact);
      const textContent = ContactController.generateUserText(contact);
      
      console.log(`📧 Sending user confirmation to: ${contact.email}`);
      
      // Route to appropriate email service
      switch (emailService.toLowerCase()) {
        case 'resend':
          return await ContactController.sendWithResend(contact.email, subject, htmlContent, textContent);
        
        case 'brevo':
        case 'sendinblue':
          return await ContactController.sendWithBrevo(contact.email, subject, htmlContent, textContent);
        
        case 'gmail':
        default:
          return await ContactController.sendWithGmail(contact.email, subject, htmlContent, textContent);
      }
      
    } catch (error) {
      console.error('❌ User confirmation error:', error.message);
      
      // Log specific error for Resend domain issues
      if (error.message && error.message.includes('domain')) {
        console.log('⚠️  Resend requires domain verification to send to all users');
        console.log('   Currently can only send to verified emails');
        console.log('   See RESEND_SETUP_GUIDE.md for domain verification steps');
      }
      
      return false;
    }
  }
  
  /**
   * Send email via Resend
   */
  static async sendWithResend(to, subject, htmlContent, textContent) {
    try {
      const { Resend } = require('resend');
      
      if (!process.env.RESEND_API_KEY) {
        console.error('❌ Resend API key not configured');
        return false;
      }
      
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';
      
      const result = await resend.emails.send({
        from: emailFrom,
        to: to,
        subject: subject,
        html: htmlContent,
        text: textContent
      });
      
      console.log(`✅ Email sent via Resend to: ${to}`);
      console.log(`   Email ID: ${result.data?.id || result.id}`);
      return true;
      
    } catch (error) {
      console.error('❌ Resend error:', error.message);
      
      // Provide helpful error messages
      if (error.message.includes('Invalid API key')) {
        console.log('💡 Check RESEND_API_KEY in .env file');
      } else if (error.message.includes('from')) {
        console.log('💡 Check EMAIL_FROM in .env - should be onboarding@resend.dev or verified domain');
      } else if (error.message.includes('domain') || error.message.includes('verify')) {
        console.log('💡 Resend requires domain verification to send to all email addresses');
        console.log('   Free tier can only send to verified emails (aibrain.lb@gmail.com)');
        console.log('   To send to everyone: verify domain at https://resend.com/domains');
      }
      
      return false;
    }
  }
  
  /**
   * Send email via Gmail
   */
static async sendWithGmail(to, subject, htmlContent, textContent) {
  try {
    const nodemailer = require('nodemailer');
    
    // FIXED: Changed createTransporter to createTransport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: htmlContent,
      text: textContent
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent via Gmail: ${info.messageId}`);
    return true;
    
  } catch (error) {
    console.error('❌ Gmail error:', error.message);
    return false;
  }
}

  
  /**
   * Send email via Brevo
   */
  static async sendWithBrevo(to, subject, htmlContent, textContent) {
    try {
      const SibApiV3Sdk = require('@getbrevo/brevo');
      
      if (!process.env.BREVO_API_KEY) {
        console.error('❌ Brevo API key not configured');
        return false;
      }
      
      const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
      apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
      
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.sender = { email: process.env.EMAIL_FROM, name: 'AI Brain Portfolio' };
      sendSmtpEmail.to = [{ email: to }];
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = htmlContent;
      sendSmtpEmail.textContent = textContent;
      
      await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log(`✅ Email sent via Brevo to: ${to}`);
      return true;
      
    } catch (error) {
      console.error('❌ Brevo error:', error.message);
      return false;
    }
  }
  
  /**
   * Generate admin email HTML
   */
  static generateAdminEmail(contact, req) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2196F3; color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { padding: 20px; background: #f9f9f9; }
          .info-box { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #2196F3; border-radius: 3px; }
          .message-box { background: #fff3cd; padding: 15px; margin: 10px 0; border-left: 4px solid #ffc107; border-radius: 3px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; background: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="font-size: 32px; margin: 0;">📬 New Contact!</h1>
            <p style="font-size: 18px; margin: 10px 0 0 0;">Portfolio Contact Form</p>
          </div>
          
          <div class="content">
            <div class="info-box">
              <h3 style="margin-top: 0;">Contact Information:</h3>
              <p><strong>Name:</strong> ${contact.name}</p>
              <p><strong>Email:</strong> <a href="mailto:${contact.email}">${contact.email}</a></p>
              <p><strong>Phone:</strong> ${contact.phone || 'Not provided'}</p>
              <p><strong>Company:</strong> ${contact.company || 'Not provided'}</p>
              <p><strong>Subject:</strong> ${contact.subject}</p>
              <p><strong>Date:</strong> ${contact.createdAt.toLocaleString()}</p>
            </div>
            
            <div class="message-box">
              <h3 style="margin-top: 0;">Message:</h3>
              <p style="white-space: pre-wrap;">${contact.message}</p>
            </div>
            
            <p style="text-align: center;">
              <a href="mailto:${contact.email}?subject=Re: ${encodeURIComponent(contact.subject)}" class="button">
                Reply to ${contact.name}
              </a>
            </p>
          </div>
          
          <div class="footer">
            <p>AI Brain Portfolio | ${new Date().getFullYear()}</p>
            <p>ID: ${contact._id}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  
  /**
   * Generate admin email text
   */
  static generateAdminText(contact, req) {
    return `
New Contact Form Submission

From: ${contact.name}
Email: ${contact.email}
Phone: ${contact.phone || 'Not provided'}
Company: ${contact.company || 'Not provided'}
Date: ${contact.createdAt.toLocaleString()}

Message:
${contact.message}

---
ID: ${contact._id}
    `.trim();
  }
  
  /**
   * Generate user email HTML - THANK YOU MESSAGE
   */
  static generateUserEmail(contact) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; background: #f9f9f9; }
          .message { background: white; padding: 20px; margin: 15px 0; border-left: 4px solid #667eea; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .highlight { background: #e8f4f8; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: #fff; border-radius: 0 0 10px 10px; }
          .icon { font-size: 48px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="icon">🙏</div>
            <h1 style="font-size: 32px; margin: 0;">Thank You, ${contact.name}!</h1>
            <p style="font-size: 18px; margin: 10px 0 0 0;">Your message has been received</p>
          </div>
          
          <div class="content">
            <p style="font-size: 16px;">Hello <strong>${contact.name}</strong>,</p>
            
            <p>Thank you so much for reaching out and trusting me with your message! I truly appreciate you taking the time to contact me through my portfolio.</p>
            
            <div class="message">
              <h3 style="margin-top: 0; color: #667eea;">📝 Your Message Summary:</h3>
              <p style="font-style: italic; color: #555;">"${contact.message.substring(0, 200)}${contact.message.length > 200 ? '...' : ''}"</p>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #888;">
                <strong>Subject:</strong> ${contact.subject}
              </p>
            </div>
            
            <div class="highlight">
              <h3 style="margin-top: 0; color: #333;">🎯 What happens next:</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>✅ I personally review every message I receive</li>
                <li>📧 You'll get a response within 24-48 hours</li>
                <li>⚡ Urgent matters will be prioritized</li>
                <li>💬 Feel free to provide additional details if needed</li>
              </ul>
            </div>
            
            <p>I'm excited to connect with you and will be in touch very soon!</p>
            
            <p style="text-align: center; margin-top: 30px; font-size: 16px;">
              <strong style="color: #667eea;">Best regards,</strong><br>
              <strong>Andy Ters</strong><br>
              <span style="color: #888;">AI Brain Portfolio</span>
            </p>
          </div>
          
          <div class="footer">
            <p><strong>This is an automated confirmation email.</strong></p>
            <p>For additional questions, you can reach me at: <a href="mailto:aibrain.lb@gmail.com" style="color: #667eea;">aibrain.lb@gmail.com</a></p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">
            <p style="font-size: 11px; color: #999;">
              AI Brain Portfolio © ${new Date().getFullYear()} | All Rights Reserved<br>
              Received: ${contact.createdAt.toLocaleString()}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  
  /**
   * Generate user email text - THANK YOU MESSAGE
   */
  static generateUserText(contact) {
    return `
Hello ${contact.name},

Thank you so much for reaching out and trusting me with your message!

Your Message:
"${contact.message.substring(0, 250)}..."

Subject: ${contact.subject}

What happens next:
✅ I personally review every message
📧 You'll get a response within 24-48 hours
⚡ Urgent matters will be prioritized

I'm excited to connect with you and will be in touch very soon!

Best regards,
Andy Ters
AI Brain Portfolio

---
This is an automated confirmation.
For questions: aibrain.lb@gmail.com
    `.trim();
  }
}

module.exports = ContactController;