const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
// Check for required environment variables
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI environment variable is required');
  process.exit(1);
}

// Route files
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const seafoodRoutes = require('./routes/seafood');
const userRoutes = require('./routes/users');
const impactRoutes = require('./routes/impact');
const gamificationRoutes = require('./routes/gamification');
const communityRoutes = require('./routes/community');

// Initialize express app
const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(
  cors({
    origin: "https://cleanguard.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);
// Security headers
app.use(helmet());

// Dev logging middleware
if (process.env.NODE_ENV === 'production') 
   app.use(morgan('dev')); 
    


// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Static folder for uploads
app.use('/uploads', express.static('uploads'));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/seafood', seafoodRoutes);
app.use('/api/users', userRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/community', communityRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CleanGuard API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('✅ MongoDB Connected');

  // Start server only in development
  if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5001;
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`\n${'='.repeat(60)}`);
      console.log('🌊 CLEANGUARD OCEAN SUSTAINABILITY TRACKER');
      console.log(`${'='.repeat(60)}`);
      console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`📍 API URL: http://localhost:${PORT}/api`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`${'='.repeat(60)}\n`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
      console.log(`Error: ${err.message}`);
      server.close(() => process.exit(1));
    });
  }
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

// Export for Vercel serverless functions
module.exports = app;