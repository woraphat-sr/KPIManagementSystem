const express = require('express');
const router = express.Router();
const {
  getDashboardOverview,
  getKPITrends,
  getStatusDistribution,
  getTopPerformingKPIs,
  getRecentUpdates,
  getKPIAnalytics,
} = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// @route   GET /api/dashboard/overview
// @desc    Get KPI dashboard overview with status indicators
// @access  Private
router.get('/overview', getDashboardOverview);

// @route   GET /api/dashboard/trends
// @desc    Get KPI trends over time
// @access  Private
router.get('/trends', getKPITrends);

// @route   GET /api/dashboard/status-distribution
// @desc    Get KPI status distribution
// @access  Private
router.get('/status-distribution', getStatusDistribution);

// @route   GET /api/dashboard/top-performing
// @desc    Get top performing KPIs
// @access  Private
router.get('/top-performing', getTopPerformingKPIs);

// @route   GET /api/dashboard/top-kpis
// @desc    Get top performing KPIs (alias for top-performing)
// @access  Private
router.get('/top-kpis', getTopPerformingKPIs);

// @route   GET /api/dashboard/recent-updates
// @desc    Get recent KPI updates
// @access  Private
router.get('/recent-updates', getRecentUpdates);

// @route   GET /api/dashboard/analytics
// @desc    Get comprehensive KPI analytics
// @access  Private
router.get('/analytics', getKPIAnalytics);

module.exports = router;
