<script setup lang="ts">
import { computed, watch } from "vue";
import { format } from "date-fns";
import { AlertTriangle, Clock3, Sparkles, UserX } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast/use-toast";
import { useAiStore } from "@/stores/aiStore";
import { useProjectStore } from "@/stores/projectStore";
import { createPollSignal, type PollSignal } from "@/lib/pollUntilTerminal";
import { riskBadgeClass } from "@/lib/aiBadges";
import AiStatusIndicator from "@/components/projects/AiStatusIndicator.vue";
import AiErrorState from "@/components/ai/AiErrorState.vue";

const props = defineProps<{
  projectId: string | null;
}>();

const aiStore = useAiStore();
const projectStore = useProjectStore();
const { toast } = useToast();
let signal: PollSignal | null = null;

const summaries = computed(() => (props.projectId ? aiStore.healthSummariesFor(props.projectId) : []));
const latest = computed(() => summaries.value[0] ?? null);
const inFlight = computed(
  () => aiStore.requestingHealthSummary || (latest.value && ["pending", "processing"].includes(latest.value.status))
);
const stats = computed(() => (props.projectId ? projectStore.statsFor(props.projectId) : null));

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

const STATUS_BARS = [
  { key: "todoTasks", label: "To Do", color: "bg-gray-300" },
  { key: "inProgressTasks", label: "In Progress", color: "bg-primary" },
  { key: "inReviewTasks", label: "In Review", color: "bg-amber-400" },
  { key: "completedTasks", label: "Done", color: "bg-emerald-500" },
] as const;

watch(
  () => props.projectId,
  (projectId) => {
    if (!projectId) return;
    aiStore.fetchHealthSummaries(projectId);
    projectStore.fetchProjectStats(projectId);
  },
  { immediate: true }
);
</script>

<template>
  <div class="space-y-4">
    <!-- Real, already-computed numbers -- never invented. Nothing renders
         if the backend hasn't returned stats yet or a project has no tasks. -->
    <div v-if="stats && stats.totalTasks > 0" class="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium text-ink">Progress</p>
        <p class="text-sm font-semibold text-primary">{{ stats.completionPercent }}%</p>
      </div>
      <div class="mt-2 h-2 overflow-hidden rounded-full bg-page">
        <div class="h-full rounded-full bg-gradient-to-r from-primary to-indigo-500 transition-all duration-500" :style="{ width: `${stats.completionPercent}%` }" />
      </div>

      <div class="mt-4 flex h-2.5 overflow-hidden rounded-full bg-page">
        <div
          v-for="bar in STATUS_BARS"
          :key="bar.key"
          :class="bar.color"
          class="h-full transition-all duration-500"
          :style="{ width: `${stats.totalTasks ? (stats[bar.key] / stats.totalTasks) * 100 : 0}%` }"
        />
      </div>
      <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-subtle">
        <span v-for="bar in STATUS_BARS" :key="bar.key" class="flex items-center gap-1.5">
          <span :class="bar.color" class="h-2 w-2 rounded-full" /> {{ bar.label }} ({{ stats[bar.key] }})
        </span>
      </div>

      <div v-if="stats.overdueTasks > 0 || stats.unassignedTasks > 0" class="mt-4 flex flex-wrap gap-2">
        <span v-if="stats.overdueTasks > 0" class="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
          <Clock3 class="h-3 w-3" /> {{ stats.overdueTasks }} overdue
        </span>
        <span v-if="stats.unassignedTasks > 0" class="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600">
          <UserX class="h-3 w-3" /> {{ stats.unassignedTasks }} unassigned
        </span>
      </div>
    </div>

    <div class="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div class="mb-3 flex items-center gap-2">
        <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-indigo-500 text-white">
          <Sparkles class="h-3.5 w-3.5" />
        </span>
        <p class="text-sm font-medium text-ink">AI Insight</p>
      </div>

      <Button class="w-full rounded-xl" :disabled="!!inFlight" @click="request">
        <Sparkles class="h-4 w-4" /> Generate Health Summary
      </Button>

      <AiStatusIndicator v-if="latest && ['pending', 'processing'].includes(latest.status)" :status="latest.status" class="mt-3" />

      <div v-if="latest?.status === 'completed'" class="mt-3 rounded-xl bg-page p-3">
        <span class="inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize" :class="riskBadgeClass(latest.riskLevel)">
          {{ latest.riskLevel || "unknown" }} risk
        </span>
        <p class="mt-2 whitespace-pre-line text-sm text-ink">{{ latest.summary }}</p>
      </div>

      <AiErrorState
        v-if="latest?.status === 'failed'"
        class="mt-3"
        title="Summary failed"
        message="The AI service ran into a problem while analyzing this project."
        :detail="latest.errorMessage"
        @retry="request"
      />

      <div v-if="summaries.length > 1" class="mt-3 space-y-1.5 border-t border-gray-100 pt-3">
        <p class="text-xs font-medium text-subtle">History</p>
        <div v-for="s in summaries.slice(1)" :key="s.id" class="flex items-center justify-between text-xs">
          <span class="text-subtle">{{ formatWhen(s.requestedAt) }}</span>
          <span class="font-medium capitalize" :class="riskBadgeClass(s.riskLevel).split(' ')[1]">{{ s.riskLevel || s.status }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
