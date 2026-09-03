<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { ArrowDown, ArrowUp, Calendar, Trash2 } from "lucide-vue-next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast/use-toast";
import { useAuthStore } from "@/stores/authStore";
import { useEmployeeStore } from "@/stores/employeeStore";
import { useProjectStore } from "@/stores/projectStore";
import { formatHoursToDuration } from "@/lib/duration";
import { formatShortDate, formatCalendarDate } from "@/lib/dates";
import { canManageTask } from "@/lib/projectPermissions";
import type { Project, TaskType } from "@/types/types";
import TimeTrackingModal from "./TimeTrackingModal.vue";

const props = defineProps<{
  project: Project;
  task: TaskType;
}>();

const authStore = useAuthStore();
const employeeStore = useEmployeeStore();
const projectsStore = useProjectStore();
const { toast } = useToast();
const timeTrackingOpen = ref(false);
const assigning = ref(false);

// Reassignment follows the same manage-task rule as editing/archiving a
// task elsewhere (TaskDetailPanel) -- creator, or whoever can manage the
// parent project.
const canReassign = computed(() =>
  canManageTask(
    props.task,
    props.project,
    authStore.logedInUserInfo.user?.id,
    authStore.logedInUserInfo.role,
    authStore.logedInUserInfo.departmentId
  )
);

const initials = (name: string) =>
  (name || "?")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const priorityColor = (level: string) => {
  switch (level) {
    case "high":
      return "text-red-500";
    case "medium":
      return "text-yellow-500";
    case "low":
      return "text-green-500";
    default:
      return "text-subtle";
  }
};
const priorityIcon = (level: string) => (level === "low" ? ArrowDown : ArrowUp);

const progressPercent = computed(() => parseInt(props.task.progress, 10) || 0);
const ringCircumference = 2 * Math.PI * 18;
const ringOffset = computed(() => ringCircumference * (1 - progressPercent.value / 100));

const timeLogs = computed(() => projectsStore.timeLogsByTask[props.task.id] ?? []);
const deletingLogId = ref<string | null>(null);
const myUserId = computed(() => authStore.logedInUserInfo.user?.id);

const loadTimeLogs = () => projectsStore.fetchTimeLogs(props.task.id);
onMounted(loadTimeLogs);
watch(() => props.task.id, loadTimeLogs);

const canDeleteLog = (entry: { userId: string | null }) => entry.userId === myUserId.value || canReassign.value;

const removeTimeLog = async (logId: string) => {
  deletingLogId.value = logId;
  const { error } = await projectsStore.deleteTimeLog(props.task.id, logId);
  deletingLogId.value = null;
  if (error) toast({ title: "Time entry not removed", description: error, variant: "destructive" });
};

const UNASSIGNED = "__unassigned__";
const assigneeValue = computed({
  get: () => props.task.assignedToId ?? UNASSIGNED,
  set: async (value: string) => {
    const assignedToId = value === UNASSIGNED ? null : value;
    if (assignedToId === props.task.assignedToId) return;
    assigning.value = true;
    const { error } = await projectsStore.assignTask(props.task.id, assignedToId);
    assigning.value = false;
    if (error) toast({ title: "Assignment not updated", description: error, variant: "destructive" });
  },
});
</script>

<template>
  <aside class="w-full rounded-2xl border border-border bg-card p-4 lg:w-64">
    <h3 class="mb-4 text-sm font-semibold text-ink">Task Info</h3>

    <div class="space-y-4 text-sm">
      <div>
        <p class="text-xs text-subtle">Reporter</p>
        <div class="mt-1 flex items-center gap-2">
          <Avatar size="sm" class="h-6 w-6 text-[10px]">
            <AvatarFallback>{{ initials(project.assignedBy) }}</AvatarFallback>
          </Avatar>
          <span class="text-ink">{{ project.assignedBy }}</span>
        </div>
      </div>

      <div>
        <p class="text-xs text-subtle">Assignee</p>
        <p v-if="!canReassign" class="mt-1 text-ink">{{ task.assigneeName ?? "Unassigned" }}</p>
        <Select v-else v-model="assigneeValue" :disabled="assigning">
          <SelectTrigger class="mt-1 rounded-xl">
            <SelectValue placeholder="Unassigned" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem :value="UNASSIGNED">Unassigned</SelectItem>
              <SelectItem v-for="person in employeeStore.employees" :key="person.id" :value="person.id">
                {{ person.name }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div>
        <p class="text-xs text-subtle">Priority</p>
        <div class="mt-1 flex items-center gap-1" :class="priorityColor(task.priority)">
          <component :is="priorityIcon(task.priority)" class="h-4 w-4" />
          <span class="font-medium capitalize">{{ task.priority }}</span>
        </div>
      </div>

      <div class="rounded-xl bg-page p-3">
        <p class="mb-2 text-xs text-subtle">Time tracking</p>
        <div class="flex items-center gap-3">
          <svg width="44" height="44" viewBox="0 0 44 44" class="shrink-0 -rotate-90">
            <circle cx="22" cy="22" r="18" fill="none" class="stroke-border" stroke-width="5" />
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              class="stroke-primary"
              stroke-width="5"
              stroke-linecap="round"
              :stroke-dasharray="ringCircumference"
              :stroke-dashoffset="ringOffset"
            />
          </svg>
          <div>
            <p class="text-sm font-semibold text-ink">{{ formatHoursToDuration(task.spentTimeHours) }} logged</p>
            <p class="text-xs text-subtle">Original Estimate {{ task.estimatedTimeHours ? formatHoursToDuration(task.estimatedTimeHours) : "—" }}</p>
          </div>
        </div>
        <Button class="mt-3 w-full rounded-xl" size="sm" @click="timeTrackingOpen = true">
          Log time
        </Button>

        <div v-if="timeLogs.length" class="mt-3 max-h-40 space-y-2 overflow-y-auto border-t border-border pt-3">
          <div v-for="entry in timeLogs" :key="entry.id" class="flex items-start justify-between gap-2 text-xs">
            <div class="min-w-0">
              <p class="font-medium text-ink">{{ entry.userName ?? "Unknown" }} · {{ formatHoursToDuration(entry.hours) }}</p>
              <p class="truncate text-subtle">
                {{ formatCalendarDate(entry.workDate) }}<span v-if="entry.description"> · {{ entry.description }}</span>
              </p>
            </div>
            <button
              v-if="canDeleteLog(entry)"
              type="button"
              class="shrink-0 text-subtle hover:text-red-500 disabled:opacity-50"
              title="Remove entry"
              :disabled="deletingLogId === entry.id"
              @click="removeTimeLog(entry.id)"
            >
              <Trash2 class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div>
        <p class="text-xs text-subtle">Dead Line</p>
        <p class="mt-1 font-medium text-ink">{{ formatShortDate(task.deadline) }}</p>
      </div>

      <div class="flex items-center gap-2 text-subtle">
        <Calendar class="h-4 w-4" />
        <span>Created {{ formatShortDate(task.createdAt) }}</span>
      </div>
    </div>

    <TimeTrackingModal v-model:open="timeTrackingOpen" :task="task" />
  </aside>
</template>
