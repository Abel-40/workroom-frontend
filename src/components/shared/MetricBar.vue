<script setup lang="ts">
import { computed } from "vue";

// Threshold coloring lives here once so every call site (department load,
// per-person workload) agrees on what "over capacity" means -- red >90%,
// amber 75-90%, primary below, per the dashboard spec.
const props = defineProps<{
  label: string;
  value: number; // 0-100
  sublabel?: string;
}>();

const clamped = computed(() => Math.max(0, Math.min(100, props.value)));
const barClass = computed(() => {
  if (clamped.value > 90) return "bg-rose-500";
  if (clamped.value >= 75) return "bg-amber-500";
  return "bg-primary";
});
const valueClass = computed(() => (clamped.value > 90 ? "text-rose-600" : "text-ink"));
</script>

<template>
  <div class="flex items-center gap-3">
    <div class="min-w-0 flex-1">
      <div class="mb-1.5 flex items-baseline justify-between gap-2">
        <span class="truncate text-sm font-medium text-ink">{{ label }}</span>
        <span class="shrink-0 text-xs font-semibold" :class="valueClass">
          {{ sublabel ?? `${Math.round(clamped)}%` }}
        </span>
      </div>
      <div class="h-2 w-full overflow-hidden rounded-full bg-slate-900/[.06]">
        <div class="h-full rounded-full transition-[width] duration-300" :class="barClass" :style="{ width: `${clamped}%` }" />
      </div>
    </div>
  </div>
</template>
