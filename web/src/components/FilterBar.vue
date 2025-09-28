<template>
  <div class="bg-white border border-gray-200 rounded-lg shadow-sm mb-3">
    <div class="p-3">
      <!-- Single Row Layout -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Search Input -->
        <div v-if="showSearch" class="flex-shrink-0 min-w-[180px]">
          <div class="relative">
            <Icon icon="mdi:magnify" class="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              v-model="localSearchTerm" 
              type="text" 
              :placeholder="searchPlaceholder"
              class="w-full pl-7 pr-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-gray-50 focus:bg-white" 
            />
          </div>
        </div>

        <!-- Status Filter -->
        <div v-if="showStatusFilter" class="flex-shrink-0 min-w-[110px]">
          <select 
            v-model="localStatusFilter" 
            @change="handleStatusChange" 
            class="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-gray-50 focus:bg-white"
          >
            <option value="">สถานะ: ทั้งหมด</option>
            <option value="on-track">On Track</option>
            <option value="at-risk">At Risk</option>
            <option value="off-track">Off Track</option>
          </select>
        </div>

        <!-- User Filter -->
        <div v-if="showUserFilter" class="flex-shrink-0 min-w-[130px]">
          <select 
            v-model="localUserFilter" 
            @change="handleUserChange" 
            class="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-gray-50 focus:bg-white"
          >
            <option value="">ผู้รับผิดชอบ: ทั้งหมด</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.username }}
            </option>
          </select>
        </div>

        <!-- Category Filter -->
        <div v-if="showCategoryFilter" class="flex-shrink-0 min-w-[110px]">
          <select 
            v-model="localCategoryFilter" 
            @change="handleCategoryChange" 
            class="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-gray-50 focus:bg-white"
          >
            <option value="">หมวดหมู่: ทั้งหมด</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>

        <!-- Role Filter -->
        <div v-if="showRoleFilter" class="flex-shrink-0 min-w-[110px]">
          <select 
            v-model="localRoleFilter" 
            @change="handleRoleChange" 
            class="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-gray-50 focus:bg-white"
          >
            <option value="">สิทธิ์: ทั้งหมด</option>
            <option value="admin">ผู้ดูแลระบบ</option>
            <option value="user">ผู้ใช้งานทั่วไป</option>
          </select>
        </div>

        <!-- Spacer -->
        <div class="flex-1"></div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-1">
          <!-- Clear Filter Button -->
          <button
            v-if="showClearButton"
            @click="handleClearFilters"
            class="inline-flex items-center px-2 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors duration-200 border border-gray-300"
            title="ล้างตัวกรอง"
          >
            <Icon icon="mdi:filter-remove" class="w-3 h-3 mr-1" />
            ล้าง
          </button>

          <!-- Export Buttons -->
          <ExportButtons 
            v-if="showExportButtons"
            @export-csv="$emit('export-csv')"
            @export-pdf="$emit('export-pdf')"
          />

          <!-- Create Button -->
          <button
            v-if="showCreateButton"
            @click="$emit('create-new')"
            class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <Icon icon="mdi:plus" class="w-3 h-3 mr-1" />
            {{ createButtonText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Icon } from '@iconify/vue'
import ExportButtons from './ExportButtons.vue'

// Props
const props = defineProps({
  // Search
  showSearch: {
    type: Boolean,
    default: true
  },
  searchPlaceholder: {
    type: String,
    default: 'ค้นหา...'
  },
  searchTerm: {
    type: String,
    default: ''
  },
  
  // Filters
  showStatusFilter: {
    type: Boolean,
    default: false
  },
  statusFilter: {
    type: String,
    default: ''
  },
  
  showUserFilter: {
    type: Boolean,
    default: false
  },
  userFilter: {
    type: [String, Number],
    default: ''
  },
  users: {
    type: Array,
    default: () => []
  },
  
  showCategoryFilter: {
    type: Boolean,
    default: false
  },
  categoryFilter: {
    type: String,
    default: ''
  },
  categories: {
    type: Array,
    default: () => []
  },
  
  showRoleFilter: {
    type: Boolean,
    default: false
  },
  roleFilter: {
    type: String,
    default: ''
  },
  
  // Buttons
  showClearButton: {
    type: Boolean,
    default: true
  },
  
  showExportButtons: {
    type: Boolean,
    default: false
  },
  
  showCreateButton: {
    type: Boolean,
    default: true
  },
  createButtonText: {
    type: String,
    default: 'เพิ่มใหม่'
  }
})

// Emits
const emit = defineEmits([
  'update:searchTerm',
  'update:statusFilter', 
  'update:userFilter',
  'update:categoryFilter',
  'update:roleFilter',
  'clear-filters',
  'export-csv',
  'export-pdf',
  'create-new'
])

// Local reactive values
const localSearchTerm = ref(props.searchTerm)
const localStatusFilter = ref(props.statusFilter)
const localUserFilter = ref(props.userFilter)
const localCategoryFilter = ref(props.categoryFilter)
const localRoleFilter = ref(props.roleFilter)

// Watch for prop changes
watch(() => props.searchTerm, (newVal) => {
  localSearchTerm.value = newVal
})

watch(() => props.statusFilter, (newVal) => {
  localStatusFilter.value = newVal
})

watch(() => props.userFilter, (newVal) => {
  localUserFilter.value = newVal
})

watch(() => props.categoryFilter, (newVal) => {
  localCategoryFilter.value = newVal
})

watch(() => props.roleFilter, (newVal) => {
  localRoleFilter.value = newVal
})

// Watch for local changes and emit
watch(localSearchTerm, (newVal) => {
  emit('update:searchTerm', newVal)
})

const handleStatusChange = () => {
  emit('update:statusFilter', localStatusFilter.value)
}

const handleUserChange = () => {
  emit('update:userFilter', localUserFilter.value)
}

const handleCategoryChange = () => {
  emit('update:categoryFilter', localCategoryFilter.value)
}

const handleRoleChange = () => {
  emit('update:roleFilter', localRoleFilter.value)
}

const handleClearFilters = () => {
  localSearchTerm.value = ''
  localStatusFilter.value = ''
  localUserFilter.value = ''
  localCategoryFilter.value = ''
  localRoleFilter.value = ''
  emit('clear-filters')
}
</script>
