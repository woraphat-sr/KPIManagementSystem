import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/utils/axios'

export const useUsersStore = defineStore('users', () => {
  // State
  const users = ref([])
  const roles = ref([])
  const loading = ref(false)
  const error = ref(null)


  // Computed
  const usersWithRoles = computed(() => {
    return users.value.map(user => {
      // Handle API response structure where role_id can be null or an object
      let roleName = 'Unknown'
      
      if (user.role_id) {
        if (typeof user.role_id === 'object' && user.role_id.name) {
          // API returns role as object with name property
          roleName = user.role_id.name
        } else if (typeof user.role_id === 'number' || typeof user.role_id === 'string') {
          // Legacy structure where role_id is just an ID
          const role = roles.value.find(r => r.id === user.role_id)
          roleName = role ? role.name : 'Unknown'
        }
      }
      
      return {
        ...user,
        role_name: roleName
      }
    })
  })

  const totalUsers = computed(() => users.value.length)
  
  const adminUsers = computed(() => {
    return users.value.filter(user => {
      if (!user.role_id) return false
      
      if ( user.role_name) {
        return user.role_name === 'admin'
      } else if (typeof user.role_id === 'number' || typeof user.role_id === 'string') {
        return user.role_id === 1
      }
      
      return false
    })
  })
  
  const regularUsers = computed(() => {
    return users.value.filter(user => {
      if (!user.role_id) return false
      
      if ( user.role_name) {
        return user.role_name !== 'admin'
      } else if (typeof user.role_id === 'number' || typeof user.role_id === 'string') {
        return user.role_id === 2
      }
      
      return false
    })
  })

  // Actions
  const initializeData = () => {
    console.log('🔄 Initializing users store...')
    // No mock data initialization - data will be fetched from API
    console.log('✅ Users store initialized')
  }

  const fetchUsers = async () => {
    loading.value = true
    error.value = null
    
    try {
      console.log('📡 Fetching users...')
      
      const response = await api.get('/users')
      
      if (response.data?.success) {
        users.value = response.data.data.users
        console.log('✅ Users fetched successfully:', users.value.length)
      } else {
        error.value = response.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้งาน'
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้งาน'
      console.error('❌ Error fetching users:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchRoles = async () => {
    loading.value = true
    error.value = null
    
    try {
      console.log('📡 Fetching roles...')
      // Simulate API call
      const response = await api.get('/users/roles')
      if (response.data?.success) {
        roles.value = response.data.data.roles
        console.log('✅ Users fetched successfully:', roles.value.length)
      } else {
        error.value = response.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้งาน'
      }
      
    } catch (err) {
      error.value = err.message
      console.error('❌ Error fetching roles:', err)
    } finally {
      loading.value = false
    }
  }

  const createUser = async (userData) => {
    loading.value = true
    error.value = null
    
    try {
      console.log('➕ Creating new user:', userData)
      
      const response = await api.post('/users', userData)
      
      if (response.data?.success) {
        const newUser = response.data.data.user
        // Force reactivity by creating new array
        users.value = [...users.value, newUser]
        console.log('✅ User created successfully:', newUser)
        console.log('📊 Updated users array:', users.value.length)
        return newUser
      } else {
        error.value = response.data?.message || 'เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน'
        throw new Error(error.value)
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน'
      console.error('❌ Error creating user:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (id, userData) => {
    loading.value = true
    error.value = null
    
    try {
      console.log('✏️ Updating user:', { id, userData })
      
      const response = await api.put(`/users/${id}`, userData)
      
      if (response.data?.success) {
        const updatedUser = response.data.data.user
        const userIndex = users.value.findIndex(u => u.id === id)
        if (userIndex !== -1) {
          // Force reactivity by replacing the entire array
          users.value = [
            ...users.value.slice(0, userIndex),
            updatedUser,
            ...users.value.slice(userIndex + 1)
          ]
        }
        console.log('✅ User updated successfully:', updatedUser)
        console.log('📊 Updated users array:', users.value.length)
        return updatedUser
      } else {
        error.value = response.data?.message || 'เกิดข้อผิดพลาดในการอัปเดตผู้ใช้งาน'
        throw new Error(error.value)
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปเดตผู้ใช้งาน'
      console.error('❌ Error updating user:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      console.log('🗑️ Deleting user:', id)
      
      const response = await api.delete(`/users/${id}`)
      
      if (response.data?.success) {
        const userIndex = users.value.findIndex(u => u.id === id)
        if (userIndex !== -1) {
          const deletedUser = users.value[userIndex]
          // Force reactivity by creating new array without the deleted user
          users.value = users.value.filter(u => u.id !== id)
          console.log('✅ User deleted successfully:', deletedUser)
          console.log('📊 Updated users array:', users.value.length)
          return deletedUser
        }
      } else {
        error.value = response.data?.message || 'เกิดข้อผิดพลาดในการลบผู้ใช้งาน'
        throw new Error(error.value)
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบผู้ใช้งาน'
      console.error('❌ Error deleting user:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getUserById = (id) => {
    return users.value.find(user => user.id === id)
  }

  const getUserByUsername = (username) => {
    return users.value.find(user => user.username === username)
  }

  const getUserByEmail = (email) => {
    return users.value.find(user => user.email === email)
  }

  const validateUserData = (userData, isUpdate = false) => {
    const errors = []
    
    if (!userData.username || userData.username.trim().length < 3) {
      errors.push('Username must be at least 3 characters long')
    }
    
    if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.push('Please enter a valid email address')
    }
    
    if (!isUpdate && (!userData.password || userData.password.length < 6)) {
      errors.push('Password must be at least 6 characters long')
    }
    
    if (!userData.role_id) {
      errors.push('Please select a role')
    }
    
    // Check for duplicate username
    const existingUser = getUserByUsername(userData.username)
    if (existingUser && (!isUpdate || existingUser.id !== userData.id)) {
      errors.push('Username already exists')
    }
    
    // Check for duplicate email
    const existingEmail = getUserByEmail(userData.email)
    if (existingEmail && (!isUpdate || existingEmail.id !== userData.id)) {
      errors.push('Email already exists')
    }
    
    return errors
  }


  return {
    // State
    users,
    roles,
    loading,
    error,
    
    // Computed
    usersWithRoles,
    totalUsers,
    adminUsers,
    regularUsers,
    
    // Actions
    fetchUsers,
    fetchRoles,
    createUser,
    updateUser,
    deleteUser,
    getUserById,
    getUserByUsername,
    getUserByEmail,
    validateUserData
  }
})
