<template>
  <div v-if="route.meta.breadcrumb" class="sticky  top-0 z-50 p-1.5 bg-white border-b border-gray-200 shadow-sm">
    <div class="px-3  py-0">
      <!-- Breadcrumb Navigation -->
      <nav class="flex justify-between items-center" aria-label="Breadcrumb">
        <ol class="inline-flex items-center space-x-1 md:space-x-2">
          <li class="inline-flex items-center">
            <router-link to="/dashboard" class="inline-flex items-center text-xs font-medium text-gray-700 hover:text-[#00569D]">
              <Icon icon="mdi:home" class="w-3 h-3 mr-1.5" />
              Dashboard
            </router-link>
          </li>
          <li v-for="(item, index) in breadcrumbs" :key="index">
            <div class="flex items-center">
              <Icon icon="mdi:chevron-right" class="w-3 h-3 text-gray-400" />
              <span v-if="index === breadcrumbs.length - 1" class="ml-1 text-xs font-medium text-[#00569D] md:ml-1.5" aria-current="page">
                {{ item }}
              </span>
              <span v-else class="ml-1 text-xs font-medium text-gray-500 md:ml-1.5">
                {{ item }}
              </span>
            </div>
          </li>
        </ol>
        
        <!-- User Profile Section -->
        <div class="flex items-center space-x-2">
          <slot name="actions"></slot>
          
          <!-- User Info Button -->
          <button 
            @click="openProfileModal"
            class="flex items-center cursor-pointer space-x-2 p-1.5 rounded hover:bg-gray-100 transition-colors"
          >
            <div class="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
              <Icon :icon="authStore.user?.role === 'admin' ? 'material-symbols:admin-panel-settings' : 'mdi:account'" class="w-3.5 h-3.5 text-white" />
            </div>
            <div class="text-left">
              <p class="text-xs font-medium text-gray-900">{{ authStore.user?.name || 'User' }}</p>
            </div>
            <Icon icon="mdi:chevron-down" class="w-3 h-3 text-gray-400" />
          </button>
        </div>
      </nav>
    </div>

    <!-- Profile Modal - Flowbite -->
    <div v-if="showProfileModal" id="profileModal" tabindex="-1" aria-hidden="true" 
         class="fixed inset-0 z-50 flex items-center shadow-lg justify-center w-full h-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 max-h-full">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-gray-500/60 bg-opacity-75 transition-opacity"></div>
      <div class="relative w-full max-w-xl max-h-full">
        <!-- Modal content -->
        <div class="relative bg-white rounded-xl shadow-2xl dark:bg-gray-700 border border-gray-100 dark:border-gray-600">
          
          <!-- Profile Mode -->
          <template v-if="modalMode === 'profile'">
            <!-- Modal header -->
            <div class="flex items-center justify-between p-2 px-3 border-b rounded-t-xl border-gray-200 dark:border-gray-600 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
              <div class="flex items-center space-x-2">
                <div class="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Icon icon="mdi:account" class="w-3 h-3 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 class="text-base font-normal text-gray-900 dark:text-white">
                  ข้อมูลส่วนตัว
                </h4>
              </div>
              <button type="button" @click="closeProfileModal"
                      class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded text-xs p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white transition-colors">
                <Icon icon="mdi:close" class="w-4 h-4" />
              </button>
            </div>
            
            <!-- Modal body -->
            <form @submit.prevent="handleProfileUpdate" class="p-4 space-y-4">
              <!-- Username (Read-only) -->
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-900 dark:text-white">
                  ชื่อผู้ใช้งาน
                </label>
                <div class="relative">
                  <input 
                    :value="profileStore.profileData.username"
                    type="text"
                    disabled
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2 pr-8 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                    placeholder="ชื่อผู้ใช้งาน"
                  />
                  <Icon icon="lsicon:disable-outline" class="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                </div>
              </div>
              
              <!-- Email (Editable) -->
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-900 dark:text-white">
                  อีเมล *
                </label>
                <input 
                  v-model="profileStore.profileData.email"
                  type="email"
                  required
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                  placeholder="กรอกอีเมล"
                />
              </div>
              
              <!-- Role (Read-only) -->
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-900 dark:text-white">
                  บทบาท
                </label>
                <div class="relative">
                  <input 
                    :value="profileStore.profileData.role"
                    type="text"
                    disabled
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2 pr-8 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                    placeholder="บทบาท"
                  />
                  <Icon icon="lsicon:disable-outline" class="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                </div>
              </div>
              
              <!-- Created Date (Read-only) -->
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-900 dark:text-white">
                  วันที่สร้างบัญชี
                </label>
                <div class="relative">
                  <input 
                    :value="formatDate(profileStore.profileData.createdAt)"
                    type="text"
                    disabled
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-2 pr-8 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                    placeholder="วันที่สร้าง"
                  />
                  <Icon icon="lsicon:disable-outline" class="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                </div>
              </div>
              
              <!-- Error Messages -->
              <div v-if="profileStore.profileErrors.length > 0" class="p-3 mb-3 text-xs text-red-800 rounded bg-red-50 dark:bg-gray-800 dark:text-red-400">
                <ul class="space-y-1">
                  <li v-for="error in profileStore.profileErrors" :key="error" class="flex items-center space-x-1.5">
                    <Icon icon="mdi:alert-circle" class="w-3 h-3" />
                    <span>{{ error }}</span>
                  </li>
                </ul>
              </div>
            </form>
            
            <!-- Modal footer -->
            <div class="flex items-center justify-end px-4 py-2 border-t border-gray-200 rounded-b dark:border-gray-600">
              <div class="flex items-center space-x-1.5">
                <button 
                  type="button"
                  @click="closeProfileModal"
                  class="text-gray-500 bg-white cursor-pointer hover:bg-gray-100 focus:ring-2 focus:outline-none focus:ring-gray-200 border border-gray-200 font-medium rounded text-xs px-3 py-1.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                >
                  ยกเลิก
                </button>
                <button 
                  type="button"
                 @click="openChangePasswordModal"
                  class="text-gray-500 bg-white cursor-pointer hover:bg-gray-100 focus:ring-2 focus:outline-none focus:ring-gray-200 border border-gray-200 font-medium rounded text-xs px-3 py-1.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                >
                เปลี่ยนรหัสผ่าน
                </button>
                
                <button 
                  type="submit"
                  :disabled="profileStore.isLoading || !hasProfileChanges"
                  @click="handleProfileUpdate"
                  class="text-white bg-blue-700 cursor-pointer hover:bg-blue-800 focus:ring-2 focus:outline-none focus:ring-blue-300 font-medium rounded text-xs px-3 py-1.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50"
                >
                  <span v-if="profileStore.isLoading" class="flex items-center space-x-1.5">
                    <svg class="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <span>กำลังบันทึก...</span>
                  </span>
                  <span v-else>บันทึกการเปลี่ยนแปลง</span>
                </button>
              </div>
            </div>
          </template>
          
          <!-- Password Mode -->
          <template v-else>
            <!-- Modal header -->
            <div class="flex items-center justify-between p-2 px-3  border-b rounded-t-xl border-gray-200 dark:border-gray-600 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
              <div class="flex items-center space-x-2">
                <button type="button" @click="closeChangePasswordModal"
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded text-xs p-1.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white transition-colors">
                  <Icon icon="mdi:arrow-left" class="w-4 h-4" />
                </button>
                
                <h4 class="text-base font-normal text-gray-900 dark:text-white">
                  เปลี่ยนรหัสผ่าน
                </h4>
              </div>
              <button type="button" @click="closeProfileModal"
                      class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded text-xs p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white transition-colors">
                <Icon icon="mdi:close" class="w-4 h-4" />
              </button>
            </div>
            
            <!-- Modal body -->
            <form @submit.prevent="handlePasswordChange" class="p-4 space-y-4">
              <!-- Current Password -->
              <div>
                <label class="block mb-2 text-xs font-semibold text-gray-900 dark:text-white">
                  รหัสผ่านปัจจุบัน *
                </label>
                <div class="relative">
                  <Icon icon="mdi:lock" class="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    v-model="profileStore.passwordData.currentPassword"
                    :type="profileStore.showPasswords.currentPassword ? 'text' : 'password'"
                    required
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block w-full pl-9 pr-10 py-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white transition-all"
                    placeholder="กรอกรหัสผ่านปัจจุบัน"
                  />
                  <button 
                    type="button"
                    @click="profileStore.togglePasswordVisibility('currentPassword')"
                    class="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <Icon :icon="profileStore.showPasswords.currentPassword ? 'mdi:eye-off' : 'mdi:eye'" class="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <!-- New Password -->
              <div>
                <label class="block mb-2 text-xs font-semibold text-gray-900 dark:text-white">
                  รหัสผ่านใหม่ *
                </label>
                <div class="relative">
                  <Icon icon="mdi:lock-plus" class="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    v-model="profileStore.passwordData.newPassword"
                    :type="profileStore.showPasswords.newPassword ? 'text' : 'password'"
                    required
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block w-full pl-9 pr-10 py-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white transition-all"
                    placeholder="กรอกรหัสผ่านใหม่"
                  />
                  <button 
                    type="button"
                    @click="profileStore.togglePasswordVisibility('newPassword')"
                    class="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <Icon :icon="profileStore.showPasswords.newPassword ? 'mdi:eye-off' : 'mdi:eye'" class="w-4 h-4" />
                  </button>
                </div>
                <div class="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  <p>รหัสผ่านต้องมี:</p>
                  <ul class="list-disc list-inside ml-2 space-y-0.5">
                    <li :class="{ 'text-green-600 dark:text-green-400': passwordChecks.length, 'text-gray-600 dark:text-gray-400': !passwordChecks.length }">
                      <span v-if="passwordChecks.length">✓</span>
                      <span v-else>○</span>
                      อย่างน้อย 6 ตัวอักษร
                    </li>
                    <li :class="{ 'text-green-600 dark:text-green-400': passwordChecks.lowercase, 'text-gray-600 dark:text-gray-400': !passwordChecks.lowercase }">
                      <span v-if="passwordChecks.lowercase">✓</span>
                      <span v-else>○</span>
                      ตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว
                    </li>
                    <li :class="{ 'text-green-600 dark:text-green-400': passwordChecks.uppercase, 'text-gray-600 dark:text-gray-400': !passwordChecks.uppercase }">
                      <span v-if="passwordChecks.uppercase">✓</span>
                      <span v-else>○</span>
                      ตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว
                    </li>
                    <li :class="{ 'text-green-600 dark:text-green-400': passwordChecks.number, 'text-gray-600 dark:text-gray-400': !passwordChecks.number }">
                      <span v-if="passwordChecks.number">✓</span>
                      <span v-else>○</span>
                      ตัวเลขอย่างน้อย 1 ตัว
                    </li>
                  </ul>
                </div>
              </div>
              
              <!-- Confirm New Password -->
              <div>
                <label class="block mb-2 text-xs font-semibold text-gray-900 dark:text-white">
                  ยืนยันรหัสผ่านใหม่ *
                </label>
                <div class="relative">
                  <Icon icon="mdi:lock-check" class="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    v-model="profileStore.passwordData.confirmPassword"
                    :type="profileStore.showPasswords.confirmPassword ? 'text' : 'password'"
                    required
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block w-full pl-9 pr-10 py-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white transition-all"
                    placeholder="ยืนยันรหัสผ่านใหม่"
                  />
                  <button 
                    type="button"
                    @click="profileStore.togglePasswordVisibility('confirmPassword')"
                    class="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <Icon :icon="profileStore.showPasswords.confirmPassword ? 'mdi:eye-off' : 'mdi:eye'" class="w-4 h-4" />
                  </button>
                </div>
                <div class="mt-1 text-xs">
                  <div :class="{ 'text-green-600 dark:text-green-400': passwordChecks.match, 'text-gray-600 dark:text-gray-400': !passwordChecks.match }">
                    <span v-if="passwordChecks.match">✓</span>
                    <span v-else>○</span>
                    รหัสผ่านตรงกัน
                  </div>
                </div>
              </div>
              
              <!-- Error Messages -->
              <div v-if="profileStore.passwordErrors.length > 0" class="p-3 mb-3 text-xs text-red-800 rounded bg-red-50 dark:bg-gray-800 dark:text-red-400">
                <ul class="space-y-1">
                  <li v-for="error in profileStore.passwordErrors" :key="error" class="flex items-center space-x-1.5">
                    <Icon icon="mdi:alert-circle" class="w-3 h-3" />
                    <span>{{ error }}</span>
                  </li>
                </ul>
              </div>
            </form>
            
            <!-- Modal footer -->
            <div class="flex items-center justify-end px-4 py-2 space-x-1.5 border-t border-gray-200 rounded-b dark:border-gray-600">
              <button 
                type="button"
                @click="closeChangePasswordModal"
                class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-2 focus:outline-none focus:ring-gray-200 border border-gray-200 font-medium rounded text-xs px-3 py-1.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
              >
                ยกเลิก
              </button>
              
              <button 
                type="submit"
                :disabled="profileStore.isLoading || !isPasswordFormValid"
                @click="handlePasswordChange"
                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-2 focus:outline-none focus:ring-blue-300 font-medium rounded text-xs px-3 py-1.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50"
              >
                <span v-if="profileStore.isLoading" class="flex items-center space-x-1.5">
                  <svg class="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  <span>กำลังเปลี่ยนรหัสผ่าน...</span>
                </span>
                <span v-else>เปลี่ยนรหัสผ่าน</span>
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Alert Component -->
    <Alert 
      v-if="profileStore.alert.show"
      :type="profileStore.alert.type"
      :title="profileStore.alert.title"
      :message="profileStore.alert.message"
      :duration="5000"
      @close="profileStore.hideAlert"
    />
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useProfileStore } from '../stores/profile';
import { Icon } from '@iconify/vue';
import Alert from './Alert.vue';

