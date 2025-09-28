<template>
  <div>
    <!-- Summary Cards -->
    <StatsCards :stats="kpiStatsCards" />

    <!-- Filters -->
    <FilterBar
      :search-term="searchTerm"
      :status-filter="filters.status"
      :category-filter="filters.category"
      :categories="Object.keys(myKpisByCategory)"
      show-search
      show-status-filter
      show-category-filter
      show-export-buttons
      search-placeholder="ค้นหา KPI..."
      create-button-text="KPI ใหม่"
      @update:search-term="updateSearchTerm"
      @update:status-filter="updateStatusFilter"
      @update:category-filter="updateCategoryFilter"
      @clear-filters="clearFilters"
      @export-csv="exportToCSV"
      @export-pdf="exportToPDF"
      @create-new="openCreateModal"
    />

    <!-- KPI List -->
    <div class="bg-white rounded-lg shadow-sm ">
      <div class="p-2 px-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">รายการ KPI</h3>
        
        <div v-if="filteredKpis.length === 0" class="text-center py-8">
          <Icon icon="mdi:clipboard-text-outline" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500">ไม่มี KPI ที่ตรงกับเงื่อนไขการค้นหา</p>
        </div>
        
        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-2 overflow-y-auto h-[calc(100vh-320px)]">
          <div
            v-for="kpi in filteredKpis"
            :key="kpi.id"
            class="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow flex flex-col h-fit"
            :class="{'h-full': filteredKpis.length > 3}"
          >
              <!-- Header -->
              <div class="flex items-start justify-between mb-1">
                <div class="flex items-center">
                  <h6 class="text-base font-medium text-gray-900 mr-2">{{ kpi.title }}</h6>
                  <span :class="getStatusBadgeClass(kpi.status)" class="px-2 py-1 rounded-md text-xs font-medium">
                    {{ kpi.status }}
                  </span>
                </div>
                <div class="flex space-x-1">
                  <button
                    @click="openUpdateProgressModal(kpi)"
                    class="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="อัปเดตความคืบหน้า"
                  >
                    <Icon icon="bi:send-arrow-up-fill" class="w-4 h-4" />
                  </button>
                  <button
                    @click="openEditModal(kpi)"
                    class="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="แก้ไข"
                  >
                    <Icon icon="mdi:pencil" class="w-4 h-4" />
                  </button>
                  <button
                    @click="openDeleteModal(kpi)"
                    class="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="ลบ"
                  >
                    <Icon icon="mdi:delete" class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- Description -->
              <p class="text-gray-600 text-sm mb-2 flex-grow">{{ kpi.description }}</p>
              
              <!-- Stats -->
              <div class="space-y-1 mb-2">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-500">เป้าหมาย</span>
                  <span class="font-medium text-sm">{{ formatValue(kpi.actual_value || kpi.actualValue) }}/{{ formatValue(kpi.target_value || kpi.targetValue) }}</span>
                </div>
                <!-- <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-500">ผลลัพธ์ปัจจุบัน</span>
                  <span class="font-medium text-sm">{{ formatValue(kpi.actual_value || kpi.actualValue) }}</span>
                </div> -->
                <div>
                  <div class="flex justify-between items-center mb-1">
                    <span class="text-sm text-gray-500">ความคืบหน้า</span>
                    <span class="text-sm font-medium">{{ getProgressPercentage(kpi) }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      :class="getProgressBarClass(kpi.status)"
                      class="h-2 rounded-full transition-all duration-300"
                      :style="{ width: Math.min(getProgressPercentage(kpi), 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
              
              <!-- Footer -->
              <div class="gap-2 mt-auto pt-2 flex flex-row items-center justify-start border-t border-gray-100">
                <div class="flex items-center text-xs text-gray-500">
                  <Icon icon="mdi:calendar" class="w-3 h-3 mr-1" />
                  <span>{{ formatDate(kpi.start_date || kpi.startDate) }} - {{ formatDate(kpi.end_date || kpi.endDate) }}</span>
                </div>
                <div class="flex items-center text-xs text-gray-500">
                  <Icon icon="mdi:tag" class="w-3 h-3 mr-1" />
                  <span>{{ kpi.category_name || kpi.category || 'N/A' }}</span>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-200/60 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 shadow-lg w-11/12 md:w-2/3 lg:w-1/2  rounded-md bg-white">
        <div class="mt-1">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-medium text-gray-900">
              {{ isEditing ? 'แก้ไข KPI' : 'เพิ่ม KPI ใหม่' }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <Icon icon="mdi:close" class="w-6 h-6" />
            </button>
          </div>
          
          <form @submit.prevent="saveKpi" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อ KPI *</label>
              <input
                v-model="form.title"
                type="text"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="กรอกชื่อ KPI"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย *</label>
              <textarea
                v-model="form.description"
                required
                rows="3"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="กรอกคำอธิบาย KPI"
              ></textarea>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">เป้าหมาย *</label>
                <input
                  v-model.number="form.targetValue"
                  type="number"
                   step="0.01"
                  required
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">ผลลัพธ์ปัจจุบัน</label>
                <input
                  v-model.number="form.actualValue"
                  type="number"
                  step="0.01"
                  :disabled="true"
                  :class="[
                    'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                    'bg-gray-100 text-gray-500 cursor-not-allowed'
                  ]"
                  placeholder="0"
                />
                <p class="text-xs text-gray-500 mt-1">อัปเดตได้ที่ปุ่ม อัปเดต</p>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มต้น *</label>
                <input
                  v-model="form.startDate"
                  type="date"
                  required
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">วันที่สิ้นสุด *</label>
                <input
                  v-model="form.endDate"
                  type="date"
                  required
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่ *</label>
                <select
                  v-model="form.category"
                  required
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">เลือกหมวดหมู่</option>
                  <option v-for="category in kpiStore.categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>

              <div v-if="isEditing" >
                <label class="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                <span class="text-sm font-medium px-3 py-2 text-gray-500">{{ form.status }}</span>
                
            </div>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                {{ isEditing ? 'บันทึกการแก้ไข' : 'เพิ่ม KPI' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <DeleteModal
      :show="showDeleteModal"
      title="ยืนยันการลบ"
      :message="deleteModalMessage"
      confirm-text="ลบ"
      :loading="false"
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

    <!-- Update Progress Modal -->
    <div v-if="showProgressModal" class="fixed inset-0 bg-gray-200/60 overflow-y-auto h-full w-full z-50">
      <div
        class="relative top-5 mx-auto p-5 border max-w-7xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">อัปเดตความคืบหน้า</h3>
            <button @click="closeProgressModal" class="text-gray-400 hover:text-gray-600">
              <Icon icon="mdi:close" class="w-6 h-6" />
            </button>
          </div>

          <div class="flex flex-row justify-between gap-2">
            <!-- ประวัติการอัปเดต -->
            <div class="w-1/2 h-full shadow-md bg-gray-50 rounded-lg p-2">
              <h4 class="text-md border-b font-medium text-gray-900 mb-2 flex items-center">
                <Icon icon="mdi:history" class="w-5 h-5 mr-2" />
                ประวัติการอัปเดต
              </h4>

              <!-- Loading State -->
              <div v-if="loadingHistory" class="flex justify-center py-4">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>

              <!-- History List -->
              <div v-else-if="kpiHistory.length > 0" class="space-y-3 max-h-100 overflow-y-auto">
                <div v-for="(update, index) in kpiHistory" :key="update._id || update.id"
                  class="bg-white shadow-md border rounded-lg p-4 border-l-4 border-blue-500">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <span
                          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          #{{ index + 1 }}
                        </span>
                        <span class="text-sm text-gray-500">
                          {{ formatDate(update.createdAt) }}
                        </span>
                      </div>

                      <div class="space-y-1">
                        <div class="flex items-center gap-2">
                          <span class="text-sm font-medium text-gray-700">ค่าที่อัปเดต:</span>
                          <span class="text-sm font-semibold text-green-600">
                            {{ formatValue(update.updated_value) }}
                          </span>
                        </div>

                        <div v-if="update.comment" class="flex items-start gap-2">
                          <span class="text-sm font-medium text-gray-700">ความคิดเห็น:</span>
                          <span class="text-sm text-gray-600">{{ update.comment }}</span>
                        </div>

                        <div class="flex items-center gap-2">
                          <span class="text-sm font-medium text-gray-700">อัปเดตโดย:</span>
                          <span class="text-sm text-gray-600">User: {{ update.updated_by_name }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-else class="text-center py-8 text-gray-500">
                <Icon icon="mdi:history" class="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p class="text-sm">ยังไม่มีประวัติการอัปเดต</p>
              </div>
            </div>

            <div class="w-1/2 bg-gray-50 rounded-lg p-4 shadow-md">
              <div v-if="kpiToUpdateProgress" class="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 class="font-medium text-gray-900">{{ kpiToUpdateProgress.title }}</h4>
                <p class="text-sm text-gray-600 mt-1">เป้าหมาย: {{ formatValue(kpiToUpdateProgress.target_value ||
                  kpiToUpdateProgress.targetValue) }}</p>
                <p class="text-sm text-gray-600">ค่าปัจจุบัน: {{ formatValue(kpiToUpdateProgress.actual_value ||
                  kpiToUpdateProgress.actualValue) }}</p>
              </div>
              <form @submit.prevent="updateProgress">
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">ค่าที่อัปเดต</label>
                    <input v-model.number="progressForm.updatedValue" type="number" step="0.01" required
                      class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00" />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">ความคิดเห็น (ไม่บังคับ)</label>
                    <textarea v-model="progressForm.comment" rows="3"
                      class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="เพิ่มความคิดเห็นเกี่ยวกับการอัปเดตนี้..."></textarea>
                  </div>
                </div>

                <div class="flex justify-end space-x-3 mt-6">
                  <button type="button" @click="closeProgressModal"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                    ยกเลิก
                  </button>
                  <button type="submit"
                    class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                    อัปเดต
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useKpiStore } from '../stores/kpi'
import { useAuthStore } from '../stores/auth'
import { Icon } from '@iconify/vue'
import StatsCards from '../components/StatsCards.vue'
import FilterBar from '../components/FilterBar.vue'
import Alert from '../components/Alert.vue'
import DeleteModal from '../components/DeleteModal.vue'
import { exportKPIData } from '../utils/exportUtils'

const kpiStore = useKpiStore()
const authStore = useAuthStore()

// State
const searchTerm = ref('')
const showModal = ref(false)
const showDeleteModal = ref(false)
const showProgressModal = ref(false)
const isEditing = ref(false)
const kpiToDelete = ref(null)
const kpiToUpdateProgress = ref(null)
const editingKpiId = ref(null)

// Alert state
const alert = ref({
  show: false,
  type: 'info',
  title: '',
  message: ''
})

const filters = ref({
  status: '',
  category: ''
})

const form = ref({
  title: '',
  description: '',
  targetValue: '',
  actualValue: '',
  startDate: '',
  endDate: '',
  status: 'on-track',
  category: 'Customer'
})

const progressForm = ref({
  updatedValue: 0.00,
  comment: ''
})

const kpiHistory = ref([])
const loadingHistory = ref(false)

// Computed
const myKpis = computed(() => {
  return kpiStore.kpis.filter(kpi => kpi.assigned_user === authStore.user?.id)
})

const myKpisByStatus = computed(() => {
  return {
    'on-track': myKpis.value.filter(kpi => kpi.status === 'On Track').length,
    'at-risk': myKpis.value.filter(kpi => kpi.status === 'At Risk').length,
    'off-track': myKpis.value.filter(kpi => kpi.status === 'Off Track').length
  }
})

const myKpisByCategory = computed(() => {
  const categories = {}
  myKpis.value.forEach(kpi => {
    const categoryName = kpi.category_name || kpi.category || 'Unknown Category'
    if (!categories[categoryName]) {
      categories[categoryName] = 0
    }
    categories[categoryName]++
  })
  return categories
})

const kpiStatsCards = computed(() => [
  {
    id: 'total-kpis',
    label: 'KPI ทั้งหมด',
    value: myKpis.value.length,
    icon: 'mdi:chart-line',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    id: 'on-track-kpis',
    label: 'On Track',
    value: myKpisByStatus.value['on-track'],
    icon: 'mdi:check-circle',
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600'
  },
  {
    id: 'at-risk-kpis',
    label: 'At Risk',
    value: myKpisByStatus.value['at-risk'],
    icon: 'mdi:alert-circle',
    bgColor: 'bg-yellow-100',
    iconColor: 'text-yellow-600'
  },
  {
    id: 'off-track-kpis',
    label: 'Off Track',
    value: myKpisByStatus.value['off-track'],
    icon: 'mdi:close-circle',
    bgColor: 'bg-red-100',
    iconColor: 'text-red-600'
  }
])

const filteredKpis = computed(() => {
  let result = myKpis.value
  
  // Full text search across multiple fields
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase().trim()
    result = result.filter(kpi => {
      const title = (kpi.title || '').toLowerCase()
      const description = (kpi.description || '').toLowerCase()
      const categoryName = (kpi.category_name || kpi.category || '').toLowerCase()
      const status = (kpi.status || '').toLowerCase()
      const targetValue = String(kpi.target_value || '').toLowerCase()
      const actualValue = String(kpi.actual_value || '').toLowerCase()
      
      return title.includes(search) ||
             description.includes(search) ||
             categoryName.includes(search) ||
             status.includes(search) ||
             targetValue.includes(search) ||
             actualValue.includes(search)
    })
  }
  
  if (filters.value.status) {
    // Convert filter value to API format
    const statusMap = {
      'on-track': 'On Track',
      'at-risk': 'At Risk',
      'off-track': 'Off Track'
    }
    const apiStatus = statusMap[filters.value.status] || filters.value.status
    result = result.filter(kpi => kpi.status === apiStatus)
  }
  
  if (filters.value.category) {
    result = result.filter(kpi => {
      const categoryName = kpi.category_name || kpi.category || 'Unknown Category'
      return categoryName === filters.value.category
    })
  }
  
  return result
})

// Methods
const openCreateModal = () => {
  isEditing.value = false
  editingKpiId.value = null
  resetForm()
  showModal.value = true
}

const openEditModal = (kpi) => {
  isEditing.value = true
  editingKpiId.value = kpi.id
  
  // Format dates for input type="date" (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }
  
  form.value = {
    title: kpi.title,
    description: kpi.description,
    targetValue: kpi.target_value || kpi.targetValue,
    actualValue: kpi.actual_value || kpi.actualValue,
    startDate: formatDateForInput(kpi.start_date || kpi.startDate),
    endDate: formatDateForInput(kpi.end_date || kpi.endDate),
    status: kpi.status,
    category: kpi.category_id || kpi.category || ''
  }
  showModal.value = true
}

const openDeleteModal = (kpi) => {
  kpiToDelete.value = kpi
  showDeleteModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  kpiToDelete.value = null
}

const openUpdateProgressModal = async (kpi) => {
  kpiToUpdateProgress.value = kpi
  progressForm.value = {
    updatedValue: kpi.actual_value || kpi.actualValue || 0.00,
    comment: ''
  }
  showProgressModal.value = true
  
  // ดึงข้อมูลประวัติการอัปเดต
  await fetchKpiHistory(kpi.id)
}

const closeProgressModal = () => {
  showProgressModal.value = false
  kpiToUpdateProgress.value = null
  progressForm.value = {
    updatedValue: 0.00,
    comment: ''
  }
  kpiHistory.value = []
}

const fetchKpiHistory = async (kpiId) => {
  try {
    loadingHistory.value = true
    const response = await kpiStore.getKpiWithHistory(kpiId)
    if (response && response.recent_updates) {
      kpiHistory.value = response.recent_updates
    }
  } catch (error) {
    console.error('Error fetching KPI history:', error)
    kpiHistory.value = []
  } finally {
    loadingHistory.value = false
  }
}

const updateProgress = async () => {
  if (!kpiToUpdateProgress.value) return
  
  try {
    const updateData = {
      updated_value: progressForm.value.updatedValue,
      comment: progressForm.value.comment || ''
    }

    // เรียก API อัปเดต progress
    await kpiStore.updateKpiProgress(kpiToUpdateProgress.value.id, updateData)

    // รีเฟรชข้อมูล KPI และประวัติ
    await kpiStore.getUserKpis(authStore.user?.id)
    await fetchKpiHistory(kpiToUpdateProgress.value.id)

    showAlert('success', 'สำเร็จ', 'อัปเดตความคืบหน้าเรียบร้อยแล้ว')
  } catch (error) {
    console.error('Error updating progress:', error)
    
    // Extract validation message from API response
    let errorMessage = 'ไม่สามารถอัปเดตความคืบหน้าได้ กรุณาลองใหม่อีกครั้ง'
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    showAlert('error', 'เกิดข้อผิดพลาด', errorMessage)
  }
}

const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    targetValue: '',
    actualValue: '',
    startDate: '',
    endDate: '',
    status: 'on-track',
    category: ''
  }
}

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

