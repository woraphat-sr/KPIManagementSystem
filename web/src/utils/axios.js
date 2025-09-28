import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - เพิ่ม token ใน header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - จัดการ 401 responses
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // ถ้าได้ 401 แสดงว่า token หมดอายุหรือไม่ถูกต้อง
    if (error.response?.status === 401) {
      // ล้างข้อมูล auth
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      
      // Redirect ไปหน้า login (เฉพาะถ้าไม่ได้อยู่ในหน้า login อยู่แล้ว)
      if (window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }
    
    return Promise.reject(error)
  }
)

export default api
