# Andy Ters Portfolio

A professional full-stack portfolio website showcasing AI development, game development, and 3D design expertise.

![Portfolio Banner](https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)

## 🌟 Features

- **Responsive Design** - Mobile-first approach with smooth animations
- **Dynamic Content** - Projects and skills loaded from REST API
- **Contact Form** - Automated email notifications with rate limiting
- **Security** - Helmet.js, CORS, input validation, and rate limiting
- **Database** - MongoDB integration for contact management
- **Modern Stack** - Node.js, Express, MongoDB, Vanilla JavaScript
- **Email Integration** - Nodemailer for automated responses
- **Error Handling** - Comprehensive error handling and logging

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Nodemailer** - Email sending
- **Helmet** - Security middleware
- **Express Rate Limit** - Rate limiting
- **Express Validator** - Input validation

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with animations
- **JavaScript (ES6+)** - Vanilla JS with modern features
- **Font Awesome** - Icon library
- **Google Fonts** - Custom typography

## 📦 Installation

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- MongoDB (v6.0 or higher)

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/andy-ters-portfolio.git
cd andy-ters-portfolio
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Configuration
Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/portfolio_db

# Email Configuration (Gmail example)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
ADMIN_EMAIL=your-admin-email@gmail.com

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

#### Gmail Setup for Email Notifications
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App-Specific Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy the generated 16-character password
3. Use this password in `EMAIL_PASSWORD`

### Step 4: Start MongoDB
```bash
# Using MongoDB service (Linux/Mac)
sudo systemctl start mongod

# Or using MongoDB directly
mongod --dbpath /path/to/your/data/directory
```

### Step 5: Run the Application

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
andy-ters-portfolio/
├── backend/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── controllers/
│   │   └── contactController.js # Contact form logic
│   ├── models/
│   │   ├── Contact.js           # Contact schema
│   │   └── Project.js           # Project schema
│   ├── routes/
│   │   └── api.js               # API routes
│   └── server.js                # Express server
├── public/
│   ├── css/
│   │   └── style.css            # Styles
│   ├── js/
│   │   └── main.js              # Frontend JavaScript
│   ├── images/                  # Image assets
│   └── index.html               # Main HTML file
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore file
├── package.json                 # Dependencies
└── README.md                    # Documentation
```

## 🔌 API Endpoints

### Public Endpoints

#### Health Check
```
GET /api/health
```
Response:
```json
{
  "success": true,
  "message": "API is running smoothly",
  "timestamp": "2025-02-03T...",
  "uptime": 1234.56,
  "environment": "development",
  "version": "1.0.0"
}
```

#### Get Projects
```
GET /api/projects
```
Response:
```json
{
  "success": true,
  "count": 4,
  "data": [...]
}
```

#### Get Skills
```
GET /api/skills
```
Response:
```json
{
  "success": true,
  "count": 18,
  "data": [...]
}
```

#### Submit Contact Form
```
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Portfolio Inquiry",
  "message": "Hello, I'd like to discuss..."
}
```
Response:
```json
{
  "success": true,
  "message": "Thank you! Your message has been sent successfully...",
  "data": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-02-03T..."
  }
}
```

### Admin Endpoints (Authentication Required in Production)

#### Get All Contacts
```
GET /api/contacts?status=new&page=1&limit=20
```

#### Get Contact by ID
```
GET /api/contact/:id
```

#### Update Contact Status
```
PATCH /api/contact/:id
Content-Type: application/json

{
  "status": "replied"
}
```

#### Delete Contact
```
DELETE /api/contact/:id
```

## 🔒 Security Features

1. **Helmet.js** - Sets security HTTP headers
2. **CORS** - Configured cross-origin resource sharing
3. **Rate Limiting** - Prevents brute force and DDoS attacks
4. **Input Validation** - Server-side validation with express-validator
5. **XSS Protection** - HTML escaping on frontend
6. **Error Handling** - Proper error messages without exposing internals
7. **Environment Variables** - Sensitive data kept in .env file

## 🎨 Customization

### Update Personal Information
Edit the following files:
- `public/index.html` - Update meta tags, content, and links
- `backend/routes/api.js` - Update projects and skills data
- `public/css/style.css` - Customize colors and styles

### Color Scheme
Update CSS variables in `style.css`:
```css
:root {
    --primary: #00d9ff;      /* Primary accent color */
    --secondary: #9d4edd;    /* Secondary accent color */
    --dark: #0a0a0f;         /* Dark background */
    --light: #f0f0f0;        /* Light text */
}
```

## 🚀 Deployment

### Deploy to Heroku

1. **Install Heroku CLI**
```bash
npm install -g heroku
```

2. **Login to Heroku**
```bash
heroku login
```

3. **Create Heroku App**
```bash
heroku create andy-ters-portfolio
```

4. **Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
heroku config:set EMAIL_USER=your_email
heroku config:set EMAIL_PASSWORD=your_password
heroku config:set ADMIN_EMAIL=admin_email
```

5. **Deploy**
```bash
git push heroku main
```

### Deploy to Vercel

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Set Environment Variables**
- Go to Vercel Dashboard → Project Settings → Environment Variables
- Add all variables from `.env`

### Deploy to DigitalOcean

1. Create a Droplet with Ubuntu
2. SSH into your server
3. Install Node.js, MongoDB, and PM2
4. Clone your repository
5. Set up environment variables
6. Use PM2 to run the application:
```bash
pm2 start backend/server.js --name portfolio
pm2 startup
pm2 save
```

## 📊 Performance Optimizations

- Lazy loading of images
- CSS and JavaScript minification (production)
- Gzip compression
- Browser caching
- Database indexing
- Rate limiting to prevent abuse

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod
```

### Email Not Sending
- Verify EMAIL_USER and EMAIL_PASSWORD are correct
- Check if 2FA and App Password are enabled for Gmail
- Test SMTP connection manually
- Check server logs for specific errors

### Port Already in Use
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Andy Ters**
- Portfolio: [andyters.dev](https://andyters.dev)
- GitHub: [@andyters](https://github.com/andyters)
- LinkedIn: [Andy Ters](https://linkedin.com/in/andyters)

## 🙏 Acknowledgments

- Icons by [Font Awesome](https://fontawesome.com/)
- Images from [Unsplash](https://unsplash.com/)
- Fonts by [Google Fonts](https://fonts.google.com/)

## 📧 Contact

For any inquiries or feedback, please reach out via the contact form on the website or email directly at contact@andyters.dev

---

**Made with ❤️ by Andy Ters**
