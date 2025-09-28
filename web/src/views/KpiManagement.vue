<template>
  <div>
    <div>
      <!-- Header -->
      <StatsCards :stats="statsCards" />

      <!-- Filters -->
      <FilterBar
        :search-term="filters.searchTerm"
        :status-filter="filters.status"
        :user-filter="filters.user"
        :category-filter="filters.category"
        :users="usersStore.users"
        :categories="Object.keys(kpiStore.kpisByCategory)"
        show-search
        show-status-filter
        show-user-filter
        show-category-filter
        show-export-buttons
        search-placeholder="ค้นหา KPI..."
        create-button-text="เพิ่ม KPI ใหม่"
        @update:search-term="updateSearchTerm"
        @update:status-filter="updateStatusFilter"
        @update:user-filter="updateUserFilter"
        @update:category-filter="updateCategoryFilter"
        @clear-filters="clearFilters"
        @export-csv="exportToCSV"
        @export-pdf="exportToPDF"
        @create-new="openCreateModal"
      />

      <!-- KPI Table -->
      <DataTable :columns="tableColumns" :data="filteredKpis" :loading="kpiStore.isLoading"
        empty-icon="mdi:clipboard-text-outline" empty-text="ไม่มี KPI">
        <!-- KPI Column -->
        <template #cell-title="{ item }">
          <div>
            <div class="text-sm font-medium text-gray-900">{{ item.title }}</div>
            <div class="text-sm text-gray-500">{{ item.description }}</div>
          </div>
        </template>

        <!-- Status Column -->
        <template #cell-status="{ item }">
          <span :class="getStatusBadgeClass(item.status)"
            class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
            {{ item.status }}
          </span>
        </template>


        <!-- Progress Column -->
        <template #cell-progress_percentage="{ item }">
          <span>{{ (item.progress_percentage || 0) }}%</span>
        </template>

        <!-- Actions Column -->
        <template #actions="{ item }">
          <button @click="openUpdateProGressModal(item)"
            class="cursor-pointer text-blue-600 bg-blue-100 hover:text-blue-900 p-2 rounded">
            <Icon icon="bi:send-arrow-up-fill" class="w-4 h-4" />
          </button>
          <button @click="openEditModal(item)"
            class="cursor-pointer text-yellow-600 bg-yellow-100 hover:text-yellow-900 p-2 rounded">
            <Icon icon="mdi:pencil" class="w-4 h-4" />
          </button>
          <button @click="confirmDelete(item)"
            class="cursor-pointer text-red-600 bg-red-100 hover:text-red-900 p-2 rounded">
            <Icon icon="mdi:delete" class="w-4 h-4" />
          </button>
        </template>
      </DataTable>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-200/60 overflow-y-auto h-full w-full z-50">
      <div class="relative top-5 mx-auto p-2 shadow-lg w-11/12 md:w-2/3 lg:w-1/2  rounded-md bg-white">
        <div class="mt-1">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-medium text-gray-900">
              {{ isEditing ? 'แก้ไข KPI' : 'เพิ่ม KPI ใหม่' }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <Icon icon="mdi:close" class="w-6 h-6" />
            </button>
          </div>
          <form @submit.prevent="saveKpi">
            <div class="bg-white px-4 pt-5 pb-2 sm:p-6 sm:pb-2">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อ KPI</label>
                  <input v-model="form.title" type="text" required
                    class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="เช่น เพิ่มอัตราการรักษาลูกค้า" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
                  <textarea v-model="form.description" rows="3" required
                    class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="อธิบายรายละเอียดของ KPI"></textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">เป้าหมาย</label>
                    <input v-model.number="form.targetValue" type="number" step="0.01" required
                      class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">ผลลัพธ์ปัจจุบัน</label>
                    <input v-model.number="form.actualValue" type="number" step="0.01" :disabled="true" :class="[
                      'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                      'bg-gray-100 text-gray-500 cursor-not-allowed'
                    ]" placeholder="0.00" />
                    <p class="text-xs text-gray-500 mt-1">อัปเดตได้ที่ปุ่ม อัปเดต</p>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">


                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
                    <select v-model="form.category" required
                      class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">เลือกหมวดหมู่</option>
                      <option v-for="category in kpiStore.categories" :key="category.id" :value="category.id">
                        {{ category.name }}
                      </option>
                    </select>
                  </div>
                  <div v-if="isEditing">
                    <label class="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                    <span class="text-sm font-medium px-3 py-2 text-gray-500">{{ form.status }}</span>

                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">ผู้รับผิดชอบ</label>
                  <select v-model="form.assignedUser" required
                    class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">เลือกผู้รับผิดชอบ</option>
                    <option v-for="user in usersStore.users" :key="user.id" :value="user.id">
                      {{ user.username }} ({{ user.email }})
                    </option>
                  </select>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มต้น</label>
                    <input v-model="form.startDate" type="date" required
                      class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">วันที่สิ้นสุด</label>
                    <input v-model="form.endDate" type="date" required
                      class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            <div class=" px-4 py-1 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="submit"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                {{ isEditing ? 'อัปเดต' : 'สร้าง' }}
              </button>
              <button type="button" @click="closeModal"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
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
      title="ยืนยันการลบ"
      :message="deleteModalMessage"
      confirm-text="ลบ"
      :loading="false"
      @confirm="deleteKpi"
      @cancel="closeDeleteModal"
    />

    <!-- Update Progress Modal -->
    <div v-if="showProgressModal" class="fixed inset-0 bg-gray-200/60 overflow-y-auto h-full w-full z-50">
      <div
        class="relative top-5 mx-auto p-5 border max-w-7xl  shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">อัปเดตความคืบหน้า</h3>
            <button @click="closeProgressModal" class="text-gray-400 hover:text-gray-600">
              <Icon icon="mdi:close" class="w-6 h-6" />
            </button>
          </div>

          <div class="flex flex-row justify-between gap-2">
            <!-- ประวัติการอัปเดต -->
            <div class=" w-1/2 h-full shadow-md bg-gray-50 rounded-lg p-2">
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

    <!-- Alert Component -->
    <Alert v-if="alert.show" :type="alert.type" :title="alert.title" :message="alert.message" :duration="alert.duration"
      :show="alert.show" @close="closeAlert" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useKpiStore } from '../stores/kpi'
