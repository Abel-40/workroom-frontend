<script setup lang="ts">
// Company overview -- shared by Owner and CM (Owner's extra reach is
// billing/CM-minting in the account menu, not a different dashboard; see
// ROLES.md). Two spec widgets couldn't be built as specified because the
// backing data doesn't exist yet on the backend -- see ROLES.md "Dashboard"
// for exactly what changed and why: "avg. utilization" and the "overdue
// tasks" KPI (no capacity/utilization or company-wide-overdue aggregate
// exists), "Load by department" (no per-department capacity figure, so it
// shows real open-task share instead), and "Pending invitations" (no
// list-pending-invites endpoint exists anywhere in this app yet, replaced
// with Recent activity, which is real).
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { AlertTriangle, Activity, CalendarClock, Gauge } from "lucide-vue-next";
import GlassCard from "@/components/shared/GlassCard.vue";
import StatCard from "@/components/shared/StatCard.vue";
import SectionKicker from "@/components/shared/SectionKicker.vue";
import MetricBar from "@/components/shared/MetricBar.vue";
import EmptyState from "@/components/shared/EmptyState.vue";
import SkeletonCard from "@/components/shared/SkeletonCard.vue";
import { useProjectStore } from "@/stores/projectStore";
import { useAnalyticsStore } from "@/stores/analyticsStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useEventStore } from "@/stores/eventStore";
import { useActivityStore } from "@/stores/activityStore";
import { useEmployeeStore } from "@/stores/employeeStore";
import { formatMonthShort, formatDayNumber, formatTime, formatRelativeTime } from "@/lib/dates";
import type { Project } from "@/types/types";

const projectStore = useProjectStore();
const analyticsStore = useAnalyticsStore();
const directoryStore = useDirectoryStore();
const eventStore = useEventStore();
const activityStore = useActivityStore();
const employeeStore = useEmployeeStore();

const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  const today = new Date().toISOString().slice(0, 10);
  await Promise.all([
    employeeStore.employees.length ? Promise.resolve() : employeeStore.fetchEmployees(),
    projectStore.fetchProjects(),
    analyticsStore.fetchAll(),
    directoryStore.loaded ? Promise.resolve() : directoryStore.fetchAll(),
    eventStore.fetchEvents({ startDate: today, pageSize: 20 }),
    activityStore.fetchActivities(5),
  ]);
  loading.value = false;
});

const stats = computed(() => analyticsStore.companyStats);
const openTasks = computed(() => (stats.value ? stats.value.taskCount - stats.value.completedTasks : 0));
const completionRate = computed(() =>
  stats.value && stats.value.taskCount ? Math.round((stats.value.completedTasks / stats.value.taskCount) * 100) : 0
);

const departmentName = (id: string | null | undefined) =>
  directoryStore.departments.find((d) => d.id === id)?.name ?? "Unassigned";

const attentionProjects = computed(() => {
  const now = Date.now();
  return projectStore.projects
    .filter((p) => p.status !== "Done" && p.deadline && new Date(p.deadline).getTime() < now)
    .map((p) => ({
      project: p,
      daysOverdue: Math.max(1, Math.ceil((now - new Date(p.deadline).getTime()) / 86_400_000)),
    }))
    .sort((a, b) => b.daysOverdue - a.daysOverdue)
    .slice(0, 4);
});

const departmentLoad = computed(() =>
  analyticsStore.departmentStats
    .map((d) => ({
      ...d,
      openCount: d.taskCount - d.completedTaskCount,
      openPercent: d.taskCount ? ((d.taskCount - d.completedTaskCount) / d.taskCount) * 100 : 0,
    }))
    .sort((a, b) => b.openPercent - a.openPercent)
    .slice(0, 6)
);

