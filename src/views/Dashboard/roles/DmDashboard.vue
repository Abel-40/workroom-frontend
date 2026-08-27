<script setup lang="ts">
// "My Day" -- the Department Member dashboard. No company counters, no
// utilization, no roster: a DM manages nothing, so this is a personal work
// surface only (see ROLES.md). Reuses the same stores/actions the company
// dashboard uses (projectStore/eventStore) rather than a dedicated
// "my tasks" endpoint, which doesn't exist on the backend -- see the
// aggregation note on `todayTasks` below.
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { CalendarClock, CheckCircle2, ListTodo, Plus } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import GlassCard from "@/components/shared/GlassCard.vue";
import SectionKicker from "@/components/shared/SectionKicker.vue";
import EmptyState from "@/components/shared/EmptyState.vue";
import SkeletonCard from "@/components/shared/SkeletonCard.vue";
import TaskStatusPill from "@/components/cards/TaskStatusPill.vue";
import AddTaskModal from "@/components/projects/AddTaskModal.vue";
import { useProjectStore } from "@/stores/projectStore";
import { useEmployeeStore } from "@/stores/employeeStore";
import { useEventStore } from "@/stores/eventStore";
import { useAuthStore } from "@/stores/authStore";
import { usePermissions } from "@/composables/usePermissions";
import { useToast } from "@/components/ui/toast/use-toast";
import { formatShortDate, formatMonthShort, formatDayNumber, formatTime } from "@/lib/dates";
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
const todayTasks = computed(() => {
  const rows: Array<TaskType & { projectTitle: string }> = [];
  for (const project of myProjects.value) {
    for (const task of project.task.tasks ?? []) {
      if (task.assignedToId === userId.value && task.status !== "Done") {
        rows.push({ ...task, projectTitle: project.title });
      }
    }
  }
  return rows
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);
});

const priorityDot = (level: TaskType["priority"]) =>
  level === "high" ? "bg-rose-500" : level === "medium" ? "bg-amber-500" : "bg-emerald-500";

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
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-sm font-medium text-[#7D8592]">{{ todayLabel }}</p>
        <h1 class="text-[28px] font-extrabold leading-tight text-ink md:text-[32px]">{{ greeting }}, {{ displayName }}</h1>
      </div>
      <Popover>
        <PopoverTrigger as-child>
          <Button
            class="bg-gradient-to-br from-[#3F8CFF] to-accent-2 text-white shadow-[0_8px_22px_rgba(63,140,255,0.38)] hover:shadow-lg"
            :disabled="!myProjects.length"
            :title="myProjects.length ? undefined : 'Join or create a project first'"
          >
            <Plus class="mr-1.5 h-4 w-4" /> New task
          </Button>
        </PopoverTrigger>
        <PopoverContent v-if="myProjects.length" class="w-64 p-1" align="end">
          <p class="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#7D8592]">Add to project</p>
          <button
            v-for="p in myProjects"
            :key="p.id"
            type="button"
            class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-page"
            @click="openNewTask(p.id)"
          >
            <span class="truncate text-ink">{{ p.title }}</span>
          </button>
        </PopoverContent>
      </Popover>
    </div>

    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-12 xl:col-span-7">
        <SectionKicker label="Today" />
        <SkeletonCard v-if="loading" :rows="5" padding="airy" />
        <GlassCard v-else padding="airy">
          <EmptyState
            v-if="!todayTasks.length"
            :icon="CheckCircle2"
            message="Nothing due today. Enjoy the quiet."
          />
          <ul v-else class="divide-y divide-slate-900/[.06]">
            <li v-for="task in todayTasks" :key="task.id" class="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <Checkbox
                :model-value="pendingDoneId === task.id"
                :disabled="pendingDoneId === task.id"
                aria-label="Mark task done"
                @update:model-value="markDone(task)"
              />
              <span class="h-2 w-2 shrink-0 rounded-full" :class="priorityDot(task.priority)" :title="`${task.priority} priority`" />
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-ink">{{ task.title }}</p>
                <p class="truncate text-xs text-[#7D8592]">{{ task.projectTitle }}</p>
              </div>
              <span class="hidden shrink-0 text-xs text-[#7D8592] sm:block">{{ formatShortDate(task.deadline) }}</span>
              <TaskStatusPill :task="task" size="sm" />
            </li>
          </ul>
        </GlassCard>
      </div>

      <div class="col-span-12 space-y-6 xl:col-span-5">
        <div>
          <SectionKicker label="My projects" />
          <SkeletonCard v-if="loading" :rows="3" />
          <GlassCard v-else>
            <EmptyState v-if="!myProjects.length" :icon="ListTodo" message="Create your first project to get moving.">
              <Button as-child size="sm" class="bg-gradient-to-br from-[#3F8CFF] to-accent-2 text-white">
                <RouterLink :to="{ name: 'admin-dashboard', query: { section: 'projects' } }">New project</RouterLink>
              </Button>
            </EmptyState>
            <ul v-else class="space-y-1">
              <li v-for="row in projectSpotlight" :key="row.project.id">
                <RouterLink
                  :to="{ name: 'admin-dashboard', query: { section: 'projects', projectId: row.project.id } }"
                  class="flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 transition hover:bg-white/50"
                >
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-ink">{{ row.project.title }}</p>
                    <p class="truncate text-xs text-[#7D8592]">{{ row.project.task.active }} active tasks</p>
                  </div>
                  <span
                    class="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
                    :class="row.mode === 'Manage' ? 'bg-primary-soft text-primary-strong' : 'bg-slate-900/5 text-[#7D8592]'"
                  >
                    {{ row.mode }}
                  </span>
                </RouterLink>
              </li>
            </ul>
          </GlassCard>
        </div>

        <div>
          <SectionKicker label="Next up" />
          <SkeletonCard v-if="loading" :rows="3" />
          <GlassCard v-else>
            <EmptyState v-if="!nextEvents.length" :icon="CalendarClock" message="No upcoming events." />
            <ul v-else class="space-y-1">
              <li v-for="row in nextEvents" :key="row.event.id">
                <RouterLink
                  :to="{ name: 'admin-dashboard', query: { section: 'event-detail', eventId: row.event.id } }"
                  class="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-white/50"
                >
                  <div class="wr-well flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg text-center leading-none">
                    <span class="text-[10px] font-bold uppercase text-primary-strong">{{ formatMonthShort(row.event.startAt) }}</span>
                    <span class="text-sm font-extrabold text-ink">{{ formatDayNumber(row.event.startAt) }}</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-semibold text-ink">{{ row.event.title }}</p>
                    <p class="truncate text-xs text-[#7D8592]">{{ formatTime(row.event.startAt) }}</p>
                  </div>
                  <span class="shrink-0 rounded-full bg-slate-900/5 px-2.5 py-1 text-[11px] font-semibold text-[#7D8592]">
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
  </div>
</template>
