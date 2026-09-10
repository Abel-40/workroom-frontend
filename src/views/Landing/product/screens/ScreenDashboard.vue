<script setup lang="ts">
// Static counterpart of the real CmDashboard/DashboardHome. It keeps the
// signed-out preview independent from auth, Pinia, routing, and the API while
// preserving the owner/company-manager dashboard's actual reading order.
import { Activity, AlertTriangle, ArrowRight, Calendar, CalendarClock, ChevronRight, Gauge, UserPlus, Users } from "lucide-vue-next";
import { DEMO_ACTIVITY, DEMO_EVENTS, DEMO_PEOPLE, DEMO_PROJECTS, DEMO_VIEWER } from "../demoWorkspace";

const workloadPreview = DEMO_PEOPLE.slice(0, 6);
const attentionProjects = DEMO_PROJECTS.slice(0, 2);
const loadColor = (load: number) => (load > 100 ? "hsl(353 74% 55%)" : load > 85 ? "hsl(38 92% 50%)" : "hsl(var(--wr-lp-brand))");
const progress = (done: number, total: number) => Math.round((done / total) * 100);
</script>

<template>
  <div class="flex h-full flex-col gap-3.5 overflow-hidden p-4">
    <!-- Matches CmDashboard's company heading and date control. -->
    <div class="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-[10px] font-semibold uppercase tracking-[.06em] wr-t3">Company</p>
        <h3 class="text-[18px] font-extrabold leading-tight tracking-tight wr-t1">Dashboard</h3>
      </div>
      <span class="inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-[9.5px] font-semibold sm:self-auto" style="background: hsl(var(--wr-lp-brand) / .10); color: hsl(var(--wr-lp-brand))"><Calendar class="h-3 w-3" /> Sep 10, 2026</span>
    </div>

    <div class="app-dashboard grid min-h-0 flex-1 gap-3">
      <div class="flex min-h-0 flex-col gap-3">
        <!-- Real dashboard workload card: UserCard-style member tiles. -->
        <section class="flex min-h-0 flex-col rounded-2xl border p-3 shadow-sm wr-line-soft" style="background: hsl(var(--wr-lp-app) / .82)">
          <div class="mb-3 flex shrink-0 items-center justify-between"><h4 class="relative pl-2.5 text-[12px] font-semibold wr-t1"><span class="absolute left-0 top-[3px] h-3 w-[3px] rounded-full" style="background: hsl(var(--wr-lp-brand))" />Workload</h4><span class="flex items-center gap-1 text-[9.5px] font-semibold" style="color: hsl(var(--wr-lp-brand))">View Company Insights <ChevronRight class="h-3 w-3" /></span></div>
          <div class="app-people grid min-h-0 flex-1 content-start gap-2">
            <article v-for="person in workloadPreview" :key="person.name" class="rounded-xl border p-2.5 shadow-sm wr-line-soft" style="background: hsl(var(--wr-lp-app))"><div class="flex items-center gap-2"><span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white" style="background: linear-gradient(135deg, hsl(var(--wr-lp-brand)), hsl(var(--wr-lp-accent)))">{{ person.initials }}</span><span class="min-w-0 leading-tight"><span class="block truncate text-[10.5px] font-semibold wr-t1">{{ person.name }}</span><span class="block truncate text-[9px] wr-t3">{{ person.profession }}</span></span></div><div class="mt-2 flex items-center gap-1.5"><span class="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[.07] dark:bg-white/10"><span class="block h-full rounded-full" :style="{ width: `${Math.min(person.load, 100)}%`, background: loadColor(person.load) }" /></span><span class="w-7 text-right text-[9px] font-semibold tabular-nums" :style="{ color: loadColor(person.load) }">{{ person.load }}%</span></div></article>
          </div>
        </section>

        <!-- Real dashboard attention section uses ProjectCard-style entries. -->
        <section class="shrink-0"><div class="mb-2 flex items-center justify-between"><h4 class="flex items-center gap-2 text-[12px] font-semibold wr-t1"><span class="h-3 w-[3px] rounded-full" style="background: hsl(353 74% 55%)" />Projects needing attention</h4><span class="text-[9.5px] font-semibold" style="color: hsl(var(--wr-lp-brand))">View all</span></div><div class="rounded-2xl border p-2.5 shadow-sm wr-line-soft" style="background: hsl(var(--wr-lp-app) / .82)"><div v-for="(project, index) in attentionProjects" :key="project.id" class="relative flex items-center gap-2.5 rounded-xl p-2.5" :class="index ? 'mt-1 border-t pt-3 wr-line-soft' : ''"><span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/[.035] text-[15px] dark:bg-white/[.06]">{{ project.icon }}</span><span class="min-w-0 flex-1 leading-tight"><span class="block truncate text-[10.5px] font-medium wr-t1">{{ project.title }}</span><span class="block text-[9px] wr-t3">{{ project.id }} · {{ project.department }}</span><span class="mt-1 block h-1 overflow-hidden rounded-full bg-black/[.07] dark:bg-white/10"><span class="block h-full rounded-full" :style="{ width: `${progress(project.doneTasks, project.totalTasks)}%`, background: 'hsl(var(--wr-lp-brand))' }" /></span></span><span class="shrink-0 rounded-full px-1.5 py-0.5 text-[8.5px] font-semibold" style="background: hsl(353 74% 55% / .11); color: hsl(353 74% 48%)">{{ index ? "2d overdue" : "11d overdue" }}</span></div></div></section>
      </div>

      <div class="app-dashboard-aside flex min-h-0 flex-col gap-3">
        <!-- Real dashboard nearest event card. -->
        <section class="flex min-h-0 flex-1 flex-col rounded-2xl border p-3 shadow-sm wr-line-soft" style="background: hsl(var(--wr-lp-app) / .82)"><div class="mb-3 flex items-center justify-between"><h4 class="relative pl-2.5 text-[12px] font-semibold wr-t1"><span class="absolute left-0 top-[3px] h-3 w-[3px] rounded-full" style="background: hsl(var(--wr-lp-brand))" />Nearest Event</h4><span class="text-[9.5px] font-semibold" style="color: hsl(var(--wr-lp-brand))">View all</span></div><div class="space-y-2"><div v-for="event in DEMO_EVENTS" :key="event.title" class="flex items-center gap-2.5 rounded-xl border p-2.5 wr-line-soft" style="background: hsl(var(--wr-lp-app))"><span class="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg" style="background: hsl(var(--wr-lp-brand) / .10); color: hsl(var(--wr-lp-brand))"><span class="text-[13px] font-bold leading-none">{{ event.day }}</span><span class="text-[7px] font-bold">{{ event.month }}</span></span><span class="min-w-0 leading-tight"><span class="block truncate text-[10.5px] font-semibold wr-t1">{{ event.title }}</span><span class="block truncate text-[9px] wr-t3">{{ event.time }} · {{ event.who }}</span></span></div></div><div class="mt-auto rounded-xl border border-dashed p-2.5 wr-line-soft"><p class="flex items-center gap-1.5 text-[9.5px] font-semibold wr-t2"><CalendarClock class="h-3 w-3" style="color: hsl(var(--wr-lp-brand))" /> Keep the team aligned with shared events.</p></div></section>

        <!-- Real ActivityStream card. -->
        <section class="flex min-h-0 flex-1 flex-col rounded-2xl border p-3 shadow-sm wr-line-soft" style="background: hsl(var(--wr-lp-app) / .82)"><div class="mb-2 flex items-center justify-between"><h4 class="relative pl-2.5 text-[12px] font-semibold wr-t1"><span class="absolute left-0 top-[3px] h-3 w-[3px] rounded-full" style="background: hsl(var(--wr-lp-brand))" />Activity</h4><Activity class="h-3.5 w-3.5 wr-t3" /></div><div class="min-h-0 space-y-2 overflow-hidden"><div v-for="activity in DEMO_ACTIVITY" :key="activity.target" class="flex items-start gap-2"><span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/[.06] text-[8px] font-bold wr-t2 dark:bg-white/10">{{ activity.who }}</span><p class="min-w-0 text-[9.5px] leading-snug wr-t2"><span class="font-semibold wr-t1">{{ activity.name }}</span> {{ activity.action }} <span class="font-medium wr-t1">{{ activity.target }}</span><span class="block text-[8.5px] wr-t3">{{ activity.detail }} · {{ activity.when }}</span></p></div></div><span class="mt-auto flex items-center justify-center gap-1 pt-2 text-[9px] font-semibold" style="color: hsl(var(--wr-lp-brand))">View all activity <ArrowRight class="h-2.5 w-2.5" /></span></section>
      </div>
    </div>
  </div>
</template>
