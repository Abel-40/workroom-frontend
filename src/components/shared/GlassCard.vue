<script setup lang="ts">
withDefaults(
  defineProps<{
    kicker?: string;
    title?: string;
    padding?: "airy" | "medium" | "dense";
    // "glass" (default): the frosted/blurred look used across DL/Cm/Dl
    // dashboards. "flat": an opaque bordered card (same tokens ProjectsView/
    // EmployeesView already use) for the pages redesigned to match flat
    // reference mockups -- opt-in only, so every existing usage is unaffected.
    variant?: "glass" | "flat";
  }>(),
  { padding: "medium", variant: "glass" }
);
</script>

<template>
  <section
    class="rounded-2xl"
    :class="{
      'wr-glass': variant === 'glass',
      'border border-border bg-card shadow-sm': variant === 'flat',
      'p-6': padding === 'airy',
      'p-5': padding === 'medium',
      'p-[18px]': padding === 'dense',
    }"
  >
    <div v-if="kicker || title || $slots.actions" class="mb-4 flex items-start justify-between gap-3">
      <div>
        <p v-if="kicker" class="text-xs font-semibold uppercase tracking-[.06em] text-[#7D8592]">{{ kicker }}</p>
        <h2 v-if="title" class="text-base font-bold text-ink">{{ title }}</h2>
      </div>
      <div v-if="$slots.actions" class="flex shrink-0 items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
    <slot />
  </section>
</template>
