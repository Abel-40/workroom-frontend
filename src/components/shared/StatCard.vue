<script setup lang="ts">
import type { Component } from "vue";

withDefaults(
  defineProps<{
    label: string;
    value: string | number;
    icon?: Component;
    delta?: string;
    deltaDirection?: "up" | "down" | "neutral";
  }>(),
  { deltaDirection: "neutral" }
);
</script>

<template>
  <div class="wr-glass rounded-2xl p-5">
    <div class="flex items-start justify-between gap-3">
      <p class="text-xs font-semibold uppercase tracking-[.06em] text-[#7D8592]">{{ label }}</p>
      <component :is="icon" v-if="icon" class="h-4 w-4 text-primary-strong" />
    </div>
    <p class="mt-2 text-[28px] font-extrabold leading-none text-ink">{{ value }}</p>
    <p
      v-if="delta"
      class="mt-2 text-xs font-semibold"
      :class="{
        'text-emerald-600': deltaDirection === 'up',
        'text-rose-600': deltaDirection === 'down',
        'text-[#7D8592]': deltaDirection === 'neutral',
      }"
    >
      {{ delta }}
    </p>
  </div>
</template>
