const mongoose = require('mongoose');

/**
 * Contact Schema - Fixed for better user experience
 */
const contactSchema = new mongoose.Schema({
  // Basic Information (REQUIRED)
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
    index: true
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Please enter a valid email address'
    ],
    index: true
  },
  
  // Message Content (REQUIRED)
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    minlength: [10, 'Message must be at least 10 characters'],
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  
  // Optional Fields (TRULY OPTIONAL - No Validation)
  phone: {
    type: String,
    trim: true,
    default: null // Truly optional
  },
  
  company: {
    type: String,
    trim: true,
    default: null // Truly optional
  },
  
  subject: {
    type: String,
    trim: true,
    default: 'Portfolio Inquiry',
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  
  // Technical Information (Auto-filled)
  ipAddress: {
    type: String,
    trim: true,
    default: 'Unknown'
  },
  
  userAgent: {
    type: String,
    trim: true,
    default: 'Unknown'
  },
  
  referrer: {
    type: String,
    trim: true,
    default: null
  },
  
  // Status Tracking
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'archived', 'spam'],
    default: 'new',
    index: true
  },
  
  category: {
    type: String,
    enum: ['general', 'job', 'collaboration', 'question', 'other'],
    default: 'general'
  },
  
  // Spam/Abuse Protection (NOT for duplicate checking)
  submissionHash: {
    type: String,
    index: true
  },
  
  isRapidSubmission: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  // Disable strict to allow truly optional fields
  strict: 'throw',
  // Optimize for queries
  autoIndex: process.env.NODE_ENV === 'development'
});

// ============================================
// INDEXES (Optimized for queries)
// ============================================

contactSchema.index({ email: 1, createdAt: -1 });
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ submissionHash: 1 }, { 
  unique: false, // Not unique to allow duplicates
  sparse: true 
});

// ============================================
// VIRTUAL PROPERTIES
// ============================================

contactSchema.virtual('isNew').get(function() {
  return this.status === 'new';
});

contactSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

contactSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const seconds = Math.floor((now - this.createdAt) / 1000);
  
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
});

// ============================================
// METHODS
// ============================================

contactSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.updatedAt = new Date();
  return this.save();
};

contactSchema.methods.markAsReplied = function() {
  this.status = 'replied';
  this.updatedAt = new Date();
  return this.save();
};

// ============================================
// STATICS
// ============================================

contactSchema.statics.getRecentSubmissions = function(email, ip, minutes = 5) {
  const timeAgo = new Date(Date.now() - minutes * 60 * 1000);
  
  return this.find({
    $or: [
      { email: email.toLowerCase(), createdAt: { $gt: timeAgo } },
      { ipAddress: ip, createdAt: { $gt: timeAgo } }
    ]
  }).sort({ createdAt: -1 });
};

contactSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        new: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
        read: { $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] } },
        replied: { $sum: { $cond: [{ $eq: ['$status', 'replied'] }, 1, 0] } },
        today: {
          $sum: {
            $cond: [
              { $gt: ['$createdAt', new Date(Date.now() - 24 * 60 * 60 * 1000)] },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $project: {
        total: 1,
        new: 1,
        read: 1,
        replied: 1,
        today: 1,
        responseRate: {
          $multiply: [
            { $divide: [{ $add: ['$read', '$replied'] }, '$total'] },
            100
          ]
        }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    new: 0,
    read: 0,
    replied: 0,
    today: 0,
    responseRate: 0
  };
};

// ============================================
// PRE-SAVE MIDDLEWARE
// ============================================

contactSchema.pre('save', function(next) {
  // Generate submission hash for spam detection (not duplicate prevention)
  if (this.isModified('message')) {
    const crypto = require('crypto');
    this.submissionHash = crypto
      .createHash('md5')
      .update(`${this.email}:${this.message.substring(0, 50)}:${Date.now()}`)
      .digest('hex');
  }
  
  // Update timestamp
  this.updatedAt = new Date();
  
  next();
});

// ============================================
// POST-SAVE MIDDLEWARE
// ============================================

contactSchema.post('save', function(doc, next) {
  if (process.env.LOG_CONTACT_SUBMISSIONS === 'true') {
    console.log(`📬 Contact saved: ${doc.name} <${doc.email}> [${doc._id}]`);
  }
  next();
});
// Add this static method to your Contact.js model:

contactSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        new: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
        read: { $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] } },
        replied: { $sum: { $cond: [{ $eq: ['$status', 'replied'] }, 1, 0] } },
        today: {
          $sum: {
            $cond: [
              { $gt: ['$createdAt', new Date(Date.now() - 24 * 60 * 60 * 1000)] },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $project: {
        total: 1,
        new: 1,
        read: 1,
        replied: 1,
        today: 1,
        responseRate: {
          $multiply: [
            { $divide: [{ $add: ['$read', '$replied'] }, '$total'] },
            100
          ]
        }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    new: 0,
    read: 0,
    replied: 0,
    today: 0,
    responseRate: 0
  };
};
// ============================================
// QUERY MIDDLEWARE
// ============================================

contactSchema.pre('find', function() {
  // Don't show spam in normal queries
  this.where({ status: { $ne: 'spam' } });
});

contactSchema.pre('findOne', function() {
  this.where({ status: { $ne: 'spam' } });
});

// ============================================
// EXPORT MODEL
// ============================================

const Contact = mongoose.model('Contact', contactSchema);

// Create collection if it doesn't exist
if (process.env.AUTO_CREATE_COLLECTIONS === 'true') {
  Contact.createCollection().catch(() => {
    console.log('Contact collection already exists');
  });
}

module.exports = Contact;