import { useUsersStore } from '../stores/users'
import DataTable from '../components/DataTable.vue'
import StatsCards from '../components/StatsCards.vue'
import FilterBar from '../components/FilterBar.vue'
import Alert from '../components/Alert.vue'
import DeleteModal from '../components/DeleteModal.vue'
import { Icon } from '@iconify/vue'
import { exportKPIData } from '../utils/exportUtils'

const kpiStore = useKpiStore()
const usersStore = useUsersStore()

// State
const showModal = ref(false)
const showDeleteModal = ref(false)
const showProgressModal = ref(false)
const isEditing = ref(false)
const kpiToDelete = ref(null)
const kpiToUpdateProgress = ref(null)

// Alert state
const alert = ref({
  show: false,
  type: 'info',
  title: '',
  message: '',
  duration: 5000
})

const filters = ref({
  searchTerm: '',
  status: '',
  user: '',
  category: ''
})

const form = ref({
  title: '',
  description: '',
  targetValue: 0.00,
  actualValue: 0.00,
  status: 'on-track',
  category: '',
  assignedUser: '',
  startDate: '',
  endDate: ''
})

const progressForm = ref({
  updatedValue: 0.00,
  comment: ''
})

const kpiHistory = ref([])
const loadingHistory = ref(false)

// Computed
const filteredKpis = computed(() => {
  return kpiStore.filterKpis(filters.value)
})

const statsCards = computed(() => {
  // Calculate stats from actual KPI data
  const total = kpiStore.kpis.length
  const onTrack = kpiStore.kpis.filter(kpi => kpi.status === 'On Track').length
  const atRisk = kpiStore.kpis.filter(kpi => kpi.status === 'At Risk').length
  const offTrack = kpiStore.kpis.filter(kpi => kpi.status === 'Off Track').length

  return [
    {
      id: 'total-kpis',
      label: 'KPI ทั้งหมด',
      value: total,
      icon: 'mdi:chart-line',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      id: 'on-track-kpis',
      label: 'On Track',
      value: onTrack,
      icon: 'mdi:check-circle',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      id: 'at-risk-kpis',
      label: 'At Risk',
      value: atRisk,
      icon: 'mdi:alert-circle',
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    {
      id: 'off-track-kpis',
      label: 'Off Track',
      value: offTrack,
      icon: 'mdi:close-circle',
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600'
    }
  ]
})

const tableColumns = computed(() => [
  {
    key: 'title',
    label: 'KPI',
    type: 'text'
  },
  {
    key: 'target_value',
    label: 'เป้าหมาย',
    type: 'number',
    formatter: (value, item) => formatValue(item.target_value || item.targetValue)
  },
  {
    key: 'actual_value',
    label: 'ผลลัพธ์',
    type: 'number',
    formatter: (value, item) => formatValue(item.actual_value || item.actualValue)
  },
  {
    key: 'progress_percentage',
    label: 'ความคืบหน้า',
    type: 'text'
  },
  {
    key: 'status',
    label: 'สถานะ',
    type: 'badge'
  },
  {
    key: 'assigned_user_name',
    label: 'ผู้รับผิดชอบ',
    type: 'text'
  },
  {
    key: 'start_date',
    label: 'วันที่เริ่มต้น',
    type: 'date',
    formatter: (value, item) => formatDate(item.start_date || item.startDate)
  },
  {
    key: 'end_date',
    label: 'วันที่สิ้นสุด',
    type: 'date',
    formatter: (value, item) => formatDate(item.end_date || item.endDate)
  },
  {
    key: 'actions',
    label: 'การดำเนินการ',
    type: 'actions'
  }
])

// Methods
const openCreateModal = () => {
  isEditing.value = false
  resetForm()
  showModal.value = true
}

const openEditModal = (kpi) => {
  isEditing.value = true

  // Format dates for input type="date" (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  form.value = {
    id: kpi.id,
    title: kpi.title,
    description: kpi.description,
    targetValue: kpi.target_value || kpi.targetValue,
    actualValue: kpi.actual_value || kpi.actualValue,
    status: kpi.status,
    category: kpi.category_id || kpi.category || '',
    assignedUser: kpi.assigned_user || kpi.assignedUser || '',
    startDate: formatDateForInput(kpi.start_date || kpi.startDate),
    endDate: formatDateForInput(kpi.end_date || kpi.endDate)
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    targetValue: 0.00,
    actualValue: 0.00, // Default value สำหรับการสร้างใหม่
    status: 'On Track',
    category: '',
    assignedUser: '',
    startDate: '',
    endDate: ''
  }
}

