<template>
  <!-- Mobile Overlay -->
  <div v-if="isMobile && !isMiniMode && overlayMode" @click="toggleMiniMode"
    class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"></div>

  <!-- Fixed Sidebar -->
  <div :class="[
    'fixed left-0 top-0 h-screen',
    overlayMode ? 'z-50' : 'z-30',
    'bg-white text-black flex flex-col transition-all duration-300',
    isMobile ? (isMiniMode ? 'w-16' : 'w-80') : (isMiniMode ? 'w-16' : 'w-72'),
    isMobile && !isMiniMode ? 'shadow-2xl' : ''
  ]">
    <!-- Header with Logo -->
    <div class="py-0.5 lg:py-1.5 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
      <div class="flex items-center justify-center">
        <div class="flex items-center space-x-3 mr-5" v-show="!isMiniMode">
          <img src="/icon.png" alt="Company Logo" class="h-8 w-auto" />
          <h5 class="text-sm font-semibold">KPI Management System</h5>
        </div>
        <div v-show="isMiniMode" class="flex justify-center">
          <!-- Logo hidden in mini mode for cleaner look -->
        </div>
        <!-- Toggle Button -->
        <button @click="toggleMiniMode"
          class="p-2 hover:bg-gray-200 rounded cursor-pointer transition-colors touch-manipulation"
          :class="isMobile ? 'active:bg-gray-200' : ''">
          <Icon :icon="isMiniMode ? 'mdi:chevron-right' : 'mdi:chevron-left'"
            :class="isMobile ? 'w-5 h-5' : 'w-5 h-5'" />
        </button>
      </div>
    </div>

    <!-- Navigation - Scrollable -->
    <nav class="overflow-y-auto overflow-x-hidden flex-1">
      <div v-for="(data, key) in menuData" :key="key" class="relative" v-show="isMenuVisible(key, data)">
        <router-link :to="data.link" @click="handleMenuClick(key, data)" :class="[
          'w-full flex items-center hover:bg-gray-200 transition-colors touch-manipulation',
          isMiniMode ? 'justify-center px-2' : 'text-left px-3',
          isMobile ? (isMiniMode ? 'py-4' : 'py-4 text-base') : (isMiniMode ? 'py-3' : 'py-3 text-sm'),
          isMobile ? 'active:bg-gray-200' : '',
          isActiveRoute(data.link) ? 'bg-gray-100 text-blue-600 font-semibold' : 'text-gray-700'
        ]" :title="isMiniMode ? data.label : ''">
          <div v-if="isMiniMode" class="flex items-center justify-center">
            <Icon :icon="data.icon" :class="isMobile ? 'w-6 h-6' : 'w-5 h-5'" />
          </div>
          <div v-else class="flex items-center space-x-3">
            <Icon :icon="data.icon" :class="isMobile ? 'w-6 h-6' : 'w-5 h-5'" />
            <span class="font-medium">{{ data.label }}</span>
            <div v-if="isLoading && loadingRoute === data.link" class="ml-2">
              <svg class="animate-spin w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            </div>
          </div>
        </router-link>
      </div>
    </nav>

    <!-- Footer -->
    <div class="p-4 border-t border-gray-200  space-y-2 flex-shrink-0">
      <button @click="confirmLogout" 
      :class="[
        'w-full flex items-center cursor-pointer space-x-3 hover:bg-gray-200  rounded transition-colors',
        isMiniMode ? 'justify-center space-x-0' : ' text-sm'
      ]">
        <Icon icon="mdi:logout" :class="isMiniMode ? 'w-6 h-6 text-red-500' : 'w-6 h-6 text-red-500'" />
        <span class="text-red-500" v-show="!isMiniMode">ออกจากระบบ</span>
      </button>
    </div>

  </div>


</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { Icon } from '@iconify/vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const props = defineProps({
  overlayMode: { type: Boolean, default: false }
});

const emit = defineEmits(['miniModeChanged']);

const route = useRoute();
const router = useRouter();
const searchTerm = ref('');
const authStore = useAuthStore();
const showLogoutModal = ref(false);
const logoutStep = ref(0);
const logoutMessages = [
  'กำลังเตรียมการ...',
  'กำลังเคลียร์ข้อมูล...',
  'กำลังนำท่านออกจากระบบ...'
];
const isProcessingLogout = ref(false);

// Mini sidebar state
const isMiniMode = ref(false);

// Mobile detection
const isMobile = ref(false);
const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024; // lg breakpoint
};

// Touch gesture handling
const touchStartX = ref(0);
const touchStartY = ref(0);
const isSwipeGesture = ref(false);

