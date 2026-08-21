<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { Check, Sparkles, X } from "lucide-vue-next";
import type { AiJobStatus } from "@/stores/aiStore";

const props = defineProps<{
  status: AiJobStatus;
  label?: string;
}>();

// Purely cosmetic, time-based message cycling -- never implies a fake
// percentage, just communicates that real work is happening in stages.
const MESSAGES = ["Understanding your request…", "Structuring the details…", "Finalizing…"];
const messageIndex = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

function startCycle() {
  stopCycle();
  timer = setInterval(() => {
    messageIndex.value = (messageIndex.value + 1) % MESSAGES.length;
  }, 2200);
}
function stopCycle() {
  if (timer) clearInterval(timer);
  timer = null;
}

watch(
  () => props.status,
  (status) => {
    if (status === "pending" || status === "processing") {
      messageIndex.value = 0;
      startCycle();
    } else {
      stopCycle();
    }
  },
  { immediate: true }
);
onBeforeUnmount(stopCycle);

const activeMessage = computed(() => props.label || MESSAGES[messageIndex.value]);
</script>

<template>
  <div class="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-3.5 py-3 shadow-sm">
    <template v-if="status === 'completed'">
      <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <Check class="h-4 w-4" />
      </span>
      <p class="text-sm font-medium text-ink">{{ label || "Done" }}</p>
    </template>

    <template v-else-if="status === 'failed'">
      <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
        <X class="h-4 w-4" />
      </span>
      <p class="text-sm font-medium text-ink">{{ label || "Failed" }}</p>
    </template>

    <template v-else>
      <span class="ai-spark-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-500 text-white">
        <Sparkles class="h-4 w-4" />
      </span>
      <p class="text-sm font-medium text-ink transition-opacity duration-300">{{ activeMessage }}</p>
    </template>
  </div>
</template>

<style scoped>
.ai-spark-ring {
  animation: ai-spark 1.6s ease-in-out infinite;
}
@keyframes ai-spark {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
    box-shadow: 0 0 0 0 rgba(63, 140, 255, 0.35);
  }
  50% {
    transform: scale(1.08) rotate(8deg);
    box-shadow: 0 0 0 6px rgba(63, 140, 255, 0);
  }
}
</style>
