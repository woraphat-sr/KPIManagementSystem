<template>
  <div >
    <div >

      <!-- Stats Cards -->
      <StatsCards :stats="statsCards" />

      <!-- Actions Bar -->
      <FilterBar
        :search-term="searchTerm"
        :role-filter="roleFilter"
        show-search
        show-role-filter
        search-placeholder="ค้นหาผู้ใช้งาน..."
        create-button-text="เพิ่มผู้ใช้งาน"
        @update:search-term="updateSearchTerm"
        @update:role-filter="updateRoleFilter"
        @create-new="openCreateModal"
      />

      <!-- Users Table -->
      <DataTable
        :columns="tableColumns"
        :data="filteredUsers"
        :loading="usersStore.loading"
        empty-icon="mdi:account-search"
        empty-text="ไม่พบผู้ใช้งาน"
      >
        <!-- User Column -->
        <template #cell-username="{ item }">
          <div class="flex items-center">
            <div class="">
              <div class="text-sm font-medium text-gray-900">{{ item.username }}</div>
              <div class="text-sm text-gray-500">ID: {{ item.id }}</div>
            </div>
          </div>
        </template>

        <!-- Actions Column -->
        <template #actions="{ item }">
          <button @click="openEditModal(item)"  class="cursor-pointer text-yellow-600 bg-yellow-100 hover:text-yellow-900 p-2 rounded"
            title="แก้ไข">
            <Icon icon="mdi:pencil" class="w-4 h-4" />
          </button>
          <button @click="openDeleteModal(item)" class="cursor-pointer text-red-600 bg-red-100 hover:text-red-900 p-2 rounded"
            title="ลบ">
            <Icon icon="mdi:delete" class="w-4 h-4" />
          </button>
        </template>
      </DataTable>

      <!-- Create/Edit Modal -->
      <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center bg-gray-200/60 bg-opacity-75 justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

          <div class="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
            <!-- Modal header -->
            <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                {{ isEditing ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่' }}
              </h3>
              <button type="button" @click="closeModal"
                class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
                <span class="sr-only">Close modal</span>
              </button>
            </div>
            
            <!-- Modal body -->
            <form @submit.prevent="handleSubmit">
              <div class="p-4 md:p-5 space-y-4">
                <!-- Username -->
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    ชื่อผู้ใช้งาน *
                  </label>
                  <input v-model="form.username" type="text" required
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                    placeholder="กรอกชื่อผู้ใช้งาน" />
                </div>

                <!-- Email -->
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    อีเมล *
                  </label>
                  <input v-model="form.email" type="email" required
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                    placeholder="กรอกอีเมล" />
                </div>

                <!-- Password -->
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    รหัสผ่าน {{ isEditing ? '(เว้นว่างไว้หากไม่ต้องการเปลี่ยน)' : '*' }}
                  </label>
                  <input v-model="form.password" type="password" :required="!isEditing"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                    placeholder="กรอกรหัสผ่าน" />
                </div>

                <!-- Role -->
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    สิทธิ์ *
                  </label>
                  <select v-model="form.role_id" required
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white">
                    <option value="">เลือกสิทธิ์</option>
                    <option v-for="role in usersStore.roles" :key="role.id" :value="role.id">
                      {{ role.name === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งานทั่วไป' }}
                    </option>
                  </select>
                  <!-- Debug info for role selection -->
                  <div v-if="isEditing" class="mt-2 text-xs text-gray-500">
                    สิทธิ์ปัจจุบัน: {{ getCurrentRoleName() }}
                  </div>
                </div>

                <!-- Error Messages -->
                <div v-if="formErrors.length > 0" class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400">
                  <ul class="space-y-1">
                    <li v-for="error in formErrors" :key="error" class="flex items-center space-x-2">
                      <Icon icon="mdi:alert-circle" class="w-4 h-4" />
                      <span>{{ error }}</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <!-- Modal footer -->
              <div class="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                <button type="submit" :disabled="usersStore.loading"
                  class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50">
                  <span v-if="usersStore.loading" class="flex items-center space-x-2">
                    <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <span>กำลังบันทึก...</span>
                  </span>
                  <span v-else>{{ isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ใช้งาน' }}</span>
                </button>
                <button type="button" @click="closeModal"
                  class="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <DeleteModal
        :show="showDeleteModal"
        title="ยืนยันการลบผู้ใช้งาน"
        :message="deleteModalMessage"
        confirm-text="ลบ"
        :loading="usersStore.loading"
        @confirm="confirmDelete"
        @cancel="closeDeleteModal"
      />

      <!-- Alert Component -->
      <Alert 
        v-if="alert.show"
        :type="alert.type"
        :title="alert.title"
        :message="alert.message"
        @close="closeAlert"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useUsersStore } from '../stores/users'
import DataTable from '../components/DataTable.vue'
import FilterBar from '../components/FilterBar.vue'
import DeleteModal from '../components/DeleteModal.vue'
import StatsCards from '../components/StatsCards.vue'
import Alert from '../components/Alert.vue'

// Store
const usersStore = useUsersStore()

// Reactive data
const searchTerm = ref('')
const roleFilter = ref('')
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const userToDelete = ref(null)
const formErrors = ref([])

// Alert state
const alert = ref({
  show: false,
  type: 'info',
  title: '',
  message: ''
})

// Form data
const form = ref({
  id: null,
  username: '',
  email: '',
  password: '',
  role_id: ''
})

// Computed
const deleteModalMessage = computed(() => {
  return `คุณต้องการลบผู้ใช้งาน "${userToDelete.value?.username}" หรือไม่?`
})

const filteredUsers = computed(() => {
  let filtered = usersStore.usersWithRoles

  // Full text search across multiple fields
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase().trim()
    filtered = filtered.filter(user => {
      const username = (user.username || '').toLowerCase()
      const email = (user.email || '').toLowerCase()
      const roleName = (user.role_name || '').toLowerCase()
      const userId = String(user.id || '').toLowerCase()
      const createdAt = (user.createdAt || '').toLowerCase()
      
      return username.includes(search) ||
             email.includes(search) ||
             roleName.includes(search) ||
             userId.includes(search) ||
             createdAt.includes(search)
    })
  }

  // Filter by role
  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role_name === roleFilter.value)
  }

  return filtered
})
const statsCards = computed(() => [
  {
    id: 'total-users',
    label: 'ผู้ใช้งานทั้งหมด',
    value: usersStore.totalUsers,
    icon: 'mdi:account-group',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    id: 'admin-users',
    label: 'ผู้ดูแลระบบ',
    value: usersStore.adminUsers.length,
    icon: 'mdi:shield-account',
    bgColor: 'bg-yellow-100',
    iconColor: 'text-yellow-600'
  },
  {
    id: 'regular-users',
    label: 'ผู้ใช้งานทั่วไป',
    value: usersStore.regularUsers.length,
    icon: 'mdi:account',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600'
  }
])

const tableColumns = computed(() => [
  {
    key: 'username',
    label: 'ผู้ใช้งาน',
    type: 'text'
  },
  {
    key: 'email',
    label: 'อีเมล',
    type: 'text'
  },
  {
    key: 'role_name',
    label: 'สิทธิ์',
    type: 'badge',
    badgeClass: (value, item) => {
      return value === 'admin'
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-blue-100 text-blue-800'
    }
  },
  {
    key: 'createdAt',
    label: 'วันที่สร้าง',
    type: 'date'
  },
  {
    key: 'actions',
    label: 'การดำเนินการ',
    type: 'actions'
  }
])

// Methods
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getCurrentRoleName = () => {
  if (!form.value.role_id) return 'ไม่ได้เลือก'
  
  const role = usersStore.roles.find(r => r.id == form.value.role_id)
  if (role) {
    return role.name === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งานทั่วไป'
  }
  
  return 'ไม่พบ'
}

const resetForm = () => {
  form.value = {
    id: null,
    username: '',
    email: '',
    password: '',
    role_id: ''
  }
  formErrors.value = []
}

const openCreateModal = () => {
  resetForm()
  isEditing.value = false
  showModal.value = true
  console.log('📝 Opening create user modal')
}

const openEditModal = (user) => {
  resetForm()
  isEditing.value = true
  
  // Handle role_id structure (can be object or number/string)
  let roleId = user.role_id
  
  if (typeof user.role_id === 'object' && user.role_id !== null) {
    // API returns role as object with id property
    roleId = user.role_id.id || user.role_id._id
  } else if (user.role_name) {
    // If we have role_name, find the corresponding role id from roles array
    const matchingRole = usersStore.roles.find(role => role.name === user.role_name)
    if (matchingRole) {
      roleId = matchingRole.id
    }
  }
  
  form.value = {
    id: user.id,
    username: user.username,
    email: user.email,
    password: '',
    role_id: roleId || ''
  }
  
  showModal.value = true
  console.log('✏️ Opening edit user modal:', {
    user,
    selectedRoleId: roleId,
    availableRoles: usersStore.roles
  })
}

const openDeleteModal = (user) => {
  userToDelete.value = user
  showDeleteModal.value = true
  console.log('🗑️ Opening delete user modal:', user)
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  userToDelete.value = null
}

// Alert helper functions
const showAlert = (type, title, message = '') => {
  alert.value = {
    show: true,
    type,
    title,
    message
  }
}

const closeAlert = () => {
  alert.value.show = false
}

const handleSubmit = async () => {
  formErrors.value = []

  try {
    console.log('📤 Submitting form:', form.value)

    // Validate form data
    const errors = usersStore.validateUserData(form.value, isEditing.value)
    if (errors.length > 0) {
      formErrors.value = errors
      console.log('❌ Validation errors:', errors)
      return
    }

    if (isEditing.value) {
      await usersStore.updateUser(form.value.id, form.value)
      console.log('✅ User updated successfully')
      showAlert('success', 'สำเร็จ', 'แก้ไขผู้ใช้งานเรียบร้อยแล้ว')
    } else {
      await usersStore.createUser(form.value)
      console.log('✅ User created successfully')
      showAlert('success', 'สำเร็จ', 'เพิ่มผู้ใช้งานใหม่เรียบร้อยแล้ว')
    }

    // Force reactivity update for stats
    console.log('📊 Stats after update:', {
      totalUsers: usersStore.totalUsers,
      adminUsers: usersStore.adminUsers.length,
      regularUsers: usersStore.regularUsers.length
    })

    closeModal()
  } catch (error) {
    console.error('❌ Error submitting form:', error)
    
    // Extract validation message from API response
    let errorMessage = 'ไม่สามารถบันทึกข้อมูลได้'
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    formErrors.value = [errorMessage]
    showAlert('error', 'เกิดข้อผิดพลาด', errorMessage)
  }
}

const confirmDelete = async () => {
  try {
    console.log('🗑️ Confirming delete for user:', userToDelete.value)
    await usersStore.deleteUser(userToDelete.value.id)
    console.log('✅ User deleted successfully')
    showAlert('success', 'สำเร็จ', 'ลบผู้ใช้งานเรียบร้อยแล้ว')
    closeDeleteModal()
  } catch (error) {
    console.error('❌ Error deleting user:', error)
    
    // Extract validation message from API response
    let errorMessage = 'ไม่สามารถลบผู้ใช้งานได้'
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    showAlert('error', 'เกิดข้อผิดพลาด', errorMessage)
  }
}

// Filter update handlers
const updateSearchTerm = (value) => {
  searchTerm.value = value
}

const updateRoleFilter = (value) => {
  roleFilter.value = value
}

// Lifecycle
onMounted(async () => {
  console.log('🚀 UserManagement component mounted')
  
  try {
    // Fetch users and roles data from API
    await Promise.all([
      usersStore.fetchUsers(),
      usersStore.fetchRoles()
    ])
    console.log('✅ Users and roles data loaded successfully')
  } catch (error) {
    console.error('❌ Error loading data:', error)
  }
  
  console.log('📊 Final data:', {
    users: usersStore.users.length,
    roles: usersStore.roles.length,
    usersWithRoles: usersStore.usersWithRoles.length
  })
})
</script>

<style scoped>
/* Custom styles if needed */
</style>
