import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Login from '../views/Login.vue'
import SignUp from '../views/SignUp.vue'
import Dashboard from '../views/Dashboard.vue'
import KpiManagement from '../views/KpiManagement.vue'
import UserManagement from '../views/UserManagement.vue'
import MyKpi from '../views/MyKpi.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: SignUp,
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, breadcrumb: 'Dashboard' }
  },
  {
    path: '/my-kpi',
    name: 'MyKpi',
    component: MyKpi,
    meta: { requiresAuth: true, breadcrumb: 'My KPI' }
  },
  {
    path: '/kpi-management',
    name: 'KpiManagement',
    component: KpiManagement,
    meta: { requiresAuth: true, breadcrumb: 'KPI Management' }
  },
  {
    path: '/user-management',
    name: 'UserManagement',
    component: UserManagement,
    meta: { requiresAuth: true, requiresAdmin: true, breadcrumb: 'User Management' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialize auth state from localStorage
  authStore.initializeAuth()
  
  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.userRole || 'user'
  
  console.log('🛡️ Route guard check:', {
    to: to.path,
    isAuthenticated,
    userRole,
    requiresAuth: to.meta.requiresAuth,
    requiresGuest: to.meta.requiresGuest,
    requiresAdmin: to.meta.requiresAdmin
  })
  
  // ถ้า route ต้องการ authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('❌ Authentication required, redirecting to login')
    next('/')
    return
  }
  
  // ถ้า route ต้องการ guest (ไม่ต้อง login)
  if (to.meta.requiresGuest && isAuthenticated) {
    console.log('❌ Guest required, redirecting to dashboard')
    next('/dashboard')
    return
  }
  
  // ถ้า route ต้องการ admin role
  if (to.meta.requiresAdmin && userRole !== 'admin') {
    console.log('❌ Admin access required, redirecting to dashboard')
    next('/dashboard')
    return
  }
  
  console.log('✅ Route access granted')
  next()
})

export default router
