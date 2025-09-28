const mongoose = require('mongoose');

const kpiSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    index: true,
    sparse: true, // เผื่อบาง record ยังไม่มีค่า id
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [255, 'Title cannot exceed 255 characters'],
  },
  description: {
    type: String,
    trim: true,
  },
  category_id: {
    type: Number,
    ref: 'Category',
    required: [true, 'Category is required'],
  },
  target_value: {
    type: Number,
    required: [true, 'Target value is required'],
    min: [0, 'Target value must be positive'],
  },
  actual_value: {
    type: Number,
    default: 0.00,
    min: [0, 'Actual value must be positive'],
  },
  status: {
    type: String,
    enum: ['On Track', 'At Risk', 'Off Track'],
    default: 'On Track',
  },
  assigned_user: {
    type: Number,
    ref: 'User',
    required: [true, 'Assigned user is required'],
  },
  start_date: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  end_date: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value > this.start_date;
      },
      message: 'End date must be after start date',
    },
  },
}, {
  timestamps: true, // This creates created_at and updated_at automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Index for better performance
kpiSchema.index({ id: 1 });
kpiSchema.index({ assigned_user: 1 });
kpiSchema.index({ status: 1 });
kpiSchema.index({ category_id: 1 });
kpiSchema.index({ start_date: 1 });
kpiSchema.index({ end_date: 1 });
kpiSchema.index({ createdAt: -1 });

// Pre-save middleware to generate serial ID
kpiSchema.pre('save', async function(next) {
  // Only generate ID if it's a new document and doesn't have an ID
  if (this.isNew && !this.id) {
    try {
      // Find the highest existing ID
      const lastKPI = await this.constructor.findOne({}, { id: 1 }).sort({ id: -1 });
      this.id = lastKPI ? lastKPI.id + 1 : 1;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Virtual for progress percentage
kpiSchema.virtual('progress_percentage').get(function() {
  if (this.target_value === 0) return 0;
  return Math.round((this.actual_value / this.target_value) * 100);
});

// Virtual for days remaining
kpiSchema.virtual('days_remaining').get(function() {
  const today = new Date();
  const endDate = new Date(this.end_date);
  const diffTime = endDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for time ratio (เวลาที่ผ่านไป / เวลาทั้งหมด * 100)
kpiSchema.virtual('time_ratio').get(function() {
  const today = new Date();
  const startDate = new Date(this.start_date);
  const endDate = new Date(this.end_date);
  
  // คำนวณเวลาทั้งหมด (วัน)
  const totalTime = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  
  // คำนวณเวลาที่ผ่านไป (วัน)
  const elapsedTime = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
  
  // ป้องกันการคำนวณผิดพลาด
  if (totalTime <= 0) return 0;
  if (elapsedTime < 0) return 0;
  if (elapsedTime > totalTime) return 100;
  
  return Math.round((elapsedTime / totalTime) * 100);
});

// Static method to get KPIs by user
kpiSchema.statics.getKPIsByUser = async function(userId) {
  return await this.find({ assigned_user: userId }).sort({ createdAt: -1 });
};

// Static method to get KPIs by status
kpiSchema.statics.getKPIsByStatus = async function(status) {
  return await this.find({ status }).sort({ createdAt: -1 });
};

// Static method to get KPIs by category
kpiSchema.statics.getKPIsByCategory = async function(categoryId) {
  return await this.find({ category_id: categoryId }).sort({ createdAt: -1 });
};


// Static method to get overdue KPIs
kpiSchema.statics.getOverdueKPIs = async function() {
  const today = new Date();
  return await this.find({ 
    end_date: { $lt: today },
    status: { $ne: 'Off Track' }
  }).sort({ end_date: 1 });
};

// Instance method to update actual value
kpiSchema.methods.updateActualValue = function(newValue) {
  this.actual_value = newValue;
  
  // Auto-update status based on standard formula
  this.status = this.calculateStatus();
  
  return this.save();
};

// Instance method to calculate status based on standard formula
kpiSchema.methods.calculateStatus = function() {
  const progress = this.progress_percentage;
  const timeRatio = this.time_ratio;
  
  // กรณีที่ถึงเป้าหมายแล้ว
  if (progress >= 100) {
    return 'On Track';
  }
  
  // กรณีที่หมดเวลาแล้วแต่ยังไม่ถึงเป้า
  if (timeRatio >= 100) {
    return 'Off Track';
  }
  
  // ใช้สูตรมาตรฐาน: เปรียบเทียบ Progress กับ Time Ratio
  // On Track: Progress ≥ Time Ratio (หรือมากกว่าเล็กน้อย เช่น ≥ Time Ratio - 5%)
  if (progress >= (timeRatio - 5)) {
    return 'On Track';
  }
  
  // At Risk: Progress < Time Ratio แต่ไม่ต่ำเกินไป (เช่น มากกว่า Time Ratio - 20%)
  if (progress >= (timeRatio - 20)) {
    return 'At Risk';
  }
  
  // Off Track: Progress ต่ำกว่ามาก
  return 'Off Track';
};

module.exports = mongoose.model('KPI', kpiSchema);
