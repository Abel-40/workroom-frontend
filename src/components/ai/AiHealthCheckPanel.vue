<script setup lang="ts">
// AI Health Check: a report built only from real, already-computed project
// data (analytics/services.py::get_project_stats + the project's own
// tasks) -- the AI only supplies the narrative summary and risk level, never
// the numbers themselves. Download produces structured .xlsx rows through
// the real export endpoint, never a screenshot. No free-text input here --
// this tool only ever generates/downloads a report, it doesn't hold a
// conversation (that's what the AI Assistant is for).
import { computed, reactive, ref, watch } from "vue";
import { ChevronDown, Clock3, Download, Sparkles, UserX } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast/use-toast";
import { useAiStore } from "@/stores/aiStore";
import { useProjectStore } from "@/stores/projectStore";
import { createPollSignal, type PollSignal } from "@/lib/pollUntilTerminal";
import { riskBadgeClass } from "@/lib/aiBadges";
import { formatDateTime } from "@/lib/dates";
import type { AiMode } from "@/types/aiWorkspace";
import AiStatusIndicator from "@/components/projects/AiStatusIndicator.vue";
import AiErrorState from "@/components/ai/AiErrorState.vue";
import MarkdownText from "@/components/ai/shared/MarkdownText.vue";
import StatusTag from "@/components/ai/shared/StatusTag.vue";
import ProjectSelectionModal from "@/components/ai/shared/ProjectSelectionModal.vue";
import AiToolModeDropdown from "@/components/ai/shared/AiToolModeDropdown.vue";
import AvatarStack from "@/components/ai/shared/AvatarStack.vue";

const props = defineProps<{
  projectId: string | null;
  mode: AiMode;
}>();

const emit = defineEmits<{
  (e: "update:project-id", projectId: string | null): void;
  (e: "update:mode", mode: AiMode): void;
}>();

const aiStore = useAiStore();
const projectStore = useProjectStore();
const { toast } = useToast();
let signal: PollSignal | null = null;

const projectModalOpen = ref(false);

const summaries = computed(() => (props.projectId ? aiStore.healthSummariesFor(props.projectId) : []));
const latest = computed(() => summaries.value[0] ?? null);
const inFlight = computed(
  () => aiStore.requestingHealthSummary || (latest.value && ["pending", "processing"].includes(latest.value.status))
);
const stats = computed(() => (props.projectId ? projectStore.statsFor(props.projectId) : null));
const project = computed(() => (props.projectId ? projectStore.projects.find((p) => p.id === props.projectId) : null));
const tasks = computed(() => project.value?.task.tasks ?? []);
const teamPeople = computed(() =>
  props.projectId ? aiStore.eligibleAssigneesFor(props.projectId).map((m) => ({ id: m.id, name: m.name })) : []
);

const RISK_LABEL: Record<string, string> = { low: "On track", medium: "At risk", high: "Delayed" };
const riskTone = (risk: string) => (risk === "low" ? "success" : risk === "medium" ? "warning" : risk === "high" ? "danger" : "neutral");

const formatWhen = formatDateTime;

const request = async () => {
  if (!props.projectId) return;
  signal = createPollSignal();
  const { error } = await aiStore.requestHealthSummary(props.projectId, signal);
  if (error) toast({ title: "Health summary request failed", description: error, variant: "destructive" });
};

const downloading = reactive(new Set<string>());
async function download(summaryId: string) {
  if (!props.projectId || downloading.has(summaryId)) return;
  downloading.add(summaryId);
  const { url, filename, error } = await aiStore.exportHealthReport(props.projectId, summaryId);
  downloading.delete(summaryId);
  if (error || !url) {
    toast({ title: "Couldn't export the report", description: error, variant: "destructive" });
    return;
  }
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "health-report.xlsx";
  link.click();
  URL.revokeObjectURL(url);
  toast({ title: "Report downloaded" });
}

const STATUS_BARS = [
  { key: "todoTasks", label: "Not started", color: "bg-muted" },
  { key: "inProgressTasks", label: "In progress", color: "bg-primary" },
  { key: "inReviewTasks", label: "In review", color: "bg-amber-400" },
  { key: "completedTasks", label: "Completed", color: "bg-emerald-500" },
] as const;

watch(
  () => props.projectId,
  (projectId) => {
    if (!projectId) return;
    aiStore.fetchHealthSummaries(projectId);
    projectStore.fetchProjectStats(projectId);
    projectStore.fetchTasks(projectId);
  },
  { immediate: true }
);
</script>

