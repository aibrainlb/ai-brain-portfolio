
const mongoose = require('mongoose');

/**
 * Public MongoDB Connection Handler
 */
class Database {
  constructor() {
    // Default to local MongoDB for public deployment
    this.uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio_db';
    this.options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2
    };
    
    this.retryCount = 0;
    this.maxRetries = 5;
    this.reconnectInterval = 5000;
    this.isConnected = false;
    this.connection = null;
    
    console.log('📊 Database Configuration for Public Deployment:');
    console.log(`   URI: ${this.maskUri(this.uri)}`);
  }

  /**
   * Mask URI for security
   */
  maskUri(uri) {
    if (uri.includes('@')) {
      return uri.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@');
    }
    return uri;
  }

  /**
   * Connect to MongoDB
   */
  async connect() {
    try {
      console.log('🔄 Connecting to MongoDB...');
      
      mongoose.set('strictQuery', true);
      
      this.setupEventListeners();
      
      await mongoose.connect(this.uri, this.options);
      
      this.connection = mongoose.connection;
      this.isConnected = true;
      this.retryCount = 0;
      
      console.log('✅ MongoDB Connected Successfully!');
      console.log(`   Database: ${this.connection.name}`);
      console.log(`   Host: ${this.connection.host}`);
      console.log(`   Port: ${this.connection.port}`);
      
      return this.connection;
      
    } catch (error) {
      console.error('❌ MongoDB Connection Error:', error.message);
      
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`   Retry ${this.retryCount}/${this.maxRetries} in ${this.reconnectInterval/1000}s...`);
        
        await this.sleep(this.reconnectInterval);
        return this.connect();
      }
      
      console.error('💥 Max retry attempts reached. Starting without database...');
      // Don't exit process, allow server to run without DB
      return null;
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    mongoose.connection.on('connected', () => {
      console.log('🔗 MongoDB connected');
      this.isConnected = true;
      this.retryCount = 0;
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
      this.isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
      this.isConnected = false;
      
      // Auto-reconnect
      setTimeout(() => {
        console.log('🔄 Attempting to reconnect to MongoDB...');
        this.connect().catch(console.error);
      }, this.reconnectInterval);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
      this.isConnected = true;
    });
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      readyState: this.connection ? this.connection.readyState : 0,
      readyStateName: this.connection ? this.getReadyStateName(this.connection.readyState) : 'DISCONNECTED',
      host: this.connection ? this.connection.host : 'Unknown',
      database: this.connection ? this.connection.name : 'Unknown'
    };
  }

  /**
   * Get ready state name
   */
  getReadyStateName(state) {
    const states = {
      0: 'DISCONNECTED',
      1: 'CONNECTED',
      2: 'CONNECTING',
      3: 'DISCONNECTING'
    };
    return states[state] || 'UNKNOWN';
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      if (!this.isConnected || !this.connection) {
        return { 
          status: 'disconnected', 
          timestamp: new Date().toISOString(),
          error: 'Not connected to MongoDB' 
        };
      }
      
      await this.connection.db.admin().ping();
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: this.connection.name,
        host: this.connection.host
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  /**
   * Sleep function
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Disconnect
   */
  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        console.log('👋 MongoDB disconnected gracefully');
        this.isConnected = false;
        this.connection = null;
      }
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error.message);
    }
  }
}

// Create singleton instance
const database = new Database();

module.exports = database;
