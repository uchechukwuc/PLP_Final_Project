const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Routes
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const seafoodRoutes = require('./routes/seafood');
const userRoutes = require('./routes/users');
const impactRoutes = require('./routes/impact');
const gamificationRoutes = require('./routes/gamification');
const communityRoutes = require('./routes/community');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS FIXED
app.use(
  cors({
    origin: [
      "https://cleanguard.vercel.app",
      "http://localhost:3000"
    ],
    credentials: true,
  })
);

// Security
app.use(helmet());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limit
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

// Static
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/seafood', seafoodRoutes);
app.use('/api/users', userRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/community', communityRoutes);

// Health
app.get('/api/health', (req, res) => res.json({ success: true }));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

// DB + Server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB error:", err));

module.exports = app;