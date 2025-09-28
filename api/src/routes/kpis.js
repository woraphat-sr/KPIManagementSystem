const express = require('express');
const router = express.Router();
const {
  createKPI,
  getAllKPIs,
  getKPIBYId,
  updateKPI,
  deleteKPI,
  updateKPIValue,
  getKPIsByUser,
  getKPIsByStatus,
  getOverdueKPIs,
} = require('../controllers/kpiController');
const { authenticateToken } = require('../middleware/auth');
const { validateKPI, validateKPIUpdate } = require('../middleware/validation');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// @route   POST /api/kpis
// @desc    Create new KPI
// @access  Private
router.post('/', validateKPI, createKPI);

// @route   GET /api/kpis
// @desc    Get all KPIs with filtering
// @access  Private
router.get('/', getAllKPIs);

// @route   GET /api/kpis/overdue
// @desc    Get overdue KPIs
// @access  Private
router.get('/overdue', getOverdueKPIs);

// @route   GET /api/kpis/user/:userId
// @desc    Get KPIs by user
// @access  Private
router.get('/user/:userId', getKPIsByUser);

// @route   GET /api/kpis/status/:status
// @desc    Get KPIs by status
// @access  Private
router.get('/status/:status', getKPIsByStatus);

// @route   GET /api/kpis/:id
// @desc    Get KPI by ID
// @access  Private
router.get('/:id', getKPIBYId);

// @route   PUT /api/kpis/:id
// @desc    Update KPI
// @access  Private
router.put('/:id', validateKPI, updateKPI);

// @route   PUT /api/kpis/:id/update-value
// @desc    Update KPI actual value with tracking
// @access  Private
router.put('/:id/update-value', validateKPIUpdate, updateKPIValue);

// @route   DELETE /api/kpis/:id
// @desc    Delete KPI
// @access  Private
router.delete('/:id', deleteKPI);

module.exports = router;
