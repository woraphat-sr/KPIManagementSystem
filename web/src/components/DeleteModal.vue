<template>
  <div v-if="show" class="fixed inset-0 bg-gray-200/60 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3 text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <Icon icon="mdi:alert" class="w-6 h-6 text-red-600" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">{{ title }}</h3>
        <p class="text-sm text-gray-500 mb-6">
          {{ message }}<br>
          การกระทำนี้ไม่สามารถย้อนกลับได้
        </p>
        <div class="flex justify-center space-x-3">
          <button
            @click="onCancel"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            ยกเลิก
          </button>
          <button
            @click="onConfirm"
            :disabled="loading"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            {{ loading ? 'กำลังลบ...' : confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'ยืนยันการลบ'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'ลบ'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const onConfirm = () => {
  emit('confirm')
}

const onCancel = () => {
  emit('cancel')
}
</script>
