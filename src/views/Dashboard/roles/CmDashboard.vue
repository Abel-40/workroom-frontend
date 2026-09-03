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
  Activity, AlertTriangle, ArrowRight, Calendar, CalendarClock, CalendarPlus, ChevronRight, FolderPlus, Gauge, Users,  CalendarDays,ChevronDown, UserPlus,
} from "lucide-vue-next";
import GlassCard from "@/components/shared/GlassCard.vue";
import EmployeeInviteModal from "@/components/employees/EmployeeInviteModal.vue";
import SectionKicker from "@/components/shared/SectionKicker.vue";
import MetricBar from "@/components/shared/MetricBar.vue";
import EmptyState from "@/components/shared/EmptyState.vue";
import SkeletonCard from "@/components/shared/SkeletonCard.vue";
import UserCard from "@/components/cards/UserCard.vue";
import ProjectCard from "@/components/cards/ProjectCard.vue";
import EventCardCompact from "@/components/cards/EventCardCompact.vue";
import ActivityStream from "@/components/dashboard/ActivityStream.vue";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/stores/projectStore";
import { useAnalyticsStore } from "@/stores/analyticsStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useEventStore } from "@/stores/eventStore";
import { useEmployeeStore } from "@/stores/employeeStore";
import { useAuthStore } from "@/stores/authStore";
import { hasPermission } from "@/lib/permissions";
import { ILLUSTRATIONS } from "@/lib/illustrations";

const projectStore = useProjectStore();
const analyticsStore = useAnalyticsStore();
const directoryStore = useDirectoryStore();
const eventStore = useEventStore();
const employeeStore = useEmployeeStore();
const authStore = useAuthStore();

const loading = ref(true);
const isInviteOpen = ref(false);

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
    .slice(0, 2);
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

