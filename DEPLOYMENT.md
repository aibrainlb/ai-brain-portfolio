# Deployment Guide

Complete guide for deploying Andy Ters Portfolio to various platforms.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [MongoDB Atlas Setup](#mongodb-atlas-setup)
3. [Heroku Deployment](#heroku-deployment)
4. [Vercel Deployment](#vercel-deployment)
5. [DigitalOcean Deployment](#digitalocean-deployment)
6. [Railway Deployment](#railway-deployment)

---

## Prerequisites

Before deploying, ensure you have:
- ✅ A MongoDB database (MongoDB Atlas recommended for cloud)
- ✅ Email credentials (Gmail with App Password)
- ✅ Git installed locally
- ✅ Code pushed to a Git repository (GitHub, GitLab, etc.)

---

## MongoDB Atlas Setup

MongoDB Atlas provides a free cloud-hosted MongoDB database.

### Step 1: Create Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new project (e.g., "Portfolio")

### Step 2: Create Cluster
1. Click "Build a Database"
2. Choose "Free" tier (M0 Sandbox)
3. Select a cloud provider and region (closest to your users)
4. Name your cluster (e.g., "portfolio-cluster")
5. Click "Create"

### Step 3: Configure Access
1. **Database Access**:
   - Go to "Database Access" in sidebar
   - Click "Add New Database User"
   - Create username and password (save these!)
   - Set permissions to "Read and write to any database"

2. **Network Access**:
   - Go to "Network Access" in sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

### Step 4: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `portfolio_db`

Example:
```
mongodb+srv://username:password@cluster.mongodb.net/portfolio_db?retryWrites=true&w=majority
```

---

## Heroku Deployment

### Step 1: Install Heroku CLI
```bash
# macOS (Homebrew)
brew tap heroku/brew && brew install heroku

# Windows (download installer)
# https://devcenter.heroku.com/articles/heroku-cli

# Ubuntu
curl https://cli-assets.heroku.com/install.sh | sh
```

### Step 2: Login
```bash
heroku login
```

### Step 3: Create Heroku App
```bash
cd andy-ters-portfolio
heroku create andy-ters-portfolio
```

### Step 4: Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/portfolio_db"
heroku config:set EMAIL_SERVICE=gmail
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASSWORD=your-app-specific-password
heroku config:set ADMIN_EMAIL=your-admin-email@gmail.com
heroku config:set RATE_LIMIT_WINDOW_MS=900000
heroku config:set RATE_LIMIT_MAX_REQUESTS=100
heroku config:set ALLOWED_ORIGINS=https://andy-ters-portfolio.herokuapp.com
```

### Step 5: Create Procfile
```bash
echo "web: node backend/server.js" > Procfile
```

### Step 6: Deploy
```bash
git add .
git commit -m "Prepare for Heroku deployment"
git push heroku main
```

### Step 7: Open App
```bash
heroku open
```

### Troubleshooting Heroku
```bash
# View logs
heroku logs --tail

# Restart app
heroku restart

# Check dyno status
heroku ps
```

---

## Vercel Deployment

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Create vercel.json
Create `vercel.json` in project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "public/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Step 3: Deploy
```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Choose your account
- Link to existing project? **N**
- Project name? **andy-ters-portfolio**
- Directory? **./** (press Enter)

### Step 4: Set Environment Variables
```bash
vercel env add MONGODB_URI
vercel env add EMAIL_USER
vercel env add EMAIL_PASSWORD
vercel env add ADMIN_EMAIL
```

Or via Vercel Dashboard:
1. Go to your project on Vercel
2. Settings → Environment Variables
3. Add all variables from your `.env` file

### Step 5: Deploy to Production
```bash
vercel --prod
```

---

## DigitalOcean Deployment

### Step 1: Create Droplet
1. Log in to DigitalOcean
2. Create → Droplets
3. Choose Ubuntu 22.04 LTS
4. Select plan (Basic $6/month is sufficient)
5. Choose datacenter region
6. Add SSH key or use password
7. Create Droplet

### Step 2: Connect to Droplet
```bash
ssh root@your_droplet_ip
```

### Step 3: Install Node.js and MongoDB
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js (using NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org

# Start MongoDB
systemctl start mongod
systemctl enable mongod

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx (web server)
apt install -y nginx
```

### Step 4: Clone and Setup Project
```bash
# Clone repository
cd /var/www
git clone https://github.com/yourusername/andy-ters-portfolio.git
cd andy-ters-portfolio

# Install dependencies
npm install --production

# Create .env file
nano .env
```

Add your environment variables and save (Ctrl+X, Y, Enter)

### Step 5: Start with PM2
```bash
# Start application
pm2 start backend/server.js --name portfolio

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Step 6: Configure Nginx
```bash
nano /etc/nginx/sites-available/portfolio
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your_domain.com www.your_domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 7: Setup SSL with Certbot (Optional)
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your_domain.com -d www.your_domain.com
```

### Step 8: Setup Firewall
```bash
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw enable
```

---

## Railway Deployment

### Step 1: Sign Up
1. Go to [Railway](https://railway.app)
2. Sign up with GitHub

### Step 2: New Project
1. Click "New Project"
2. Choose "Deploy from GitHub repo"
3. Select your repository

### Step 3: Add Environment Variables
1. Go to your project
2. Click "Variables" tab
3. Add all variables from `.env`:
   - NODE_ENV=production
   - MONGODB_URI=your_mongodb_atlas_uri
   - EMAIL_USER=your_email
   - EMAIL_PASSWORD=your_password
   - ADMIN_EMAIL=admin_email
   - PORT=3000

### Step 4: Configure Start Command
1. Go to Settings
2. Under "Deploy", set start command:
   ```
   node backend/server.js
   ```

### Step 5: Deploy
Railway will automatically deploy your application.

---

## Post-Deployment Checklist

After deploying to any platform:

- [ ] Test all pages load correctly
- [ ] Test contact form submission
- [ ] Verify email notifications work
- [ ] Check API endpoints respond correctly
- [ ] Test on mobile devices
- [ ] Setup domain name (if applicable)
- [ ] Enable SSL/HTTPS
- [ ] Setup monitoring (e.g., UptimeRobot)
- [ ] Configure backups for database
- [ ] Test error handling
- [ ] Check application logs

---

## Monitoring and Maintenance

### Application Monitoring
- **Heroku**: Use Heroku logs and metrics
- **Vercel**: Built-in analytics dashboard
- **DigitalOcean**: PM2 monitoring with `pm2 monit`

### Database Backups
- **MongoDB Atlas**: Automatic backups included
- **Local MongoDB**: Setup cron job for backups

### Update Application
```bash
# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install

# Restart application
pm2 restart portfolio  # For DigitalOcean
# OR push to git for automatic deployment (Heroku/Vercel)
```

---

## Need Help?

If you encounter issues:
1. Check application logs
2. Verify all environment variables are set
3. Ensure database connection string is correct
4. Check firewall and network settings
5. Review platform-specific documentation

For platform-specific support:
- **Heroku**: https://help.heroku.com
- **Vercel**: https://vercel.com/support
- **DigitalOcean**: https://docs.digitalocean.com
- **Railway**: https://docs.railway.app
