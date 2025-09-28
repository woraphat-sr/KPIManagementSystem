<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-4 px-4 sm:px-6 lg:px-8 overflow-y-scroll h-[calc(100vh-100px)] ">
    <div class="max-w-md w-full bg-white rounded-lg border-2 border-gray-200 shadow-md p-2  px-4 space-y-8 ">
      <div class="mb-1">
        <img src="/icon.png" alt="KPI Management" class="w-16 h-16 mx-auto">
        <p class="mt-1 text-center text-xs text-gray-600">
          สร้างบัญชีใหม่เพื่อใช้งานระบบ
        </p>
      </div>
      
      <form class="mt-4 space-y-6" @submit.prevent="handleSignUp">
        <div class="space-y-2 mb-3">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
              ชื่อผู้ใช้งาน *
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autocomplete="username"
              required
              v-model="form.username"
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="กรอกชื่อผู้ใช้งาน"
            />
            <div class="mt-1 text-xs text-gray-600">
              <p>ชื่อผู้ใช้งานต้องมี:</p>
              <ul class="list-disc list-inside ml-2 space-y-0.5">
                <li :class="{ 'text-green-600': usernameChecks.length, 'text-gray-600': !usernameChecks.length }">
                  <span v-if="usernameChecks.length">✓</span>
                  <span v-else>○</span>
                  1-50 ตัวอักษร
                </li>
                <li :class="{ 'text-green-600': usernameChecks.validChars, 'text-gray-600': !usernameChecks.validChars }">
                  <span v-if="usernameChecks.validChars">✓</span>
                  <span v-else>○</span>
                  ตัวอักษร ตัวเลข และ _ เท่านั้น
                </li>
              </ul>
            </div>
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              อีเมล *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              v-model="form.email"
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="กรอกอีเมล"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              รหัสผ่าน *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="new-password"
              required
              v-model="form.password"
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="กรอกรหัสผ่าน"
            />
            <div class="mt-1 text-xs text-gray-600">
              <p>รหัสผ่านต้องมี:</p>
              <ul class="list-disc list-inside ml-2 space-y-0.5">
                <li :class="{ 'text-green-600': passwordChecks.length, 'text-gray-600': !passwordChecks.length }">
                  <span v-if="passwordChecks.length">✓</span>
                  <span v-else>○</span>
                  อย่างน้อย 6 ตัวอักษร
                </li>
                <li :class="{ 'text-green-600': passwordChecks.lowercase, 'text-gray-600': !passwordChecks.lowercase }">
                  <span v-if="passwordChecks.lowercase">✓</span>
                  <span v-else>○</span>
                  ตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว
                </li>
                <li :class="{ 'text-green-600': passwordChecks.uppercase, 'text-gray-600': !passwordChecks.uppercase }">
                  <span v-if="passwordChecks.uppercase">✓</span>
                  <span v-else>○</span>
                  ตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว
                </li>
                <li :class="{ 'text-green-600': passwordChecks.number, 'text-gray-600': !passwordChecks.number }">
                  <span v-if="passwordChecks.number">✓</span>
                  <span v-else>○</span>
                  ตัวเลขอย่างน้อย 1 ตัว
                </li>
              </ul>
            </div>
          </div>
          
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
              ยืนยันรหัสผ่าน *
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              v-model="form.confirmPassword"
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="ยืนยันรหัสผ่าน"
            />
            <div class="mt-1 text-xs">
              <div :class="{ 'text-green-600': passwordChecks.match, 'text-gray-600': !passwordChecks.match }">
                <span v-if="passwordChecks.match">✓</span>
                <span v-else>○</span>
                รหัสผ่านตรงกัน
              </div>
            </div>
          </div>
        
        </div>

        <div class="mb-2">
          <button
            type="submit"
            :disabled="authStore.isLoading || !isFormValid"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="authStore.isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ authStore.isLoading ? 'กำลังสร้างบัญชี...' : 'สร้างบัญชี' }}
          </button>
        </div>

        <!-- Error Messages -->
        <Alert 
          v-if="formErrors.length > 0"
          type="error"
          title="เกิดข้อผิดพลาด:"
          :message="formErrors.join('\\n')"
          :show="formErrors.length > 0"
          @close="formErrors = []"
        />

        <!-- Success Message -->
        <Alert 
          v-if="successMessage"
          type="success"
          title="สำเร็จ"
          :message="successMessage"
          :show="!!successMessage"
          @close="successMessage = ''"
        />

        <!-- Login Link -->
        <div class="text-center pb-2">
          <p class="text-sm text-gray-600">
            มีบัญชีอยู่แล้ว?
            <router-link to="/" class="font-medium text-blue-600 hover:text-blue-500">
              เข้าสู่ระบบ
            </router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Alert from '../components/Alert.vue'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const formErrors = ref([])
