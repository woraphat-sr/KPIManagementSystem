const { body, param, query } = require('express-validator');

// User validation rules
const validateUserRegistration = [
  body('username')
    .isLength({ min: 1, max: 50 })
    .withMessage('Username must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .isLength({ max: 100 })
    .withMessage('Email cannot exceed 100 characters')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
];

const validateUserLogin = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .trim(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const validateUserUpdate = [
  body('username')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Username must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .isLength({ max: 100 })
    .withMessage('Email cannot exceed 100 characters')
    .normalizeEmail(),
];

const validateChangePassword = [
  body('current_password')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('new_password')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
];

// Parameter validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
];

// Parameter validation for Number ID
const validateNumberId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid ID format'),
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

// KPI validation rules
const validateKPI = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title cannot exceed 255 characters')
    .trim(),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
    .trim(),
  
  body('target_value')
    .isNumeric()
    .withMessage('Target value must be a number')
    .isFloat({ min: 0 })
    .withMessage('Target value must be positive'),
  
  body('actual_value')
    .optional()
    .isNumeric()
    .withMessage('Actual value must be a number')
    .isFloat({ min: 0 })
    .withMessage('Actual value must be positive'),
  
  body('category_id')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  
  body('assigned_user')
    .isInt({ min: 1 })
    .withMessage('Assigned user ID must be a positive integer'),
  
  body('start_date')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  body('end_date')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.start_date)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
];

const validateKPIUpdate = [
  body('updated_value')
    .isNumeric()
    .withMessage('Updated value must be a number')
    .isFloat({ min: 0 })
    .withMessage('Updated value must be positive'),
  
  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
    .trim(),
];

// Category validation rules
const validateCategory = [
  body('name')
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ max: 100 })
    .withMessage('Category name cannot exceed 100 characters')
    .trim(),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .trim(),
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateChangePassword,
  validateObjectId,
  validateNumberId,
  validatePagination,
  validateKPI,
  validateKPIUpdate,
  validateCategory,
};
