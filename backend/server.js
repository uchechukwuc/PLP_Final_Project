const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

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

// ------------- CORS FIX HERE -------------------
const allowedOrigins = [
  "https://cleanguard.vercel.app",
  "http://localhost:3000"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed for this origin: " + origin));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);
// ------------------------------------------------

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limit
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
}));

// Static files
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/seafood', seafoodRoutes);
app.use('/api/users', userRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/community', communityRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: "OK" });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err.message);
  res.status(500).json({ success: false, message: err.message });
});

// Connect DB + start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("MongoDB error:", err);
    process.exit(1);
  });

module.exports = app;
