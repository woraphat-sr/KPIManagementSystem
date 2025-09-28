<template>
  <div class="grid grid-cols-1 md:grid-cols-6 gap-3 mb-3">
    <div v-for="stat in stats" :key="stat.id" class="bg-white rounded-lg shadow-sm p-2">
      <div class="flex items-center">
        <div :class="`p-1.5 ${stat.bgColor} rounded-md`">
          <Icon :icon="stat.icon" :class="`w-4 h-4 ${stat.iconColor}`" />
        </div>
        <div class="ml-3">
          <p class="text-xs font-medium text-gray-600">{{ stat.label }}</p>
          <p class="text-lg font-bold text-gray-900">{{ stat.value }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'

// Props
const props = defineProps({
  stats: {
    type: Array,
    required: true,
    default: () => []
  }
})
</script>

<style scoped>
/* Custom styles if needed */
</style>
