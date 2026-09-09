<script setup lang="ts">
// Generic status/priority/risk pill for the AI Workspace screens -- built on
// the new success/warning/danger/info design tokens (tailwind.config.js)
// rather than the ad hoc Tailwind-color pills used elsewhere in the app.
withDefaults(
  defineProps<{
    label: string;
    tone?: "success" | "warning" | "danger" | "info" | "neutral";
  }>(),
  { tone: "neutral" }
);

const toneClass: Record<string, string> = {
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  danger: "bg-danger text-danger-foreground",
  info: "bg-info text-info-foreground",
  neutral: "bg-page text-subtle",
};
</script>

<template>
  <span class="inline-flex items-center rounded-md px-2 py-0.5 text-[10.5px] font-medium" :class="toneClass[tone]">
    {{ label }}
  </span>
</template>
