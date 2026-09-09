<script setup lang="ts">
import { computed } from "vue";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// A circular progress ring around a member's avatar -- how full someone's
// active-task plate is, at a glance. `progress` is 0..1 (already clamped by
// the caller against the busiest teammate); `tone` picks the ring color by
// load severity so an overloaded person visually stands out in the grid.
const props = withDefaults(
  defineProps<{
    progress: number;
    imageUrl?: string | null;
    initials: string;
    tone?: "light" | "medium" | "heavy";
  }>(),
  { tone: "light" }
);

const SIZE = 64;
const STROKE = 4;
const radius = SIZE / 2 - STROKE;
const circumference = 2 * Math.PI * radius;

const clamped = computed(() => Math.min(1, Math.max(0, props.progress)));
const dashOffset = computed(() => circumference * (1 - clamped.value));

const toneClass = computed(() => ({ light: "stroke-primary", medium: "stroke-warning-foreground", heavy: "stroke-danger-foreground" })[props.tone]);
</script>

<template>
  <div class="relative shrink-0" :style="{ width: `${SIZE}px`, height: `${SIZE}px` }">
    <svg :width="SIZE" :height="SIZE" class="absolute inset-0 -rotate-90">
      <circle :cx="SIZE / 2" :cy="SIZE / 2" :r="radius" fill="none" :stroke-width="STROKE" class="stroke-border" />
      <circle
        :cx="SIZE / 2"
        :cy="SIZE / 2"
        :r="radius"
        fill="none"
        :stroke-width="STROKE"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        :class="toneClass"
        class="transition-[stroke-dashoffset] duration-500 ease-out"
      />
    </svg>
    <Avatar class="absolute inset-0 m-auto h-[56px] w-[56px] text-sm">
      <AvatarImage v-if="imageUrl" :src="imageUrl" />
      <AvatarFallback>{{ initials }}</AvatarFallback>
    </Avatar>
  </div>
</template>
