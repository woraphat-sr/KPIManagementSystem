import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../utils/axios'

export const useKpiStore = defineStore('kpi', () => {
  // State
  const kpis = ref([])
  const categories = ref([])

  const isLoading = ref(false)
  const error = ref('')

  // Getters
  const totalKpis = computed(() => kpis.value.length)
  
  const kpisByStatus = computed(() => {
    return {
      'on-track': kpis.value.filter(kpi => kpi.status === 'On Track').length,
      'at-risk': kpis.value.filter(kpi => kpi.status === 'At Risk').length,
      'off-track': kpis.value.filter(kpi => kpi.status === 'Off Track').length
    }
  })

  const achievementRate = computed(() => {
    if (totalKpis.value === 0) return 0
    return Math.round((kpisByStatus.value['on-track'] / totalKpis.value) * 100)
  })

  const kpisByCategory = computed(() => {
    const categories = {}
    kpis.value.forEach(kpi => {
      const categoryName = kpi.category_name || kpi.category || 'Unknown Category'
      if (!categories[categoryName]) {
        categories[categoryName] = 0
      }
      categories[categoryName]++
    })
    return categories
  })

  const kpisByUser = computed(() => {
    const users = {}
    kpis.value.forEach(kpi => {
      const userId = kpi.assigned_user || kpi.assignedUser
      if (!users[userId]) {
        users[userId] = 0
      }
      users[userId]++
    })
    return users
  })

  // ดึงข้อมูล KPI ทั้งหมดจาก API
  const fetchAllKpi = async () => {
    try {
      isLoading.value = true
      error.value = ''
      const response = await api.get('/kpis')
      if (response.data.success) {
        kpis.value = response.data.data.kpis
        return response.data.data.kpis
      } else {
        throw new Error(response.data.message || 'ไม่สามารถดึงข้อมูล KPI ได้')
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'ไม่สามารถดึงข้อมูล KPI ได้'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Actions
  const createKpi = async (kpiData) => {
    try {
      isLoading.value = true
      error.value = ''
      
      const response = await api.post('/kpis', kpiData)
      
      if (response.data.success) {
        const newKpi = response.data.data
        kpis.value.push(newKpi)
        return newKpi
      } else {
        throw new Error(response.data.message || 'Failed to create KPI')
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to create KPI'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateKpi = async (id, kpiData) => {
    try {
      isLoading.value = true
      error.value = ''
      
      const response = await api.put(`/kpis/${id}`, kpiData)
      
      if (response.data.success) {
        const updatedKpi = response.data.data
        const index = kpis.value.findIndex(kpi => kpi.id === id)
        if (index !== -1) {
          kpis.value[index] = updatedKpi
        }
        return updatedKpi
      } else {
        throw new Error(response.data.message || 'Failed to update KPI')
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to update KPI'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteKpi = async (id) => {
    try {
      isLoading.value = true
      error.value = ''
      
      const response = await api.delete(`/kpis/${id}`)
      
      if (response.data.success) {
        const index = kpis.value.findIndex(kpi => kpi.id === id)
        if (index !== -1) {
          kpis.value.splice(index, 1)
        }
        return true
      } else {
        throw new Error(response.data.message || 'Failed to delete KPI')
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to delete KPI'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateKpiProgress = async (id, progressData) => {
    try {
      isLoading.value = true
      error.value = ''
      
      const response = await api.put(`/kpis/${id}/update-value`, progressData)
      
      if (response.data.success) {
        // อัปเดตข้อมูล KPI ใน local state
        const index = kpis.value.findIndex(kpi => kpi.id === id)
        if (index !== -1) {
          kpis.value[index] = { ...kpis.value[index], ...response.data.data }
        }
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Failed to update KPI progress')
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to update KPI progress'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getKpiById = async (id) => {
    try {
      isLoading.value = true
      error.value = ''
      
      const response = await api.get(`/kpis/${id}`)
      
      if (response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Failed to get KPI')
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to get KPI'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getKpiWithHistory = async (id) => {
    try {
      isLoading.value = true
      error.value = ''
      
      const response = await api.get(`/kpis/${id}`)
      
      if (response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Failed to get KPI with history')
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to get KPI with history'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getUserKpis = async (userId) => {
    try {
      isLoading.value = true
      error.value = ''
      
      const response = await api.get(`/kpis/user/${userId}`)
      
      if (response.data.success) {
        kpis.value = response.data.data.kpis
        return response.data.data.kpis
      } else {
        throw new Error(response.data.message || 'Failed to get user KPIs')
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to get user KPIs'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const filterKpis = (filters) => {
    return kpis.value.filter(kpi => {
      // Full text search across multiple fields
      if (filters.searchTerm) {
        const search = filters.searchTerm.toLowerCase().trim()
        const title = (kpi.title || '').toLowerCase()
        const description = (kpi.description || '').toLowerCase()
        const categoryName = (kpi.category_name || kpi.category || '').toLowerCase()
        const status = (kpi.status || '').toLowerCase()
        const targetValue = String(kpi.target_value || '').toLowerCase()
        const actualValue = String(kpi.actual_value || '').toLowerCase()
        const assignedUserName = (kpi.assigned_user_name || '').toLowerCase()
        
        const matchesSearch = title.includes(search) ||
                             description.includes(search) ||
                             categoryName.includes(search) ||
                             status.includes(search) ||
                             targetValue.includes(search) ||
                             actualValue.includes(search) ||
                             assignedUserName.includes(search)
        
        if (!matchesSearch) return false
      }
      
      // Status filter
      if (filters.status) {
        const statusMap = {
          'on-track': 'On Track',
          'at-risk': 'At Risk', 
          'off-track': 'Off Track'
        }
        const expectedStatus = statusMap[filters.status] || filters.status
        if (kpi.status !== expectedStatus) return false
      }
      
      // User filter
      if (filters.user && (kpi.assigned_user || kpi.assignedUser) !== filters.user) return false
      
      // Category filter
      if (filters.category) {
        const categoryName = kpi.category_name || kpi.category || 'Unknown Category'
        if (categoryName !== filters.category) return false
      }
      
      return true
    })
  }

  const fetchCategories = async () => {
    try {
      isLoading.value = true
      error.value = ''
      
      const response = await api.get('/categories')
      
      if (response.data.success) {
        categories.value = response.data.data.categories
        return response.data.data.categories
      } else {
        throw new Error(response.data.message || 'Failed to fetch categories')
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to fetch categories'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const clearError = () => {
    error.value = ''
  }

  return {
    // State
    kpis,
    categories,
    isLoading,
    error,
    
    // Getters
    totalKpis,
    kpisByStatus,
    achievementRate,
    kpisByCategory,
    kpisByUser,
    
    // Actions
    fetchAllKpi,
    createKpi,
    updateKpi,
    updateKpiProgress,
    deleteKpi,
    getKpiById,
    getKpiWithHistory,
    getUserKpis,
    fetchCategories,
    filterKpis,
    clearError
  }
})
