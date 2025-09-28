<script setup>
import { computed, onMounted, ref, provide, watch } from 'vue'
import { useRoute } from 'vue-router'
import { initFlowbite } from 'flowbite'
import { Icon } from '@iconify/vue'
import Topbar from './components/Topbar.vue'
import SideBar from './components/SideBar.vue'
import { useAuthStore } from './stores/auth'

const route = useRoute()

const authStore = useAuthStore()
const userName = authStore.user?.name
console.log(userName)

const sideBarRef = ref();
// const isUploadExcelPage = computed(() => route.path === '/upload-excel');
// Reactive sidebar state
const isSidebarMiniMode = ref(false);

// Computed property for sidebar width
const sidebarWidth = computed(() => {
  return isSidebarMiniMode.value ? 130 : 300;
});

// Computed property for main content margin
const mainContentMargin = computed(() => {
  if (route.path === '/' || route.path === '/signup') return '';
  return isSidebarMiniMode.value ? 'ml-16' : 'ml-80 lg:ml-72';
});

// Provide sidebar state to child components
provide('sidebarWidth', sidebarWidth);
provide('isSidebarCollapsed', isSidebarMiniMode);

function closeSideBar() {
  isSidebarMiniMode.value = true;
}

// Method to sync sidebar state
function syncSidebarState(miniMode) {
  isSidebarMiniMode.value = miniMode;
}

// Watch for sidebar ref changes to sync initial state
watch(sideBarRef, (newRef) => {
  if (newRef) {
    isSidebarMiniMode.value = newRef.isMiniMode;
  }
}, { immediate: true });
</script>

<template>
  
    <div :class="userName">
        <div v-if="route.path !== '/' && route.path !== '/signup' && !isUploadExcelPage" class="h-screen bg-gray-50 overflow-auto">
            <!-- Background drop เฉพาะตอน overlayMode && !isCollapsed (full) -->
            <div v-if="showOverlay" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" @click="closeSideBar" />
            <SideBar v-if="route.path !== '/' && route.path !== '/signup'" :overlay-mode="isDailyStockPage" ref="sideBarRef" @miniModeChanged="syncSidebarState" />
            <div class="flex flex-col h-screen transition-all duration-300" :class="mainContentMargin">
              <Topbar v-if="route.path !== '/' && route.path !== '/signup'" />
                <main :class="route.path !== '/' && route.path !== '/signup' ? 'flex-1 p-6' : ''">
                  
                    <router-view />
                </main>
            </div>
        </div>
        <!-- Show login/signup page when on root or signup path -->
        <div v-else>
            <router-view />
        </div>
        
        <!-- Global Logout Modal -->
        <div v-if="sideBarRef?.showLogoutModal" class="fixed inset-0 flex items-center bg-gray-200/60 justify-center z-[9999]">
          <div class="bg-white rounded-lg shadow-xl w-full flex flex-col items-center justify-center max-w-xs p-6 relative">
            <template v-if="!sideBarRef?.isProcessingLogout">
              <Icon icon="mdi:logout" class="w-10 h-10 text-red-400 mb-2" />
            </template>
            <template v-else>
              <svg class="animate-spin w-10 h-10 text-sky-500 mb-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            </template>
            <h3 class="text-lg font-semibold text-gray-900 mb-2 text-center">ยืนยันการออกจากระบบ</h3>
            <template v-if="!sideBarRef?.isProcessingLogout">
              <p class="text-center text-gray-500 mb-4">คุณต้องการออกจากระบบใช่หรือไม่?</p>
            </template>
            <template v-else>
              <p class="text-center text-gray-500 mb-4">{{ sideBarRef?.logoutMessages[sideBarRef?.logoutStep] }}</p>
            </template>
            <div class="flex justify-end space-x-2 mt-2">
              <button v-if="!sideBarRef?.isProcessingLogout" @click="sideBarRef?.cancelLogout"
                class="px-3 py-1 rounded cursor-pointer bg-gray-200 text-gray-700">ยกเลิก</button>
              <button v-if="!sideBarRef?.isProcessingLogout" @click="sideBarRef?.proceedLogout"
                class="px-3 py-1 rounded cursor-pointer bg-red-600 text-white">ออกจากระบบ</button>
              <button v-else disabled
                class="px-3 py-1 rounded bg-gray-300 text-gray-400 cursor-not-allowed">โปรดรอ...</button>
            </div>
          </div>
        </div>
    </div>
</template>

<style scoped>
</style>
