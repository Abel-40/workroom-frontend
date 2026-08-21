<script setup lang="ts">
// Polished segmented control for the 3 AI modes -- an animated pill slides
// behind whichever mode is active instead of the old flat tab-row toggle.
import { computed } from "vue";
import { HeartPulse, MessageSquare, Sparkles } from "lucide-vue-next";

export type AiMode = "plan" | "assistant" | "health";

const props = defineProps<{ modelValue: AiMode }>();
const emit = defineEmits<{ (e: "update:modelValue", value: AiMode): void }>();

const MODES: { value: AiMode; label: string; icon: typeof Sparkles }[] = [
  { value: "plan", label: "Plan Creator", icon: Sparkles },
  { value: "assistant", label: "Assistant", icon: MessageSquare },
  { value: "health", label: "Health Check", icon: HeartPulse },
];

const activeIndex = computed(() => MODES.findIndex((m) => m.value === props.modelValue));
</script>

<template>
  <div class="relative grid grid-cols-3 gap-1 rounded-2xl border border-gray-100 bg-white p-1 shadow-sm">
    <div
      class="absolute inset-y-1 rounded-xl bg-gradient-to-br from-primary to-indigo-500 transition-transform duration-300 ease-out"
      :style="{ width: 'calc((100% - 0.5rem) / 3)', transform: `translateX(calc(${activeIndex} * (100% + 0.25rem)))` }"
    />
    <button
      v-for="mode in MODES"
      :key="mode.value"
      type="button"
      class="relative z-10 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200"
      :class="modelValue === mode.value ? 'text-white' : 'text-subtle hover:text-ink'"
      @click="emit('update:modelValue', mode.value)"
    >
      <component :is="mode.icon" class="h-4 w-4" />
      <span class="hidden sm:inline">{{ mode.label }}</span>
    </button>
  </div>
</template>
