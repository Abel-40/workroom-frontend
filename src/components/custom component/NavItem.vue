<template>
  <button
    class="flex flex-col items-center text-xs transition-all duration-200"
    @click="$emit('click')"
  >
    <component
      :is="item.icon"
      :class="[
        'w-5 h-5 mb-0.5',
        isActive ? 'text-purple-600' : 'text-gray-400'
      ]"
    />
    <span :class="[isActive ? 'text-purple-600 font-medium' : 'text-gray-400']">
      {{ capitalize(item.name) }}
    </span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  item: { name: string; icon: any }
  isActive: boolean
}>()

defineEmits(['click'])

function capitalize(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1)
}
</script>
