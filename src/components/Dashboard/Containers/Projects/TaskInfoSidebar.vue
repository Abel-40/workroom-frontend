<script setup lang="ts">
import { computed, ref } from "vue";
import { ArrowDown, ArrowUp, Calendar } from "lucide-vue-next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Project, TaskType } from "@/types/types";
import TimeTrackingModal from "./TimeTrackingModal.vue";

const props = defineProps<{
  project: Project;
  task: TaskType;
}>();

const timeTrackingOpen = ref(false);

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

const progressPercent = computed(() => parseInt(props.task.Progress, 10) || 0);
const ringCircumference = 2 * Math.PI * 18;
const ringOffset = computed(() => ringCircumference * (1 - progressPercent.value / 100));
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
        <div class="mt-1 flex items-center gap-2">
          <Avatar size="sm" class="h-6 w-6 text-[10px]">
            <AvatarFallback>{{ initials(task.assignee) }}</AvatarFallback>
          </Avatar>
          <span class="text-ink">{{ task.assignee || "Unassigned" }}</span>
        </div>
      </div>

      <div>
        <p class="text-xs text-subtle">Priority</p>
        <div class="mt-1 flex items-center gap-1" :class="priorityColor(task.priority.level)">
          <component :is="priorityIcon(task.priority.level)" class="h-4 w-4" />
          <span class="font-medium capitalize">{{ task.priority.level }}</span>
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
            <p class="text-sm font-semibold text-ink">{{ task.SpentTime || "0h" }} logged</p>
            <p class="text-xs text-subtle">Original Estimate {{ task.EstimatedTime || "—" }}</p>
          </div>
        </div>
        <Button class="mt-3 w-full rounded-xl" size="sm" @click="timeTrackingOpen = true">
          Log time
        </Button>
      </div>

      <div>
        <p class="text-xs text-subtle">Dead Line</p>
        <p class="mt-1 font-medium text-ink">{{ task.deadline || "Not set" }}</p>
      </div>

      <div class="flex items-center gap-2 text-subtle">
        <Calendar class="h-4 w-4" />
        <span>Created {{ task.createdAt }}</span>
      </div>
    </div>

    <TimeTrackingModal v-model:open="timeTrackingOpen" :project-id="project.id" :task="task" />
  </aside>
</template>