// A brand-new company has neither a team nor a project yet -- the two
// foundational things this dashboard is otherwise built around. Rather than
// showing four empty widgets and a KPI row full of dashes, walk the owner/CM
// through the same three actions the rest of the dashboard would otherwise
// be reporting on.
const isWorkspaceEmpty = computed(() => employeeStore.employees.length === 0 && projectStore.projects.length === 0);
const displayName = computed(() => authStore.logedInUserInfo?.user?.username || "there");
const todayLabel = computed(() =>
  new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
);
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
    <div class="mx-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-[13px] font-semibold uppercase tracking-[.06em] text-subtle">Company</p>
        <h1 class="text-[28px] font-extrabold leading-tight text-ink md:text-[32px]">
          <template v-if="!loading && isWorkspaceEmpty">Welcome to Workroom, {{ displayName }}! &#128075;</template>
          <template v-else>Dashboard</template>
        </h1>
      </div>
      <span class="inline-flex items-center gap-1.5 self-start rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-strong md:self-end md:mb-1">
        <Calendar class="h-3.5 w-3.5" />
        {{ todayLabel }}
      </span>
    </div>

    <template v-if="!loading && isWorkspaceEmpty">
      <div class="grid grid-cols-12 gap-4">
        <GlassCard variant="flat" class="col-span-12 md:col-span-6" padding="airy">
          <div class="flex flex-col items-center gap-3 py-4 text-center">
            <img :src="ILLUSTRATIONS.dashboardEmptyWorkload" alt="No team members yet" class="h-24 w-24 object-contain" />
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

        <GlassCard variant="flat" class="col-span-12 md:col-span-6" padding="airy">
          <div class="flex flex-col items-center gap-3 py-4 text-center">
            <img :src="ILLUSTRATIONS.dashboardEmptyProjects" alt="No projects yet" class="h-24 w-24 object-contain" />
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

        <GlassCard variant="flat" class="col-span-12 md:col-span-6" padding="airy">
          <div class="flex flex-col items-center gap-3 py-4 text-center">
            <img :src="ILLUSTRATIONS.dashboardEmptyEvents" alt="No upcoming events" class="h-24 w-24 object-contain" />
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

        <GlassCard variant="flat" class="col-span-12 md:col-span-6" padding="airy">
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

      <GlassCard variant="flat" title="Let's set up your workspace!" padding="airy">
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
    <div class="grid grid-cols-12 gap-10 mx-4">
      <div class="col-span-12 space-y-6 xl:col-span-7">
        <div class="flex min-h-[480px] w-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="relative pl-3 font-semibold text-ink before:absolute before:left-0 before:top-0.5 before:h-4 before:w-1 before:rounded-full before:bg-primary-strong">Workload</h2>
            <Button
              variant="link"
              class="group p-0 text-sm text-primary-strong"
              @click="$router.push({ name: 'admin-dashboard', query: { section: 'analytics' } })"
            >
              View Company Insights <ChevronRight class="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>

          <SkeletonCard v-if="loading" :rows="4" />
          <template v-else>
            <EmptyState
              v-if="!employeeStore.employees.length"
              :icon="Users"
              :image="ILLUSTRATIONS.dashboardEmptyWorkload"
              image-alt="No team members yet"
              message="No team members yet."
            />
            <div v-else class="grid flex-1 auto-rows-min grid-cols-2 content-start gap-3 sm:grid-cols-3 lg:grid-cols-4">
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

              <!-- Fills the remaining preview slot(s) with an invite CTA
                   shaped like a UserCard -- disappears once the preview is
                   fully seated at WORKLOAD_PREVIEW_COUNT (8) real members,
                   since there's no room left to invite into here. -->
              <div
                v-if="canInvite && workloadPreview.length < WORKLOAD_PREVIEW_COUNT"
                class="group relative flex h-[180px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-3 text-center transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                role="button"
                tabindex="0"
                @click="isInviteOpen = true"
                @keydown.enter="isInviteOpen = true"
              >
                <span class="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-primary/40 text-primary-strong transition-transform duration-300 group-hover:scale-105">
                  <UserPlus class="h-6 w-6" />
                </span>
                <p class="text-sm font-semibold text-ink">Invite user</p>
              </div>
            </div>
          </template>
        </div>

        <EmployeeInviteModal v-model:open="isInviteOpen" />

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
          <GlassCard v-else variant="flat" class="flex min-h-[240px] flex-col justify-center">
            <EmptyState v-if="!attentionProjects.length" :icon="AlertTriangle" message="Nothing overdue. Every project is on track." />
            <div v-else class="space-y-3">
              <div v-for="row in attentionProjects" :key="row.project.id" class="relative">
                <span class="absolute right-4 top-4 z-10 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-400">
                  {{ row.daysOverdue }}d overdue
                </span>
                <ProjectCard :project="row.project" />
              </div>
            </div>
          </GlassCard>
        </div>

        <div>
          <SectionKicker label="Load by department" />
          <SkeletonCard v-if="loading" :rows="4" />
          <GlassCard v-else variant="flat">
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
        <div class="flex min-h-[480px] w-full flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="relative pl-3 font-semibold text-ink before:absolute before:left-0 before:top-0.5 before:h-4 before:w-1 before:rounded-full before:bg-primary-strong">Nearest Event</h2>
            <RouterLink
              :to="{ name: 'admin-dashboard', query: { section: 'events' } }"
              class="text-xs font-semibold text-primary hover:underline"
            >
              View all
            </RouterLink>
          </div>
          <SkeletonCard v-if="loading" :rows="3" />
          <template v-else>
            <EmptyState
              v-if="!eventStore.nearest.length"
              :icon="CalendarClock"
              :image="ILLUSTRATIONS.dashboardEmptyEvents"
              image-alt="No upcoming events"
              message="No upcoming events."
            />
            <div v-else class="flex-1 space-y-2.5">
              <EventCardCompact v-for="event in eventStore.nearest" :key="event.id" :event="event" />
            </div>
          </template>
        </div>

        <ActivityStream />
      </div>
    </div>
    </template>
  </div>
</template>
