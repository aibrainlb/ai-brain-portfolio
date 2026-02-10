# 🪟 Windows Quick Start Guide

## ✅ Simple 3-Step Setup

### Step 1: Install Dependencies
```cmd
npm install
```

### Step 2: Create .env File
Create a file called `.env` in the project root with this content:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/portfolio_db
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
ADMIN_EMAIL=your-email@gmail.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ALLOWED_ORIGINS=http://localhost:3000
```

### Step 3: Start the Server

**Option 1: Simple Start (Recommended)**
```cmd
npm start
```

**Option 2: With Auto-Reload (if nodemon is installed)**
```cmd
npm run dev
```

**Option 3: Direct Node Command**
```cmd
node backend/server.js
```

---

## 🚨 Troubleshooting

### Issue: "npm run dev" not working

**Solution 1:** Use `npm start` instead
```cmd
npm start
```

**Solution 2:** Install nodemon globally
```cmd
npm install -g nodemon
npm run dev
```

**Solution 3:** Use Windows-specific script
```cmd
npm run dev-windows
```

### Issue: Missing .env file

**Quick Fix:**
```cmd
# Copy the example file
copy .env.example .env

# Then edit .env with Notepad
notepad .env
```

### Issue: MongoDB not connected

**Check if MongoDB is running:**
```cmd
# Your MongoDB should be running as a Windows service
# Check Windows Services (services.msc) for "MongoDB"
```

**Or use MongoDB Atlas (cloud):**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create free cluster
- Get connection string
- Update MONGODB_URI in .env

---

## ✅ Verification Checklist

Once running, check:
- [ ] Console shows: "✅ MongoDB Connected"
- [ ] Console shows: "🚀 Server running on port 3000"
- [ ] Open browser: http://localhost:3000
- [ ] Website loads successfully
- [ ] No red errors in console

---

## 📝 All Available Commands

```cmd
npm install          # Install dependencies
npm start            # Start server (production mode)
npm run dev          # Start with auto-reload (needs nodemon)
npm run dev-windows  # Windows-friendly start
node backend/server.js   # Direct start
```

---

## 🎯 Recommended: Use npm start

For the simplest experience on Windows, just use:
```cmd
npm start
```

This works every time without any additional setup!

---

## 💡 Quick Commands Reference

### First Time Setup
```cmd
cd andy-ters-portfolio
npm install
copy .env.example .env
notepad .env
```
*(Edit .env with your email and MongoDB settings)*

### Every Time You Code
```cmd
npm start
```

### Open in Browser
```
http://localhost:3000
```

### Stop Server
```
Ctrl + C
```

---

## 🆘 Still Having Issues?

1. **Check Node.js version:**
   ```cmd
   node --version
   ```
   Should be v18 or higher

2. **Check npm version:**
   ```cmd
   npm --version
   ```
   Should be v9 or higher

3. **Reinstall dependencies:**
   ```cmd
   rmdir /s /q node_modules
   npm install
   ```

4. **Check if port 3000 is free:**
   ```cmd
   netstat -ano | findstr :3000
   ```

---

**That's it! Your portfolio should now be running! 🚀**

Visit: http://localhost:3000
