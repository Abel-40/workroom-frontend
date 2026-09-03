<script setup lang="ts">
// "My Day" -- the Department Member dashboard. No company counters, no
// utilization, no roster: a DM manages nothing, so this is a personal work
// surface only (see ROLES.md). Reuses the same stores/actions the company
// dashboard uses (projectStore/eventStore) rather than a dedicated
// "my tasks" endpoint, which doesn't exist on the backend -- see the
// aggregation note on `todayTasksAll` below.
//
// Deliberately does not show a "Start my day" / clock-in button or a
// "Focus time left" figure -- there's no session/live-timer feature in this
// app (Log Time is a real per-entry log of already-worked hours, not a
// running timer), so those would be exactly the kind of placeholder UI the
// project rules forbid. "N events today" fills that visual slot with real
// data instead.
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { CalendarClock, CalendarDays, CheckCircle2, Clock3, ListTodo, Plus } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import GlassCard from "@/components/shared/GlassCard.vue";
import SectionKicker from "@/components/shared/SectionKicker.vue";
import EmptyState from "@/components/shared/EmptyState.vue";
import SkeletonCard from "@/components/shared/SkeletonCard.vue";
import TaskStatusPill from "@/components/cards/TaskStatusPill.vue";
import AddTaskModal from "@/components/projects/AddTaskModal.vue";
import TimeTrackingModal from "@/components/projects/TimeTrackingModal.vue";
import { useProjectStore } from "@/stores/projectStore";
import { useEmployeeStore } from "@/stores/employeeStore";
import { useEventStore } from "@/stores/eventStore";
import { useAuthStore } from "@/stores/authStore";
import { usePermissions } from "@/composables/usePermissions";
import { useToast } from "@/components/ui/toast/use-toast";
import { ILLUSTRATIONS } from "@/lib/illustrations";
import { formatRelativeTime, formatMonthShort, formatDayNumber, formatTime } from "@/lib/dates";
import type { TaskType } from "@/types/types";

const projectStore = useProjectStore();
const employeeStore = useEmployeeStore();
const eventStore = useEventStore();
const authStore = useAuthStore();
const { userId } = usePermissions();
const { toast } = useToast();

const loading = ref(true);
const newTaskProjectId = ref<string | null>(null);
const showAddTask = ref(false);
const showLogTime = ref(false);
const pendingDoneId = ref<string | null>(null);

const displayName = computed(() => authStore.logedInUserInfo?.user?.username || "there");
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
});
const todayLabel = computed(() =>
  new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date())
);

const startOfToday = computed(() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
});
const endOfToday = computed(() => {
  const d = new Date(startOfToday.value);
  d.setDate(d.getDate() + 1);
  return d;
});
const isToday = (iso: string) => {
  const d = new Date(iso);
  return d >= startOfToday.value && d < endOfToday.value;
};

const myProjects = computed(() =>
  projectStore.projects.filter((p) => p.createdById === userId.value || p.assigneeIds?.includes(userId.value ?? ""))
);
const createdByMe = computed(() => myProjects.value.filter((p) => p.createdById === userId.value));
const memberOf = computed(() => myProjects.value.filter((p) => p.createdById !== userId.value));
// Two joined-project cards first, then one created-by-me card, per spec.
const projectSpotlight = computed(() => [
  ...memberOf.value.slice(0, 2).map((p) => ({ project: p, mode: "Open" as const })),
  ...createdByMe.value.slice(0, 1).map((p) => ({ project: p, mode: "Manage" as const })),
].slice(0, 3));

// No flat "my tasks" endpoint exists on the backend (only per-project task
// lists). Bounded to the user's own projects -- typically a handful for a
// DM -- rather than sweeping every company project.
const myTasksAll = computed(() => {
  const rows: Array<TaskType & { projectTitle: string }> = [];
  for (const project of myProjects.value) {
    for (const task of project.task.tasks ?? []) {
      if (task.assignedToId === userId.value) rows.push({ ...task, projectTitle: project.title });
    }
  }
  return rows;
});

// "Due today" is by deadline, regardless of status -- completing an overdue
// task late shouldn't count as "today's" work, and a just-finished task that
// was due today should still count toward today's completed total.
const tasksDueToday = computed(() => myTasksAll.value.filter((t) => isToday(t.deadline)));
const pendingDueToday = computed(() =>
  tasksDueToday.value
    .filter((t) => t.status !== "Done")
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
);
const completedDueToday = computed(() => tasksDueToday.value.filter((t) => t.status === "Done").length);
const percentDoneToday = computed(() =>
  tasksDueToday.value.length ? Math.round((completedDueToday.value / tasksDueToday.value.length) * 100) : 0
);
const ringCircumference = 2 * Math.PI * 26;
const ringOffset = computed(() => ringCircumference * (1 - percentDoneToday.value / 100));

const myTasksFlat = computed(() => myTasksAll.value as TaskType[]);

