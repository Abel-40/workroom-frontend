<script setup lang="ts">
// Department cockpit. A DL's project/task/event administration is scoped to
// their own department (see canManageProject/canManageEvent), so a
// company-wide firehose is mostly un-actionable -- everything here is
// either their department or something they personally own elsewhere (the
// last card exists because the real permission rule is "department scope
// *plus* anything created/owned" -- without it those projects would vanish
// from view entirely). Two spec widgets don't have real backing data yet:
// "capacity %" (no capacity/utilization figure exists anywhere in the
// backend) became a relative "share of the department's current busiest
// person" instead, and "Blocked in <Department>" (no blocked-status or
// dependency-wait-reason field exists on TaskType at all) became "Overdue
// in <Department>", which is real and equally actionable for a DL deciding
// where to intervene. See ROLES.md "Dashboard" for the full rationale.
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { AlertTriangle, FolderKanban, CalendarClock, Plus, Users } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/shared/GlassCard.vue";
import SectionKicker from "@/components/shared/SectionKicker.vue";
import PersonRow from "@/components/shared/PersonRow.vue";
import MetricBar from "@/components/shared/MetricBar.vue";
import EmptyState from "@/components/shared/EmptyState.vue";
import SkeletonCard from "@/components/shared/SkeletonCard.vue";
import CreateProjectModal from "@/components/projects/CreateProjectModal.vue";
import { useProjectStore } from "@/stores/projectStore";
import { useEmployeeStore } from "@/stores/employeeStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useEventStore } from "@/stores/eventStore";
import { usePermissions } from "@/composables/usePermissions";
import { formatMonthShort, formatDayNumber, formatTime } from "@/lib/dates";

const projectStore = useProjectStore();
const employeeStore = useEmployeeStore();
const directoryStore = useDirectoryStore();
const eventStore = useEventStore();
const { userId, departmentId } = usePermissions();

const loading = ref(true);
const showCreateProject = ref(false);

const myDepartment = computed(() => directoryStore.departments.find((d) => d.id === departmentId.value) ?? null);

const departmentProjects = computed(() => projectStore.projects.filter((p) => p.departmentId === departmentId.value));
const activeDepartmentProjects = computed(() => departmentProjects.value.filter((p) => p.status === "Active"));
const departmentEmployees = computed(() =>
  employeeStore.employees.filter((e) => e.department === myDepartment.value?.name)
);
const elsewhereMine = computed(() =>
  projectStore.projects.filter(
    (p) => p.departmentId !== departmentId.value && (p.createdById === userId.value || p.currentOwnerId === userId.value)
  )
);

// Floored to a fair full workload so a bar doesn't read as "maxed out" off
// a department where the busiest person only has a couple of tasks.
const FAIR_WORKLOAD_CAPACITY = 6;
const maxActive = computed(() =>
  Math.max(FAIR_WORKLOAD_CAPACITY, ...departmentEmployees.value.map((e) => e.activeTaskCount))
);
const workload = computed(() =>
  [...departmentEmployees.value]
    .sort((a, b) => b.activeTaskCount - a.activeTaskCount)
    .slice(0, 6)
    .map((e) => ({ employee: e, percent: (e.activeTaskCount / maxActive.value) * 100 }))
);

const overdueInDepartment = computed(() => {
  const now = Date.now();
  const rows: Array<{ id: string; title: string; assigneeName: string | null; projectTitle: string; daysOverdue: number }> = [];
  for (const project of departmentProjects.value) {
    for (const task of project.task.tasks ?? []) {
      if (task.status === "Done" || !task.deadline) continue;
      const dueTime = new Date(task.deadline).getTime();
      if (dueTime >= now) continue;
      rows.push({
        id: task.id,
        title: task.title,
        assigneeName: task.assigneeName,
        projectTitle: project.title,
        daysOverdue: Math.max(1, Math.ceil((now - dueTime) / 86_400_000)),
      });
    }
  }
  return rows.sort((a, b) => b.daysOverdue - a.daysOverdue).slice(0, 5);
});

onMounted(async () => {
  loading.value = true;
  const today = new Date().toISOString().slice(0, 10);
  if (!employeeStore.employees.length) await employeeStore.fetchEmployees();
  if (!directoryStore.loaded) await directoryStore.fetchAll();
  await projectStore.fetchProjects();
  await eventStore.fetchEvents({ departmentId: departmentId.value ?? undefined, startDate: today, pageSize: 20 });
  await Promise.all(departmentProjects.value.map((p) => projectStore.fetchTasks(p.id)));
  loading.value = false;
});

const projectDonePercent = (p: (typeof departmentProjects.value)[number]) =>
  p.task.total ? ((p.task.total - p.task.active) / p.task.total) * 100 : 0;
</script>

