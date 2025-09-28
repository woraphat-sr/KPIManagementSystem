const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // ถ้าจะใช้ id SERIAL PRIMARY KEY แล้วให้ logic ใน controller เป็นคนรัน serial เอง
  // ให้เพิ่ม field id ที่เป็น Number และ unique
  id: {
    type: Number,
    unique: true,
    index: true,
    sparse: true, // เผื่อบาง record ยังไม่มีค่า id
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Username cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: [100, 'Email cannot exceed 100 characters'],
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  password_hash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't include password in queries by default
  },
  role_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    default: null, // ON DELETE SET NULL equivalent
  },
}, {
  timestamps: true, // This creates created_at and updated_at automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Index for better performance
userSchema.index({ id: 1 });
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ role_id: 1 });

// Pre-save middleware to set default role
userSchema.pre('save', async function(next) {
  // Only set default role if it's a new document and doesn't have a role_id
  if (this.isNew && !this.role_id) {
    try {
      const { Role } = require('./index');
      const userRole = await Role.findOne({ name: 'user' });
      if (userRole) {
        this.role_id = userRole._id;
      }
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Pre-save middleware to generate serial ID
userSchema.pre('save', async function(next) {
  // Only generate ID if it's a new document and doesn't have an ID
  if (this.isNew && !this.id) {
    try {
      // Find the highest existing ID
      const lastUser = await this.constructor.findOne({}, { id: 1 }).sort({ id: -1 });
      this.id = lastUser ? lastUser.id + 1 : 1;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password_hash')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password_hash = await bcrypt.hash(this.password_hash, salt);
    next();
  } catch (error) {
    next(error);
  }
}); 

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

// Instance method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  const jwt = require('jsonwebtoken');
  const config = require('../config');
  
  return jwt.sign(
    { 
      id: this._id, 
      email: this.email, 
      role: this.role_id?.name || 'user' // Fallback to 'user' if role not populated
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

// Static method to find user by email or username
userSchema.statics.findByCredentials = async function(emailOrUsername, password) {
  const user = await this.findOne({
    $or: [
      { email: emailOrUsername },
      { username: emailOrUsername }
    ]
  }).select('+password_hash').populate('role_id');

  if (!user) {
    throw new Error('ชื่อผู้ใช้หรืออีเมลไม่ถูกต้อง');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('รหัสผ่านไม่ถูกต้อง');
  }

  return user;
};

module.exports = mongoose.model('User', userSchema);