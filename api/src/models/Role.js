const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    index: true,
    sparse: true, // เผื่อบาง record ยังไม่มีค่า id
  },
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    enum: ['admin', 'user'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
}, {
  timestamps: true, // This creates created_at and updated_at automatically
});

// Index for better performance
roleSchema.index({ id: 1 });
roleSchema.index({ name: 1 });

// Pre-save middleware to generate serial ID
roleSchema.pre('save', async function(next) {
  // Only generate ID if it's a new document and doesn't have an ID
  if (this.isNew && !this.id) {
    try {
      // Find the highest existing ID
      const lastRole = await this.constructor.findOne({}, { id: 1 }).sort({ id: -1 });
      this.id = lastRole ? lastRole.id + 1 : 1;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Static method to get role by name
roleSchema.statics.getRoleByName = async function(roleName) {
  return await this.findOne({ name: roleName });
};

// Static method to get all roles
roleSchema.statics.getAllRoles = async function() {
  return await this.find().sort({ id: 1 });
};

module.exports = mongoose.model('Role', roleSchema);
