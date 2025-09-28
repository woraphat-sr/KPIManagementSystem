const express = require('express');
const router = express.Router();

// Import controllers
const {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUserAccount,
  getAllRoles,
  createUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} = require('../controllers/userController');

// Import middleware
const {
  validateUserRegistration,
  validateUserUpdate,
  validateChangePassword,
  validateObjectId,
  validateNumberId,
  validatePagination,
} = require('../middleware/validation');
const { handleValidationErrors } = require('../middleware/errorHandler');
const { authenticateToken, authorizeAdminById } = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', validateUserUpdate, handleValidationErrors, updateUserProfile);

// @route   PUT /api/users/change-password
// @desc    Change password
// @access  Private
router.put('/change-password', validateChangePassword, handleValidationErrors, changePassword);

// @route   DELETE /api/users/profile
// @desc    Delete user account
// @access  Private
router.delete('/profile', deleteUserAccount);

// @route   GET /api/users/roles
// @desc    Get all roles
// @access  Private
router.get('/roles', getAllRoles);

// Admin routes
// @route   POST /api/users
// @desc    Create user
// @access  Private/Admin
router.post('/', authorizeAdminById, validateUserRegistration, handleValidationErrors, createUser);

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', authorizeAdminById, handleValidationErrors, getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get('/:id', authorizeAdminById, validateNumberId, handleValidationErrors, getUserById);

// @route   PUT /api/users/:id
// @desc    Update user by ID
// @access  Private/Admin
router.put('/:id', authorizeAdminById, validateNumberId, validateUserUpdate, handleValidationErrors, updateUserById);

// @route   DELETE /api/users/:id
// @desc    Delete user by ID
// @access  Private/Admin
router.delete('/:id', authorizeAdminById, validateNumberId, handleValidationErrors, deleteUserById);

module.exports = router;
