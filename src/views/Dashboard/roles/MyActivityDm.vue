<script setup lang="ts">
// DM's "My Activity" -- personal, not company-wide. Same task-aggregation
// approach as DmDashboard's "Today" (no flat "my tasks" endpoint exists --
// see ROLES.md "Dashboard"), broadened to all of a DM's assigned tasks
// across their own projects, not just today's. "On-time rate" and
// "completed this week" are derived from `updatedAt` as a completion-time
// proxy -- the backend has no dedicated `completed_at` timestamp, but a
// task's `updatedAt` reflects its last status transition, which for a
// Done task is when it was completed.
//
// "Time by project" is sourced from the real per-entry time-log API
// (GET /time-logs/mine/) -- not task.spentTimeHours, which would double-
// count/misattribute time other people logged on a task assigned to this
// DM. There's no "goal" feature anywhere in this app, so unlike some
// reference dashboards this doesn't show a fabricated "% of goal" ring --
// the Week/Month/Quarter comparison below is real (this period's completed
// count vs the immediately preceding period of the same length).
import { computed, onMounted, ref, watch } from "vue";
import { CalendarCheck, CheckCircle2, Clock, ListChecks } from "lucide-vue-next";
import StatCard from "@/components/shared/StatCard.vue";
import GlassCard from "@/components/shared/GlassCard.vue";
import PageHeader from "@/components/shared/PageHeader.vue";
import SectionKicker from "@/components/shared/SectionKicker.vue";
import EmptyState from "@/components/shared/EmptyState.vue";
import SkeletonCard from "@/components/shared/SkeletonCard.vue";
import { useProjectStore } from "@/stores/projectStore";
import { usePermissions } from "@/composables/usePermissions";
import { avatarColorFor } from "@/lib/avatarColor";
import type { TaskType, TimeLogEntry } from "@/types/types";

const projectStore = useProjectStore();
const { userId: myUserId } = usePermissions();
const loading = ref(true);

type Period = "week" | "month" | "quarter";
const PERIOD_DAYS: Record<Period, number> = { week: 7, month: 30, quarter: 90 };
const period = ref<Period>("month");
const periodStart = computed(() => new Date(Date.now() - PERIOD_DAYS[period.value] * 86_400_000));
const previousPeriodStart = computed(() => new Date(Date.now() - PERIOD_DAYS[period.value] * 2 * 86_400_000));

const myProjects = computed(() =>
  projectStore.projects.filter((p) => p.createdById === myUserId.value || p.assigneeIds?.includes(myUserId.value ?? ""))
);

const myTasks = computed(() => {
  const rows: Array<TaskType & { projectTitle: string }> = [];
  for (const project of myProjects.value) {
    for (const task of project.task.tasks ?? []) {
      if (task.assignedToId === myUserId.value) rows.push({ ...task, projectTitle: project.title });
    }
  }
  return rows;
});

const completedTasks = computed(() => myTasks.value.filter((t) => t.status === "Done"));
const completedInRange = (start: Date, end: Date) =>
  completedTasks.value.filter((t) => {
    const at = new Date(t.updatedAt).getTime();
    return at >= start.getTime() && at < end.getTime();
  }).length;

const completedThisPeriod = computed(() => completedInRange(periodStart.value, new Date()));
const completedPreviousPeriod = computed(() => completedInRange(previousPeriodStart.value, periodStart.value));
// null when there's no prior-period baseline to compare against -- shown as
// no delta at all rather than a misleading "+100%"/"0%".
const vsLastPeriod = computed<{ text: string; direction: "up" | "down" | "neutral" } | null>(() => {
  if (completedPreviousPeriod.value === 0) return null;
  const percent = Math.round(
    ((completedThisPeriod.value - completedPreviousPeriod.value) / completedPreviousPeriod.value) * 100
  );
  const label = period.value === "week" ? "last week" : period.value === "month" ? "last month" : "last quarter";
  return {
    text: `${percent > 0 ? "+" : ""}${percent}% vs ${label}`,
    direction: percent > 0 ? "up" : percent < 0 ? "down" : "neutral",
  };
});

const completedThisWeek = computed(() => completedInRange(new Date(Date.now() - 7 * 86_400_000), new Date()));
const onTimeRate = computed(() => {
  const withDeadline = completedTasks.value.filter((t) => t.deadline);
  if (!withDeadline.length) return null;
  const onTime = withDeadline.filter((t) => new Date(t.updatedAt).getTime() <= new Date(t.deadline).getTime()).length;
  return Math.round((onTime / withDeadline.length) * 100);
});

// Real per-entry logged time for the selected period (see time-logs/mine/),
// grouped by project -- not task.spentTimeHours, which would mix in time
// other people logged on a shared task.
const myTimeLogs = ref<TimeLogEntry[]>([]);
const loadingTimeLogs = ref(true);
const loadTimeLogs = async () => {
  loadingTimeLogs.value = true;
  myTimeLogs.value = await projectStore.fetchMyTimeLogs({ startDate: periodStart.value.toISOString().slice(0, 10) });
  loadingTimeLogs.value = false;
};
watch(period, loadTimeLogs);