const statusBadgeClass = (status: Project["status"]) =>
  status === "Active"
    ? "bg-primary-soft text-primary-strong"
    : status === "Done"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-slate-900/5 text-[#7D8592]";

const recentActivity = computed(() => activityStore.activities.slice(0, 3));
</script>

<template>
  <div class="space-y-6 pb-6">
    <div>
      <p class="text-[13px] font-semibold uppercase tracking-[.06em] text-subtle">Company</p>
      <h1 class="text-[28px] font-extrabold leading-tight text-ink md:text-[32px]">Dashboard</h1>
    </div>

    <div class="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <template v-if="loading">
        <SkeletonCard v-for="i in 4" :key="i" :rows="1" />
      </template>
      <template v-else>
        <StatCard label="Active projects" :value="stats?.activeProjects ?? '—'" />
        <StatCard label="Team members" :value="stats?.memberCount ?? '—'" />
        <StatCard label="Open tasks" :value="stats ? openTasks : '—'" />
        <StatCard label="Completion rate" :value="stats ? `${completionRate}%` : '—'" />
      </template>
    </div>

    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-12 space-y-6 xl:col-span-7">
        <div>
          <SectionKicker label="Projects needing attention" />
          <SkeletonCard v-if="loading" :rows="4" />
          <GlassCard v-else>
            <EmptyState v-if="!attentionProjects.length" :icon="AlertTriangle" message="Nothing overdue. Every project is on track." />
            <ul v-else class="divide-y divide-slate-900/[.06]">
              <li v-for="row in attentionProjects" :key="row.project.id" class="py-2.5 first:pt-0 last:pb-0">
                <RouterLink
                  :to="{ name: 'admin-dashboard', query: { section: 'projects', id: row.project.id } }"
                  class="flex items-center gap-3 rounded-xl px-2 py-1 transition hover:bg-white/50"
                >
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-semibold text-ink">{{ row.project.title }}</p>
                    <p class="truncate text-xs text-[#7D8592]">{{ departmentName(row.project.departmentId) }}</p>
                  </div>
                  <span class="shrink-0 text-xs font-semibold text-rose-600">{{ row.daysOverdue }}d overdue</span>
                  <span class="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold" :class="statusBadgeClass(row.project.status)">
                    {{ row.project.status }}
                  </span>
                </RouterLink>
              </li>
            </ul>
          </GlassCard>
        </div>

        <div>
          <SectionKicker label="Load by department" />
          <SkeletonCard v-if="loading" :rows="4" />
          <GlassCard v-else>
            <EmptyState v-if="!departmentLoad.length" :icon="Gauge" message="No departments yet." />
            <div v-else class="space-y-4">
              <MetricBar
                v-for="dept in departmentLoad"
                :key="dept.id"
                :label="dept.name"
                :value="dept.openPercent"
                :sublabel="`${dept.openCount}/${dept.taskCount} open`"
              />
            </div>
          </GlassCard>
        </div>
      </div>

      <div class="col-span-12 space-y-6 xl:col-span-5">
        <div>
          <SectionKicker label="Nearest events" />
          <SkeletonCard v-if="loading" :rows="3" />
          <GlassCard v-else>
            <EmptyState v-if="!eventStore.nearest.length" :icon="CalendarClock" message="No upcoming events." />
            <ul v-else class="space-y-1">
              <li v-for="event in eventStore.nearest" :key="event.id">
                <RouterLink
                  :to="{ name: 'admin-dashboard', query: { section: 'event-detail', eventId: event.id } }"
                  class="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-white/50"
                >
                  <div class="wr-well flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg text-center leading-none">
                    <span class="text-[10px] font-bold uppercase text-primary-strong">{{ formatMonthShort(event.startAt) }}</span>
                    <span class="text-sm font-extrabold text-ink">{{ formatDayNumber(event.startAt) }}</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-semibold text-ink">{{ event.title }}</p>
                    <p class="truncate text-xs text-[#7D8592]">{{ formatTime(event.startAt) }}</p>
                  </div>
                </RouterLink>
              </li>
            </ul>
          </GlassCard>
        </div>

        <div>
          <SectionKicker label="Recent activity" />
          <SkeletonCard v-if="loading" :rows="3" />
          <GlassCard v-else>
            <EmptyState v-if="!recentActivity.length" :icon="Activity" message="No company activity yet." />
            <ul v-else class="space-y-3">
              <li v-for="activity in recentActivity" :key="activity.id" class="wr-well flex items-start gap-3 rounded-xl px-3 py-2.5">
                <div class="min-w-0">
                  <p class="text-sm text-ink">{{ activity.summary }}</p>
                  <p class="text-xs text-[#7D8592]">{{ formatRelativeTime(activity.createdAt) }}</p>
                </div>
              </li>
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  </div>
</template>