const priorityBorder = (level: TaskType["priority"]) =>
  level === "high" ? "border-rose-500" : level === "medium" ? "border-amber-500" : "border-emerald-500";

const nextEvents = computed(() =>
  eventStore.nearest.map((event) => ({
    event,
    kind:
      event.organizerId === userId.value
        ? "Organizing"
        : !event.departmentId && !event.teamId
          ? "Company event"
          : "Attending",
  }))
);
const todayEvents = computed(() => nextEvents.value.filter((row) => isToday(row.event.startAt)));
const upNext = computed(() => todayEvents.value[0] ?? nextEvents.value[0] ?? null);
const scheduleEvents = computed(() => todayEvents.value.filter((row) => row.event.id !== upNext.value?.event.id));

onMounted(async () => {
  loading.value = true;
  const today = new Date().toISOString().slice(0, 10);
  if (!employeeStore.employees.length) await employeeStore.fetchEmployees();
  await projectStore.fetchProjects();
  await eventStore.fetchEvents({ mine: true, startDate: today, pageSize: 20 });
  await Promise.all(myProjects.value.map((p) => projectStore.fetchTasks(p.id)));
  loading.value = false;
});

const openNewTask = (projectId: string) => {
  newTaskProjectId.value = projectId;
  showAddTask.value = true;
};

const markDone = async (task: TaskType) => {
  pendingDoneId.value = task.id;
  const { error } = await projectStore.updateTaskStatus(task.id, "Done");
  if (error) toast({ title: "Couldn't update task", description: error, variant: "destructive" });
  pendingDoneId.value = null;
};
</script>

