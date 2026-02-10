const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Database
const database = require('./config/database');

// Routes
const apiRoutes = require('./routes/api');
const devRoutes = require('./routes/dev');

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// DATABASE CONNECTION
// ============================================
database.connect().catch(console.error);

// ============================================
// SECURITY MIDDLEWARE
// ============================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "http://localhost:3000"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ============================================
// CORS CONFIGURATION (FIXED)
// ============================================
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ];

app.use(cors({
  origin: function (origin, callback) {
    // Allow all in development
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Allow requests with no origin (like mobile apps)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check against allowed origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: process.env.CORS_CREDENTIALS === 'true',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight
app.options('*', cors());

// ============================================
// RATE LIMITING (FIXED - NOT STRICT)
// ============================================
if (process.env.RATE_LIMIT_ENABLED === 'true') {
  const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
      success: false,
      message: 'Too many requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false
  });
  
  // Apply to API routes
  app.use('/api/', apiLimiter);
  
  console.log('✅ Rate limiting enabled');
} else {
  console.log('⚠️  Rate limiting disabled');
}

// ============================================
// LOGGING MIDDLEWARE
// ============================================
if (process.env.LOG_REQUESTS === 'true') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => {
        console.log(message.trim());
      }
    }
  }));
  
  // Custom contact form logging
  app.use('/api/contact', (req, res, next) => {
    const start = Date.now();
    const originalSend = res.send;
    
    res.send = function(data) {
      const duration = Date.now() - start;
      console.log(`📝 Contact Form: ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
      
      if (res.statusCode >= 400 && typeof data === 'string') {
        try {
          const jsonData = JSON.parse(data);
          if (!jsonData.success) {
            console.log(`   Error: ${jsonData.message}`);
          }
        } catch (e) {
          // Not JSON
        }
      }
      
      originalSend.apply(res, arguments);
    };
    
    next();
  });
}

// ============================================
// BODY PARSING
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// STATIC FILES
// ============================================
app.use(express.static(path.join(__dirname, '../public'), {
  maxAge: parseInt(process.env.STATIC_FILES_CACHE) || 86400000,
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// ============================================
// API ROUTES
// ============================================
app.use('/api', apiRoutes);

// Development routes
if (process.env.NODE_ENV === 'development' && process.env.ENABLE_DEV_ROUTES === 'true') {
  app.use('/api/dev', devRoutes);
}

// ============================================
// DATABASE HEALTH ENDPOINT
// ============================================
app.get('/api/db/health', async (req, res) => {
  try {
    const health = await database.healthCheck();
    res.json({
      success: true,
      database: health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Database health check failed',
      error: error.message
    });
  }
});

// ============================================
// SPA FALLBACK
// ============================================
app.get('*', (req, res, next) => {
  // Don't serve HTML for API routes
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  // Don't serve HTML for file extensions
  if (req.path.match(/\.\w+$/)) {
    return next();
  }
  
  // Serve the SPA
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// ============================================
// ERROR HANDLING
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  
  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS error. Please check your origin.',
      allowedOrigins: allowedOrigins
    });
  }
  
  // Rate limit errors
  if (err.status === 429) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please wait a moment.',
      retryAfter: '15 minutes'
    });
  }
  
  // Default error
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Something went wrong. Please try again later.' 
    : err.message;
  
  res.status(status).json({
    success: false,
    message: message,
    error: process.env.NODE_ENV === 'development' ? {
      name: err.name,
      message: err.message,
      stack: err.stack
    } : undefined
  });
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
const gracefulShutdown = async () => {
  console.log('\n🔄 Starting graceful shutdown...');
  
  try {
    await database.disconnect();
    console.log('✅ Database disconnected');
    
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
    
    // Force close after 5 seconds
    setTimeout(() => {
      console.log('⚠️  Forcing shutdown...');
      process.exit(1);
    }, 5000);
    
  } catch (error) {
    console.error('❌ Shutdown error:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// ============================================
// START SERVER
// ============================================
const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 AI BRAIN PORTFOLIO SERVER v3.0');
  console.log('='.repeat(70));
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Local: http://localhost:${PORT}`);
  console.log(`📁 Static: ./public`);
  console.log(`🗄️  Database: ${process.env.MONGODB_URI ? 'Configured' : 'Local'}`);
  console.log(`📧 Email: ${process.env.EMAIL_ENABLED === 'true' ? 'Enabled' : 'Disabled'}`);
  console.log(`🔧 Dev Routes: ${process.env.ENABLE_DEV_ROUTES === 'true' ? '✅ On' : '❌ Off'}`);
  console.log('='.repeat(70));
  console.log('\n📋 Available Endpoints:');
  console.log('   GET  /api/health          - Health check');
  console.log('   POST /api/contact         - Contact form (FIXED)');
  console.log('   GET  /api/projects        - Portfolio projects');
  console.log('   GET  /api/skills          - Technical skills');
  console.log('   GET  /api/db/health       - Database status');
  
  if (process.env.ENABLE_DEV_ROUTES === 'true') {
    console.log('\n🔧 Development Endpoints:');
    console.log('   GET  /api/dev/contacts/all - All contacts');
    console.log('   DELETE /api/dev/contacts   - Clear all contacts');
    console.log('   POST /api/dev/test-contact - Test submission');
  }
  
  console.log('='.repeat(70) + '\n');
});

module.exports = { app, server };