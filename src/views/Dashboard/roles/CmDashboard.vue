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
import {
  Activity, AlertTriangle, ArrowRight, CalendarClock, CalendarPlus, FolderPlus, Gauge, Users,
} from "lucide-vue-next";
import GlassCard from "@/components/shared/GlassCard.vue";
import SectionKicker from "@/components/shared/SectionKicker.vue";
import MetricBar from "@/components/shared/MetricBar.vue";
import EmptyState from "@/components/shared/EmptyState.vue";
import SkeletonCard from "@/components/shared/SkeletonCard.vue";
import UserCard from "@/components/cards/UserCard.vue";
import ProjectCard from "@/components/cards/ProjectCard.vue";
import ActivityStream from "@/components/dashboard/ActivityStream.vue";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/stores/projectStore";
import { useAnalyticsStore } from "@/stores/analyticsStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useEventStore } from "@/stores/eventStore";
import { useEmployeeStore } from "@/stores/employeeStore";
import { useAuthStore } from "@/stores/authStore";
import { hasPermission } from "@/lib/permissions";
import { EVENT_BORDER_CLASS, eventColorFor } from "@/lib/eventColor";
import { formatTime } from "@/lib/dates";

const projectStore = useProjectStore();
const analyticsStore = useAnalyticsStore();
const directoryStore = useDirectoryStore();
const eventStore = useEventStore();
const employeeStore = useEmployeeStore();
const authStore = useAuthStore();

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
    // Activity itself is fetched by <ActivityStream> below -- not duplicated
    // here, since both would write the same shared activityStore.activities.
  ]);
  loading.value = false;
});

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

// Busiest-first, capped to one grid page -- "View all" (above) sends the
// rest to the Employees list rather than growing this card unbounded.
const WORKLOAD_PREVIEW_COUNT = 8;
const workloadPreview = computed(() =>
  [...employeeStore.employees].sort((a, b) => b.activeTaskCount - a.activeTaskCount).slice(0, WORKLOAD_PREVIEW_COUNT)
);
// The ring fills relative to a fair full workload, floored so it never
// reads as "fully loaded" off a team where the busiest person only has a
// couple of tasks -- but it still stretches past that baseline for anyone
// who's genuinely carrying more than a fair share.
const FAIR_WORKLOAD_CAPACITY = 6;
const maxActiveTaskCount = computed(() =>
  Math.max(FAIR_WORKLOAD_CAPACITY, ...employeeStore.employees.map((e) => e.activeTaskCount))
);

// "Today"/"Tomorrow"/short-date label for the Nearest Events row -- mirrors
// how the reference layout reads event dates relative to now instead of a
// bare timestamp.
const eventDayLabel = (iso: string | null | undefined) => {
  if (!iso) return "";
  const date = new Date(iso);
  const today = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(date) - startOfDay(today)) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

// A brand-new company has neither a team nor a project yet -- the two
// foundational things this dashboard is otherwise built around. Rather than
// showing four empty widgets and a KPI row full of dashes, walk the owner/CM
// through the same three actions the rest of the dashboard would otherwise
// be reporting on.
const isWorkspaceEmpty = computed(() => employeeStore.employees.length === 0 && projectStore.projects.length === 0);
const displayName = computed(() => authStore.logedInUserInfo?.user?.username || "there");
const canInvite = computed(() => hasPermission(authStore.logedInUserInfo?.role, "members:invite"));

