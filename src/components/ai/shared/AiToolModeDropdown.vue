<script setup lang="ts">
// Compact tool switcher living inside each panel's composer row -- the one
// piece of chrome deliberately identical across Planner/Assistant/Health
// (spec: "the three tools should feel coherent"), replacing a page-level
// segmented control with something that travels with the input itself.
import { ref } from "vue";
import { ChevronDown, HeartPulse, MessageSquare, Sparkles } from "lucide-vue-next";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { AiMode } from "@/types/aiWorkspace";

defineProps<{ modelValue: AiMode }>();
const emit = defineEmits<{ (e: "update:modelValue", value: AiMode): void }>();

const MODES: { value: AiMode; label: string; icon: typeof Sparkles }[] = [
  { value: "plan", label: "AI Task Planner", icon: Sparkles },
  { value: "assistant", label: "AI Assistant", icon: MessageSquare },
  { value: "health", label: "Project Health Check", icon: HeartPulse },
];

const open = ref(false);
function choose(mode: AiMode) {
  emit("update:modelValue", mode);
  open.value = false;
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <button
        type="button"
        class="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-ink shadow-sm transition hover:border-primary/40"
      >
        <component :is="MODES.find((m) => m.value === modelValue)?.icon" class="h-4 w-4 text-primary" />
        <span class="hidden sm:inline">{{ MODES.find((m) => m.value === modelValue)?.label }}</span>
        <ChevronDown class="h-3.5 w-3.5 text-subtle" />
      </button>
    </PopoverTrigger>
    <PopoverContent class="w-56 rounded-2xl p-1.5" align="start">
      <button
        v-for="mode in MODES" :key="mode.value"
        type="button"
        class="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm transition"
        :class="modelValue === mode.value ? 'bg-primary/10 font-medium text-primary' : 'text-ink hover:bg-page'"
        @click="choose(mode.value)"
      >
        <component :is="mode.icon" class="h-4 w-4" />
        {{ mode.label }}
      </button>
    </PopoverContent>
  </Popover>
</template>
