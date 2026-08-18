<script setup lang="ts">
import { computed, ref } from "vue";
import { ChevronDown, Paperclip, X } from "lucide-vue-next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import TaskStatusPill from "@/components/cards/TaskStatusPill.vue";
import type { TaskType } from "@/types/types";

const props = defineProps<{
  projectId: string;
  task: TaskType;
}>();

defineEmits<{
  (e: "close"): void;
}>();

const LABEL_CLASS: Record<string, string> = {
  purple: "bg-violet-500",
  cyan: "bg-cyan-400",
};

const expanded = ref(false);
const visibleActivity = computed(() => {
  const entries = props.task.activity || [];
  return expanded.value ? entries : entries.slice(0, 3);
});

const initials = (name: string) =>
  (name || "?")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const formatTimestamp = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};
</script>

<template>
  <div class="w-full rounded-2xl border border-gray-100 bg-white p-4">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-sm font-semibold text-ink">Task Details</h3>
      <button type="button" class="text-subtle hover:text-ink" @click="$emit('close')">
        <X class="h-4 w-4" />
      </button>
    </div>

    <div class="mb-3 flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-mono text-subtle">{{ task.id }}</p>
        <h4 class="text-lg font-semibold text-ink">{{ task.name }}</h4>
      </div>
      <TaskStatusPill :project-id="projectId" :task="task" />
    </div>

    <p class="mb-4 whitespace-pre-line text-sm leading-relaxed text-subtle">
      {{ task.description || "No description provided." }}
    </p>

    <div
      v-if="task.attachments?.length"
      class="mb-4 space-y-2"
    >
      <div
        v-for="(attachment, index) in task.attachments"
        :key="index"
        class="flex items-center gap-3 rounded-xl border border-gray-100 bg-page p-3"
      >
        <div class="h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br from-primary to-violet-500" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-ink">
            {{ attachment.type === "file" ? attachment.name : attachment.label || attachment.url }}
          </p>
          <p class="text-xs text-subtle">Attached to this task</p>
        </div>
        <Paperclip class="h-4 w-4 shrink-0 text-subtle" />
      </div>
    </div>

    <div v-if="task.labelColors?.length" class="mb-4 flex gap-2">
      <span
        v-for="(color, idx) in task.labelColors"
        :key="idx"
        class="h-3 w-3 rounded-full"
        :class="LABEL_CLASS[color] || 'bg-slate-400'"
      />
    </div>

    <div class="border-t border-gray-100 pt-4">
      <h4 class="mb-3 text-sm font-semibold text-ink">Recent Activity</h4>
      <ul class="space-y-4">
        <li v-for="entry in visibleActivity" :key="entry.id" class="flex gap-3">
          <Avatar size="sm" class="h-8 w-8 shrink-0 text-xs">
            <AvatarFallback>{{ initials(entry.actor) }}</AvatarFallback>
          </Avatar>
          <div class="min-w-0">
            <p class="text-sm text-ink">
              <span class="font-medium">{{ entry.actor }}</span>
              <span v-if="entry.actorRole" class="ml-1 text-xs text-subtle">{{ entry.actorRole }}</span>
            </p>
            <p class="text-sm text-subtle">{{ entry.message }}</p>
            <p class="text-xs text-subtle">{{ formatTimestamp(entry.createdAt) }}</p>
          </div>
        </li>
        <li v-if="!task.activity?.length" class="text-sm text-subtle">No activity yet.</li>
      </ul>

      <button
        v-if="(task.activity?.length || 0) > 3"
        type="button"
        class="mt-3 flex items-center gap-1 text-xs font-medium text-primary"
        @click="expanded = !expanded"
      >
        {{ expanded ? "View less" : "View more" }}
        <ChevronDown class="h-3.5 w-3.5 transition" :class="expanded ? 'rotate-180' : ''" />
      </button>
    </div>
  </div>
</template>
