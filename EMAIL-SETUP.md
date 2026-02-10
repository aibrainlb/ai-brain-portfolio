# 🚀 AI Brain Portfolio - Complete Setup Guide

## ✅ **IMPORTANT: Email Configuration**

Your portfolio is configured to send all contact form submissions to:
**📧 aibrain.lb@gmail.com**

---

## 📋 **Email Setup (REQUIRED)**

### Step 1: Enable Gmail App Password

1. **Go to Google Account Settings:**
   - Visit: https://myaccount.google.com/security
   - Log in with: **aibrain.lb@gmail.com**

2. **Enable 2-Step Verification:**
   - Find "2-Step Verification"
   - Click "Get Started"
   - Follow the steps to enable it

3. **Create App Password:**
   - After enabling 2FA, go back to Security
   - Find "App passwords" (or search for it)
   - Select:
     - App: **Mail**
     - Device: **Windows Computer** (or Other)
   - Click **Generate**
   - **COPY the 16-character password** (looks like: `xxxx xxxx xxxx xxxx`)

### Step 2: Update .env File

1. **Create .env file:**
   ```cmd
   copy .env.example .env
   ```

2. **Edit .env file:**
   ```cmd
   notepad .env
   ```

3. **Update this line:**
   ```env
   EMAIL_PASSWORD=your-app-specific-password
   ```
   
   **Replace with the 16-character password you copied** (remove spaces):
   ```env
   EMAIL_PASSWORD=abcdabcdabcdabcd
   ```

4. **Save and close**

---

## 🎨 **New Feature: Active Navigation**

When you click on navigation links (Home, About, Skills, etc.), the active link will:
- ✨ Turn **bright blue** color
- ✨ Show an **underline**
- ✨ Display a **glowing dot** on the left
- ✨ Use **bold font weight**

This makes it easy to see which section you're currently viewing!

### How it works:
- Click "Home" → "Home" turns bright blue
- Scroll to "About" → "About" turns bright blue automatically
- Click "Contact" → "Contact" turns bright blue

---

## 🚀 **Quick Start**

### 1. Install Dependencies
```cmd
cd andy-ters-portfolio
npm install
```

### 2. Configure Email
```cmd
# Copy template
copy .env.example .env

# Edit file
notepad .env

# Add your Gmail App Password
EMAIL_PASSWORD=your-16-char-password
```

### 3. Start Server
```cmd
npm start
```

### 4. Open Browser
```
http://localhost:3000
```

---

## ✅ **Verification Checklist**

Test everything works:

### Email Testing:
- [ ] Fill out contact form
- [ ] Click "Send Message"
- [ ] Check **aibrain.lb@gmail.com** inbox
- [ ] You should receive TWO emails:
  - Admin notification (form submission details)
  - Auto-reply confirmation (sent to user)

### Navigation Testing:
- [ ] Click "Home" - should turn bright blue
- [ ] Click "About" - should turn bright blue
- [ ] Scroll down - active link should update automatically
- [ ] Click "Contact" - should turn bright blue

### Visual Testing:
- [ ] All sections load correctly
- [ ] Animations work smoothly
- [ ] Certificate section shows only Game Development
- [ ] No "Code" or "Live Demo" buttons on projects
- [ ] Logo shows "AI Brain"

---

## 📧 **Email Configuration Details**

Your `.env` file should look like this:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/portfolio_db

# Email Configuration - CONFIGURED FOR AI BRAIN
EMAIL_SERVICE=gmail
EMAIL_USER=aibrain.lb@gmail.com
EMAIL_PASSWORD=your-app-password-here
ADMIN_EMAIL=aibrain.lb@gmail.com

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

---

## 🎯 **What Emails You'll Receive**

### When someone submits the contact form:

**Email 1: Admin Notification (to aibrain.lb@gmail.com)**
- Shows who contacted you
- Their email address
- Subject line
- Full message
- Technical details (IP, timestamp)

**Email 2: Auto-Reply (to the person who contacted you)**
- Thanks them for contacting AI Brain
- Confirms message was received
- Tells them you'll respond in 24-48 hours
- Shows message summary
- Your contact links

---

## 🎨 **Active Navigation Colors**

The navigation highlighting uses:
- **Default:** Dark gray text
- **Hover:** Bright blue (#2196F3)
- **Active:** Bright blue (#2196F3) + bold + underline + glowing dot

---

## 🐛 **Troubleshooting**

### Email Not Sending?
1. **Check Gmail App Password:**
   - Make sure 2FA is enabled
   - App password is 16 characters
   - No spaces in password
   - Correct email: aibrain.lb@gmail.com

2. **Check .env file:**
   ```cmd
   # View file
   type .env
   
   # Should show:
   EMAIL_USER=aibrain.lb@gmail.com
   EMAIL_PASSWORD=your-password
   ```

3. **Check console:**
   - Look for: "✅ Email server is ready"
   - Or error messages about email

### Navigation Not Highlighting?
1. **Clear browser cache:**
   - Press `Ctrl + F5`
   - Hard refresh the page

2. **Check console:**
   - Press `F12`
   - Look for JavaScript errors

---

## 💡 **Pro Tips**

1. **Test Email First:**
   - Before going live, send yourself a test message
   - Make sure both emails arrive

2. **Check Spam Folder:**
   - Gmail might filter auto-replies
   - Check spam folder for test emails

3. **Gmail Limits:**
   - Free Gmail: ~500 emails/day
   - Should be plenty for a portfolio site

4. **Navigation Tips:**
   - The active link updates while you scroll
   - You can see exactly which section you're in
   - Great for one-page portfolios!

---

## 📱 **Mobile Testing**

On mobile, the active navigation also works:
- Tap menu button
- Tap "Projects"
- "Projects" turns bright blue
- Menu stays open until you tap again

---

## 🎉 **You're All Set!**

Your AI Brain Portfolio is now configured with:
- ✅ Email sending to **aibrain.lb@gmail.com**
- ✅ Active navigation highlighting
- ✅ Professional animations
- ✅ One featured certificate
- ✅ Clean project display

**Just add your Gmail App Password and you're ready to go!** 🚀

---

## 📞 **Need Help?**

If emails aren't working:
1. Double-check Gmail App Password
2. Verify 2FA is enabled
3. Check .env file has correct email
4. Look at server console for errors
5. Try restarting the server

**Everything should work perfectly once the App Password is configured!**
