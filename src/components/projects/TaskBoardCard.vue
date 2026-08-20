<script setup lang="ts">
import { ArrowDown, ArrowUp, Clock } from "lucide-vue-next";
import type { TaskType } from "@/types/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatHoursToDuration } from "@/lib/duration";

const props = defineProps<{
  task: TaskType;
  dragging?: boolean;
}>();

const emit = defineEmits<{
  (e: "select", task: TaskType): void;
  (e: "dragstart", event: DragEvent, task: TaskType): void;
  (e: "dragend", event: DragEvent): void;
}>();

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

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
</script>

<template>
  <div
    class="cursor-pointer rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition hover:shadow-md hover:border-primary/30"
    :class="{ 'opacity-40': dragging }"
    draggable="true"
    @click="emit('select', task)"
    @dragstart="(e) => emit('dragstart', e, task)"
    @dragend="(e) => emit('dragend', e)"
  >
    <p class="mb-1 text-[11px] font-mono text-subtle">{{ task.id.slice(0, 8) }}</p>
    <p class="mb-3 text-sm font-medium text-ink line-clamp-2">{{ task.title }}</p>
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="flex items-center gap-1 text-xs text-subtle" v-if="task.estimatedTimeHours">
          <Clock class="h-3.5 w-3.5" />
          {{ formatHoursToDuration(task.estimatedTimeHours) }}
        </span>
        <component
          :is="priorityIcon(task.priority)"
          class="h-3.5 w-3.5"
          :class="priorityColor(task.priority)"
        />
      </div>
      <Tooltip>
        <TooltipTrigger as-child>
          <Avatar size="sm" class="h-6 w-6 text-[10px]">
            <AvatarFallback>{{ initials(task.assigneeName || "?") }}</AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent side="top" class="flex items-center gap-2">
          <Avatar size="sm" class="h-5 w-5 text-[9px]">
            <AvatarFallback>{{ initials(task.assigneeName || "?") }}</AvatarFallback>
          </Avatar>
          <div class="text-xs">
            <p class="text-subtle">Assignee</p>
            <p class="font-medium text-ink">{{ task.assigneeName || "Unassigned" }}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  </div>
</template>
