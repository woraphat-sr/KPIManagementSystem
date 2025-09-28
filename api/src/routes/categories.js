const express = require('express');
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { authenticateToken } = require('../middleware/auth');
const { validateCategory, validateNumberId } = require('../middleware/validation');
const { handleValidationErrors } = require('../middleware/errorHandler');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// @route   POST /api/categories
// @desc    Create new category
// @access  Private
router.post('/', validateCategory, handleValidationErrors, createCategory);

// @route   GET /api/categories
// @desc    Get all categories
// @access  Private
router.get('/', getAllCategories);


// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private
router.put('/:id', validateNumberId, validateCategory, handleValidationErrors, updateCategory);

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private
router.delete('/:id', validateNumberId, handleValidationErrors, deleteCategory);

module.exports = router;