<template>
  <div class="space-y-6 pb-6">
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="text-[28px] font-extrabold leading-tight text-ink md:text-[32px]">{{ myDepartment?.name ?? "Department" }}</h1>
          <span class="inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-strong">
            {{ myDepartment?.name ?? "My department" }}
          </span>
        </div>
        <p class="mt-1 text-sm text-[#7D8592]">
          {{ myDepartment?.memberCount ?? 0 }} people &middot; {{ activeDepartmentProjects.length }} active projects
        </p>
      </div>
      <Button
        class="bg-gradient-to-br from-[#3F8CFF] to-accent-2 text-white shadow-[0_8px_22px_rgba(63,140,255,0.38)] hover:shadow-lg"
        @click="showCreateProject = true"
      >
        <Plus class="mr-1.5 h-4 w-4" /> New project
      </Button>
    </div>

    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-12 space-y-6 xl:col-span-7">
        <div>
          <SectionKicker label="Team workload this week" />
          <SkeletonCard v-if="loading" :rows="4" />
          <GlassCard v-else>
            <EmptyState v-if="!workload.length" :icon="Users" message="No one in this department yet." />
            <div v-else class="space-y-1">
              <PersonRow
                v-for="row in workload"
                :key="row.employee.id"
                :name="row.employee.name"
                :subtitle="row.employee.roleLabel"
                :avatar-url="row.employee.profilePictureUrl"
              >
                <template #trailing>
                  <div class="w-28">
                    <MetricBar label="" :value="row.percent" :sublabel="`${row.employee.activeTaskCount} active`" />
                  </div>
                </template>
              </PersonRow>
            </div>
          </GlassCard>
        </div>

        <div>
          <SectionKicker :label="`Overdue in ${myDepartment?.name ?? 'department'}`" />
          <SkeletonCard v-if="loading" :rows="4" />
          <GlassCard v-else>
            <EmptyState v-if="!overdueInDepartment.length" :icon="AlertTriangle" message="Nothing overdue right now." />
            <ul v-else class="divide-y divide-slate-900/[.06]">
              <li v-for="row in overdueInDepartment" :key="row.id" class="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium text-ink">{{ row.title }}</p>
                  <p class="truncate text-xs text-[#7D8592]">{{ row.projectTitle }} &middot; {{ row.assigneeName ?? "Unassigned" }}</p>
                </div>
                <span class="shrink-0 text-xs font-semibold text-rose-600">{{ row.daysOverdue }}d</span>
              </li>
            </ul>
          </GlassCard>
        </div>
      </div>

      <div class="col-span-12 space-y-6 xl:col-span-5">
        <div>
          <SectionKicker label="Department projects" />
          <SkeletonCard v-if="loading" :rows="3" />
          <GlassCard v-else>
            <EmptyState v-if="!departmentProjects.length" :icon="FolderKanban" message="No projects in this department yet.">
              <Button size="sm" class="bg-gradient-to-br from-[#3F8CFF] to-accent-2 text-white" @click="showCreateProject = true">
                New project
              </Button>
            </EmptyState>
            <ul v-else class="space-y-3">
              <li v-for="p in departmentProjects.slice(0, 5)" :key="p.id">
                <RouterLink
                  :to="{ name: 'admin-dashboard', query: { section: 'projects', id: p.id } }"
                  class="block rounded-xl px-2 py-2 transition hover:bg-white/50"
                >
                  <div class="mb-1.5 flex items-center justify-between gap-2">
                    <p class="truncate text-sm font-semibold text-ink">{{ p.title }}</p>
                    <span class="shrink-0 text-xs text-[#7D8592]">{{ p.task.active }}/{{ p.task.total }} active</span>
                  </div>
                  <MetricBar label="" :value="projectDonePercent(p)" :sublabel="`due ${p.deadline || 'not set'}`" />
                </RouterLink>
              </li>
            </ul>
          </GlassCard>
        </div>

        <div>
          <SectionKicker label="Department events" />
          <SkeletonCard v-if="loading" :rows="3" />
          <GlassCard v-else>
            <EmptyState v-if="!eventStore.nearest.length" :icon="CalendarClock" message="No upcoming department events." />
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

        <div v-if="elsewhereMine.length">
          <SectionKicker label="Mine, outside my department" />
          <GlassCard padding="dense">
            <ul class="space-y-1">
              <li v-for="p in elsewhereMine.slice(0, 3)" :key="p.id">
                <RouterLink
                  :to="{ name: 'admin-dashboard', query: { section: 'projects', id: p.id } }"
                  class="flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-sm transition hover:bg-white/50"
                >
                  <span class="truncate font-medium text-ink">{{ p.title }}</span>
                  <span class="shrink-0 text-xs text-[#7D8592]">{{ p.status }}</span>
                </RouterLink>
              </li>
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>

    <CreateProjectModal v-model:open="showCreateProject" />
  </div>
</template>