const timeByProject = computed(() => {
  const map = new Map<string, { title: string; hours: number }>();
  for (const entry of myTimeLogs.value) {
    const key = entry.projectId ?? entry.taskId;
    const row = map.get(key) ?? { title: entry.projectTitle ?? entry.taskTitle ?? "Unknown", hours: 0 };
    row.hours += entry.hours;
    map.set(key, row);
  }
  return [...map.values()].sort((a, b) => b.hours - a.hours);
});
const maxProjectHours = computed(() => Math.max(1, ...timeByProject.value.map((p) => p.hours)));

// Completed-per-day is deliberately always "this week" (matches the
// reference), independent of the Week/Month/Quarter selector above.
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const completedPerDay = computed(() => {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  const now = new Date();
  const todayIndex = (now.getDay() + 6) % 7; // Mon=0..Sun=6
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - todayIndex);
  for (const task of completedTasks.value) {
    const completedAt = new Date(task.updatedAt);
    if (completedAt >= startOfWeek) {
      const idx = (completedAt.getDay() + 6) % 7;
      counts[idx] += 1;
    }
  }
  return DAY_LABELS.map((label, i) => ({ label, count: counts[i], isToday: i === todayIndex }));
});
const maxPerDay = computed(() => Math.max(1, ...completedPerDay.value.map((d) => d.count)));

onMounted(async () => {
  loading.value = true;
  await projectStore.fetchProjects();
  await Promise.all(myProjects.value.map((p) => projectStore.fetchTasks(p.id)));
  loading.value = false;
  await loadTimeLogs();
});
</script>

<template>
  <div class="p-4">
    <PageHeader kicker="Your work, at a glance" title="My Activity">
      <template #actions>
        <div class="flex items-center gap-1 rounded-xl bg-page p-1">
          <button
            v-for="p in (['week', 'month', 'quarter'] as Period[])"
            :key="p"
            type="button"
            class="rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition"
            :class="period === p ? 'bg-primary text-primary-foreground shadow-sm' : 'text-subtle hover:text-ink'"
            @click="period = p"
          >
            {{ p }}
          </button>
        </div>
      </template>
    </PageHeader>

    <div v-if="loading" class="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
      <SkeletonCard v-for="i in 3" :key="i" :rows="1" />
    </div>
    <div v-else class="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
      <StatCard
        variant="flat"
        label="Tasks completed"
        :value="completedThisPeriod"
        :icon="CheckCircle2"
        :delta="vsLastPeriod?.text"
        :delta-direction="vsLastPeriod?.direction"
      />
      <StatCard variant="flat" label="Completed this week" :value="completedThisWeek" :icon="CalendarCheck" />
      <StatCard variant="flat" label="On-time rate" :value="onTimeRate === null ? '—' : `${onTimeRate}%`" :icon="ListChecks" />
    </div>

    <div class="flex flex-col gap-6 lg:flex-row">
      <div class="lg:w-2/3">
        <SectionKicker label="Time by project" />
        <SkeletonCard v-if="loadingTimeLogs" :rows="3" />
        <GlassCard v-else variant="flat">
          <EmptyState v-if="!timeByProject.length" :icon="Clock" message="No logged time yet." />
          <div v-else class="space-y-4">
            <div v-for="entry in timeByProject" :key="entry.title" class="min-w-0">
              <div class="mb-1.5 flex items-baseline justify-between gap-2">
                <span class="truncate text-sm font-medium text-ink">{{ entry.title }}</span>
                <span class="shrink-0 text-xs font-semibold text-subtle">{{ entry.hours.toFixed(1) }}h</span>
              </div>
              <div class="h-2 w-full overflow-hidden rounded-full bg-page">
                <div
                  class="h-full rounded-full transition-[width] duration-300"
                  :class="avatarColorFor(entry.title).solid"
                  :style="{ width: `${(entry.hours / maxProjectHours) * 100}%` }"
                />
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <div class="lg:w-1/3">
        <SectionKicker label="Completed per day" />
        <p class="-mt-3 mb-3 text-xs text-subtle">This week</p>
        <GlassCard variant="flat">
          <div class="flex h-32 items-end justify-between gap-2">
            <div v-for="day in completedPerDay" :key="day.label" class="flex flex-1 flex-col items-center gap-1.5">
              <span class="text-xs font-semibold text-ink">{{ day.count || "" }}</span>
              <div class="flex w-full flex-1 items-end">
                <div
                  class="w-full rounded-md transition-[height] duration-300"
                  :class="day.isToday ? 'bg-primary' : 'bg-primary/20'"
                  :style="{ height: `${Math.max(4, (day.count / maxPerDay) * 100)}%` }"
                />
              </div>
              <span class="text-[10px] text-subtle" :class="day.isToday ? 'font-semibold text-ink' : ''">{{ day.label }}</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  </div>
</template>
