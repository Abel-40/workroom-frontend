<script setup lang="ts">
import type { Component } from "vue";

defineProps<{
  icon: Component;
  message: string;
}>();
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-900/10 px-6 py-10 text-center">
    <div class="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft">
      <component :is="icon" class="h-5 w-5 text-primary-strong" />
    </div>
    <p class="max-w-xs text-sm text-[#7D8592]">{{ message }}</p>
    <div v-if="$slots.default" class="mt-1">
      <slot />
    </div>
  </div>
</template>
