#!/usr/bin/env node

/**
 * Email Configuration Tester
 * Run this script to test your email setup before deploying
 * 
 * Usage: node test-email.js
 */

require('dotenv').config();

console.log('\n' + '='.repeat(70));
console.log('📧 EMAIL CONFIGURATION TEST');
console.log('='.repeat(70) + '\n');

// Check environment variables
console.log('🔍 Checking environment variables...\n');

const checks = {
  'EMAIL_ENABLED': process.env.EMAIL_ENABLED === 'true',
  'EMAIL_SERVICE': !!process.env.EMAIL_SERVICE,
  'ADMIN_EMAIL': !!process.env.ADMIN_EMAIL,
  'EMAIL_FROM': !!process.env.EMAIL_FROM
};

// Service-specific checks
const emailService = process.env.EMAIL_SERVICE || 'none';

if (emailService === 'sendgrid') {
  checks['SENDGRID_API_KEY'] = !!process.env.SENDGRID_API_KEY;
} else if (emailService === 'mailgun') {
  checks['MAILGUN_API_KEY'] = !!process.env.MAILGUN_API_KEY;
  checks['MAILGUN_DOMAIN'] = !!process.env.MAILGUN_DOMAIN;
} else if (emailService === 'gmail') {
  checks['EMAIL_USER'] = !!process.env.EMAIL_USER;
  checks['EMAIL_PASSWORD'] = !!process.env.EMAIL_PASSWORD;
}

// Display results
let allPassed = true;
for (const [key, value] of Object.entries(checks)) {
  const status = value ? '✅' : '❌';
  console.log(`${status} ${key}: ${value ? 'Set' : 'Missing'}`);
  if (!value) allPassed = false;
}

console.log('\n' + '-'.repeat(70) + '\n');

// Configuration summary
console.log('📊 Configuration Summary:');
console.log(`   Email Enabled: ${process.env.EMAIL_ENABLED}`);
console.log(`   Email Service: ${emailService}`);
console.log(`   Admin Email: ${process.env.ADMIN_EMAIL || 'Not set'}`);
console.log(`   From Email: ${process.env.EMAIL_FROM || 'Not set'}`);
console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);

console.log('\n' + '-'.repeat(70) + '\n');

if (!allPassed) {
  console.log('❌ CONFIGURATION INCOMPLETE\n');
  console.log('Missing environment variables detected. Please update your .env file.\n');
  
  if (emailService === 'sendgrid' && !process.env.SENDGRID_API_KEY) {
    console.log('💡 To fix SendGrid configuration:');
    console.log('   1. Go to https://app.sendgrid.com/settings/api_keys');
    console.log('   2. Create a new API key');
    console.log('   3. Add to .env: SENDGRID_API_KEY=SG.your_key_here');
    console.log('   4. Verify sender at: https://app.sendgrid.com/settings/sender_auth\n');
  }
  
  if (emailService === 'gmail' && process.env.NODE_ENV === 'production') {
    console.log('⚠️  WARNING: Gmail is not recommended for production!');
    console.log('   Switch to SendGrid or Mailgun for better reliability.\n');
  }
  
  process.exit(1);
}

// Test email sending
console.log('✅ ALL CONFIGURATION CHECKS PASSED\n');
console.log('🧪 Testing email sending...\n');

async function testEmail() {
  try {
    if (emailService === 'sendgrid') {
      await testSendGrid();
    } else if (emailService === 'mailgun') {
      await testMailgun();
    } else if (emailService === 'gmail') {
      await testGmail();
    } else {
      console.log('ℹ️  Email service not configured or unknown');
      return;
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.body);
    }
    process.exit(1);
  }
}

async function testSendGrid() {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = {
    to: process.env.ADMIN_EMAIL,
    from: process.env.EMAIL_FROM,
    subject: '✅ SendGrid Test - AI Brain Portfolio',
    text: 'This is a test email from your AI Brain Portfolio contact form setup.',
    html: '<p>This is a test email from your <strong>AI Brain Portfolio</strong> contact form setup.</p><p>If you received this, your SendGrid configuration is working correctly! 🎉</p>'
  };
  
  console.log(`📧 Sending test email via SendGrid to: ${process.env.ADMIN_EMAIL}...`);
  await sgMail.send(msg);
  console.log('✅ Test email sent successfully!\n');
  console.log('📬 Check your inbox at:', process.env.ADMIN_EMAIL);
  console.log('   (Don\'t forget to check spam folder)\n');
  console.log('🎉 SendGrid is configured correctly!');
}

async function testMailgun() {
  const formData = require('form-data');
  const Mailgun = require('mailgun.js');
  
  const mailgun = new Mailgun(formData);
  const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY
  });
  
  const msg = {
    from: process.env.EMAIL_FROM,
    to: process.env.ADMIN_EMAIL,
    subject: '✅ Mailgun Test - AI Brain Portfolio',
    text: 'This is a test email from your AI Brain Portfolio contact form setup.',
    html: '<p>This is a test email from your <strong>AI Brain Portfolio</strong> contact form setup.</p><p>If you received this, your Mailgun configuration is working correctly! 🎉</p>'
  };
  
  console.log(`📧 Sending test email via Mailgun to: ${process.env.ADMIN_EMAIL}...`);
  await mg.messages.create(process.env.MAILGUN_DOMAIN, msg);
  console.log('✅ Test email sent successfully!\n');
  console.log('📬 Check your inbox at:', process.env.ADMIN_EMAIL);
  console.log('🎉 Mailgun is configured correctly!');
}

async function testGmail() {
  const nodemailer = require('nodemailer');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.ADMIN_EMAIL,
    subject: '✅ Gmail Test - AI Brain Portfolio',
    text: 'This is a test email from your AI Brain Portfolio contact form setup.',
    html: '<p>This is a test email from your <strong>AI Brain Portfolio</strong> contact form setup.</p><p>If you received this, your Gmail configuration is working! 🎉</p><p><strong>Note:</strong> Gmail is not recommended for production. Consider switching to SendGrid.</p>'
  };
  
  console.log(`📧 Sending test email via Gmail to: ${process.env.ADMIN_EMAIL}...`);
  const info = await transporter.sendMail(mailOptions);
  console.log('✅ Test email sent successfully!');
  console.log('📬 Message ID:', info.messageId);
  console.log('📬 Check your inbox at:', process.env.ADMIN_EMAIL);
  
  if (process.env.NODE_ENV === 'production') {
    console.log('\n⚠️  WARNING: Gmail is not recommended for production!');
    console.log('   Please switch to SendGrid or Mailgun for better reliability.');
  }
}

// Run the test
testEmail().catch(err => {
  console.error('\n❌ Email test failed:', err.message);
  console.error('\nPlease check your configuration and try again.');
  process.exit(1);
});