const successMessage = ref('')

// Computed properties for real-time validation
const usernameChecks = computed(() => {
  const username = form.value.username.trim()
  return {
    length: username.length >= 1 && username.length <= 50,
    validChars: /^[a-zA-Z0-9_]+$/.test(username)
  }
})

const passwordChecks = computed(() => {
  const password = form.value.password
  return {
    length: password.length >= 6,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    match: form.value.confirmPassword === password && password.length > 0
  }
})

// Computed properties
const isFormValid = computed(() => {
  return form.value.username.trim() !== '' &&
         usernameChecks.value.length &&
         usernameChecks.value.validChars &&
         form.value.email.trim() !== '' &&
         /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email) &&
         passwordChecks.value.length &&
         passwordChecks.value.lowercase &&
         passwordChecks.value.uppercase &&
         passwordChecks.value.number &&
         passwordChecks.value.match
})

const validateForm = () => {
  formErrors.value = []
  
  // Username validation
  if (!form.value.username.trim()) {
    formErrors.value.push('กรุณากรอกชื่อผู้ใช้งาน')
  } else if (form.value.username.trim().length < 1 || form.value.username.trim().length > 50) {
    formErrors.value.push('ชื่อผู้ใช้งานต้องมี 1-50 ตัวอักษร')
  } else if (!/^[a-zA-Z0-9_]+$/.test(form.value.username.trim())) {
    formErrors.value.push('ชื่อผู้ใช้งานสามารถใช้ได้เฉพาะตัวอักษร ตัวเลข และ _ เท่านั้น')
  }
  
  // Email validation
  if (!form.value.email.trim()) {
    formErrors.value.push('กรุณากรอกอีเมล')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    formErrors.value.push('รูปแบบอีเมลไม่ถูกต้อง')
  }
  
  // Password validation
  if (!form.value.password) {
    formErrors.value.push('กรุณากรอกรหัสผ่าน')
  } else if (form.value.password.length < 6) {
    formErrors.value.push('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.value.password)) {
    formErrors.value.push('รหัสผ่านต้องมีตัวอักษรพิมพ์เล็ก ตัวอักษรพิมพ์ใหญ่ และตัวเลขอย่างน้อยอย่างละ 1 ตัว')
  }
  
  // Confirm password validation
  if (!form.value.confirmPassword) {
    formErrors.value.push('กรุณายืนยันรหัสผ่าน')
  } else if (form.value.password !== form.value.confirmPassword) {
    formErrors.value.push('รหัสผ่านไม่ตรงกัน')
  }
  
  
  return formErrors.value.length === 0
}

const handleSignUp = async () => {
  console.log('📝 Starting sign up process...')
  
  // Clear previous messages
  formErrors.value = []
  successMessage.value = ''
  
  // Validate form
  if (!validateForm()) {
    console.log('❌ Form validation failed:', formErrors.value)
    return
  }
  
  try {
    console.log('📤 Submitting sign up form:', {
      username: form.value.username,
      email: form.value.email
    })
    
    const success = await authStore.register(
      form.value.username,
      form.value.email,
      form.value.password
    )
    
    if (success) {
      console.log('✅ Sign up successful')
      successMessage.value = 'สร้างบัญชีสำเร็จ! กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...'
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } else {
      console.log('❌ Sign up failed')
      formErrors.value = [authStore.error || 'เกิดข้อผิดพลาดในการสร้างบัญชี']
    }
  } catch (error) {
    console.error('❌ Sign up error:', error)
    formErrors.value = ['เกิดข้อผิดพลาดในการสร้างบัญชี']
  }
}
</script>

<style scoped>
/* Custom styles if needed */
</style>
