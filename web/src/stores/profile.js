import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/utils/axios'

export const useProfileStore = defineStore('profile', () => {
  // State
  const profileData = ref({
    username: '',
    email: '',
    role: '',
    createdAt: ''
  })

  const passwordData = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const showPasswords = ref({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  })

  const isLoading = ref(false)
  const profileErrors = ref([])
  const passwordErrors = ref([])
  
  // Alert states
  const alert = ref({
    show: false,
    type: 'info',
    title: '',
    message: ''
  })

  // Actions
  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/users/profile')
      
      if (response.data?.success) {
        const userData = response.data.data.user
        profileData.value = {
          username: userData.username,
          email: userData.email,
          role: userData.role,
          createdAt: userData.createdAt
        }
        return true
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return false
    }
  }

  const updateProfile = async (email) => {
    isLoading.value = true
    profileErrors.value = []
    
    try {
      const response = await api.put('/users/profile', {
        email: email
      })
      
      if (response.data?.success) {
        profileData.value.email = email
        console.log('✅ Profile updated successfully')
        showAlert('success', 'อัปเดตข้อมูลสำเร็จ', 'ข้อมูลส่วนตัวของคุณได้รับการอัปเดตเรียบร้อยแล้ว')
        return { success: true }
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error)
      if (error.response?.data?.message) {
        profileErrors.value = [error.response.data.message]
      } else {
        profileErrors.value = ['เกิดข้อผิดพลาดในการอัปเดตข้อมูล']
      }
      return { success: false, errors: profileErrors.value }
    } finally {
      isLoading.value = false
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    isLoading.value = true
    passwordErrors.value = []
    
    try {
      const response = await api.put('/users/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      })
      
      if (response.data?.success) {
        console.log('✅ Password changed successfully')
        showAlert('success', 'เปลี่ยนรหัสผ่านสำเร็จ', 'รหัสผ่านของคุณได้รับการอัปเดตเรียบร้อยแล้ว')
        return { success: true }
      }
    } catch (error) {
      console.error('❌ Error changing password:', error)
      if (error.response?.data?.message) {
        passwordErrors.value = [error.response.data.message]
      } else {
        passwordErrors.value = ['เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน']
      }
      return { success: false, errors: passwordErrors.value }
    } finally {
      isLoading.value = false
    }
  }

  const resetPasswordData = () => {
    passwordData.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    showPasswords.value = {
      currentPassword: false,
      newPassword: false,
      confirmPassword: false
    }
  }

  const togglePasswordVisibility = (field) => {
    showPasswords.value[field] = !showPasswords.value[field]
  }

  const clearErrors = () => {
    profileErrors.value = []
    passwordErrors.value = []
  }

  const showAlert = (type, title, message = '') => {
    alert.value = {
      show: true,
      type,
      title,
      message
    }
  }

  const hideAlert = () => {
    alert.value.show = false
  }

  const initializeFromAuthStore = (user) => {
    if (user) {
      profileData.value = {
        username: user.username || user.name,
        email: user.email || '',
        role: user.role || '',
        createdAt: new Date().toISOString()
      }
    }
  }

  return {
    // State
    profileData,
    passwordData,
    showPasswords,
    isLoading,
    profileErrors,
    passwordErrors,
    alert,
    
    // Actions
    fetchUserProfile,
    updateProfile,
    changePassword,
    resetPasswordData,
    togglePasswordVisibility,
    clearErrors,
    showAlert,
    hideAlert,
    initializeFromAuthStore
  }
})
