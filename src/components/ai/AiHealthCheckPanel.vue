<script setup lang="ts">
import { computed, watch } from "vue";
import { format } from "date-fns";
import { AlertTriangle, Sparkles } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast/use-toast";
import { useAiStore } from "@/stores/aiStore";
import { createPollSignal, type PollSignal } from "@/lib/pollUntilTerminal";
import AiStatusIndicator from "@/components/projects/AiStatusIndicator.vue";

const props = defineProps<{
  projectId: string | null;
}>();

const aiStore = useAiStore();
const { toast } = useToast();
let signal: PollSignal | null = null;

const summaries = computed(() => (props.projectId ? aiStore.healthSummariesFor(props.projectId) : []));
const latest = computed(() => summaries.value[0] ?? null);
const inFlight = computed(
  () => aiStore.requestingHealthSummary || (latest.value && ["pending", "processing"].includes(latest.value.status))
);

const formatWhen = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : format(date, "MMM d, h:mm a");
};

const request = async () => {
  if (!props.projectId) return;
  signal = createPollSignal();
  const { error } = await aiStore.requestHealthSummary(props.projectId, signal);
  if (error) toast({ title: "Health summary request failed", description: error, variant: "destructive" });
};

const riskBadgeClass = (level: string) => {
  switch (level) {
    case "high": return "bg-red-100 text-red-600";
    case "medium": return "bg-amber-100 text-amber-600";
    case "low": return "bg-emerald-100 text-emerald-600";
    default: return "bg-gray-100 text-gray-500";
  }
};

watch(
  () => props.projectId,
  (projectId) => {
    if (projectId) aiStore.fetchHealthSummaries(projectId);
  },
  { immediate: true }
);
</script>

<template>
  <div v-if="!projectId" class="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-subtle">
    Select a project above to check its health.
  </div>
  <div v-else class="space-y-4">
    <Button class="w-full rounded-xl" :disabled="!!inFlight" @click="request">
      <Sparkles class="h-4 w-4" /> Generate Health Summary
    </Button>

    <AiStatusIndicator v-if="latest && ['pending', 'processing'].includes(latest.status)" :status="latest.status" />

    <div v-if="latest?.status === 'completed'" class="rounded-xl border border-gray-100 bg-white p-3">
      <span class="inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize" :class="riskBadgeClass(latest.riskLevel)">
        {{ latest.riskLevel || "unknown" }} risk
      </span>
      <p class="mt-2 whitespace-pre-line text-sm text-ink">{{ latest.summary }}</p>
    </div>

    <div v-if="latest?.status === 'failed'" class="rounded-xl border border-red-100 bg-red-50 p-3">
      <p class="flex items-center gap-1.5 text-sm font-medium text-red-600">
        <AlertTriangle class="h-3.5 w-3.5" /> Summary failed
      </p>
      <p class="mt-1 text-xs text-red-500">{{ latest.errorMessage || "Something went wrong." }}</p>
    </div>

    <div v-if="summaries.length > 1" class="space-y-1.5 border-t border-gray-100 pt-3">
      <p class="text-xs font-medium text-subtle">History</p>
      <div v-for="s in summaries.slice(1)" :key="s.id" class="flex items-center justify-between text-xs">
        <span class="text-subtle">{{ formatWhen(s.requestedAt) }}</span>
        <span class="font-medium capitalize" :class="riskBadgeClass(s.riskLevel).split(' ')[1]">{{ s.riskLevel || s.status }}</span>
      </div>
    </div>
  </div>
</template>
