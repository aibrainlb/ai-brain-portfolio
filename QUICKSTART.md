# Quick Start Guide

Get your Andy Ters Portfolio up and running in 5 minutes!

## Prerequisites Check

- [ ] Node.js v18+ installed (`node --version`)
- [ ] npm v9+ installed (`npm --version`)
- [ ] MongoDB installed OR MongoDB Atlas account
- [ ] Gmail account (for contact form emails)

## 🚀 Quick Setup (3 Steps)

### Step 1: Install
```bash
# Run the automated setup script
chmod +x setup.sh
./setup.sh
```

### Step 2: Configure
```bash
# Edit .env file with your details
nano .env
```

**Required Configuration:**
```env
MONGODB_URI=mongodb://localhost:27017/portfolio_db
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
ADMIN_EMAIL=your-email@gmail.com
```

**Gmail App Password Setup:**
1. Go to Google Account → Security → 2-Step Verification
2. Scroll to "App passwords"
3. Generate password for "Mail"
4. Copy 16-character password to `EMAIL_PASSWORD`

### Step 3: Run
```bash
# Start development server
npm run dev

# Open browser
# Visit: http://localhost:3000
```

That's it! 🎉

## 🔧 Common Issues & Solutions

### Issue: MongoDB Connection Failed
```bash
# Start MongoDB
sudo systemctl start mongod

# OR use MongoDB Atlas
# Update MONGODB_URI in .env with Atlas connection string
```

### Issue: Email Not Sending
```bash
# Check .env has correct credentials
# Verify 2FA and App Password enabled
# Test SMTP connection
```

### Issue: Port 3000 Already in Use
```bash
# Change PORT in .env
PORT=3001

# OR kill process on port 3000
kill -9 $(lsof -ti:3000)
```

## 📚 Quick Reference

### Development
```bash
npm run dev          # Start with auto-reload
npm start            # Production mode
```

### Project Structure
```
andy-ters-portfolio/
├── backend/         # Server code
├── public/          # Frontend files
├── .env             # Your configuration
└── README.md        # Full documentation
```

### Important Files
- **README.md** - Complete documentation
- **DEPLOYMENT.md** - Deployment guides
- **FIXES.md** - All improvements made
- **.env.example** - Configuration template

### API Endpoints
```
GET  /api/health     # Health check
GET  /api/projects   # List projects
GET  /api/skills     # List skills
POST /api/contact    # Submit contact form
GET  /api/contacts   # List all contacts
```

### Test Contact Form
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test",
    "message": "This is a test message"
  }'
```

## 🎨 Customization

### Change Colors
Edit `public/css/style.css`:
```css
:root {
    --primary: #00d9ff;     /* Your color */
    --secondary: #9d4edd;   /* Your color */
}
```

### Update Content
- Projects: `backend/routes/api.js` (line 80)
- Skills: `backend/routes/api.js` (line 130)
- About: `public/index.html`

### Add Images
Place images in `public/images/` directory

## 🚢 Deploy in 5 Minutes

### Heroku (Fastest)
```bash
heroku create
heroku config:set MONGODB_URI="your-atlas-uri"
heroku config:set EMAIL_USER="your-email"
heroku config:set EMAIL_PASSWORD="your-password"
git push heroku main
```

### Vercel
```bash
vercel
# Follow prompts, then add environment variables in dashboard
```

See **DEPLOYMENT.md** for detailed guides!

## 📞 Need Help?

1. Check **README.md** for full documentation
2. Check **FIXES.md** for troubleshooting
3. Open an issue on GitHub
4. Email: contact@andyters.dev

## ✅ Checklist After Setup

- [ ] Server starts without errors
- [ ] Website loads at localhost:3000
- [ ] All sections display correctly
- [ ] Contact form submits successfully
- [ ] Email notifications received
- [ ] Mobile responsive design works
- [ ] No console errors

## 🎯 Next Steps

1. **Customize** - Update content and colors
2. **Test** - Try all features locally
3. **Deploy** - Choose a platform (Heroku/Vercel/etc)
4. **Monitor** - Check logs and email notifications
5. **Maintain** - Keep dependencies updated

---

**Congratulations! Your portfolio is ready! 🚀**

For detailed documentation, see:
- **README.md** - Complete guide
- **DEPLOYMENT.md** - Deployment instructions
- **CONTRIBUTING.md** - Contribution guidelines