const route = useRoute();
const authStore = useAuthStore();
const profileStore = useProfileStore();

// Modal states
const showProfileModal = ref(false);
const modalMode = ref('profile'); // 'profile' or 'password'

// Computed
const breadcrumbs = computed(() => {
  const metaBreadcrumb = route.meta.breadcrumb || '';
  if (metaBreadcrumb && typeof metaBreadcrumb === 'string') {
    // For Dashboard, return empty array since it's already shown as home
    if (metaBreadcrumb === 'Dashboard') return [];
    return metaBreadcrumb.split(' / ');
  }
  return [];
});

// Password validation computed properties
const passwordChecks = computed(() => {
  const password = profileStore.passwordData.newPassword;
  return {
    length: password.length >= 6,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    match: profileStore.passwordData.confirmPassword === password && password.length > 0
  }
});

const isPasswordFormValid = computed(() => {
  return profileStore.passwordData.currentPassword.trim() !== '' &&
         passwordChecks.value.length &&
         passwordChecks.value.lowercase &&
         passwordChecks.value.uppercase &&
         passwordChecks.value.number &&
         passwordChecks.value.match
});

const hasProfileChanges = computed(() => {
  return profileStore.profileData.email !== authStore.user?.email;
});

// Methods
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const openProfileModal = async () => {
  await profileStore.fetchUserProfile();
  showProfileModal.value = true;
  modalMode.value = 'profile';
  profileStore.clearErrors();
};

