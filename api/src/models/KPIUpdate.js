const mongoose = require('mongoose');

const kpiUpdateSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    index: true,
    sparse: true, // เผื่อบาง record ยังไม่มีค่า id
  },
  kpi_id: {
    type: Number,
    ref: 'KPI',
    required: [true, 'KPI ID is required'],
  },
  updated_value: {
    type: Number,
    required: [true, 'Updated value is required'],
    min: [0, 'Updated value must be positive'],
  },
  comment: {
    type: String,
    trim: true,
  },
  updated_by: {
    type: Number,
    ref: 'User',
    required: [true, 'Updated by user is required'],
  },
}, {
  timestamps: true, // This creates created_at and updated_at automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Index for better performance
kpiUpdateSchema.index({ id: 1 });
kpiUpdateSchema.index({ kpi_id: 1 });
kpiUpdateSchema.index({ updated_by: 1 });
kpiUpdateSchema.index({ createdAt: -1 });

// Pre-save middleware to generate serial ID
kpiUpdateSchema.pre('save', async function(next) {
  // Only generate ID if it's a new document and doesn't have an ID
  if (this.isNew && !this.id) {
    try {
      // Find the highest existing ID
      const lastUpdate = await this.constructor.findOne({}, { id: 1 }).sort({ id: -1 });
      this.id = lastUpdate ? lastUpdate.id + 1 : 1;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Static method to get updates by KPI
kpiUpdateSchema.statics.getUpdatesByKPI = async function(kpiId) {
  return await this.find({ kpi_id: kpiId }).sort({ createdAt: -1 });
};

// Static method to get updates by user
kpiUpdateSchema.statics.getUpdatesByUser = async function(userId) {
  return await this.find({ updated_by: userId }).sort({ createdAt: -1 });
};

// Static method to get recent updates
kpiUpdateSchema.statics.getRecentUpdates = async function(limit = 10) {
  return await this.find().sort({ createdAt: -1 }).limit(limit);
};

module.exports = mongoose.model('KPIUpdate', kpiUpdateSchema);
