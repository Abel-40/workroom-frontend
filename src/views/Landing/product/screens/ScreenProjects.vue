<script setup lang="ts">
// Projects -- "How do I organize work?"
// The list view: every project carries its id, owning department, priority,
// progress and the members assigned to it.
import { Plus, SlidersHorizontal, LayoutGrid, List } from "lucide-vue-next";
import { DEMO_PROJECTS, DEMO_DEPARTMENTS } from "../demoWorkspace";

const priorityTone: Record<string, string> = {
  high: "hsl(353 74% 55%)",
  medium: "hsl(38 92% 45%)",
  low: "hsl(152 55% 38%)",
};
const pct = (d: number, t: number) => Math.round((d / t) * 100);
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden">
    <!-- Toolbar -->
    <div class="flex shrink-0 items-center gap-2 border-b px-4 py-2.5 wr-line">
      <h3 class="text-[15px] font-bold tracking-tight wr-t1">Projects</h3>
      <span class="rounded-full bg-black/[.05] px-1.5 py-0.5 text-[10px] font-semibold wr-t2 dark:bg-white/10"
        >12</span
      >
      <span class="flex-1" />
      <span class="flex items-center gap-1 rounded-md border px-2 py-1 text-[10.5px] wr-t2 wr-line">
        <SlidersHorizontal class="h-3 w-3" /> Filter
      </span>
      <span class="flex overflow-hidden rounded-md border wr-line">
        <span class="px-1.5 py-1" style="background: hsl(var(--wr-lp-brand) / .12)">
          <List class="h-3 w-3" style="color: hsl(var(--wr-lp-brand))" />
        </span>
        <span class="px-1.5 py-1"><LayoutGrid class="h-3 w-3 wr-t3" /></span>
      </span>
      <span
        class="flex items-center gap-1 rounded-md px-2.5 py-1 text-[10.5px] font-semibold text-white"
        style="background: linear-gradient(135deg, hsl(var(--wr-lp-brand)), hsl(var(--wr-lp-accent)))"
      >
        <Plus class="h-3 w-3" /> New project
      </span>
    </div>

    <div class="app-projects grid min-h-0 flex-1 overflow-hidden">
      <!-- Table -->
      <div class="flex min-h-0 flex-col overflow-hidden">
        <div
          class="app-prow grid shrink-0 gap-2 border-b px-4 py-1.5 text-[10.5px] font-semibold uppercase tracking-wider wr-t3 wr-line"
        >
          <span>Project</span><span>Department</span><span>Priority</span><span>Progress</span
          ><span>Deadline</span>
        </div>
        <div class="min-h-0 flex-1 overflow-hidden">
          <div
            v-for="pr in DEMO_PROJECTS"
            :key="pr.id"
            class="app-prow grid items-center gap-2 border-b px-4 py-2.5 wr-line-soft"
          >
            <span class="flex min-w-0 items-center gap-2">
              <span class="text-[15px]">{{ pr.icon }}</span>
              <span class="min-w-0 leading-tight">
                <span class="block truncate text-[12px] font-semibold wr-t1">{{ pr.title }}</span>
                <span class="block text-[10.5px] tabular-nums wr-t3">{{ pr.id }}</span>
              </span>
            </span>
            <span class="truncate text-[11px] wr-t2">{{ pr.department }}</span>
            <span class="flex items-center gap-1 text-[10.5px] font-medium" :style="{ color: priorityTone[pr.priority] }">
              <span class="h-1.5 w-1.5 rounded-full" :style="{ background: priorityTone[pr.priority] }" />
              {{ pr.priority }}
            </span>
            <span class="flex items-center gap-1.5">
              <span class="h-1 flex-1 overflow-hidden rounded-full bg-black/[.07] dark:bg-white/10">
                <span
                  class="block h-full rounded-full"
                  :style="{ width: pct(pr.doneTasks, pr.totalTasks) + '%', background: 'hsl(var(--wr-lp-brand))' }"
                />
              </span>
              <span class="w-7 shrink-0 text-right text-[10.5px] tabular-nums wr-t3"
                >{{ pct(pr.doneTasks, pr.totalTasks) }}%</span
              >
            </span>
            <span class="flex items-center justify-between gap-1">
              <span class="text-[10.5px] tabular-nums wr-t2">{{ pr.deadline }}</span>
              <span class="flex -space-x-1.5">
                <span
                  v-for="m in pr.members"
                  :key="m"
                  class="flex h-5 w-5 items-center justify-center rounded-full border-2 text-[10px] font-bold text-white"
                  style="
                    background: linear-gradient(135deg, hsl(var(--wr-lp-brand)), hsl(var(--wr-lp-accent)));
                    border-color: hsl(var(--wr-lp-app));
                  "
                  >{{ m }}</span
                >
              </span>
            </span>
          </div>
        </div>
      </div>

      <!-- Side panel: grouping by department -->
      <aside class="app-aside wr-app-well min-h-0 overflow-hidden border-l p-3 wr-line">
        <p class="mb-2 text-[10.5px] font-semibold uppercase tracking-wider wr-t3">By department</p>
        <div class="flex flex-col gap-1.5">
          <div
            v-for="d in DEMO_DEPARTMENTS"
            :key="d.name"
            class="flex items-center justify-between gap-2 rounded-md px-2 py-1.5"
            :style="d.name === 'Engineering' ? 'background: hsl(var(--wr-lp-brand) / .10)' : ''"
          >
            <span class="truncate text-[11px] wr-t1">{{ d.name }}</span>
            <span class="shrink-0 text-[10px] tabular-nums wr-t3">{{ d.activeProjects }}</span>
          </div>
        </div>
        <p class="mb-2 mt-4 text-[10.5px] font-semibold uppercase tracking-wider wr-t3">Visibility</p>
        <div class="flex flex-col gap-1 text-[10.5px] wr-t2">
          <span class="flex items-center justify-between"><span>Company-wide</span><span class="tabular-nums wr-t3">7</span></span>
          <span class="flex items-center justify-between"><span>Department only</span><span class="tabular-nums wr-t3">4</span></span>
          <span class="flex items-center justify-between"><span>Private</span><span class="tabular-nums wr-t3">1</span></span>
        </div>
      </aside>
    </div>
  </div>
</template>