const closeProfileModal = () => {
  showProfileModal.value = false;
  profileStore.clearErrors();
  modalMode.value = 'profile';
};

const openChangePasswordModal = () => {
  profileStore.resetPasswordData();
  modalMode.value = 'password';
  profileStore.clearErrors();
};

const closeChangePasswordModal = () => {
  modalMode.value = 'profile';
  profileStore.clearErrors();
};

const handleProfileUpdate = async () => {
  const result = await profileStore.updateProfile(profileStore.profileData.email);
  
  if (result.success) {
    // Update auth store
    authStore.user.email = profileStore.profileData.email;
    localStorage.setItem('user', JSON.stringify(authStore.user));
    
    closeProfileModal();
  }
};

const handlePasswordChange = async () => {
  // Validate passwords match
  if (profileStore.passwordData.newPassword !== profileStore.passwordData.confirmPassword) {
    profileStore.passwordErrors = ['รหัสผ่านใหม่ไม่ตรงกัน'];
    return;
  }
  
  const result = await profileStore.changePassword(
    profileStore.passwordData.currentPassword,
    profileStore.passwordData.newPassword
  );
  
  if (result.success) {
    modalMode.value = 'profile';
  }
};

// Lifecycle
onMounted(() => {
  // Initialize profile data from auth store
  profileStore.initializeFromAuthStore(authStore.user);
});
</script>