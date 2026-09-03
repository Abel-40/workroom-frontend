<script setup lang="ts">
import type { Component } from "vue";

withDefaults(
  defineProps<{
    icon?: Component;
    image?: string;
    imageAlt?: string;
    title?: string;
    message: string;
    /**
     * "sm" (default): compact widget empty state, e.g. inside a dashboard card.
     * "lg": a page's primary content (still shares its layout with other elements).
     * "xl": a full takeover -- the illustration is the only thing on screen.
     */
    size?: "sm" | "lg" | "xl";
  }>(),
  { size: "sm" }
);
</script>

<template>
  <div
    class="flex flex-col items-center justify-center text-center"
    :class="{
      'gap-3 rounded-xl border border-dashed border-slate-900/10 px-6 py-10': size === 'sm',
      'gap-4 rounded-2xl border border-dashed border-border bg-card px-6 py-14 sm:py-20': size === 'lg',
      'gap-5 rounded-2xl border border-dashed border-border bg-card px-6 py-20 sm:py-28': size === 'xl',
    }"
  >
    <img
      v-if="image"
      :src="image"
      :alt="imageAlt ?? title ?? message"
      loading="lazy"
      class="pointer-events-none select-none object-contain"
      :class="{
        'h-14 w-14 sm:h-16 sm:w-16': size === 'sm',
        'h-40 w-40 sm:h-56 sm:w-56': size === 'lg',
        'h-56 w-56 sm:h-72 sm:w-72 md:h-80 md:w-80': size === 'xl',
      }"
    />
    <div
      v-else-if="icon"
      class="flex items-center justify-center rounded-full bg-primary-soft"
      :class="size === 'sm' ? 'h-11 w-11' : size === 'lg' ? 'h-16 w-16' : 'h-20 w-20'"
    >
      <component :is="icon" class="text-primary-strong" :class="size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-7 w-7' : 'h-9 w-9'" />
    </div>

    <div>
      <p v-if="title" class="font-semibold text-ink" :class="size === 'xl' ? 'text-xl' : size === 'lg' ? 'text-lg' : ''">{{ title }}</p>
      <p
        class="mx-auto text-sm"
        :class="[title ? 'mt-1.5 text-subtle' : 'text-[#7D8592]', size === 'xl' ? 'max-w-sm text-base' : 'max-w-xs']"
      >
        {{ message }}
      </p>
    </div>

    <div v-if="$slots.default" class="mt-1">
      <slot />
    </div>
  </div>
</template>
