const mongoose = require('mongoose');

/**
 * Project Schema for portfolio
 */
const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  
  technologies: [{
    type: String,
    trim: true
  }],
  
  features: [{
    type: String,
    trim: true
  }],
  
  startDate: {
    type: Date,
    required: true
  },
  
  endDate: {
    type: String,
    default: 'Present'
  },
  
  status: {
    type: String,
    enum: ['active', 'completed', 'upcoming', 'archived'],
    default: 'active'
  },
  
  githubUrl: {
    type: String,
    trim: true
  },
  
  liveUrl: {
    type: String,
    trim: true
  },
  
  imageUrl: {
    type: String,
    trim: true,
    default: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  
  featured: {
    type: Boolean,
    default: false
  },
  
  displayOrder: {
    type: Number,
    default: 0
  },
  
  views: {
    type: Number,
    default: 0
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
projectSchema.index({ featured: -1, displayOrder: 1 });
projectSchema.index({ status: 1, createdAt: -1 });

// Virtuals
projectSchema.virtual('formattedStartDate').get(function() {
  return this.startDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });
});

projectSchema.virtual('isLive').get(function() {
  return !this.endDate || this.endDate === 'Present';
});

// Methods
projectSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Pre-save middleware
projectSchema.pre('save', function(next) {
  if (!this.shortDescription && this.description) {
    this.shortDescription = this.description.substring(0, 197) + '...';
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Project', projectSchema);