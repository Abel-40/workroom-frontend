<script setup lang="ts">
import { ref } from "vue";
import { Check } from "lucide-vue-next";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useProjectStore } from "@/stores/projectStore";
import type { TaskType } from "@/types/types";
import TaskCompleteModal from "@/components/projects/TaskCompleteModal.vue";

const props = defineProps<{
  projectId: string;
  task: TaskType;
  size?: "sm" | "md";
}>();

const projectsStore = useProjectStore();
const open = ref(false);
const confirmOpen = ref(false);

const STATUSES: TaskType["status"][] = ["To Do", "In Progress", "In Review", "Done"];

const pillClass = (status: TaskType["status"]) => {
  switch (status) {
    case "To Do":
      return "bg-blue-500";
    case "In Progress":
      return "bg-violet-500";
    case "In Review":
      return "bg-slate-400";
    case "Done":
      return "bg-emerald-500";
    default:
      return "bg-slate-400";
  }
};

const dotClass = (status: TaskType["status"]) => {
  switch (status) {
    case "To Do":
      return "bg-blue-500";
    case "In Progress":
      return "bg-violet-500";
    case "In Review":
      return "bg-slate-400";
    case "Done":
      return "bg-emerald-500";
    default:
      return "bg-slate-400";
  }
};

const pick = (status: TaskType["status"]) => {
  open.value = false;
  if (status === "Done" && props.task.status !== "Done") {
    confirmOpen.value = true;
    return;
  }
  projectsStore.updateTaskStatus(props.projectId, props.task.id, status);
};

const approveComplete = () => {
  projectsStore.updateTaskStatus(props.projectId, props.task.id, "Done");
};
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-lg text-xs font-semibold text-white transition hover:opacity-90"
        :class="[
          pillClass(task.status),
          size === 'sm' ? 'h-6 px-3' : 'h-6 w-[77px]',
        ]"
        @click.stop
      >
        {{ task.status }}
      </button>
    </PopoverTrigger>
    <PopoverContent class="w-40 p-1" align="start" @click.stop>
      <button
        v-for="status in STATUSES"
        :key="status"
        type="button"
        class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-page"
        @click="pick(status)"
      >
        <span class="h-2 w-2 rounded-full" :class="dotClass(status)" />
        <span class="flex-1 text-ink">{{ status }}</span>
        <Check v-if="task.status === status" class="h-3.5 w-3.5 text-primary" />
      </button>
    </PopoverContent>
  </Popover>

  <TaskCompleteModal v-model:open="confirmOpen" @approve="approveComplete" />
</template>
