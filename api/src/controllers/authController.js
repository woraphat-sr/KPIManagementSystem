const { User } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email or username already exists',
    });
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password_hash: password,
  });

  // Populate role information
  await user.populate('role_id');

  // Generate token
  const accessToken = user.generateAuthToken();

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role:  user.role_id.name,
        createdAt: user.createdAt,
      },
      accessToken,
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user by email or username
    const user = await User.findByCredentials(username, password);

    // Generate token
    const accessToken = user.generateAuthToken();

    res.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role_id ? {
            id: user.role_id._id,
            name: user.role_id.name,
            description: user.role_id.description
          } : null,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        accessToken,
      },
    });
  } catch (error) {
    // Handle specific error messages
    if (error.message === 'ชื่อผู้ใช้หรืออีเมลไม่ถูกต้อง') {
      return res.status(401).json({
        success: false,
        message: 'ชื่อผู้ใช้หรืออีเมลไม่ถูกต้อง',
      });
    }
    
    if (error.message === 'รหัสผ่านไม่ถูกต้อง') {
      return res.status(401).json({
        success: false,
        message: 'รหัสผ่านไม่ถูกต้อง',
      });
    }

    // Generic error fallback
    return res.status(401).json({
      success: false,
      message: 'ข้อมูลเข้าสู่ระบบไม่ถูกต้อง',
    });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  // Populate role information for the current user
  await req.user.populate('role_id');
  
  res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role_id ? {
          id: req.user.role_id._id,
          name: req.user.role_id.name,
          description: req.user.role_id.description
        } : null,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
      },
    },
  });
});

module.exports = {
  register,
  login,
  getMe,
};
