const { KPI, KPIUpdate, User } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get KPI dashboard overview
// @route   GET /api/dashboard/overview
// @access  Private
const getDashboardOverview = asyncHandler(async (req, res) => {
  const { period = 'month', all_users = false, status, category_id } = req.query;
  const userId = req.user.id;

  // Build base query
  const query = {};
  if (!all_users) {
    query.assigned_user = userId;
  }
  
  // Status filter
  if (status) {
    query.status = status;
  }
  
  // Category filter
  if (category_id) {
    query.category_id = parseInt(category_id);
  }

  // Date range for period filtering based on KPI start/end dates
  const now = new Date();
  let dateFilter = {};
  
  switch (period) {
    case 'week':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = {
        $or: [
          { start_date: { $gte: weekAgo } },
          { end_date: { $gte: weekAgo } },
          { $and: [{ start_date: { $lte: weekAgo } }, { end_date: { $gte: weekAgo } }] }
        ]
      };
      break;
    case 'month':
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = {
        $or: [
          { start_date: { $gte: monthAgo } },
          { end_date: { $gte: monthAgo } },
          { $and: [{ start_date: { $lte: monthAgo } }, { end_date: { $gte: monthAgo } }] }
        ]
      };
      break;
    case 'quarter':
      const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      dateFilter = {
        $or: [
          { start_date: { $gte: quarterAgo } },
          { end_date: { $gte: quarterAgo } },
          { $and: [{ start_date: { $lte: quarterAgo } }, { end_date: { $gte: quarterAgo } }] }
        ]
      };
      break;
    case 'year':
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      dateFilter = {
        $or: [
          { start_date: { $gte: yearAgo } },
          { end_date: { $gte: yearAgo } },
          { $and: [{ start_date: { $lte: yearAgo } }, { end_date: { $gte: yearAgo } }] }
        ]
      };
      break;
    default:
      dateFilter = {};
  }

  // Get KPIs with date filter
  const kpiQuery = { ...query, ...dateFilter };
  const kpis = await KPI.find(kpiQuery);

  // Calculate statistics
  const totalKPIs = kpis.length;
  const onTrackKPIs = kpis.filter(kpi => kpi.status === 'On Track').length;
  const atRiskKPIs = kpis.filter(kpi => kpi.status === 'At Risk').length;
  const offTrackKPIs = kpis.filter(kpi => kpi.status === 'Off Track').length;

  // Calculate achievement percentage
  const achievedKPIs = kpis.filter(kpi => kpi.progress_percentage >= 100).length;
  const achievementPercentage = totalKPIs > 0 ? Math.round((achievedKPIs / totalKPIs) * 100) : 0;

  // Calculate average progress
  const totalProgress = kpis.reduce((sum, kpi) => sum + kpi.progress_percentage, 0);
  const averageProgress = totalKPIs > 0 ? Math.round(totalProgress / totalKPIs) : 0;

  // Get overdue KPIs (overdue and not achieved)
  const overdueKPIs = kpis.filter(kpi => 
    kpi.days_remaining < 0 && 
    kpi.status !== 'Off Track' && 
    kpi.progress_percentage < 100
  );

  res.json({
    success: true,
    data: {
      overview: {
        total_kpis: totalKPIs,
        on_track: onTrackKPIs,
        at_risk: atRiskKPIs,
        off_track: offTrackKPIs,
        achieved_kpis: achievedKPIs,
        achievement_percentage: achievementPercentage,
        average_progress: averageProgress,
        overdue_kpis: overdueKPIs.length,
    },
    period,
    user_filter: all_users ? 'all' : 'current_user',
    filters: {
      status: status || 'all',
      category_id: category_id || 'all'
    }
  },
});
});

