import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/utils/axios'

export const useAuthStore = defineStore('auth', () => {
  // Simple state
  const user = ref(null)
  const isLoading = ref(false)
  const error = ref('')
  const token = ref(null)

  // Simple getters
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const userEmail = computed(() => user.value?.email || '')
  const userRole = computed(() => user.value?.role || 'user')
  const isTokenValid = computed(() => !!token.value)

  // Simple login
  const login = async (username, password) => {
    isLoading.value = true
    error.value = ''
    
    try {
      const response = await api.post('/auth/login', {
        username,
        password
      })
      
      console.log('🔍 API Response:', response.data)
      
      if (response.data?.success) {
        const userData = response.data.data.user
        
        // Set user data
        user.value = {
          id: userData.id,
          username: userData.username,
          name: userData.username, // ใช้ username เป็น name
          email: userData.email,
          role: userData.role.name || userData.role // role เป็น object มี name property
        }
        
        // Set token (ใช้ accessToken แทน token)
        token.value = response.data.data.accessToken
        localStorage.setItem('auth_token', response.data.data.accessToken)
        localStorage.setItem('user', JSON.stringify(user.value))
        
        console.log('✅ Login successful:', { user: user.value, token: token.value })
        return true
      } else {
        error.value = response.data?.message || 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง'
        return false
      }
      
    } catch (err) {
      error.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Simple logout
  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('auth_token')
  }

  // Simple initialize
  const initializeAuth = () => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('auth_token')
    
    if (savedUser && savedToken) {
      user.value = JSON.parse(savedUser)
      token.value = savedToken
    }
  }

  // Register function
  const register = async (username, email, password) => {
    isLoading.value = true
    error.value = ''
    
    try {
      const response = await api.post('/auth/register', {
        username,
        email,
        password
      })
      
      console.log('🔍 Register API Response:', response.data)
      
      if (response.data?.success) {
        console.log('✅ Register successful')
        return true
      } else {
        error.value = response.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก'
        return false
      }
      
    } catch (err) {
      error.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Clear error
  const clearError = () => {
    error.value = ''
  }

  return {
    // State
    user,
    isLoading,
    error,
    token,
    
    // Getters
    isAuthenticated,
    userEmail,
    userRole,
    isTokenValid,
    
    // Actions
    login,
    register,
    logout,
    initializeAuth,
    clearError
  }
})
