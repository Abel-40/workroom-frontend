<script setup lang="ts">
defineProps<{
  kicker?: string;
  title: string;
  subtitle?: string;
  scope?: string;
}>();
</script>

<template>
  <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div>
      <p v-if="kicker" class="text-[13px] font-semibold uppercase tracking-[.06em] text-subtle">{{ kicker }}</p>
      <div class="flex flex-wrap items-center gap-3">
        <h1 class="text-[28px] font-extrabold leading-tight text-ink md:text-[32px]">{{ title }}</h1>
        <span
          v-if="scope"
          class="inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-strong"
        >
          {{ scope }}
        </span>
      </div>
      <p v-if="subtitle" class="mt-1 text-sm text-[#7D8592]">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="flex shrink-0 items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
