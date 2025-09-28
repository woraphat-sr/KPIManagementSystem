<template>
  <div v-if="show" class="fixed top-4 right-4 z-[100] max-w-sm">
    <div 
      :class="[
        'flex items-center p-4 mb-4 text-sm border rounded-lg shadow-lg transition-all duration-300',
        alertClasses
      ]" 
      role="alert"
    >
      <Icon :icon="alertIcon" class="shrink-0 w-4 h-4 me-3" />
      <span class="sr-only">{{ type }}</span>
      <div class="flex-1">
        <span class="font-medium">{{ title }}</span>
        <p v-if="message" class="mt-1">{{ message }}</p>
      </div>
      <button 
        @click="close"
        class="ml-3 text-current hover:opacity-75 transition-opacity"
      >
        <Icon icon="mdi:close" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info', 'dark'].includes(value)
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 5000 // 5 seconds
  },
  show: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close'])

const show = ref(props.show)
let timeoutId = null

const alertClasses = computed(() => {
  const classes = {
    success: 'text-green-800 border-green-300 bg-green-50 dark:bg-gray-800 dark:text-green-400 dark:border-green-800',
    error: 'text-red-800 border-red-300 bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800',
    warning: 'text-yellow-800 border-yellow-300 bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300 dark:border-yellow-800',
    info: 'text-blue-800 border-blue-300 bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800',
    dark: 'text-gray-800 border-gray-300 bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
  }
  return classes[props.type] || classes.info
})

const alertIcon = computed(() => {
  const icons = {
    success: 'mdi:check-circle',
    error: 'mdi:alert-circle',
    warning: 'mdi:alert',
    info: 'mdi:information',
    dark: 'mdi:information'
  }
  return icons[props.type] || icons.info
})

const close = () => {
  show.value = false
  emit('close')
}

onMounted(() => {
  if (props.duration > 0) {
    timeoutId = setTimeout(() => {
      close()
    }, props.duration)
  }
})

// Cleanup timeout on unmount
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
})
</script>