// @desc    Get KPI trends over time
// @route   GET /api/dashboard/trends
// @access  Private
const getKPITrends = asyncHandler(async (req, res) => {
  const { period = 'month', group_by = 'week', all_users = false, status } = req.query;
  const userId = req.user.id;

  // Build base query
  const query = {};
  if (!all_users) {
    query.updated_by = userId;
  }
  
  // Status filter for updates
  if (status) {
    // Need to get KPI IDs with specific status first
    const kpisWithStatus = await KPI.find({ 
      status: status,
      ...(all_users ? {} : { assigned_user: userId })
    }).select('id');
    const kpiIds = kpisWithStatus.map(kpi => kpi.id);
    query.kpi_id = { $in: kpiIds };
  }

  // Date range
  let startDate;
  const now = new Date();
  
  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'quarter':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Get KPI updates within date range
  const updates = await KPIUpdate.find({
    ...query,
    createdAt: { $gte: startDate }
  }).sort({ createdAt: 1 });
  
  // Get KPI details for progress calculation
  const kpiIds = [...new Set(updates.map(update => update.kpi_id))];
  const kpis = await KPI.find({ id: { $in: kpiIds } });

  // Group updates by time period
  const trends = {};
  const groupByDays = group_by === 'week' ? 7 : group_by === 'day' ? 1 : 1;

  updates.forEach(update => {
    const date = new Date(update.createdAt);
    const groupKey = group_by === 'week' 
      ? `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`
      : group_by === 'month'
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    if (!trends[groupKey]) {
      trends[groupKey] = {
        period: groupKey,
        updates_count: 0,
        total_value: 0,
        average_value: 0,
        total_progress: 0,
        average_progress: 0,
      };
    }

    // Get KPI details for progress calculation
    const kpi = kpis.find(k => k.id === update.kpi_id);
    const progress = kpi ? (update.updated_value / kpi.target_value) * 100 : 0;

    trends[groupKey].updates_count++;
    trends[groupKey].total_value += update.updated_value;
    trends[groupKey].total_progress += progress;
    trends[groupKey].average_value = trends[groupKey].total_value / trends[groupKey].updates_count;
    trends[groupKey].average_progress = trends[groupKey].total_progress / trends[groupKey].updates_count;
  });

  // Convert to array and sort by period
  const trendsArray = Object.values(trends).sort((a, b) => a.period.localeCompare(b.period));

  res.json({
    success: true,
    data: {
      trends: trendsArray,
      period,
      group_by,
      user_filter: all_users ? 'all' : 'current_user',
      filters: {
        status: status || 'all'
      }
    },
  });
});

// @desc    Get KPI status distribution
// @route   GET /api/dashboard/status-distribution
// @access  Private
const getStatusDistribution = asyncHandler(async (req, res) => {
  const { category_id, all_users = false, status } = req.query;
  const userId = req.user.id;

  // Build query
  const query = {};
  if (!all_users) {
    query.assigned_user = userId;
  }
  
  // Category filter
  if (category_id) {
    query.category_id = parseInt(category_id);
  }
  
  // Status filter
  if (status) {
    query.status = status;
  }

  // Get KPIs
  const kpis = await KPI.find(query);

  // Group by status
  const statusDistribution = {
    'On Track': kpis.filter(kpi => kpi.status === 'On Track').length,
    'At Risk': kpis.filter(kpi => kpi.status === 'At Risk').length,
    'Off Track': kpis.filter(kpi => kpi.status === 'Off Track').length,
  };

  // Calculate percentages
  const total = kpis.length;
  const percentages = {};
  Object.keys(statusDistribution).forEach(status => {
    percentages[status] = total > 0 ? Math.round((statusDistribution[status] / total) * 100) : 0;
  });

  res.json({
    success: true,
    data: {
      status_distribution: statusDistribution,
      percentages,
      total_kpis: total,
      user_filter: all_users ? 'all' : 'current_user',
      filters: {
        category_id: category_id || 'all',
        status: status || 'all'
      }
    },
  });
});

// @desc    Get top performing KPIs
// @route   GET /api/dashboard/top-performing
// @access  Private
const getTopPerformingKPIs = asyncHandler(async (req, res) => {
  const { limit = 10, sort_by = 'progress', all_users = false, status, category_id } = req.query;
  const userId = req.user.id;

  // Build query
  const query = {};
  if (!all_users) {
    query.assigned_user = userId;
  }
  
  // Status filter
  if (status) {
    query.status = status;
  }
  
  // Category filter
  if (category_id) {
    query.category_id = parseInt(category_id);
  }

  // Sort options
  let sortOptions = {};
  switch (sort_by) {
    case 'progress':
      sortOptions = { progress_percentage: -1 };
      break;
    case 'achievement':
      sortOptions = { actual_value: -1 };
      break;
    case 'recent':
      sortOptions = { updatedAt: -1 };
      break;
    default:
      sortOptions = { progress_percentage: -1 };
  }

  // Get top KPIs
  const kpis = await KPI.find(query)
    .sort(sortOptions)
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: {
      kpis: kpis.map(kpi => ({
        id: kpi.id,
        title: kpi.title,
        description: kpi.description,
        target_value: kpi.target_value,
        actual_value: kpi.actual_value,
        status: kpi.status,
        progress_percentage: kpi.progress_percentage,
        days_remaining: kpi.days_remaining,
        assigned_user: kpi.assigned_user,
        start_date: kpi.start_date,
        end_date: kpi.end_date,
        updatedAt: kpi.updatedAt,
      })),
      sort_by,
      limit: parseInt(limit),
      user_filter: all_users ? 'all' : 'current_user',
      filters: {
        status: status || 'all',
        category_id: category_id || 'all'
      }
    },
  });
});

