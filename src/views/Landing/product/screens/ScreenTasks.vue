<script setup lang="ts">
// Tasks -- "How does work actually get executed?"
// The Kanban board for one project, using the app's four real statuses from
// types/types.ts and the task-type vocabulary from the sector defaults.
import { computed } from "vue";
import { Clock, MessageSquare, Paperclip } from "lucide-vue-next";
import { DEMO_TASKS, STATUS_COLUMNS, DEMO_PROJECTS } from "../demoWorkspace";
import type { TaskStatus } from "@/types/types";

const project = DEMO_PROJECTS[1];

const byStatus = computed(() =>
  STATUS_COLUMNS.map((status) => ({
    status,
    tasks: DEMO_TASKS.filter((t) => t.status === status),
  }))
);

const statusTone: Record<TaskStatus, string> = {
  "To Do": "hsl(218 11% 55%)",
  "In Progress": "hsl(var(--wr-lp-brand))",
  "In Review": "hsl(38 92% 45%)",
  Done: "hsl(152 55% 38%)",
};
const priorityTone: Record<string, string> = {
  high: "hsl(353 74% 55%)",
  medium: "hsl(38 92% 45%)",
  low: "hsl(152 55% 38%)",
};
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden">
    <!-- Project header -->
    <div class="shrink-0 border-b px-4 py-2.5 wr-line">
      <div class="flex items-center gap-2">
        <span class="text-[16px]">{{ project.icon }}</span>
        <h3 class="text-[15px] font-bold tracking-tight wr-t1">{{ project.title }}</h3>
        <span class="rounded-full px-1.5 py-0.5 text-[10.5px] font-semibold" style="background: hsl(152 55% 38% / .14); color: hsl(152 55% 34%)">{{ project.status }}</span>
        <span class="text-[10px] tabular-nums wr-t3">{{ project.id }}</span>
        <span class="flex-1" />
        <span class="flex -space-x-1.5">
          <span
            v-for="m in project.members"
            :key="m"
            class="flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-bold text-white"
            style="background: linear-gradient(135deg, hsl(var(--wr-lp-brand)), hsl(var(--wr-lp-accent))); border-color: hsl(var(--wr-lp-app))"
            >{{ m }}</span
          >
        </span>
      </div>
      <nav class="mt-2 flex gap-4 text-[11px]">
        <span class="border-b-2 pb-1 font-semibold" style="border-color: hsl(var(--wr-lp-brand)); color: hsl(var(--wr-lp-brand))">Board</span>
        <span class="pb-1 wr-t3">Timeline</span>
        <span class="pb-1 wr-t3">Documents</span>
        <span class="pb-1 wr-t3">Members</span>
        <span class="pb-1 wr-t3">AI Health Check</span>
      </nav>
    </div>

    <!-- Board -->
    <div class="app-board grid min-h-0 flex-1 gap-2.5 overflow-hidden p-3">
      <section v-for="col in byStatus" :key="col.status" class="flex min-h-0 flex-col">
        <div class="mb-2 flex shrink-0 items-center gap-1.5">
          <span class="h-1.5 w-1.5 rounded-full" :style="{ background: statusTone[col.status] }" />
          <span class="text-[11px] font-semibold wr-t1">{{ col.status }}</span>
          <span class="text-[10px] tabular-nums wr-t3">{{ col.tasks.length }}</span>
        </div>
        <div class="wr-app-well flex min-h-0 flex-1 flex-col gap-2 rounded-lg border p-2 wr-line-soft">
          <article
            v-for="t in col.tasks"
            :key="t.id"
            class="rounded-lg border p-2.5 wr-line-soft"
            style="background: hsl(var(--wr-lp-app))"
          >
            <div class="flex items-start gap-1.5">
              <span class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" :style="{ background: priorityTone[t.priority] }" />
              <p class="min-w-0 flex-1 text-[11.5px] font-medium leading-snug wr-t1">{{ t.name }}</p>
            </div>
            <p class="mt-1.5 text-[10.5px] wr-t3">{{ t.taskType }}</p>
            <div v-if="t.progress > 0 && t.progress < 100" class="mt-2 flex items-center gap-1.5">
              <span class="h-1 flex-1 overflow-hidden rounded-full bg-black/[.07] dark:bg-white/10">
                <span class="block h-full rounded-full" :style="{ width: t.progress + '%', background: statusTone[t.status] }" />
              </span>
              <span class="text-[10.5px] tabular-nums wr-t3">{{ t.progress }}%</span>
            </div>
            <div class="mt-2 flex items-center gap-2">
              <span
                class="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style="background: linear-gradient(135deg, hsl(var(--wr-lp-brand)), hsl(var(--wr-lp-accent)))"
                >{{ t.assignee }}</span
              >
              <span class="flex items-center gap-0.5 text-[10.5px] tabular-nums wr-t3">
                <Clock class="h-2.5 w-2.5" />{{ t.estimated }}
              </span>
              <span class="flex-1" />
              <span class="flex items-center gap-0.5 text-[10.5px] wr-t3"><MessageSquare class="h-2.5 w-2.5" />2</span>
              <span class="flex items-center gap-0.5 text-[10.5px] wr-t3"><Paperclip class="h-2.5 w-2.5" />1</span>
            </div>
            <p class="mt-1.5 text-[10.5px] tabular-nums wr-t3">{{ t.id }} · due {{ t.deadline }}</p>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>