const setupSteps = computed(() => {
  const steps = [
    {
      title: "Create a project",
      description: "Organize tasks and track progress.",
      icon: FolderPlus,
      to: { name: "admin-dashboard", query: { section: "projects" } },
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Schedule an event",
      description: "Plan meetings and keep everyone aligned.",
      icon: CalendarPlus,
      to: { name: "admin-dashboard", query: { section: "events" } },
      bg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];
  if (canInvite.value) {
    steps.unshift({
      title: "Invite your team",
      description: "Add your team members and start collaborating.",
      icon: Users,
      to: { name: "admin-dashboard", query: { section: "employees" } },
      bg: "bg-violet-50",
      iconColor: "text-violet-600",
    });
  }
  return steps;
});
</script>

<template>
  <div class="space-y-6 pb-6">
    <div>
      <p class="text-[13px] font-semibold uppercase tracking-[.06em] text-subtle">Company</p>
      <h1 class="text-[28px] font-extrabold leading-tight text-ink md:text-[32px]">
        <template v-if="!loading && isWorkspaceEmpty">Welcome to Workroom, {{ displayName }}! &#128075;</template>
        <template v-else>Dashboard</template>
      </h1>
    </div>

    <template v-if="!loading && isWorkspaceEmpty">
      <div class="grid grid-cols-12 gap-4">
        <GlassCard class="col-span-12 md:col-span-6" padding="airy">
          <div class="flex flex-col items-center gap-3 py-4 text-center">
            <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft">
              <Users class="h-8 w-8 text-primary-strong" />
            </div>
            <div>
              <p class="font-bold text-ink">No team members yet</p>
              <p class="mx-auto mt-1 max-w-xs text-sm text-subtle">
                Invite your team and start assigning work to see the workload overview.
              </p>
            </div>
            <RouterLink v-if="canInvite" :to="{ name: 'admin-dashboard', query: { section: 'employees' } }">
              <Button class="rounded-xl"><Users class="h-4 w-4" /> Invite Members</Button>
            </RouterLink>
          </div>
        </GlassCard>

        <GlassCard class="col-span-12 md:col-span-6" padding="airy">
          <div class="flex flex-col items-center gap-3 py-4 text-center">
            <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft">
              <FolderPlus class="h-8 w-8 text-primary-strong" />
            </div>
            <div>
              <p class="font-bold text-ink">No projects yet</p>
              <p class="mx-auto mt-1 max-w-xs text-sm text-subtle">
                Create your first project to get started and organize your work in one place.
              </p>
            </div>
            <RouterLink :to="{ name: 'admin-dashboard', query: { section: 'projects' } }">
              <Button class="rounded-xl"><FolderPlus class="h-4 w-4" /> Create Project</Button>
            </RouterLink>
          </div>
        </GlassCard>

        <GlassCard class="col-span-12 md:col-span-6" padding="airy">
          <div class="flex flex-col items-center gap-3 py-4 text-center">
            <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft">
              <CalendarPlus class="h-8 w-8 text-primary-strong" />
            </div>
            <div>
              <p class="font-bold text-ink">No upcoming events</p>
              <p class="mx-auto mt-1 max-w-xs text-sm text-subtle">
                Schedule events to keep your team in sync and on track.
              </p>
            </div>
            <RouterLink :to="{ name: 'admin-dashboard', query: { section: 'events' } }">
              <Button class="rounded-xl"><CalendarPlus class="h-4 w-4" /> Schedule Event</Button>
            </RouterLink>
          </div>
        </GlassCard>

        <GlassCard class="col-span-12 md:col-span-6" padding="airy">
          <div class="flex flex-col items-center gap-3 py-4 text-center">
            <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft">
              <Activity class="h-8 w-8 text-primary-strong" />
            </div>
            <div>
              <p class="font-bold text-ink">No activity yet</p>
              <p class="mx-auto mt-1 max-w-xs text-sm text-subtle">
                Once your team starts collaborating, updates will appear here.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard title="Let's set up your workspace!" padding="airy">
        <p class="-mt-2 mb-4 text-sm text-subtle">Complete a few quick steps to get the most out of your dashboard.</p>
        <div class="grid gap-3 sm:grid-cols-3">
          <RouterLink
            v-for="step in setupSteps"
            :key="step.title"
            :to="step.to"
            class="group flex flex-col gap-3 rounded-xl p-4 transition hover:opacity-90"
            :class="step.bg"
          >
            <div class="flex items-center justify-between">
              <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-white/70">
                <component :is="step.icon" class="h-4 w-4" :class="step.iconColor" />
              </div>
              <ArrowRight class="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5" />
            </div>
            <div>
              <!-- Fixed slate, not the theme-reactive ink/subtle tokens: these
                   cards keep a light pastel background in both themes (an
                   intentional onboarding accent), so their text must stay
                   dark-on-light regardless of site theme. -->
              <p class="text-sm font-semibold text-slate-900">{{ step.title }}</p>
              <p class="mt-0.5 text-xs text-slate-600">{{ step.description }}</p>
            </div>
          </RouterLink>
        </div>
      </GlassCard>
    </template>

    <template v-else>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-12 space-y-6 xl:col-span-7">
        <div>
          <div class="mb-3 flex items-center justify-between">
            <SectionKicker label="Workload" />
            <RouterLink
              v-if="employeeStore.employees.length > WORKLOAD_PREVIEW_COUNT"
              :to="{ name: 'admin-dashboard', query: { section: 'employees' } }"
              class="text-xs font-semibold text-primary hover:underline"
            >
              View all
            </RouterLink>
          </div>
          <SkeletonCard v-if="loading" :rows="4" />
          <GlassCard v-else>
            <EmptyState v-if="!employeeStore.employees.length" :icon="Users" message="No team members yet." />
            <div v-else class="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <UserCard
                v-for="member in workloadPreview"
                :key="member.id"
                class="!m-0 !max-w-none"
                :name="member.name"
                :role="member.roleLabel"
                :profession="member.profession"
                :department="member.department ?? undefined"
                :profile-picture-url="member.profilePictureUrl"
                :active-task-count="member.activeTaskCount"
                :max-active-task-count="maxActiveTaskCount"
                @click="$router.push({ name: 'admin-dashboard', query: { section: 'employee-detail', employeeId: member.id } })"
              />
            </div>
          </GlassCard>
        </div>

        <div>
          <div class="mb-3 flex items-center justify-between">
            <SectionKicker label="Projects needing attention" />
            <RouterLink
              :to="{ name: 'admin-dashboard', query: { section: 'projects' } }"
              class="text-xs font-semibold text-primary hover:underline"
            >
              View all
            </RouterLink>
          </div>
          <SkeletonCard v-if="loading" :rows="4" />
          <EmptyState v-else-if="!attentionProjects.length" :icon="AlertTriangle" message="Nothing overdue. Every project is on track." />
          <div v-else class="space-y-3">
            <div v-for="row in attentionProjects" :key="row.project.id" class="relative">
              <span class="absolute right-4 top-4 z-10 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-400">
                {{ row.daysOverdue }}d overdue
              </span>
              <ProjectCard :project="row.project" />
            </div>
          </div>
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
          <div class="mb-3 flex items-center justify-between">
            <SectionKicker label="Nearest events" />
            <RouterLink
              :to="{ name: 'admin-dashboard', query: { section: 'events' } }"
              class="text-xs font-semibold text-primary hover:underline"
            >
              View all
            </RouterLink>
          </div>
          <SkeletonCard v-if="loading" :rows="3" />
          <GlassCard v-else>
            <EmptyState v-if="!eventStore.nearest.length" :icon="CalendarClock" message="No upcoming events." />
            <ul v-else class="space-y-2.5">
              <li v-for="event in eventStore.nearest" :key="event.id">
                <RouterLink
                  :to="{ name: 'admin-dashboard', query: { section: 'event-detail', eventId: event.id } }"
                  class="wr-well flex items-center gap-3 rounded-xl border-l-4 py-2.5 pl-3 pr-2 transition hover:opacity-90"
                  :class="EVENT_BORDER_CLASS[eventColorFor(event.eventTypeName || event.title)]"
                >
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-semibold text-ink">{{ event.title }}</p>
                    <p class="truncate text-xs text-[#7D8592]">{{ eventDayLabel(event.startAt) }} · {{ formatTime(event.startAt) }}</p>
                  </div>
                </RouterLink>
              </li>
            </ul>
          </GlassCard>
        </div>

        <ActivityStream />
      </div>
    </div>
    </template>
  </div>
</template>
