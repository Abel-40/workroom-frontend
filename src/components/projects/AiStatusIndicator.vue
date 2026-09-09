<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { Sparkles } from "lucide-vue-next";
import type { AiJobStatus } from "@/stores/aiStore";

const props = defineProps<{
  status: AiJobStatus;
  label?: string;
}>();

// Purely cosmetic, time-based message cycling -- never implies a fake
// percentage, just communicates that real work is happening in stages.
// Every caller only ever mounts this while status is pending/processing
// (each page swaps it out for its own completed/error UI once the job
// reaches a terminal state), so it holds on the last message instead of
// looping back to the first -- whatever the backend is doing right before
// it actually finishes, "Finalizing…" is always the last thing shown.
const MESSAGES = ["Understanding your request…", "Structuring the details…", "Finalizing…"];
const messageIndex = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

function stopCycle() {
  if (timer) clearInterval(timer);
  timer = null;
}
function startCycle() {
  stopCycle();
  timer = setInterval(() => {
    if (messageIndex.value < MESSAGES.length - 1) messageIndex.value++;
    else stopCycle();
  }, 2200);
}

onMounted(startCycle);
onBeforeUnmount(stopCycle);

const activeMessage = computed(() => props.label || MESSAGES[messageIndex.value]);
</script>

<template>
  <div class="flex items-center gap-2.5">
    <span class="ai-spark-ring flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-500 text-white">
      <Sparkles class="h-3.5 w-3.5" />
    </span>
    <p class="text-sm font-medium text-ink transition-opacity duration-300">{{ activeMessage }}</p>
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