const handleTouchStart = (e) => {
  if (!isMobile.value) return;
  touchStartX.value = e.touches[0].clientX;
  touchStartY.value = e.touches[0].clientY;
  isSwipeGesture.value = false;
};

const handleTouchMove = (e) => {
  if (!isMobile.value) return;
  const touchEndX = e.touches[0].clientX;
  const touchEndY = e.touches[0].clientY;
  const deltaX = touchEndX - touchStartX.value;
  const deltaY = touchEndY - touchStartY.value;

  // Check if it's a horizontal swipe
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
    isSwipeGesture.value = true;
    e.preventDefault(); // Prevent scrolling during swipe
  }
};

const handleTouchEnd = (e) => {
  if (!isMobile.value || !isSwipeGesture.value) return;

  const touchEndX = e.changedTouches[0].clientX;
  const deltaX = touchEndX - touchStartX.value;

  // Swipe right to open sidebar (when closed)
  if (deltaX > 100 && isMiniMode.value) {
    isMiniMode.value = false;
  }
  // Swipe left to close sidebar (when open)
  else if (deltaX < -100 && !isMiniMode.value) {
    isMiniMode.value = true;
  }

  isSwipeGesture.value = false;
};

// Loading state for menu navigation
const isLoading = ref(false);
const loadingRoute = ref('');

const menuData = {
  Dashboard: {
    icon: 'fluent:data-pie-24-filled',
    label: 'หน้าหลัก',
    link: '/dashboard',
    Role: ['admin', 'user']
  },
  MyKPI: {
    icon: 'carbon:task-complete',
    label: 'KPI ของฉัน',
    link: '/my-kpi',
    Role: ['admin', 'user']
  },
  AllKPI: {
    icon: 'carbon:task-settings',
    label: 'จัดการ KPI',
    link: '/kpi-management',
    Role: ['admin']
  },
  UserManage: {
    icon: 'ic:baseline-group',
    label: 'จัดการผู้ใช้งาน',
    link: '/user-management',
    Role: ['admin']
  }
};

// Toggle mini mode
function toggleMiniMode() {
  isMiniMode.value = !isMiniMode.value;
  // Clear search when entering mini mode
  if (isMiniMode.value) {
    searchTerm.value = '';
  }
}

// Watch for mini mode changes and emit event
watch(isMiniMode, (newValue) => {
  emit('miniModeChanged', newValue);
});

// Initialize mobile behavior
const initializeMobileBehavior = () => {
  if (isMobile.value) {
    // Start in mini mode on mobile for better UX
    isMiniMode.value = true;
  }
};

// Menu visibility based on role
function isMenuVisible(key, data) {
  // Check if user has permission to see this menu
  if (!hasPermission(data.Role)) return false;

  return true;
}

// Check if user has permission based on role
function hasPermission(requiredRoles) {
  if (!requiredRoles || requiredRoles.length === 0) return true;

  // Get user role from auth store
  const userRole = authStore.userRole || 'user';

  return requiredRoles.includes(userRole);
}

// Function to check if a menu item is active
function isActiveRoute(link) {
  const currentPath = route.path;
  return currentPath === link;
}


function handleMenuClick(key, data) {
  const targetRoute = data.link;

  // Only show loading if navigating to a different route
  if (route.path !== targetRoute) {
    isLoading.value = true;
    loadingRoute.value = targetRoute;

    // On mobile, close sidebar after navigation for better UX
    if (isMobile.value && !isMiniMode.value) {
      setTimeout(() => {
        isMiniMode.value = true;
      }, 100);
    }

    // Hide loading after a short delay to show the indicator
    setTimeout(() => {
      isLoading.value = false;
      loadingRoute.value = '';
    }, 1000); // Show loading for at least 1 second
  }
}

const handleLogout = async () => {
  console.log('🚪 Starting logout process...')
  try {
    await authStore.logout();
    console.log('✅ Logout successful, redirecting to login page')
    router.push('/');
  } catch (error) {
    console.error('❌ Logout error:', error)
    // Even if logout fails, redirect to login page
    router.push('/');
  }
};

// สำหรับ modal
const confirmLogout = () => {
  console.log('❓ User clicked logout button, showing confirmation modal')
  showLogoutModal.value = true;
  logoutStep.value = 0;
  isProcessingLogout.value = false;
};