<template>
  <div class="mx-auto flex h-full w-full max-w-6xl min-h-[420px] gap-4 pb-4">
    <div class="flex min-w-0 flex-1 flex-col gap-3">
      <!-- Report (left) and AI Insight (right) sit side by side so both are
           visible at once -- previously stacked in one column, which forced
           scrolling the whole panel just to reach the AI Insight card below
           a long task table. Each column scrolls independently instead. -->
      <div class="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
      <div class="min-h-0 flex-1 space-y-4 overflow-y-auto pr-0.5">
        <div v-if="!projectId" class="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-subtle">
          Select a project below to see its health report.
        </div>

        <!-- No tasks yet: nothing meaningful to report -->
        <div v-else-if="stats && stats.totalTasks === 0" class="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <p class="text-sm font-medium text-ink">This project has no tasks yet</p>
          <p class="mt-1 text-xs text-subtle">A health report needs at least one task to summarize. Add tasks to the backlog first.</p>
        </div>

        <div v-else-if="stats" data-tour="health-report" class="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="flex flex-col gap-1">
              <span class="text-[10.5px] font-semibold uppercase tracking-wide text-subtle">Health check report</span>
              <div class="flex items-center gap-2">
                <span class="text-lg font-bold text-ink">{{ project?.title }}</span>
                <StatusTag
                  v-if="latest?.status === 'completed'"
                  :label="RISK_LABEL[latest.riskLevel] || 'Unknown'"
                  :tone="riskTone(latest.riskLevel)"
                />
              </div>
            </div>
            <Button
              v-if="latest?.status === 'completed'"
              data-tour="health-download"
              size="sm" variant="outline" class="rounded-lg"
              :disabled="downloading.has(latest.id)"
              @click="download(latest.id)"
            >
              <Download class="h-3.5 w-3.5" /> Download report (.xlsx)
            </Button>
          </div>

          <div class="mt-4 flex items-end gap-3">
            <span class="text-3xl font-bold text-ink">{{ stats.completionPercent }}%</span>
            <span class="pb-1 text-xs text-subtle">overall progress</span>
          </div>
          <div class="mt-2 flex h-2.5 overflow-hidden rounded-full bg-page">
            <div
              v-for="bar in STATUS_BARS" :key="bar.key" :class="bar.color" class="h-full transition-all duration-500"
              :style="{ width: `${stats.totalTasks ? (stats[bar.key] / stats.totalTasks) * 100 : 0}%` }"
            />
          </div>
          <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-subtle">
            <span v-for="bar in STATUS_BARS" :key="bar.key" class="flex items-center gap-1.5">
              <span :class="bar.color" class="h-2 w-2 rounded-full" /> {{ bar.label }} ({{ stats[bar.key] }})
            </span>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div class="rounded-xl bg-surface p-3">
              <p class="text-xs text-subtle">Total</p>
              <p class="text-xl font-semibold text-ink">{{ stats.totalTasks }}</p>
            </div>
            <div class="rounded-xl bg-surface p-3">
              <p class="text-xs text-subtle">Completed</p>
              <p class="text-xl font-semibold text-ink">{{ stats.completedTasks }}</p>
            </div>
            <div class="rounded-xl bg-surface p-3">
              <p class="text-xs text-subtle">In progress</p>
              <p class="text-xl font-semibold text-ink">{{ stats.inProgressTasks }}</p>
            </div>
            <div class="rounded-xl bg-surface p-3">
              <p class="text-xs text-subtle">Overdue</p>
              <p class="text-xl font-semibold text-ink">{{ stats.overdueTasks }}</p>
            </div>
          </div>

          <div v-if="stats.overdueTasks > 0 || stats.unassignedTasks > 0" class="mt-3 flex flex-wrap gap-2">
            <span v-if="stats.overdueTasks > 0" class="flex items-center gap-1.5 rounded-full bg-danger px-2.5 py-1 text-xs font-medium text-danger-foreground">
              <Clock3 class="h-3 w-3" /> {{ stats.overdueTasks }} overdue
            </span>
            <span v-if="stats.unassignedTasks > 0" class="flex items-center gap-1.5 rounded-full bg-warning px-2.5 py-1 text-xs font-medium text-warning-foreground">
              <UserX class="h-3 w-3" /> {{ stats.unassignedTasks }} unassigned
            </span>
          </div>

          <!-- Task table: name, assignee, status, due date -- no subtask
               column, since subtasks aren't a modeled concept in Workroom
               today (see ai_agent/exports.py). -->
          <div v-if="tasks.length" class="mt-4 overflow-hidden rounded-xl border border-border">
            <table class="w-full text-left text-xs">
              <thead class="bg-surface text-subtle">
                <tr>
                  <th class="px-3 py-2 font-medium">Task</th>
                  <th class="px-3 py-2 font-medium">Assignee</th>
                  <th class="px-3 py-2 font-medium">Status</th>
                  <th class="px-3 py-2 font-medium">Due date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="task in tasks" :key="task.id" class="border-t border-border/50">
                  <td class="max-w-[220px] truncate px-3 py-2 font-medium text-ink">{{ task.title }}</td>
                  <td class="px-3 py-2 text-subtle">{{ task.assigneeName || "Unassigned" }}</td>
                  <td class="px-3 py-2 text-subtle">{{ task.status }}</td>
                  <td class="px-3 py-2 text-subtle">{{ task.deadline ? formatWhen(task.deadline) : "—" }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-if="projectId" class="flex w-full min-h-0 flex-col overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-sm lg:w-72 lg:shrink-0">
        <div class="mb-3 flex items-center gap-2">
          <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-indigo-500 text-white">
            <Sparkles class="h-3.5 w-3.5" />
          </span>
          <p class="text-sm font-medium text-ink">AI Insight</p>
        </div>

        <p v-if="!latest" class="text-sm text-subtle">Generate a report below to see the AI's risk assessment here.</p>

        <AiStatusIndicator v-if="latest && ['pending', 'processing'].includes(latest.status)" :status="latest.status" />

        <div v-if="latest?.status === 'completed'" class="mt-3 rounded-xl bg-page p-3">
          <span class="inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize" :class="riskBadgeClass(latest.riskLevel)">
            {{ latest.riskLevel || "unknown" }} risk
          </span>
          <MarkdownText class="mt-2 text-sm text-ink" :text="latest.summary" />
        </div>

        <AiErrorState
          v-if="latest?.status === 'failed'"
          class="mt-3"
          title="Summary failed"
          message="The AI service ran into a problem while analyzing this project."
          :detail="latest.errorMessage"
          @retry="request"
        />
      </div>
      </div>

      <!-- Footer: row 1 is the context/action cluster, row 2 is the
           composer -- both centered, compact groups of independent pills,
           matching the workspace's shared layout across all three tools. -->
      <div class="shrink-0 space-y-3">
        <div class="flex flex-wrap items-center justify-center gap-3">
          <div class="flex items-center gap-2">
            <button
              type="button"
              data-tour="health-project"
              class="inline-flex items-center gap-1.5 h-12 rounded-xl border border-border bg-card py-1.5 pl-3 pr-2.5 text-sm shadow-sm transition hover:border-primary/40"
              @click="projectModalOpen = true"
            >
              <ChevronDown class="h-3.5 w-3.5 text-subtle" />
              <span class="max-w-[10rem] truncate font-medium" :class="project ? 'text-ink' : 'text-subtle'">
                {{ project?.title || "Select project" }}
              </span>
            </button>

            <span v-if="teamPeople.length" class="inline-flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-3 pr-2.5 text-sm shadow-sm">
              <span class="text-[10px] font-medium text-subtle">Team</span>
              <AvatarStack :people="teamPeople" :max="3" />
            </span>
          </div>

          <Button  variant="outline" class="rounded-xl shadow-sm h-12 " :disabled="!latest || latest.status !== 'completed' || downloading.has(latest.id)" @click="latest && download(latest.id)">
            <Download class="h-3.5 w-3.5" /> Download report
          </Button>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-2">
          <AiToolModeDropdown :model-value="mode" @update:model-value="emit('update:mode', $event)" />

          <Button
            data-tour="health-composer"
            class="h-11 w-full max-w-lg rounded-full shadow-sm"
            :disabled="!projectId || !!inFlight"
            @click="request"
          >
            <Sparkles class="h-4 w-4" /> Generate Health Summary
          </Button>
        </div>
      </div>
    </div>

    <ProjectSelectionModal
      v-model:open="projectModalOpen"
      :projects="projectStore.projects"
      :initial-project-id="projectId"
      continue-label="Select project"
      @confirm="(id) => emit('update:project-id', id)"
    />
  </div>
</template>
