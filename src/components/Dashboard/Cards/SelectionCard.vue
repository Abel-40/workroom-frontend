<script setup lang="ts">
defineProps<{
  name: string
  selected: boolean
}>()

defineEmits(['toggle'])
</script>


<template>
  <div
    @click="$emit('toggle')"
    class="cursor-pointer border rounded-xl px-4 py-3 flex items-center gap-3 transition-all"
    :class="selected ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'"
  >
    <span class="text-sm font-medium text-gray-800">{{ name }}</span>
  </div>
</template>