// @desc    Get recent KPI updates
// @route   GET /api/dashboard/recent-updates
// @access  Private
const getRecentUpdates = asyncHandler(async (req, res) => {
  const { limit = 10, all_users = false, status } = req.query;
  const userId = req.user.id;

  // Build query
  const query = {};
  if (!all_users) {
    query.updated_by = userId;
  }
  
  // Status filter for updates
  if (status) {
    // Need to get KPI IDs with specific status first
    const kpisWithStatus = await KPI.find({ 
      status: status,
      ...(all_users ? {} : { assigned_user: userId })
    }).select('id');
    const kpiIds = kpisWithStatus.map(kpi => kpi.id);
    query.kpi_id = { $in: kpiIds };
  }

  // Get recent updates
  const updates = await KPIUpdate.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  // Get KPI details and user details for each update
  const updatesWithKPIDetails = await Promise.all(
    updates.map(async (update) => {
      const kpi = await KPI.findOne({ id: update.kpi_id });
      const updatedByUser = await User.findOne({ id: update.updated_by });
      return {
        id: update.id,
        kpi_id: update.kpi_id,
        kpi_title: kpi ? kpi.title : 'Unknown KPI',
        kpi_status: kpi ? kpi.status : 'Unknown',
        updated_value: update.updated_value,
        comment: update.comment,
        updated_by: update.updated_by,
        updated_by_name: updatedByUser ? updatedByUser.username : 'Unknown User',
        createdAt: update.createdAt,
      };
    })
  );

  res.json({
    success: true,
    data: {
      updates: updatesWithKPIDetails,
      limit: parseInt(limit),
      user_filter: all_users ? 'all' : 'current_user',
      filters: {
        status: status || 'all'
      }
    },
  });
});

// @desc    Get KPI analytics summary
// @route   GET /api/dashboard/analytics
// @access  Private
const getKPIAnalytics = asyncHandler(async (req, res) => {
  const { period = 'month', all_users = false, status, category_id } = req.query;
  const userId = req.user.id;

  // Build base query
  const query = {};
  if (!all_users) {
    query.assigned_user = userId;
  }
  
  // Status filter
  if (status) {
    query.status = status;
  }
  
  // Category filter
  if (category_id) {
    query.category_id = parseInt(category_id);
  }

  // Get all KPIs
  const kpis = await KPI.find(query);
  const totalKPIs = kpis.length;

  // Calculate analytics
  const analytics = {
    total_kpis: totalKPIs,
    completed_kpis: kpis.filter(kpi => kpi.progress_percentage >= 100).length,
    overdue_kpis: kpis.filter(kpi => 
      kpi.days_remaining < 0 && 
      kpi.status !== 'Off Track' && 
      kpi.progress_percentage < 100
    ).length,
    average_progress: totalKPIs > 0 
      ? Math.round(kpis.reduce((sum, kpi) => sum + kpi.progress_percentage, 0) / totalKPIs)
      : 0,
    status_breakdown: {
      'On Track': kpis.filter(kpi => kpi.status === 'On Track').length,
      'At Risk': kpis.filter(kpi => kpi.status === 'At Risk').length,
      'Off Track': kpis.filter(kpi => kpi.status === 'Off Track').length,
    },
    status_percentages: {
      'On Track': totalKPIs > 0 ? Math.round((kpis.filter(kpi => kpi.status === 'On Track').length / totalKPIs) * 100) : 0,
      'At Risk': totalKPIs > 0 ? Math.round((kpis.filter(kpi => kpi.status === 'At Risk').length / totalKPIs) * 100) : 0,
      'Off Track': totalKPIs > 0 ? Math.round((kpis.filter(kpi => kpi.status === 'Off Track').length / totalKPIs) * 100) : 0,
    },
    progress_ranges: {
      '0-25%': kpis.filter(kpi => kpi.progress_percentage >= 0 && kpi.progress_percentage <= 25).length,
      '26-50%': kpis.filter(kpi => kpi.progress_percentage >= 26 && kpi.progress_percentage <= 50).length,
      '51-75%': kpis.filter(kpi => kpi.progress_percentage >= 51 && kpi.progress_percentage <= 75).length,
      '76-99%': kpis.filter(kpi => kpi.progress_percentage >= 76 && kpi.progress_percentage <= 99).length,
      '100%+': kpis.filter(kpi => kpi.progress_percentage >= 100).length,
    },
  };

  res.json({
    success: true,
    data: {
      analytics,
      period,
      user_filter: all_users ? 'all' : 'current_user',
      filters: {
        status: status || 'all',
        category_id: category_id || 'all'
      }
    },
  });
});

module.exports = {
  getDashboardOverview,
  getKPITrends,
  getStatusDistribution,
  getTopPerformingKPIs,
  getRecentUpdates,
  getKPIAnalytics,
};
