<script setup lang="ts">
import { computed } from "vue";
import { Check, X } from "lucide-vue-next";
import type { AiJobStatus } from "@/stores/aiStore";

const props = defineProps<{
  status: AiJobStatus;
  label?: string;
}>();

const STAGES = ["Queued", "Working"] as const;
const activeStage = computed(() => (props.status === "pending" ? 0 : 1));
</script>

<template>
  <div class="flex items-center gap-3 rounded-xl bg-page px-3 py-2.5">
    <template v-if="status === 'completed'">
      <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <Check class="h-3.5 w-3.5" />
      </span>
      <p class="text-sm font-medium text-ink">{{ label || "Done" }}</p>
    </template>

    <template v-else-if="status === 'failed'">
      <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
        <X class="h-3.5 w-3.5" />
      </span>
      <p class="text-sm font-medium text-ink">{{ label || "Failed" }}</p>
    </template>

    <template v-else>
      <div class="flex items-center gap-1.5">
        <span
          v-for="(stage, index) in STAGES"
          :key="stage"
          class="h-2 w-2 rounded-full transition-colors"
          :class="index === activeStage ? 'ai-pulse bg-primary' : index < activeStage ? 'bg-primary/40' : 'bg-gray-300'"
        />
      </div>
      <p class="text-sm font-medium text-ink">{{ label || STAGES[activeStage] + '…' }}</p>
    </template>
  </div>
</template>

<style scoped>
.ai-pulse {
  animation: ai-pulse 1.4s ease-in-out infinite;
}
@keyframes ai-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(63, 140, 255, 0.35);
  }
  50% {
    transform: scale(1.35);
    box-shadow: 0 0 0 4px rgba(63, 140, 255, 0);
  }
}
</style>
