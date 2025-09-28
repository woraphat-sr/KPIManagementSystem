const { User } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  // Get user by ID from database
  const user = await User.findById(req.user._id).select('-password_hash').populate('role_id');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role_id.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    },
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const userId = req.user._id;

  // Check if email is being changed and if it's already taken
  if (email && email !== req.user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already taken',
      });
    }
  }

  // Get user first
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Update fields
  if (email) user.email = email;
  if (password) user.password_hash = password;

  // Save user (this will trigger pre-save middleware for password hashing)
  const updatedUser = await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        password_hash: updatedUser.password_hash,
        role_id: updatedUser.role_id,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    },
  });
});

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { current_password, new_password } = req.body;
  const userId = req.user._id;

  // Validate required fields
  if (!current_password || !new_password) {
    return res.status(400).json({
      success: false,
      message: 'Current password and new password are required',
    });
  }

  // Get user with password
  const user = await User.findById(userId).select('+password_hash');
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Check if current password is correct
  const isCurrentPasswordValid = await user.comparePassword(current_password);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect',
    });
  }

  // Update password
  user.password_hash = new_password;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
const deleteUserAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Hard delete - remove user from database
  await User.findByIdAndDelete(userId);

  res.json({
    success: true,
    message: 'Account deleted successfully',
  });
});

// @desc    Create user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
  const { username, email, password, role_id } = req.body;

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
    role_id: role_id || null, // Use provided role_id or default to null
  });

  // Populate role information
  await user.populate('role_id');

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role_id: user.role_id._id,
        role_name: user.role_id.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    },
  });
});

// @desc    Get all roles 
// @route   GET /api/users/roles
// @access  Private
const getAllRoles = asyncHandler(async (req, res) => {
  const { Role } = require('../models');
  
  // Get all roles
  const roles = await Role.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    data: {
      roles: roles.map(role => ({
        id: role._id,
        name: role.name,
        description: role.description,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      })),
    },
  });
});

const getAllUsers = asyncHandler(async (req, res) => {
  // Build query
  const query = {};
  if (req.query.role_id) {
    query.role_id = req.query.role_id;
  }

  // Get users
  const users = await User.find(query)
    .select('-password_hash')
    .populate('role_id')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: {
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role_id: user.role_id._id,
        role_name: user.role_id.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    },
  });
});

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findOne({ id: parseInt(req.params.id) }).select('-password_hash').populate('role_id');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  res.json({
    success: true,
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
    },
  });
});

// @desc    Update user by ID (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUserById = asyncHandler(async (req, res) => {
  const { username, email, password, role_id } = req.body;

  // Check if username is being changed and if it's already taken
  if (username) {
    const existingUser = await User.findOne({ username, id: { $ne: parseInt(req.params.id) } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken',
      });
    }
  }

  // Check if email is being changed and if it's already taken
  if (email) {
    const existingUser = await User.findOne({ email, id: { $ne: parseInt(req.params.id) } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already taken',
      });
    }
  }

  // Get user first
  const user = await User.findOne({ id: parseInt(req.params.id) });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Update fields
  if (username) user.username = username;
  if (email) user.email = email;
  if (password) user.password_hash = password;
  if (role_id) user.role_id = role_id;

  // Save user (this will trigger pre-save middleware for password hashing)
  const updatedUser = await user.save();

  // Populate role information
  await updatedUser.populate('role_id');

  res.json({
    success: true,
    message: 'User updated successfully',
    data: {
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role_id: updatedUser.role_id._id,
        role_name: updatedUser.role_id.name,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    },
  });
});

// @desc    Delete user by ID (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUserById = asyncHandler(async (req, res) => {
  const user = await User.findOneAndDelete({ id: parseInt(req.params.id) });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  res.json({
    success: true,
    message: 'User deleted successfully',
  });
});

module.exports = {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  changePassword,
  createUser,
  getAllUsers,
  getUserById,
  getAllRoles,
  updateUserById,
  deleteUserById,
};
