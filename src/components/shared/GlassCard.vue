<script setup lang="ts">
withDefaults(
  defineProps<{
    kicker?: string;
    title?: string;
    padding?: "airy" | "medium" | "dense";
  }>(),
  { padding: "medium" }
);
</script>

<template>
  <section
    class="wr-glass rounded-2xl"
    :class="{
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
