<template>
  <div class="bg-white rounded-lg shadow overflow-hidden h-[calc(100vh-250px)]">
    <div class="overflow-auto h-full">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th
              v-for="column in columns" 
              :key="column.key"
              :class="[
                'px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-50',
                column.type === 'number' ? 'text-right' : 'text-left',
                column.class || ''
              ]"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <!-- Loading State -->
          <tr v-if="loading" class="animate-pulse">
            <td :colspan="columns.length" class="px-3 py-8 text-center text-gray-500">
              <div class="flex items-center justify-center space-x-1">
                <svg class="animate-spin w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span>กำลังโหลด...</span>
              </div>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-else-if="data.length === 0">
            <td :colspan="columns.length" class="px-3 py-8 text-center text-gray-500">
              <Icon :icon="emptyIcon" class="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>{{ emptyText }}</p>
            </td>
          </tr>

          <!-- Data Rows -->
          <tr 
            v-else 
            v-for="(item, index) in data" 
            :key="item.id || index" 
            :class="[
              'hover:bg-gray-50 transition-colors',
              rowClass ? rowClass(item, index) : ''
            ]"
          >
            <td 
              v-for="column in columns" 
              :key="column.key"
              :class="[
                'px-3 py-2 whitespace-nowrap bg-white text-sm',
                column.type === 'number' ? 'text-right' : 'text-left',
                column.cellClass || ''
              ]"
            >
              <slot 
                :name="`cell-${column.key}`" 
                :item="item" 
                :value="getNestedValue(item, column.key)" 
                :index="rowIndex"
                :column="column"
              >
                <!-- Default cell content -->
                <span v-if="column.type === 'text'">
                  {{ getNestedValue(item, column.key) }}
                </span>
                
                <!-- Number type -->
                <span v-else-if="column.type === 'number'">
                  {{ column.formatter ? column.formatter(getNestedValue(item, column.key), item) : getNestedValue(item, column.key) }}
                </span>
                
                <!-- Badge type -->
                <span 
                  v-else-if="column.type === 'badge'"
                  :class="[
                    'inline-flex px-2 py-0.5 text-xs font-medium rounded-full',
                    column.badgeClass ? column.badgeClass(getNestedValue(item, column.key), item) : 'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ getNestedValue(item, column.key) }}
                </span>
                
                <!-- Date type -->
                <span v-else-if="column.type === 'date'">
                  {{ formatDate(getNestedValue(item, column.key)) }}
                </span>
                
                <!-- Actions type -->
                <div v-else-if="column.type === 'actions'" class="flex items-center space-x-1">
                  <slot 
                    name="actions" 
                    :item="item" 
                    :index="rowIndex"
                  >
                    <!-- Default actions if no slot provided -->
                  </slot>
                </div>
                
                <!-- Default fallback -->
                <span v-else>
                  {{ getNestedValue(item, column.key) }}
                </span>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'

const props = defineProps({
  // Table configuration
  columns: {
    type: Array,
    required: true,
    validator: (columns) => {
      return columns.every(col => col.key && col.label)
    }
  },
  
  // Data
  data: {
    type: Array,
    default: () => []
  },
  
  // Loading state
  loading: {
    type: Boolean,
    default: false
  },
  
  // Empty state
  emptyIcon: {
    type: String,
    default: 'mdi:database-search'
  },
  
  emptyText: {
    type: String,
    default: 'ไม่พบข้อมูล'
  },
  
  // Styling
  rowClass: {
    type: Function,
    default: null
  }
})

// Helper function to get nested object values (e.g., 'user.profile.name')
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null
  }, obj)
}

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return '-'
  
  try {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    return dateString
  }
}

</script>
