<script setup lang="ts">
import { computed, ref } from "vue";
import type { TaskType } from "@/types/types";
import { useProjectStore } from "@/stores/projectStore";
import { TooltipProvider } from "@/components/ui/tooltip";
import TaskBoardCard from "./TaskBoardCard.vue";

const props = defineProps<{
  projectId: string;
  tasks: TaskType[];
}>();

const emit = defineEmits<{
  (e: "select", task: TaskType): void;
}>();

const projectsStore = useProjectStore();

const STATUSES: TaskType["status"][] = ["To Do", "In Progress", "In Review", "Done"];
const statusDot: Record<TaskType["status"], string> = {
  "To Do": "bg-blue-500",
  "In Progress": "bg-violet-500",
  "In Review": "bg-slate-400",
  Done: "bg-emerald-500",
};

const statusFilter = ref<TaskType["status"] | null>(null);
const toggleFilter = (status: TaskType["status"]) => {
  statusFilter.value = statusFilter.value === status ? null : status;
};

const activeTasks = computed(() =>
  props.tasks.filter(
    (task) => task.status !== "To Do" && (!statusFilter.value || task.status === statusFilter.value)
  )
);
const backlogTasks = computed(() =>
  props.tasks.filter(
    (task) => task.status === "To Do" && (!statusFilter.value || task.status === statusFilter.value)
  )
);

const draggingTask = ref<TaskType | null>(null);
const dragOverZone = ref<"active" | "backlog" | null>(null);

const onDragStart = (_event: DragEvent, task: TaskType) => {
  draggingTask.value = task;
};
const onDragEnd = () => {
  draggingTask.value = null;
  dragOverZone.value = null;
};
const onDragOverZone = (zone: "active" | "backlog") => {
  if (!draggingTask.value) return;
  dragOverZone.value = zone;
};
const onDropZone = (zone: "active" | "backlog") => {
  if (!draggingTask.value) return;
  const task = draggingTask.value;
  const nextStatus: TaskType["status"] =
    zone === "backlog" ? "To Do" : task.status === "To Do" ? "In Progress" : task.status;
  if (nextStatus !== task.status) {
    projectsStore.updateTaskStatus(props.projectId, task.id, nextStatus);
  }
  dragOverZone.value = null;
  draggingTask.value = null;
};
</script>

<template>
  <TooltipProvider :delay-duration="150">
    <div class="space-y-6">
      <!-- Status filter pills -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="status in STATUSES"
          :key="status"
          type="button"
          class="flex h-9 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition"
          :class="
            statusFilter === status
              ? 'border-primary bg-blue-50 text-primary'
              : 'border-gray-200 bg-white text-ink hover:border-primary/40'
          "
          @click="toggleFilter(status)"
        >
          <span class="h-2 w-2 rounded-full" :class="statusDot[status]" />
          {{ status }}
        </button>
      </div>

      <!-- Active Tasks swimlane -->
      <div>
        <div class="mb-3 flex h-10 items-center justify-center rounded-xl bg-page">
          <h3 class="text-sm font-medium text-ink">Active Tasks</h3>
        </div>
        <div
          class="grid min-h-[96px] grid-cols-1 gap-3 rounded-2xl p-2 transition sm:grid-cols-2 xl:grid-cols-3"
          :class="dragOverZone === 'active' ? 'bg-blue-50 ring-2 ring-primary/40' : ''"
          @dragover.prevent="onDragOverZone('active')"
          @dragleave="dragOverZone = dragOverZone === 'active' ? null : dragOverZone"
          @drop="onDropZone('active')"
        >
          <TaskBoardCard
            v-for="task in activeTasks"
            :key="task.id"
            :task="task"
            :dragging="draggingTask?.id === task.id"
            @select="emit('select', task)"
            @dragstart="onDragStart($event, task)"
            @dragend="onDragEnd"
          />
          <p v-if="!activeTasks.length" class="col-span-full py-6 text-center text-sm text-subtle">
            No active tasks{{ statusFilter ? ` for “${statusFilter}”` : "" }}.
          </p>
        </div>
      </div>

      <!-- Backlog swimlane -->
      <div>
        <div class="mb-3 flex h-10 items-center justify-center rounded-xl bg-page">
          <h3 class="text-sm font-medium text-ink">Backlog</h3>
        </div>
        <div
          class="grid min-h-[96px] grid-cols-1 gap-3 rounded-2xl p-2 transition sm:grid-cols-2 xl:grid-cols-3"
          :class="dragOverZone === 'backlog' ? 'bg-blue-50 ring-2 ring-primary/40' : ''"
          @dragover.prevent="onDragOverZone('backlog')"
          @dragleave="dragOverZone = dragOverZone === 'backlog' ? null : dragOverZone"
          @drop="onDropZone('backlog')"
        >
          <TaskBoardCard
            v-for="task in backlogTasks"
            :key="task.id"
            :task="task"
            :dragging="draggingTask?.id === task.id"
            @select="emit('select', task)"
            @dragstart="onDragStart($event, task)"
            @dragend="onDragEnd"
          />
          <p v-if="!backlogTasks.length" class="col-span-full py-6 text-center text-sm text-subtle">
            Backlog is empty.
          </p>
        </div>
      </div>
    </div>
  </TooltipProvider>
</template>
