// Netlify Serverless Function - Projects API
const mongoose = require('mongoose');

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const uri = process.env.MONGODB_URI || 'mongodb+srv://aibrain:aibrain12@cluster0.ke8o8cs.mongodb.net/portfolioDB?retryWrites=true&w=majority';
  
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  });

  cachedDb = mongoose.connection;
  return cachedDb;
}

const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  technologies: [String],
  features: [String],
  startDate: Date,
  endDate: String,
  status: String,
  githubUrl: String,
  liveUrl: String,
  imageUrl: String,
  featured: Boolean,
  views: Number
});

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

// Default projects
const DEFAULT_PROJECTS = [
  {
    id: 1,
    title: "Kheir W Barke",
    description: "AI-powered supermarket management system with intelligent automation and GPS tracking.",
    technologies: ["AI/ML", "Node.js", "Python", "React", "MongoDB"],
    features: ["AI inventory management", "GPS tracking", "Automated checkout"],
    startDate: "2025-09-01",
    endDate: "Present",
    status: "active",
    githubUrl: "https://github.com/andyters/kheir-w-barke",
    liveUrl: "#",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    featured: true,
    views: 1250
  }
];

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  try {
    await connectToDatabase();
    
    const projects = await Project.find({ status: 'active' })
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(20);

    if (!projects || projects.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          count: DEFAULT_PROJECTS.length,
          data: DEFAULT_PROJECTS
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        count: projects.length,
        data: projects
      })
    };

  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        count: DEFAULT_PROJECTS.length,
        data: DEFAULT_PROJECTS
      })
    };
  }
};
