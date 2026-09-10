<script setup lang="ts">
// Static counterpart of ProjectsView: master list on the left, selected
// project context and task modes on the right. It deliberately has no store,
// router, or mutation behavior because this surface is public preview chrome.
import { Calendar, ChartNoAxesGantt, Globe2, Kanban, LockKeyhole, Plus, SlidersHorizontal, UsersRound } from "lucide-vue-next";
import { DEMO_PROJECTS, DEMO_TASKS } from "../demoWorkspace";

const selectedProject = DEMO_PROJECTS[1];
const pct = (done: number, total: number) => Math.round((done / total) * 100);
const priorityTone: Record<string, string> = {
  high: "hsl(353 74% 55%)",
  medium: "hsl(38 92% 45%)",
  low: "hsl(152 55% 38%)",
};
const boardStatuses = ["To Do", "In Progress", "In Review"] as const;
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden">
    <div class="flex shrink-0 items-center gap-2 border-b px-4 py-2.5 wr-line">
      <h3 class="text-[15px] font-bold tracking-tight wr-t1">Projects</h3>
      <span class="rounded-full bg-black/[.05] px-1.5 py-0.5 text-[10px] font-semibold wr-t2 dark:bg-white/10">12</span>
      <span class="flex-1" />
      <span class="flex items-center gap-1 rounded-md border px-2 py-1 text-[10.5px] wr-t2 wr-line"><SlidersHorizontal class="h-3 w-3" /> Filter</span>
      <span class="flex items-center gap-1 rounded-md px-2.5 py-1 text-[10.5px] font-semibold text-white" style="background: linear-gradient(135deg, hsl(var(--wr-lp-brand)), hsl(var(--wr-lp-accent)))"><Plus class="h-3 w-3" /> New project</span>
    </div>

    <div class="app-projects grid min-h-0 flex-1 overflow-hidden">
      <div class="flex min-h-0 flex-col overflow-hidden border-r wr-line">
        <div class="flex shrink-0 items-center justify-between border-b px-3 py-2 wr-line"><span class="text-[10.5px] font-semibold uppercase tracking-wider wr-t3">My projects</span><span class="text-[10px] wr-t3">Department · Company</span></div>
        <div class="min-h-0 flex-1 overflow-hidden py-1">
          <div v-for="pr in DEMO_PROJECTS" :key="pr.id" class="flex h-[76px] cursor-default items-center gap-2 border-b px-3 py-2.5 transition wr-line-soft" :class="pr.id === selectedProject.id ? 'bg-black/[.025] dark:bg-white/[.035]' : ''">
            <span class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black/[.035] text-[15px] dark:bg-white/[.06]">{{ pr.icon }}</span>
            <span class="min-w-0 flex-1 leading-tight"><span class="block truncate text-[11.5px] font-medium wr-t1">{{ pr.title }}</span><span class="mt-0.5 block text-[9.5px] tabular-nums wr-t3">{{ pr.id }} · {{ pr.department }}</span><span class="mt-1 block h-1 overflow-hidden rounded-full bg-black/[.07] dark:bg-white/10"><span class="block h-full rounded-full" :style="{ width: `${pct(pr.doneTasks, pr.totalTasks)}%`, background: 'hsl(var(--wr-lp-brand))' }" /></span></span>
            <span v-if="pr.id === selectedProject.id" class="h-8 w-1 shrink-0 rounded-full" style="background: hsl(var(--wr-lp-brand))" />
          </div>
        </div>
      </div>

      <div class="flex min-h-0 flex-col overflow-hidden">
        <div class="shrink-0 border-b px-4 py-3 wr-line">
          <div class="flex items-start gap-2"><span class="text-[17px]">{{ selectedProject.icon }}</span><div class="min-w-0 flex-1"><div class="flex flex-wrap items-center gap-2"><h4 class="truncate text-[15px] font-bold tracking-tight wr-t1">{{ selectedProject.title }}</h4><span class="rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold" style="background: hsl(152 55% 38% / .14); color: hsl(152 55% 34%)">{{ selectedProject.status }}</span></div><p class="mt-1 text-[10px] wr-t3">{{ selectedProject.id }} · Owned by {{ selectedProject.owner }}</p></div><span class="flex -space-x-1.5"><span v-for="m in selectedProject.members" :key="m" class="flex h-6 w-6 items-center justify-center rounded-full border-2 text-[9px] font-bold text-white" style="background: linear-gradient(135deg, hsl(var(--wr-lp-brand)), hsl(var(--wr-lp-accent))); border-color: hsl(var(--wr-lp-app))">{{ m }}</span></span></div>
          <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] wr-t2"><span class="flex items-center gap-1"><Calendar class="h-3 w-3 wr-t3" />{{ selectedProject.startDate }} – {{ selectedProject.deadline }}</span><span class="flex items-center gap-1"><Globe2 class="h-3 w-3 wr-t3" />{{ selectedProject.visibility }}</span><span class="flex items-center gap-1"><UsersRound class="h-3 w-3 wr-t3" />{{ selectedProject.members.length }} members</span></div>
          <p class="mt-2 max-w-xl text-[10.5px] leading-relaxed wr-t2">{{ selectedProject.description }}</p>
        </div>
        <div class="flex shrink-0 items-center gap-4 border-b px-4 pt-2 text-[10.5px] wr-line"><span class="border-b-2 pb-2 font-semibold" style="border-color: hsl(var(--wr-lp-brand)); color: hsl(var(--wr-lp-brand))"><Kanban class="mr-1 inline h-3 w-3" />Board</span><span class="pb-2 wr-t3"><ChartNoAxesGantt class="mr-1 inline h-3 w-3" />Timeline</span><span class="pb-2 wr-t3">Documents</span><span class="pb-2 wr-t3">Members</span></div>
        <div class="min-h-0 flex-1 overflow-hidden p-3"><div class="grid gap-2.5 sm:grid-cols-3"><div v-for="status in boardStatuses" :key="status" class="min-w-0"><div class="mb-2 flex items-center gap-1.5"><span class="h-1.5 w-1.5 rounded-full" :style="{ background: status === 'In Progress' ? 'hsl(var(--wr-lp-brand))' : status === 'In Review' ? 'hsl(38 92% 45%)' : 'hsl(218 11% 55%)' }" /><span class="text-[10.5px] font-semibold wr-t1">{{ status }}</span><span class="text-[9.5px] wr-t3">{{ DEMO_TASKS.filter((t) => t.status === status).length }}</span></div><div class="flex min-h-[95px] flex-col gap-1.5 rounded-2xl border p-2 wr-app-well wr-line-soft"><div v-for="task in DEMO_TASKS.filter((t) => t.status === status).slice(0, 2)" :key="task.id" class="rounded-xl border p-2 wr-line-soft" style="background: hsl(var(--wr-lp-app))"><p class="font-mono text-[8.5px] wr-t3">{{ task.id }}</p><p class="mt-1 text-[10px] font-medium leading-snug wr-t1">{{ task.name }}</p><div class="mt-2 flex items-center justify-between"><span class="text-[9px]" :style="{ color: priorityTone[task.priority] }">{{ task.priority }}</span><span class="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold text-white" style="background: linear-gradient(135deg, hsl(var(--wr-lp-brand)), hsl(var(--wr-lp-accent)))">{{ task.assignee }}</span></div></div></div></div></div><div class="mt-3 flex items-center gap-1.5 text-[9.5px] wr-t3"><LockKeyhole class="h-3 w-3" /> Visibility and task permissions follow the selected project.</div></div>
      </div>
    </div>
  </div>
</template>
