<script setup lang="ts">
withDefaults(
  defineProps<{
    rows?: number;
    padding?: "airy" | "medium" | "dense";
  }>(),
  { rows: 3, padding: "medium" }
);
</script>

<template>
  <section
    class="wr-glass animate-pulse rounded-2xl"
    :class="{
      'p-6': padding === 'airy',
      'p-5': padding === 'medium',
      'p-[18px]': padding === 'dense',
    }"
    role="status"
    aria-label="Loading"
  >
    <div class="mb-4 h-4 w-1/3 rounded bg-slate-900/10" />
    <div class="space-y-3">
      <div v-for="i in rows" :key="i" class="h-3 rounded bg-slate-900/10" :style="{ width: i % 2 ? '100%' : '80%' }" />
    </div>
  </section>
</template>
