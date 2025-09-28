const express = require('express');
const router = express.Router();

// Import controllers
const {
  register,
  login,
  getMe,
} = require('../controllers/authController');

// Import middleware
const {
  validateUserRegistration,
  validateUserLogin,
} = require('../middleware/validation');
const { handleValidationErrors } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateUserRegistration, handleValidationErrors, register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateUserLogin, handleValidationErrors, login);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, getMe);

module.exports = router;
