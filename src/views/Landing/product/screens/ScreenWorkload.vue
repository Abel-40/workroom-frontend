<script setup lang="ts">
// Static counterpart of AnalyticsView. The real app reports project/task
// aggregates and workload by member; it does not invent contracted capacity.
import { Activity, BarChart3, CheckCircle2, FolderKanban, UsersRound } from "lucide-vue-next";
import { DEMO_ACTIVITY, DEMO_DEPARTMENTS, DEMO_PEOPLE, DEMO_PROJECTS, DEMO_TASKS } from "../demoWorkspace";

const metrics = [
  { label: "Total projects", value: "18", icon: FolderKanban },
  { label: "Active projects", value: "12", icon: BarChart3 },
  { label: "Completed projects", value: "6", icon: CheckCircle2 },
  { label: "Company members", value: "24", icon: UsersRound },
  { label: "Total tasks", value: "86", icon: Activity },
  { label: "Completed tasks", value: "54", icon: CheckCircle2 },
];
</script>

<template>
  <div class="flex h-full flex-col gap-3 overflow-hidden p-4">
    <div class="flex shrink-0 items-baseline justify-between"><div><p class="text-[10px] font-semibold uppercase tracking-wider wr-t3">Company</p><h3 class="text-[17px] font-bold tracking-tight wr-t1">Analytics &amp; Company Insights</h3></div><span class="rounded-md border px-2 py-1 text-[10px] wr-t2 wr-line">Last 30 days</span></div>
    <div class="app-stats grid shrink-0 gap-2"><div v-for="metric in metrics" :key="metric.label" class="wr-app-well rounded-2xl border p-2.5 shadow-sm wr-line-soft"><div class="flex items-center gap-1.5"><component :is="metric.icon" class="h-3.5 w-3.5" style="color: hsl(var(--wr-lp-brand))" /><span class="text-[9.5px] wr-t3">{{ metric.label }}</span></div><p class="mt-1 text-[20px] font-bold leading-none tracking-tight wr-t1">{{ metric.value }}</p></div></div>

    <div class="app-work grid min-h-0 flex-1 gap-3 overflow-hidden">
      <section class="flex min-h-0 flex-col rounded-2xl border p-3 wr-app-well wr-line-soft"><div class="mb-2 flex shrink-0 items-center justify-between"><h4 class="text-[12px] font-semibold wr-t1">Department overview</h4><span class="text-[9.5px] wr-t3">Members · projects · tasks</span></div><div class="min-h-0 overflow-hidden"><div class="grid grid-cols-[1.25fr_.5fr_.55fr_.5fr_.65fr] gap-2 border-b px-1 py-1.5 text-[8.5px] font-semibold uppercase tracking-wider wr-t3 wr-line"><span>Department</span><span>Members</span><span>Projects</span><span>Tasks</span><span>Done</span></div><div v-for="d in DEMO_DEPARTMENTS" :key="d.id" class="grid grid-cols-[1.25fr_.5fr_.55fr_.5fr_.65fr] items-center gap-2 border-b px-1 py-2 wr-line-soft"><span class="flex min-w-0 items-center gap-1.5"><span class="h-1.5 w-1.5 shrink-0 rounded-full" style="background: hsl(var(--wr-lp-brand))" /><span class="truncate text-[10.5px] font-medium wr-t1">{{ d.name }}</span></span><span class="text-[10px] tabular-nums wr-t2">{{ d.members }}</span><span class="text-[10px] tabular-nums wr-t2">{{ d.activeProjects }}</span><span class="text-[10px] tabular-nums wr-t2">{{ d.activeProjects * 8 }}</span><span class="text-[10px] tabular-nums wr-t2">{{ Math.round(d.load * .6) }}</span></div></div></section>

      <section class="flex min-h-0 flex-col rounded-2xl border p-3 wr-app-well wr-line-soft"><h4 class="mb-2 text-[12px] font-semibold wr-t1">Member workload</h4><div class="min-h-0 space-y-2 overflow-hidden"><div v-for="person in DEMO_PEOPLE" :key="person.name" class="flex items-center gap-2"><span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white" style="background: linear-gradient(135deg, hsl(var(--wr-lp-brand)), hsl(var(--wr-lp-accent)))">{{ person.initials }}</span><span class="w-20 shrink-0 truncate text-[10px] font-medium wr-t1">{{ person.name }}</span><span class="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[.07] dark:bg-white/10"><span class="block h-full rounded-full" :style="{ width: `${Math.min(person.load, 100)}%`, background: person.load > 100 ? 'hsl(353 74% 55%)' : 'hsl(var(--wr-lp-brand))' }" /></span><span class="w-7 text-right text-[9.5px] tabular-nums wr-t3">{{ person.activeTasks }}</span></div></div><div class="mt-auto border-t pt-3 wr-line-soft"><p class="mb-2 text-[10px] font-semibold wr-t1">Recent activity</p><div v-for="activity in DEMO_ACTIVITY.slice(0, 3)" :key="activity.target" class="flex gap-1.5 py-1"><span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black/[.06] text-[8px] font-bold wr-t2 dark:bg-white/10">{{ activity.who }}</span><p class="min-w-0 truncate text-[9.5px] wr-t2"><span class="font-semibold wr-t1">{{ activity.name }}</span> {{ activity.action }} {{ activity.target }} <span class="wr-t3">· {{ activity.when }}</span></p></div></div></section>
    </div>
  </div>
</template>