const saveKpi = async () => {
  try {
    const kpiData = {
      title: form.value.title,
      description: form.value.description,
      target_value: form.value.targetValue,
      actual_value: form.value.actualValue,
      status: "On Track",
      category_id: form.value.category,
      start_date: form.value.startDate,
      end_date: form.value.endDate,
      assigned_user: authStore.user?.id
    }
    
    if (isEditing.value) {
      await kpiStore.updateKpi(editingKpiId.value, kpiData)
      showAlert('success', 'แก้ไข KPI สำเร็จ!')
    } else {
      await kpiStore.createKpi(kpiData)
      showAlert('success', 'เพิ่ม KPI สำเร็จ!')
    }
    
    // รีเฟรชข้อมูล KPI
    await kpiStore.getUserKpis(authStore.user?.id)
    
    closeModal()
  } catch (error) {
    console.error('Error saving KPI:', error)
    
    // Extract validation message from API response
    let errorMessage = 'ไม่สามารถบันทึกข้อมูลได้'
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    showAlert('error', 'เกิดข้อผิดพลาด', errorMessage)
  }
}

const confirmDelete = async () => {
  if (kpiToDelete.value) {
    try {
      await kpiStore.deleteKpi(kpiToDelete.value.id)
      
      // รีเฟรชข้อมูล KPI
      await kpiStore.getUserKpis(authStore.user?.id)
      
      showAlert('success', 'ลบ KPI สำเร็จ!')
      closeDeleteModal()
  } catch (error) {
    console.error('Error deleting KPI:', error)
    
    // Extract validation message from API response
    let errorMessage = 'ไม่สามารถลบข้อมูลได้'
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    showAlert('error', 'เกิดข้อผิดพลาด', errorMessage)
  }
  }
}

