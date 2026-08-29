<script setup lang="ts">
// Shared brand mark (navbar + footer) so the two never drift -- a plain
// inline SVG rather than a raster logo file since it needs to inherit
// currentColor-independent gradient stops and scale crisply at any size.
defineProps<{ class?: string }>();
</script>

<template>
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" :class="$props.class">
    <defs>
      <linearGradient id="wr-mark-gradient" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#3F8CFF" />
        <stop offset="1" stop-color="#6A5CFF" />
      </linearGradient>
    </defs>
    <path
      d="M20 2.5 35.5 11v18L20 37.5 4.5 29V11L20 2.5Z"
      fill="url(#wr-mark-gradient)"
    />
    <path
      d="M13 16.5 17 25l3-6 3 6 4-8.5"
      stroke="white"
      stroke-width="2.4"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
    />
  </svg>
</template>
