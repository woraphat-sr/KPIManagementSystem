const { KPI, KPIUpdate, User } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Create new KPI
// @route   POST /api/kpis
// @access  Private
const createKPI = asyncHandler(async (req, res) => {
  const { title, description, category_id, target_value, actual_value, assigned_user, start_date, end_date } = req.body;

  // Validate assigned user exists
  const assignedUser = await User.findOne({ id: assigned_user });
  if (!assignedUser) {
    return res.status(400).json({
      success: false,
      message: 'Assigned user not found',
    });
  }

  // Validate category exists
  const { Category } = require('../models');
  const category = await Category.findOne({ id: category_id });
  if (!category) {
    return res.status(400).json({
      success: false,
      message: 'Category not found',
    });
  }

  // Create KPI
  const kpi = await KPI.create({
    title,
    description,
    category_id,
    target_value,
    actual_value: actual_value || 0,
    assigned_user,
    start_date: new Date(start_date),
    end_date: new Date(end_date),
  });

  res.status(201).json({
    success: true,
    message: 'KPI created successfully',
    data: {
      kpi: {
        id: kpi.id,
        title: kpi.title,
        description: kpi.description,
        target_value: kpi.target_value,
        actual_value: kpi.actual_value,
        status: kpi.status,
        assigned_user: kpi.assigned_user,
        start_date: kpi.start_date,
        end_date: kpi.end_date,
        progress_percentage: kpi.progress_percentage,
        days_remaining: kpi.days_remaining,
        createdAt: kpi.createdAt,
        updatedAt: kpi.updatedAt,
      },
    },
  });
});

// @desc    Get all KPIs with filtering
// @route   GET /api/kpis
// @access  Private
const getAllKPIs = asyncHandler(async (req, res) => {
  const { 
    status, 
    assigned_user, 
    category_id,
    search,
    sort_by = 'createdAt',
    sort_order = 'desc'
  } = req.query;

  // Build query
  const query = {};
  
  if (status) {
    query.status = status;
  }
  
  if (assigned_user) {
    query.assigned_user = parseInt(assigned_user);
  }
  
  if (category_id) {
    query.category_id = parseInt(category_id);
  }
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Sort options
  const sortOptions = {};
  sortOptions[sort_by] = sort_order === 'desc' ? -1 : 1;

  // Get all KPIs
  const kpis = await KPI.find(query).sort(sortOptions);

  // Get category and user details for each KPI
  const kpisWithDetails = await Promise.all(
    kpis.map(async (kpi) => {
      const { Category, User } = require('../models');
      const category = await Category.findOne({ id: kpi.category_id });
      const assignedUser = await User.findOne({ id: kpi.assigned_user });
      return {
        id: kpi.id,
        title: kpi.title,
        description: kpi.description,
        category_id: kpi.category_id,
        category_name: category ? category.name : 'Unknown Category',
        target_value: kpi.target_value,
        actual_value: kpi.actual_value,
        status: kpi.status,
        assigned_user: kpi.assigned_user,
        assigned_user_name: assignedUser ? assignedUser.username : 'Unknown User',
        start_date: kpi.start_date,
        end_date: kpi.end_date,
        progress_percentage: kpi.progress_percentage,
        days_remaining: kpi.days_remaining,
        createdAt: kpi.createdAt,
        updatedAt: kpi.updatedAt,
      };
    })
  );

  res.json({
    success: true,
    data: {
      kpis: kpisWithDetails,
    },
  });
});

