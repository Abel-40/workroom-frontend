<script setup lang="ts">
// Initials-on-color avatar, used everywhere a member is represented in the
// AI workspace (mention menu, assignee picker, assistant header). No photo
// URL is safely exposed by any endpoint used here (profile pictures require
// authenticated media serving, out of scope) -- initials are a standard,
// justified stand-in, not a placeholder image.
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    name: string;
    seed?: string;
    size?: "sm" | "md";
  }>(),
  { size: "sm" }
);

const initials = computed(() => {
  const parts = props.name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
});

// Small deterministic hash -> hue, so the same person always gets the same
// color without needing a server-assigned palette index.
const hue = computed(() => {
  const key = props.seed || props.name;
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) % 360;
  return hash;
});

const sizeClass = computed(() => (props.size === "md" ? "h-9 w-9 text-sm" : "h-6 w-6 text-[10px]"));
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
    :class="sizeClass"
    :style="{ backgroundColor: `hsl(${hue}, 62%, 52%)` }"
  >
    {{ initials }}
  </span>
</template>
