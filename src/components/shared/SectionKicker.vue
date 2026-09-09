<script setup lang="ts">
defineProps<{
  label: string;
}>();
</script>

<template>
  <div class="mb-3 flex items-center gap-2">
    <span class="h-[3px] w-[26px] rounded-full bg-gradient-to-r from-[#3F8CFF] to-accent-2" />
    <span class="text-[13px] font-extrabold uppercase tracking-[.06em] text-[#7D8592]">{{ label }}</span>
  </div>
</template>