// @desc    Get KPI by ID
// @route   GET /api/kpis/:id
// @access  Private
const getKPIBYId = asyncHandler(async (req, res) => {
  const kpi = await KPI.findOne({ id: parseInt(req.params.id) });

  if (!kpi) {
    return res.status(404).json({
      success: false,
      message: 'KPI not found',
    });
  }

  // Get recent updates for this KPI with user details
  const updates = await KPIUpdate.find({ kpi_id: kpi.id })
    .sort({ createdAt: -1 })
    .limit(5);

  // Get user details for each update
  const updatesWithUsers = await Promise.all(
    updates.map(async (update) => {
      const updatedByUser = await User.findOne({ id: update.updated_by });
      return {
        id: update.id,
        updated_value: update.updated_value,
        comment: update.comment,
        updated_by: update.updated_by,
        updated_by_name: updatedByUser ? updatedByUser.username : 'Unknown User',
        createdAt: update.createdAt,
      };
    })
  );

  // Get category and assigned user details
  const { Category } = require('../models');
  const category = await Category.findOne({ id: kpi.category_id });
  const assignedUser = await User.findOne({ id: kpi.assigned_user });

  res.json({
    success: true,
    data: {
      kpi: {
        id: kpi.id,
        title: kpi.title,
        description: kpi.description,
        category_id: kpi.category_id,
        category_name: category ? category.name : 'Unknown Category',
        target_value: kpi.target_value,
        actual_value: kpi.actual_value,
        status: kpi.status,
        assigned_user: kpi.assigned_user,
        assigned_user_name: assignedUser ? assignedUser.username : 'Unknown User',
        start_date: kpi.start_date,
        end_date: kpi.end_date,
        progress_percentage: kpi.progress_percentage,
        days_remaining: kpi.days_remaining,
        createdAt: kpi.createdAt,
        updatedAt: kpi.updatedAt,
      },
      recent_updates: updatesWithUsers,
    },
  });
});

// @desc    Update KPI
// @route   PUT /api/kpis/:id
// @access  Private
const updateKPI = asyncHandler(async (req, res) => {
  const { title, description, target_value, actual_value, status, assigned_user, start_date, end_date } = req.body;

  // Find KPI
  const kpi = await KPI.findOne({ id: parseInt(req.params.id) });
  if (!kpi) {
    return res.status(404).json({
      success: false,
      message: 'KPI not found',
    });
  }

  // Validate assigned user if provided
  if (assigned_user && assigned_user !== kpi.assigned_user) {
    const assignedUser = await User.findOne({ id: assigned_user });
    if (!assignedUser) {
      return res.status(400).json({
        success: false,
        message: 'Assigned user not found',
      });
    }
  }

  // Update fields
  if (title !== undefined) kpi.title = title;
  if (description !== undefined) kpi.description = description;
  if (target_value !== undefined) kpi.target_value = target_value;
  if (actual_value !== undefined) kpi.actual_value = actual_value;
  if (status !== undefined) kpi.status = status;
  if (assigned_user !== undefined) kpi.assigned_user = assigned_user;
  if (start_date !== undefined) kpi.start_date = new Date(start_date);
  if (end_date !== undefined) kpi.end_date = new Date(end_date);

  // Auto-update status based on standard formula if actual_value is updated
  if (actual_value !== undefined) {
    kpi.status = kpi.calculateStatus();
  }

  const updatedKPI = await kpi.save();

  res.json({
    success: true,
    message: 'KPI updated successfully',
    data: {
      kpi: {
        id: updatedKPI.id,
        title: updatedKPI.title,
        description: updatedKPI.description,
        target_value: updatedKPI.target_value,
        actual_value: updatedKPI.actual_value,
        status: updatedKPI.status,
        assigned_user: updatedKPI.assigned_user,
        start_date: updatedKPI.start_date,
        end_date: updatedKPI.end_date,
        progress_percentage: updatedKPI.progress_percentage,
        days_remaining: updatedKPI.days_remaining,
        createdAt: updatedKPI.createdAt,
        updatedAt: updatedKPI.updatedAt,
      },
    },
  });
});

// @desc    Delete KPI
// @route   DELETE /api/kpis/:id
// @access  Private
const deleteKPI = asyncHandler(async (req, res) => {
  const kpi = await KPI.findOneAndDelete({ id: parseInt(req.params.id) });

  if (!kpi) {
    return res.status(404).json({
      success: false,
      message: 'KPI not found',
    });
  }

  // Also delete related KPI updates
  await KPIUpdate.deleteMany({ kpi_id: kpi.id });

  res.json({
    success: true,
    message: 'KPI deleted successfully',
  });
});