// Alert helper functions
const showAlert = (type, title, message) => {
  alert.value = {
    show: true,
    type,
    title,
    message,
    duration: 5000
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
      status: form.value.status,
      category_id: form.value.category,
      assigned_user: form.value.assignedUser,
      start_date: form.value.startDate,
      end_date: form.value.endDate
    }

    // เพิ่ม actual_value เฉพาะตอนสร้างใหม่
    if (!isEditing.value) {
      kpiData.actual_value = form.value.actualValue
    }

    if (isEditing.value) {
      await kpiStore.updateKpi(form.value.id, kpiData)
      showAlert('success', 'สำเร็จ', 'แก้ไข KPI เรียบร้อยแล้ว')
    } else {
      await kpiStore.createKpi(kpiData)
      showAlert('success', 'สำเร็จ', 'เพิ่ม KPI ใหม่เรียบร้อยแล้ว')
    }

    // รีเฟรชข้อมูล KPI
    await kpiStore.fetchAllKpi()

    closeModal()
  } catch (error) {
    console.error('Error saving KPI:', error)
    
    // Extract validation message from API response
    let errorMessage = 'ไม่สามารถบันทึก KPI ได้ กรุณาลองใหม่อีกครั้ง'
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    showAlert('error', 'เกิดข้อผิดพลาด', errorMessage)
  }
}

const confirmDelete = (kpi) => {
  kpiToDelete.value = kpi
  showDeleteModal.value = true
}

const deleteKpi = async () => {
  if (kpiToDelete.value) {
    try {
      await kpiStore.deleteKpi(kpiToDelete.value.id)

      // รีเฟรชข้อมูล KPI
      await kpiStore.fetchAllKpi()

      showAlert('success', 'สำเร็จ', 'ลบ KPI เรียบร้อยแล้ว')
      closeDeleteModal()
  } catch (error) {
    console.error('Error deleting KPI:', error)
    
    // Extract validation message from API response
    let errorMessage = 'ไม่สามารถลบ KPI ได้ กรุณาลองใหม่อีกครั้ง'
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    showAlert('error', 'เกิดข้อผิดพลาด', errorMessage)
  }
  }
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  kpiToDelete.value = null
}

const openUpdateProGressModal = async (kpi) => {
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
    await kpiStore.fetchAllKpi()
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

const applyFilters = () => {
  // Filters are applied automatically through computed property
}

const deleteModalMessage = computed(() => {
  return `คุณต้องการลบ KPI "${kpiToDelete.value?.title}" หรือไม่?`
})

const clearFilters = () => {
  filters.value = {
    searchTerm: '',
    status: '',
    user: '',
    category: ''
  }
}

// Filter update handlers
const updateSearchTerm = (value) => {
  filters.value.searchTerm = value
}

const updateStatusFilter = (value) => {
  filters.value.status = value
}

const updateUserFilter = (value) => {
  filters.value.user = value
}

const updateCategoryFilter = (value) => {
  filters.value.category = value
}

// Export functions
const prepareKpiDataForExport = (kpis) => {
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
    const result = exportKPIData(exportData, 'csv', 'KPI_Management_Report')
    
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
    const result = exportKPIData(exportData, 'pdf', 'KPI_Management_Report')
    
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

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('th-TH')
}

const formatValue = (value) => {
  if (typeof value === 'number') {
    return value.toLocaleString()
  }
  return value || 0
}

// Lifecycle
onMounted(async () => {
  try {
    // Load KPIs, categories, and users in parallel
    await Promise.all([
      kpiStore.fetchAllKpi(),
      kpiStore.fetchCategories(),
      usersStore.fetchUsers()
    ])
  } catch (error) {
    console.error('Error loading data:', error)
  }
})
</script>
