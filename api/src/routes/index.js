const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');
const kpiRoutes = require('./kpis');
const dashboardRoutes = require('./dashboard');
const categoryRoutes = require('./categories');

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/kpis', kpiRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/categories', categoryRoutes);

module.exports = router;
