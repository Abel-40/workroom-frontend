<script setup lang="ts">
import { ref } from "vue";
import type { TaskType } from "@/types/types";
import { useProjectStore } from "@/stores/projectStore";
import { useToast } from "@/components/ui/toast/use-toast";
import { useDeviceClass } from "@/composables/useDeviceClass";
import { TooltipProvider } from "@/components/ui/tooltip";
import TaskBoardCard from "./TaskBoardCard.vue";

const props = defineProps<{
  tasks: TaskType[];
}>();

const emit = defineEmits<{
  (e: "select", task: TaskType): void;
}>();

const projectsStore = useProjectStore();
const { toast } = useToast();
const { isReadOnly } = useDeviceClass();

const COLUMNS: TaskType["status"][] = ["To Do", "In Progress", "In Review", "Done"];
const columnDot: Record<TaskType["status"], string> = {
  "To Do": "bg-blue-500",
  "In Progress": "bg-violet-500",
  "In Review": "bg-slate-400",
  Done: "bg-emerald-500",
};

const tasksFor = (status: TaskType["status"]) => props.tasks.filter((task) => task.status === status);

const draggingTask = ref<TaskType | null>(null);
const dragOverColumn = ref<TaskType["status"] | null>(null);

// Read-only mobile: cancel the drag gesture outright (preventDefault on
// dragstart aborts native HTML5 drag-and-drop) rather than letting a ghost
// drag start that can never actually drop anywhere -- the axios interceptor
// is still the real correctness guarantee here, this just avoids the dead-end.
const onDragStart = (event: DragEvent, task: TaskType) => {
  if (isReadOnly.value) {
    event.preventDefault();
    return;
  }
  draggingTask.value = task;
};
const onDragEnd = () => {
  draggingTask.value = null;
  dragOverColumn.value = null;
};
const onDragOverColumn = (status: TaskType["status"]) => {
  if (!draggingTask.value) return;
  dragOverColumn.value = status;
};
const onDropColumn = async (status: TaskType["status"]) => {
  if (!draggingTask.value) return;
  const task = draggingTask.value;
  dragOverColumn.value = null;
  draggingTask.value = null;
  if (task.status === status) return;
  const { error } = await projectsStore.updateTaskStatus(task.id, status);
  if (error) toast({ title: "Status not updated", description: error, variant: "destructive" });
};
</script>

<template>
  <TooltipProvider :delay-duration="150">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div v-for="status in COLUMNS" :key="status">
        <div class="mb-3 flex h-10 items-center justify-center gap-2 rounded-xl bg-page">
          <span class="h-2 w-2 rounded-full" :class="columnDot[status]" />
          <h3 class="text-sm font-medium text-ink">{{ status }}</h3>
          <span class="text-xs text-subtle">({{ tasksFor(status).length }})</span>
        </div>
        <div
          class="flex min-h-[120px] flex-col gap-3 rounded-2xl p-2 transition"
          :class="dragOverColumn === status ? 'bg-primary/10 ring-2 ring-primary/40' : ''"
          @dragover.prevent="onDragOverColumn(status)"
          @dragleave="dragOverColumn = dragOverColumn === status ? null : dragOverColumn"
          @drop="onDropColumn(status)"
        >
          <TaskBoardCard
            v-for="task in tasksFor(status)"
            :key="task.id"
            :task="task"
            :dragging="draggingTask?.id === task.id"
            @select="emit('select', task)"
            @dragstart="onDragStart($event, task)"
            @dragend="onDragEnd"
          />
          <p v-if="!tasksFor(status).length" class="py-6 text-center text-sm text-subtle">Nothing here.</p>
        </div>
      </div>
    </div>
  </TooltipProvider>
</template>
