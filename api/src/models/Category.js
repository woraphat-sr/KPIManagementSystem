const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    index: true,
    sparse: true, // เผื่อบาง record ยังไม่มีค่า id
  },
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
}, {
  timestamps: true, // This creates created_at and updated_at automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Index for better performance
categorySchema.index({ id: 1 });
categorySchema.index({ name: 1 });
categorySchema.index({ createdAt: -1 });

// Pre-save middleware to generate serial ID
categorySchema.pre('save', async function(next) {
  // Only generate ID if it's a new document and doesn't have an ID
  if (this.isNew && !this.id) {
    try {
      // Find the highest existing ID
      const lastCategory = await this.constructor.findOne({}, { id: 1 }).sort({ id: -1 });
      this.id = lastCategory ? lastCategory.id + 1 : 1;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Static method to get categories by name
categorySchema.statics.getCategoriesByName = async function(name) {
  return await this.find({ name: { $regex: name, $options: 'i' } }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Category', categorySchema);
