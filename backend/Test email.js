require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('='.repeat(70));
  console.log('📧 AI BRAIN PORTFOLIO - EMAIL SYSTEM TEST');
  console.log('='.repeat(70));
  console.log('');
  
  // Display configuration
  console.log('📋 Current Configuration:');
  console.log('   Email Service:', process.env.EMAIL_SERVICE || 'gmail');
  console.log('   Email User:', process.env.EMAIL_USER || 'NOT SET');
  console.log('   Email From:', process.env.EMAIL_FROM || 'NOT SET');
  console.log('   Password Set:', process.env.EMAIL_PASSWORD ? '✅ YES' : '❌ NO');
  console.log('   Password Length:', process.env.EMAIL_PASSWORD?.length || 0, 'chars');
  console.log('   Email Enabled:', process.env.EMAIL_ENABLED || 'NOT SET');
  console.log('');
  
  // Validate configuration
  if (!process.env.EMAIL_USER) {
    console.error('❌ ERROR: EMAIL_USER not set in .env file');
    return;
  }
  
  if (!process.env.EMAIL_PASSWORD) {
    console.error('❌ ERROR: EMAIL_PASSWORD not set in .env file');
    return;
  }
  
  if (process.env.EMAIL_PASSWORD.includes(' ')) {
    console.error('⚠️  WARNING: EMAIL_PASSWORD contains spaces - this will likely fail!');
    console.log('   Remove ALL spaces from your app password');
  }
  
  if (process.env.EMAIL_PASSWORD.length !== 16) {
    console.error('⚠️  WARNING: Gmail app passwords should be 16 characters');
    console.log(`   Your password is ${process.env.EMAIL_PASSWORD.length} characters`);
  }
  
  try {
    console.log('🔧 Creating Gmail transporter...');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      debug: false, // Set to true for detailed logs
      logger: false
    });
    
    console.log('✅ Transporter created successfully');
    console.log('');
    console.log('🔄 Verifying SMTP connection...');
    
    await transporter.verify();
    
    console.log('✅ SMTP Connection Verified!');
    console.log('   Gmail server is reachable and credentials are valid');
    console.log('');
    
    // Send test email
    const testRecipient = process.env.EMAIL_USER; // Send to yourself
    console.log(`📤 Sending test email to: ${testRecipient}`);
    console.log('   Please wait...');
    console.log('');
    
    const info = await transporter.sendMail({
      from: `"AI Brain Portfolio Test" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: testRecipient,
      subject: '✅ Test Email - AI Brain Portfolio System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { padding: 30px; background: white; border-radius: 0 0 10px 10px; }
            .success { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #28a745; }
            .info { background: #d1ecf1; color: #0c5460; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 32px;">🎉 Success!</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px;">Your Email System Is Working</p>
            </div>
            
            <div class="content">
              <div class="success">
                <h2 style="margin-top: 0;">✅ Email Configuration Verified</h2>
                <p>Your AI Brain Portfolio email system is properly configured and working!</p>
              </div>
              
              <div class="info">
                <h3 style="margin-top: 0;">📊 Test Details:</h3>
                <p><strong>Tested at:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Service:</strong> Gmail (via nodemailer)</p>
                <p><strong>From:</strong> ${process.env.EMAIL_FROM || process.env.EMAIL_USER}</p>
                <p><strong>To:</strong> ${testRecipient}</p>
              </div>
              
              <h3>✅ What This Means:</h3>
              <ul>
                <li>✓ Gmail app password is correct</li>
                <li>✓ SMTP connection is working</li>
                <li>✓ Emails can be sent successfully</li>
                <li>✓ Contact form notifications will work</li>
              </ul>
              
              <h3>🚀 Next Steps:</h3>
              <ol>
                <li>Test your contact form on the website</li>
                <li>Check that you receive both admin and user emails</li>
                <li>Monitor server logs for any errors</li>
              </ol>
              
              <p style="text-align: center; margin-top: 30px;">
                <strong style="color: #667eea;">Your portfolio is ready to receive messages!</strong>
              </p>
            </div>
            
            <div class="footer">
              <p>AI Brain Portfolio Email System Test</p>
              <p style="font-size: 11px; color: #999;">
                This is an automated test email.<br>
                If you received this, your email configuration is working correctly!
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
🎉 SUCCESS!

Your AI Brain Portfolio email system is working correctly!

Test Details:
- Tested at: ${new Date().toLocaleString()}
- Service: Gmail
- From: ${process.env.EMAIL_FROM || process.env.EMAIL_USER}
- To: ${testRecipient}

✅ What's Working:
✓ Gmail app password is correct
✓ SMTP connection established
✓ Emails can be sent
✓ Contact form will work

Next Steps:
1. Test your contact form
2. Check for admin and user emails
3. Monitor server logs

Your portfolio is ready to receive messages!

---
AI Brain Portfolio Email System Test
      `.trim()
    });
    
    console.log('='.repeat(70));
    console.log('🎉 EMAIL SENT SUCCESSFULLY!');
    console.log('='.repeat(70));
    console.log('');
    console.log('✅ Results:');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    console.log('   Accepted:', info.accepted);
    console.log('   Rejected:', info.rejected.length > 0 ? info.rejected : 'None');
    console.log('');
    console.log('📬 Next Steps:');
    console.log('   1. Check your inbox for the test email');
    console.log('   2. Check spam folder if not in inbox');
    console.log('   3. Test the contact form on your website');
    console.log('   4. Verify both admin and user emails arrive');
    console.log('');
    console.log('🎯 Your email system is READY FOR PRODUCTION!');
    console.log('='.repeat(70));
    console.log('');
    
  } catch (error) {
    console.log('='.repeat(70));
    console.error('❌ EMAIL TEST FAILED');
    console.log('='.repeat(70));
    console.log('');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    console.log('');
    
    // Provide specific troubleshooting
    if (error.message.includes('Invalid login') || error.message.includes('Username and Password not accepted')) {
      console.log('🔧 TROUBLESHOOTING: Invalid Credentials');
      console.log('');
      console.log('This error means Gmail rejected your username/password.');
      console.log('');
      console.log('Solutions:');
      console.log('1. Generate a NEW App Password:');
      console.log('   → https://myaccount.google.com/apppasswords');
      console.log('   → App: Mail | Device: Other (AI Brain Portfolio)');
      console.log('');
      console.log('2. Remove ALL spaces from the password:');
      console.log('   ✗ WRONG: "abcd efgh ijkl mnop"');
      console.log('   ✓ RIGHT: "abcdefghijklmnop"');
      console.log('');
      console.log('3. Update .env file:');
      console.log('   EMAIL_PASSWORD=abcdefghijklmnop');
      console.log('');
      console.log('4. Restart this test');
      
    } else if (error.message.includes('EAUTH')) {
      console.log('🔧 TROUBLESHOOTING: Authentication Failed');
      console.log('');
      console.log('Possible causes:');
      console.log('1. Wrong email address in EMAIL_USER');
      console.log('2. Wrong app password in EMAIL_PASSWORD');
      console.log('3. 2-Factor Authentication not enabled');
      console.log('');
      console.log('Check:');
      console.log('   - EMAIL_USER =', process.env.EMAIL_USER);
      console.log('   - Is this your correct Gmail address?');
      console.log('   - Is 2FA enabled on this account?');
      
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
      console.log('🔧 TROUBLESHOOTING: Connection Failed');
      console.log('');
      console.log('Cannot reach Gmail servers.');
      console.log('');
      console.log('Possible causes:');
      console.log('1. No internet connection');
      console.log('2. Firewall blocking SMTP ports (587 or 465)');
      console.log('3. Gmail servers temporarily down');
      console.log('');
      console.log('Try:');
      console.log('1. Check your internet connection');
      console.log('2. Test again in a few minutes');
      
    } else {
      console.log('🔧 TROUBLESHOOTING: Unknown Error');
      console.log('');
      console.log('Full error details:');
      console.log(error);
    }
    
    console.log('');
    console.log('='.repeat(70));
    console.log('Need more help? Check EMAIL_FIX_GUIDE.md');
    console.log('='.repeat(70));
    console.log('');
  }
}

// Run the test
console.log('');
testEmail().catch(console.error);