const cancelLogout = () => {
  console.log('❌ User cancelled logout')
  showLogoutModal.value = false;
  logoutStep.value = 0;
  isProcessingLogout.value = false;
};
const proceedLogout = async () => {
  console.log('🔄 Starting logout process with modal...')
  isProcessingLogout.value = true;
  logoutStep.value = 0;

  try {
    // Step 1: กำลังเตรียมการ...
    console.log('📋 Step 1: Preparing logout...')
    await new Promise(r => setTimeout(r, 500));
    logoutStep.value = 1;

    // Step 2: กำลังเคลียร์ข้อมูล...
    console.log('🧹 Step 2: Clearing data...')
    await new Promise(r => setTimeout(r, 750));
    logoutStep.value = 2;

    // Step 3: กำลังนำท่านออกจากระบบ
    console.log('🚪 Step 3: Logging out...')
    await new Promise(r => setTimeout(r, 750));

    // Close modal and logout
    showLogoutModal.value = false;
    isProcessingLogout.value = false;
    logoutStep.value = 0;

    await handleLogout();
  } catch (error) {
    console.error('❌ Error in logout process:', error)
    // Reset modal state even if error occurs
    showLogoutModal.value = false;
    isProcessingLogout.value = false;
    logoutStep.value = 0;
  }
};

// Lifecycle hooks
onMounted(() => {
  checkMobile();
  initializeMobileBehavior();
  window.addEventListener('resize', checkMobile);

  // Add touch event listeners for swipe gestures
  if (isMobile.value) {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile);

  // Remove touch event listeners
  document.removeEventListener('touchstart', handleTouchStart);
  document.removeEventListener('touchmove', handleTouchMove);
  document.removeEventListener('touchend', handleTouchEnd);
});

// Expose variables and methods for App.vue
defineExpose({
  isMiniMode,
  showLogoutModal,
  isProcessingLogout,
  logoutStep,
  logoutMessages,
  cancelLogout,
  proceedLogout
});
</script>

<style scoped>
/* Mobile-specific styles */
@media (max-width: 1023px) {
  .touch-manipulation {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }

  .active\:bg-sky-500:active {
    background-color: rgb(14 116 144);
  }

  /* Mobile sidebar animations */
  .fixed.left-0 {
    animation: slideInFromLeft 0.3s ease-out;
  }

  /* Mobile overlay animation */
  .fixed.inset-0 {
    animation: fadeIn 0.3s ease-out;
  }

  /* Larger touch targets for mobile */
  button,
  a {
    min-height: 44px;
    min-width: 44px;
  }

  /* Better spacing for mobile */
  .p-4 {
    padding: 1rem;
  }

  /* Mobile-specific scrollbar */
  .overflow-y-auto::-webkit-scrollbar {
    width: 8px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.4);
    border-radius: 4px;
  }
}

/* Touch-friendly interactions */
.touch-manipulation {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideInFromLeft {
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(0);
  }
}

@keyframes slideOutToLeft {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-100%);
  }
}

/* Custom Scrollbar Styles */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(0, 64, 128, 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  transition: background 0.2s ease;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Firefox scrollbar styles */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) rgba(0, 64, 128, 0.3);
}

/* Smooth scrolling for better UX */
.overflow-y-auto {
  scroll-behavior: smooth;
}

/* Hide scrollbar when not needed */
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: transparent;
}

.overflow-y-auto:hover::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
}

/* Custom scrollbar for mini menu dropdown */
.max-h-\[80vh\]::-webkit-scrollbar {
  width: 4px;
}

.max-h-\[80vh\]::-webkit-scrollbar-track {
  background: rgba(51, 51, 51, 0.3);
  border-radius: 2px;
}

.max-h-\[80vh\]::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  transition: background 0.2s ease;
}

.max-h-\[80vh\]::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}

.max-h-\[80vh\] {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) rgba(51, 51, 51, 0.3);
}

/* Smooth scrolling for mini menu */
.max-h-\[80vh\] {
  scroll-behavior: smooth;
}

/* Hide scrollbar when not needed for mini menu */
.max-h-\[80vh\]::-webkit-scrollbar-thumb {
  background: transparent;
}

.max-h-\[80vh\]:hover::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

/* Custom tooltip styles */
button[title] {
  position: relative;
}

button[title]:hover::after {
  content: attr(title);
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 10px;
  padding: 5px 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
  pointer-events: none;
}

/* Add a small arrow to the tooltip */
button[title]:hover::before {
  content: '';
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 2px;
  border-width: 5px;
  border-style: solid;
  border-color: transparent transparent transparent rgba(0, 0, 0, 0.8);
  pointer-events: none;
}

/* Custom tooltip for user avatar */
img[title] {
  position: relative;
}

img[title]:hover::after {
  content: attr(title);
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 10px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 6px;
  font-size: 11px;
  white-space: pre-line;
  z-index: 1000;
  pointer-events: none;
  max-width: 200px;
  line-height: 1.4;
}

img[title]:hover::before {
  content: '';
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 2px;
  border-width: 6px;
  border-style: solid;
  border-color: transparent transparent transparent rgba(0, 0, 0, 0.9);
  pointer-events: none;
}
</style>
