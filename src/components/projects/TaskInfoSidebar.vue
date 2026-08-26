<script setup lang="ts">
import { computed, ref } from "vue";
import { ArrowDown, ArrowUp, Calendar } from "lucide-vue-next";
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
import { formatShortDate } from "@/lib/dates";
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
      return "text-gray-500";
  }
};
const priorityIcon = (level: string) => (level === "low" ? ArrowDown : ArrowUp);

const progressPercent = computed(() => parseInt(props.task.progress, 10) || 0);
const ringCircumference = 2 * Math.PI * 18;
const ringOffset = computed(() => ringCircumference * (1 - progressPercent.value / 100));

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
  <aside class="w-full rounded-2xl border border-gray-100 bg-white p-4 lg:w-64">
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
            <circle cx="22" cy="22" r="18" fill="none" stroke="#D9E3EE" stroke-width="5" />
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              stroke="#3F8CFF"
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