<template>
  <div class="space-y-6 pb-6">
    <!-- Today banner -->
    <div class="rounded-2xl bg-gradient-to-br from-[#3F8CFF] to-accent-2 p-6 text-white shadow-[0_20px_45px_rgba(63,140,255,0.35)]">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            <CalendarDays class="h-3.5 w-3.5" /> {{ todayLabel }}
          </span>
          <h1 class="mt-3 text-[28px] font-extrabold leading-tight md:text-[32px]">{{ greeting }}, {{ displayName }}</h1>
          <p class="mt-1 text-sm text-white/80">
            {{ pendingDueToday.length }} task{{ pendingDueToday.length === 1 ? "" : "s" }} due today
            <template v-if="todayEvents.length"> · {{ todayEvents.length }} event{{ todayEvents.length === 1 ? "" : "s" }} today</template>
            <template v-if="upNext"> · next up {{ formatRelativeTime(upNext.event.startAt) }}</template>
          </p>
          <Button
            variant="outline"
            class="mt-4 border-white/30 bg-white/10 text-white hover:bg-white/20"
            :disabled="!myTasksFlat.length"
            :title="myTasksFlat.length ? undefined : 'No tasks to log time against yet'"
            @click="showLogTime = true"
          >
            <Clock3 class="mr-1.5 h-4 w-4" /> Log time
          </Button>
        </div>

        <div class="flex items-center gap-4">
          <div class="relative flex h-20 w-20 shrink-0 items-center justify-center">
            <svg width="80" height="80" viewBox="0 0 60 60" class="-rotate-90">
              <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="6" />
              <circle
                cx="30" cy="30" r="26" fill="none" stroke="white" stroke-width="6" stroke-linecap="round"
                :stroke-dasharray="ringCircumference" :stroke-dashoffset="ringOffset"
              />
            </svg>
            <span class="absolute text-sm font-bold">{{ percentDoneToday }}%</span>
          </div>
          <div class="space-y-2">
            <div class="rounded-xl bg-white/10 px-3 py-1.5">
              <p class="text-[10px] uppercase tracking-wide text-white/70">Completed</p>
              <p class="text-sm font-semibold">{{ completedDueToday }} / {{ tasksDueToday.length }}</p>
            </div>
            <div class="rounded-xl bg-white/10 px-3 py-1.5">
              <p class="text-[10px] uppercase tracking-wide text-white/70">Events today</p>
              <p class="text-sm font-semibold">{{ todayEvents.length }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-12 xl:col-span-7">
        <div class="mb-3 flex items-center justify-between">
          <SectionKicker label="Today's tasks" />
          <Popover>
            <PopoverTrigger as-child>
              <Button size="sm" variant="outline" class="h-8 rounded-lg text-xs" :disabled="!myProjects.length">
                <Plus class="h-3.5 w-3.5" /> New task
              </Button>
            </PopoverTrigger>
            <PopoverContent v-if="myProjects.length" class="w-64 p-1" align="end">
              <p class="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-subtle">Add to project</p>
              <button
                v-for="p in myProjects" :key="p.id" type="button"
                class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-page"
                @click="openNewTask(p.id)"
              >
                <span class="truncate text-ink">{{ p.title }}</span>
              </button>
            </PopoverContent>
          </Popover>
        </div>
        <SkeletonCard v-if="loading" :rows="5" padding="airy" />
        <GlassCard v-else variant="flat" padding="airy">
          <EmptyState v-if="!pendingDueToday.length" :icon="CheckCircle2" message="Nothing due today. Enjoy the quiet." />
          <ul v-else class="space-y-2">
            <li
              v-for="task in pendingDueToday" :key="task.id"
              class="flex items-center gap-3 rounded-lg border-l-4 bg-page/60 py-2.5 pl-3 pr-2"
              :class="priorityBorder(task.priority)"
            >
              <Checkbox
                :model-value="pendingDoneId === task.id"
                :disabled="pendingDoneId === task.id"
                aria-label="Mark task done"
                @update:model-value="markDone(task)"
              />
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-ink">{{ task.title }}</p>
                <p class="truncate text-xs text-subtle">{{ task.projectTitle }}</p>
              </div>
              <span class="hidden shrink-0 text-xs text-subtle sm:block">{{ formatTime(task.deadline) }}</span>
              <TaskStatusPill :task="task" size="sm" />
            </li>
          </ul>
        </GlassCard>

        <div class="mt-6">
          <SectionKicker label="My projects" />
          <SkeletonCard v-if="loading" :rows="3" />
          <GlassCard v-else variant="flat">
            <EmptyState
              v-if="!myProjects.length"
              :icon="ListTodo"
              :image="ILLUSTRATIONS.dashboardEmptyProjects"
              image-alt="No projects yet"
              message="Create your first project to get moving."
            >
              <Button as-child size="sm" class="bg-gradient-to-br from-[#3F8CFF] to-accent-2 text-white">
                <RouterLink :to="{ name: 'admin-dashboard', query: { section: 'projects' } }">New project</RouterLink>
              </Button>
            </EmptyState>
            <ul v-else class="space-y-1">
              <li v-for="row in projectSpotlight" :key="row.project.id">
                <RouterLink
                  :to="{ name: 'admin-dashboard', query: { section: 'projects', projectId: row.project.id } }"
                  class="flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 transition hover:bg-page"
                >
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-ink">{{ row.project.title }}</p>
                    <p class="truncate text-xs text-subtle">{{ row.project.task.active }} active tasks</p>
                  </div>
                  <span
                    class="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
                    :class="row.mode === 'Manage' ? 'bg-primary-soft text-primary-strong' : 'bg-page text-subtle'"
                  >
                    {{ row.mode }}
                  </span>
                </RouterLink>
              </li>
            </ul>
          </GlassCard>
        </div>
      </div>

      <div class="col-span-12 space-y-6 xl:col-span-5">
        <div v-if="upNext">
          <SectionKicker label="Up next" />
          <RouterLink
            :to="{ name: 'admin-dashboard', query: { section: 'event-detail', eventId: upNext.event.id } }"
            class="block rounded-2xl border border-amber-200 bg-amber-50 p-4 transition hover:opacity-90 dark:border-amber-500/30 dark:bg-amber-500/10"
          >
            <p class="text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">Up next</p>
            <p class="mt-1 font-semibold text-ink">{{ upNext.event.title }}</p>
            <p class="mt-0.5 text-xs text-subtle">{{ formatTime(upNext.event.startAt) }} &middot; {{ formatRelativeTime(upNext.event.startAt) }}</p>
          </RouterLink>
        </div>

        <div>
          <SectionKicker label="Schedule" />
          <SkeletonCard v-if="loading" :rows="3" />
          <GlassCard v-else variant="flat">
            <EmptyState
              v-if="!scheduleEvents.length && !upNext"
              :icon="CalendarClock"
              :image="ILLUSTRATIONS.dashboardEmptyEvents"
              image-alt="No upcoming events"
              message="No upcoming events."
            />
            <p v-else-if="!scheduleEvents.length" class="py-4 text-center text-sm text-subtle">Nothing else scheduled today.</p>
            <ul v-else class="space-y-1">
              <li v-for="row in scheduleEvents" :key="row.event.id">
                <RouterLink
                  :to="{ name: 'admin-dashboard', query: { section: 'event-detail', eventId: row.event.id } }"
                  class="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-page"
                >
                  <div class="wr-well flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg text-center leading-none">
                    <span class="text-[10px] font-bold uppercase text-primary-strong">{{ formatMonthShort(row.event.startAt) }}</span>
                    <span class="text-sm font-extrabold text-ink">{{ formatDayNumber(row.event.startAt) }}</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-semibold text-ink">{{ row.event.title }}</p>
                    <p class="truncate text-xs text-subtle">{{ formatTime(row.event.startAt) }}</p>
                  </div>
                  <span class="shrink-0 rounded-full bg-page px-2.5 py-1 text-[11px] font-semibold text-subtle">
                    {{ row.kind }}
                  </span>
                </RouterLink>
              </li>
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>

    <AddTaskModal v-if="newTaskProjectId" v-model:open="showAddTask" :project-id="newTaskProjectId" />
    <TimeTrackingModal v-model:open="showLogTime" :tasks="myTasksFlat" />
  </div>
</template>