// @desc    Update KPI actual value (with tracking)
// @route   PUT /api/kpis/:id/update-value
// @access  Private
const updateKPIValue = asyncHandler(async (req, res) => {
  const { updated_value, comment } = req.body;
  const userId = req.user.id;

  // Find KPI
  const kpi = await KPI.findOne({ id: parseInt(req.params.id) });
  if (!kpi) {
    return res.status(404).json({
      success: false,
      message: 'KPI not found',
    });
  }

  // Update KPI actual value using the model method
  const oldValue = kpi.actual_value;
  await kpi.updateActualValue(updated_value);

  // Create KPI update record
  const kpiUpdate = await KPIUpdate.create({
    kpi_id: kpi.id,
    updated_value,
    comment,
    updated_by: userId,
  });

  res.json({
    success: true,
    message: 'KPI value updated successfully',
    data: {
      kpi: {
        id: kpi.id,
        title: kpi.title,
        actual_value: kpi.actual_value,
        previous_value: oldValue,
        status: kpi.status,
        progress_percentage: kpi.progress_percentage,
      },
      update: {
        id: kpiUpdate.id,
        updated_value: kpiUpdate.updated_value,
        comment: kpiUpdate.comment,
        updated_by: kpiUpdate.updated_by,
        createdAt: kpiUpdate.createdAt,
      },
    },
  });
});

// @desc    Get KPIs by user
// @route   GET /api/kpis/user/:userId
// @access  Private
const getKPIsByUser = asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.userId);
  
  // Verify user exists
  const user = await User.findOne({ id: userId });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  const kpis = await KPI.getKPIsByUser(userId);

  // Get category and assigned user details for each KPI
  const kpisWithDetails = await Promise.all(
    kpis.map(async (kpi) => {
      const { Category } = require('../models');
      const category = await Category.findOne({ id: kpi.category_id });
      const assignedUser = await User.findOne({ id: kpi.assigned_user });
      
      return { 
        id: kpi.id,
        title: kpi.title,
        description: kpi.description,
        category_id: kpi.category_id,
        category_name: category ? category.name : 'Unknown Category',
        target_value: kpi.target_value,
        actual_value: kpi.actual_value,
        status: kpi.status, 
        assigned_user: kpi.assigned_user,
        assigned_user_name: assignedUser ? assignedUser.username : 'Unknown User',
        start_date: kpi.start_date,
        end_date: kpi.end_date,
        progress_percentage: kpi.progress_percentage,
        days_remaining: kpi.days_remaining,
        createdAt: kpi.createdAt,
        updatedAt: kpi.updatedAt,
      };
    })
  );

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      kpis: kpisWithDetails,
    },
  });
});

// @desc    Get KPIs by status
// @route   GET /api/kpis/status/:status
// @access  Private
const getKPIsByStatus = asyncHandler(async (req, res) => {
  const status = req.params.status;
  
  // Validate status
  const validStatuses = ['On Track', 'At Risk', 'Off Track'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status. Must be one of: On Track, At Risk, Off Track',
    });
  }

  const kpis = await KPI.getKPIsByStatus(status);

  res.json({
    success: true,
    data: {
      status,
      kpis: kpis.map(kpi => ({
        id: kpi.id,
        title: kpi.title,
        description: kpi.description,
        target_value: kpi.target_value,
        actual_value: kpi.actual_value,
        status: kpi.status,
        assigned_user: kpi.assigned_user,
        start_date: kpi.start_date,
        end_date: kpi.end_date,
        progress_percentage: kpi.progress_percentage,
        days_remaining: kpi.days_remaining,
        createdAt: kpi.createdAt,
        updatedAt: kpi.updatedAt,
      })),
    },
  });
});

// @desc    Get overdue KPIs
// @route   GET /api/kpis/overdue
// @access  Private
const getOverdueKPIs = asyncHandler(async (req, res) => {
  const overdueKPIs = await KPI.getOverdueKPIs();

  res.json({
    success: true,
    data: {
      kpis: overdueKPIs.map(kpi => ({
        id: kpi.id,
        title: kpi.title,
        description: kpi.description,
        target_value: kpi.target_value,
        actual_value: kpi.actual_value,
        status: kpi.status,
        assigned_user: kpi.assigned_user,
        start_date: kpi.start_date,
        end_date: kpi.end_date,
        progress_percentage: kpi.progress_percentage,
        days_remaining: kpi.days_remaining,
        createdAt: kpi.createdAt,
        updatedAt: kpi.updatedAt,
      })),
    },
  });
});

module.exports = {
  createKPI,
  getAllKPIs,
  getKPIBYId,
  updateKPI,
  deleteKPI,
  updateKPIValue,
  getKPIsByUser,
  getKPIsByStatus,
  getOverdueKPIs,
};