const deleteModalMessage = computed(() => {
  return `คุณต้องการลบ KPI "${kpiToDelete.value?.title}" หรือไม่?`
})

const applyFilters = () => {
  // Filters are applied automatically through computed property
}

const clearFilters = () => {
  filters.value = {
    status: '',
    category: ''
  }
}

const getStatusBadgeClass = (status) => {
  const classes = {
    'On Track': 'bg-green-100 text-green-800',
    'At Risk': 'bg-yellow-100 text-yellow-800',
    'Off Track': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status) => {
  const texts = {
    'on-track': 'On Track',
    'at-risk': 'At Risk',
    'off-track': 'Off Track'
  }
  return texts[status] || status
}

const getProgressBarClass = (status) => {
  const classes = {
    'On Track': 'bg-green-500',
    'At Risk': 'bg-yellow-500',
    'Off Track': 'bg-red-500'
  }
  return classes[status] || 'bg-gray-500'
}

const getProgressPercentage = (kpi) => {
  if (kpi.progress_percentage !== undefined) {
    return kpi.progress_percentage
  }
  if (!kpi.target_value && !kpi.targetValue) return 0
  const target = kpi.target_value || kpi.targetValue
  const actual = kpi.actual_value || kpi.actualValue
  if (!target || target === 0) return 0
  const percentage = (actual / target) * 100
  return Math.min(Math.round(percentage), 100)
}

const formatValue = (value) => {
  if (typeof value === 'number') {
    return value.toLocaleString()
  }
  return value || 0
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('th-TH')
}

// Export functions
const prepareKpiDataForExport = (kpis) => {
    console.log(kpis);
    
  return kpis.map(kpi => {
    const targetValue = kpi.target_value || kpi.targetValue || 0
    const actualValue = kpi.actual_value || kpi.actualValue || 0
    
    
    // Format date range
    const startDate = kpi.start_date || kpi.startDate || ''
    const endDate = kpi.end_date || kpi.endDate || ''
    const dateRange = startDate && endDate 
      ? `${formatDate(startDate)} - ${formatDate(endDate)}`
      : ''
    
    return {
      title: kpi.title || '',
      description: kpi.description || '',
      target_value: targetValue,
      actual_value: actualValue,
      status: kpi.status || 'On Track',
      assigned_user: kpi.assigned_user_name || kpi.assignedUser || 'ไม่ระบุ',
      date_range: dateRange
    }
  })
}

const exportToCSV = () => {
  try {
    const exportData = prepareKpiDataForExport(filteredKpis.value)
    const result = exportKPIData(exportData, 'csv', 'My_KPI_Report')
    
    if (result.success) {
      showAlert('success', 'Export สำเร็จ', result.message)
    } else {
      showAlert('error', 'Export ไม่สำเร็จ', result.message)
    }
  } catch (error) {
    console.error('Export CSV Error:', error)
    showAlert('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถ export CSV ได้')
  }
}

const exportToPDF = () => {
  try {
    const exportData = prepareKpiDataForExport(filteredKpis.value)
    const result = exportKPIData(exportData, 'pdf', 'My_KPI_Report')
    
    if (result.success) {
      showAlert('success', 'Export สำเร็จ', result.message)
    } else {
      showAlert('error', 'Export ไม่สำเร็จ', result.message)
    }
  } catch (error) {
    console.error('Export PDF Error:', error)
    showAlert('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถ export PDF ได้')
  }
}

// Filter update handlers
const updateSearchTerm = (value) => {
  searchTerm.value = value
}

const updateStatusFilter = (value) => {
  filters.value.status = value
}

const updateCategoryFilter = (value) => {
  filters.value.category = value
}

// Lifecycle
onMounted(async () => {
  if (authStore.user?.id) {
    try {
      // Load categories and user KPIs in parallel
      await Promise.all([
        kpiStore.fetchCategories(),
        kpiStore.getUserKpis(authStore.user.id)
      ])
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }
})
</script>
