<template>
  <div class="flex items-center gap-1">
    <!-- CSV Export Button -->
    <button
      @click="$emit('export-csv')"
      class="inline-flex items-center px-2 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded transition-colors duration-200"
      title="ส่งออกเป็นไฟล์ CSV"
    >
      <Icon icon="mdi:file-excel" class="w-3 h-3 mr-1" />
      CSV
    </button>
    
    <!-- PDF Export Button -->
    <button
      @click="$emit('export-pdf')"
      class="inline-flex items-center px-2 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded transition-colors duration-200"
      title="ส่งออกเป็นไฟล์ PDF"
    >
      <Icon icon="mdi:file-pdf-box" class="w-3 h-3 mr-1" />
      PDF
    </button>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'

// Emits
defineEmits(['export-csv', 'export-pdf'])
</script>
