import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../utils/axios'

export const useDashboardStore = defineStore('dashboard', () => {
  // State
  const overview = ref({
    total_kpis: 0,
    on_track: 0,
    at_risk: 0,
    off_track: 0,
    average_progress: 0,
    completed_kpis: 0,
    overdue_kpis: 0
  })

  const trends = ref([])
  const statusDistribution = ref([])
  const topKPIs = ref([])
  const recentUpdates = ref([])
  const analytics = ref({
    completed_percentage: 0,
    overdue_percentage: 0,
    average_progress: 0,
    status_percentages: {},
    progress_ranges: {
      '0-25': 0,
      '26-50': 0,
      '51-75': 0,
      '76-100': 0
    }
  })

  const loading = ref(false)
  const error = ref(null)
  const userFilter = ref('current_user') // 'current_user' or 'all'

  // Getters
  const isDataLoaded = computed(() => {
    return !loading.value && !error.value && overview.value.total_kpis > 0
  })

  const isAdminView = computed(() => {
    return userFilter.value === 'all'
  })

  const getFilterText = computed(() => {
    return isAdminView.value ? 'ข้อมูลทั้งหมด' : 'ข้อมูลของฉัน'
  })

  const statusPercentages = computed(() => {
    if (statusDistribution.value.percentages) {
      return statusDistribution.value.percentages
    }
    return {}
  })

  const totalKPIsFromStatus = computed(() => {
    return statusDistribution.value.total_kpis || 0
  })

  const trendsPeriod = computed(() => {
    return trends.value.period || 'month'
  })

  const trendsGroupBy = computed(() => {
    return trends.value.group_by || 'week'
  })

  const trendsFilters = computed(() => {
    return trends.value.filters || {}
  })

  const topKPIsSortBy = computed(() => {
    return topKPIs.value.sort_by || 'progress'
  })

  const topKPIsLimit = computed(() => {
    return topKPIs.value.limit || 10
  })

  const topKPIsFilters = computed(() => {
    return topKPIs.value.filters || {}
  })

  const recentUpdatesLimit = computed(() => {
    return recentUpdates.value.limit || 10
  })

  const recentUpdatesFilters = computed(() => {
    return recentUpdates.value.filters || {}
  })

  const analyticsPeriod = computed(() => {
    return analytics.value.period || 'month'
  })

  const analyticsFilters = computed(() => {
    return analytics.value.filters || {}
  })

  const statusBreakdown = computed(() => {
    return analytics.value.status_breakdown || {}
  })

  const statusChartData = computed(() => {
    // รองรับทั้งรูปแบบใหม่และเก่า
    if (statusDistribution.value.status_distribution) {
      // รูปแบบใหม่: { "On Track": 0, "At Risk": 0, "Off Track": 1 }
      return Object.entries(statusDistribution.value.status_distribution).map(([status, count]) => ({
        name: status,
        value: count
      }))
    } else if (Array.isArray(statusDistribution.value)) {
      // รูปแบบเก่า: [{ status: "On Track", count: 0 }]
      return statusDistribution.value.map(item => ({
        name: item.status,
        value: item.count
      }))
    }
    return []
  })

  const trendsChartData = computed(() => {
    // รองรับทั้งรูปแบบใหม่และเก่า
    let trendsArray = []
    
    if (trends.value.trends && Array.isArray(trends.value.trends)) {
      // รูปแบบใหม่: { trends: [{ period: "2025-W4", ... }] }
      trendsArray = trends.value.trends
    } else if (Array.isArray(trends.value)) {
      // รูปแบบเก่า: [{ period: "2025-W4", on_track: 0, at_risk: 1, off_track: 0 }]
      trendsArray = trends.value
    }
    
    return {
      categories: trendsArray.map(item => item.period),
      series: [
        {
          name: 'On Track',
          data: trendsArray.map(item => item.on_track || 0)
        },
        {
          name: 'At Risk', 
          data: trendsArray.map(item => item.at_risk || 0)
        },
        {
          name: 'Off Track',
          data: trendsArray.map(item => item.off_track || 0)
        }
      ]
    }
  })

  // Actions
  const fetchOverview = async (params = {}) => {
    try {
      loading.value = true
      error.value = null

      // สร้าง query params ตาม user role
      const queryParams = new URLSearchParams()
      
      // เพิ่ม all_users=true สำหรับ Admin เท่านั้น
      if (params.all_users || userFilter.value === 'all') {
        queryParams.append('all_users', 'true')
      }
      
      // เพิ่ม params อื่นๆ
      if (params.period) queryParams.append('period', params.period)
      if (params.status) queryParams.append('status', params.status)
      if (params.category_id) queryParams.append('category_id', params.category_id)

      const response = await api.get(`/dashboard/overview?${queryParams}`)
      
      if (response.data.success) {
        // อัปเดต userFilter จาก response
        userFilter.value = response.data.user_filter || 'current_user'
        overview.value = response.data.data.overview || response.data.data
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Failed to fetch overview')
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to fetch overview'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchTrends = async (params = {}) => {
    try {
      loading.value = true
      error.value = null

      const queryParams = new URLSearchParams()
      
      if (params.all_users || userFilter.value === 'all') {
        queryParams.append('all_users', 'true')
      }
      
      if (params.period) queryParams.append('period', params.period)
      if (params.group_by) queryParams.append('group_by', params.group_by)

      const response = await api.get(`/dashboard/trends?${queryParams}`)
      
      if (response.data.success) {
        userFilter.value = response.data.user_filter || response.data.data.user_filter || userFilter.value
        trends.value = response.data.data
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Failed to fetch trends')
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to fetch trends'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchStatusDistribution = async (params = {}) => {
    try {
      loading.value = true
      error.value = null

      const queryParams = new URLSearchParams()
      
      if (params.all_users || userFilter.value === 'all') {
        queryParams.append('all_users', 'true')
      }

      const response = await api.get(`/dashboard/status-distribution?${queryParams}`)
      
      if (response.data.success) {
        userFilter.value = response.data.user_filter || response.data.data.user_filter || userFilter.value
        statusDistribution.value = response.data.data
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Failed to fetch status distribution')
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to fetch status distribution'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchTopKPIs = async (params = {}) => {
    try {
      loading.value = true
      error.value = null

      const queryParams = new URLSearchParams()
      
      if (params.all_users || userFilter.value === 'all') {
        queryParams.append('all_users', 'true')
      }
      
      if (params.limit) queryParams.append('limit', params.limit)
      if (params.status) queryParams.append('status', params.status)
      if (params.category_id) queryParams.append('category_id', params.category_id)

      const response = await api.get(`/dashboard/top-performing?${queryParams}`)
      
      if (response.data.success) {
        userFilter.value = response.data.user_filter || response.data.data.user_filter || userFilter.value
        topKPIs.value = response.data.data.kpis || response.data.data
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Failed to fetch top KPIs')
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to fetch top KPIs'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchRecentUpdates = async (params = {}) => {
    try {
      loading.value = true
      error.value = null

      const queryParams = new URLSearchParams()
      
      if (params.all_users || userFilter.value === 'all') {
        queryParams.append('all_users', 'true')
      }
      
      if (params.limit) queryParams.append('limit', params.limit)

      const response = await api.get(`/dashboard/recent-updates?${queryParams}`)
      
      if (response.data.success) {
        userFilter.value = response.data.user_filter || response.data.data.user_filter || userFilter.value
        recentUpdates.value = response.data.data.updates || response.data.data
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Failed to fetch recent updates')
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to fetch recent updates'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchAnalytics = async (params = {}) => {
    try {
      loading.value = true
      error.value = null

      const queryParams = new URLSearchParams()
      
      if (params.all_users || userFilter.value === 'all') {
        queryParams.append('all_users', 'true')
      }
      
      if (params.period) queryParams.append('period', params.period)
      if (params.status) queryParams.append('status', params.status)
      if (params.category_id) queryParams.append('category_id', params.category_id)

      const response = await api.get(`/dashboard/analytics?${queryParams}`)
      
      if (response.data.success) {
        userFilter.value = response.data.user_filter || response.data.data.user_filter || userFilter.value
        analytics.value = response.data.data.analytics || response.data.data
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Failed to fetch analytics')
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to fetch analytics'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchAllDashboardData = async (params = {}) => {
    try {
      loading.value = true
      error.value = null

      const baseParams = {
        period: params.period || 'month',
        all_users: params.all_users || userFilter.value === 'all'
      }

      await Promise.all([
        fetchOverview(baseParams),
        fetchAnalytics(baseParams),
        fetchTopKPIs({ limit: 10, ...baseParams }),
        fetchStatusDistribution({ all_users: baseParams.all_users }),
        fetchTrends({ ...baseParams, group_by: 'week' }),
        fetchRecentUpdates({ limit: 10, all_users: baseParams.all_users })
      ])
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const setUserFilter = (filter) => {
    userFilter.value = filter // 'current_user' or 'all'
  }

  const toggleUserFilter = () => {
    userFilter.value = userFilter.value === 'current_user' ? 'all' : 'current_user'
  }

  const clearError = () => {
    error.value = null
  }

  const resetStore = () => {
    overview.value = {
      total_kpis: 0,
      on_track: 0,
      at_risk: 0,
      off_track: 0,
      average_progress: 0,
      completed_kpis: 0,
      overdue_kpis: 0
    }
    trends.value = []
    statusDistribution.value = []
    topKPIs.value = []
    recentUpdates.value = []
    analytics.value = {
      completed_percentage: 0,
      overdue_percentage: 0,
      average_progress: 0,
      status_percentages: {},
      progress_ranges: {
        '0-25': 0,
        '26-50': 0,
        '51-75': 0,
        '76-100': 0
      }
    }
    error.value = null
  }

  return {
    // State
    overview,
    trends,
    statusDistribution,
    topKPIs,
    recentUpdates,
    analytics,
    loading,
    error,
    userFilter,
    
    // Getters
    isDataLoaded,
    isAdminView,
    getFilterText,
    statusPercentages,
    totalKPIsFromStatus,
    trendsPeriod,
    trendsGroupBy,
    trendsFilters,
    topKPIsSortBy,
    topKPIsLimit,
    topKPIsFilters,
    recentUpdatesLimit,
    recentUpdatesFilters,
    analyticsPeriod,
    analyticsFilters,
    statusBreakdown,
    statusChartData,
    trendsChartData,
    
    // Actions
    fetchOverview,
    fetchTrends,
    fetchStatusDistribution,
    fetchTopKPIs,
    fetchRecentUpdates,
    fetchAnalytics,
    fetchAllDashboardData,
    setUserFilter,
    toggleUserFilter,
    clearError,
    resetStore
  }
})
