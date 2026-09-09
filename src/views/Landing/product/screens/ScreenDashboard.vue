<script setup lang="ts">
// Dashboard -- "What can I see at a glance?"
// Mirrors DashboardHome: workload grid, projects list, nearest events and
// the activity stream, in the same reading order as the signed-in app.
import { TrendingUp, TriangleAlert, CircleCheck } from "lucide-vue-next";
import {
  DEMO_PEOPLE,
  DEMO_PROJECTS,
  DEMO_ACTIVITY,
  DEMO_EVENTS,
  DEMO_VIEWER,
} from "../demoWorkspace";

const stats = [
  { label: "Active projects", value: "12", delta: "+2 this week", icon: TrendingUp, tone: "brand" },
  { label: "Tasks due this week", value: "23", delta: "6 unassigned", icon: CircleCheck, tone: "ok" },
  { label: "Overdue", value: "2", delta: "Engineering", icon: TriangleAlert, tone: "warn" },
];

const loadColor = (n: number) =>
  n > 100 ? "hsl(353 74% 55%)" : n > 85 ? "hsl(38 92% 50%)" : "hsl(var(--wr-lp-brand))";
</script>

<template>
  <div class="flex h-full flex-col gap-3.5 overflow-hidden p-4">
    <div class="flex shrink-0 items-baseline justify-between">
      <div>
        <p class="text-[11px] wr-t3">Welcome back, {{ DEMO_VIEWER.name.split(" ")[0] }}</p>
        <h3 class="text-[17px] font-bold tracking-tight wr-t1">Dashboard</h3>
      </div>
      <span class="rounded-md border px-2 py-1 text-[10.5px] wr-t2 wr-line">Sep 1 – Sep 30</span>
    </div>

    <!-- Stat row -->
    <div class="app-stats grid shrink-0 gap-2.5">
      <div v-for="s in stats" :key="s.label" class="wr-app-well rounded-lg border p-2.5 wr-line-soft">
        <div class="flex items-center gap-1.5">
          <component
            :is="s.icon"
            class="h-3.5 w-3.5"
            :style="{
              color:
                s.tone === 'warn'
                  ? 'hsl(353 74% 55%)'
                  : s.tone === 'ok'
                    ? 'hsl(152 60% 40%)'
                    : 'hsl(var(--wr-lp-brand))',
            }"
          />
          <span class="text-[10.5px] wr-t3">{{ s.label }}</span>
        </div>
        <p class="mt-1 text-[22px] font-bold leading-none tracking-tight wr-t1">{{ s.value }}</p>
        <p class="mt-1 text-[10px] wr-t3">{{ s.delta }}</p>
      </div>
    </div>

    <div class="app-split grid min-h-0 flex-1 gap-3">
      <!-- Left: workload + projects -->
      <div class="flex min-h-0 flex-col gap-3">
        <section class="app-workload-block flex min-h-0 flex-1 flex-col">
          <div class="mb-2 flex shrink-0 items-center justify-between">
            <h4
              class="relative pl-2.5 text-[12.5px] font-semibold wr-t1 before:absolute before:left-0 before:top-[3px] before:h-3 before:w-[3px] before:rounded-full"
              style="--tw-content: ''"
            >
              <span
                class="absolute left-0 top-[3px] h-3 w-[3px] rounded-full"
                style="background: hsl(var(--wr-lp-brand))"
              />
              Workload
            </h4>
            <span class="text-[10.5px]" style="color: hsl(var(--wr-lp-brand))">View Company Insights ›</span>
          </div>
          <div class="app-people grid min-h-0 flex-1 content-start gap-2">
            <div
              v-for="p in DEMO_PEOPLE.slice(0, 6)"
              :key="p.name"
              class="wr-app-well rounded-lg border p-2 wr-line-soft"
            >
              <div class="flex items-center gap-1.5">
                <span
                  class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10.5px] font-bold text-white"
                  style="background: linear-gradient(135deg, hsl(var(--wr-lp-brand)), hsl(var(--wr-lp-accent)))"
                  >{{ p.initials }}</span
                >
                <span class="min-w-0 leading-tight">
                  <span class="block truncate text-[11px] font-semibold wr-t1">{{ p.name }}</span>
                  <span class="block truncate text-[10.5px] wr-t3">{{ p.profession }}</span>
                </span>
              </div>
              <div class="mt-2 flex items-center gap-1.5">
                <span class="h-1 flex-1 overflow-hidden rounded-full bg-black/[.07] dark:bg-white/10">
                  <span
                    class="block h-full rounded-full"
                    :style="{ width: Math.min(p.load, 100) + '%', background: loadColor(p.load) }"
                  />
                </span>
                <span
                  class="shrink-0 text-[10.5px] font-semibold tabular-nums"
                  :style="{ color: loadColor(p.load) }"
                  >{{ p.load }}%</span
                >
              </div>
            </div>
          </div>
        </section>

        <section class="flex min-h-0 shrink-0 flex-col">
          <h4 class="mb-2 flex items-center gap-2 text-[12.5px] font-semibold wr-t1">
            <span class="h-3 w-[3px] rounded-full" style="background: hsl(var(--wr-lp-brand))" />
            Projects
          </h4>
          <div class="flex flex-col gap-1.5">
            <div
              v-for="pr in DEMO_PROJECTS.slice(0, 3)"
              :key="pr.id"
              class="wr-app-well flex items-center gap-2.5 rounded-lg border px-2.5 py-2 wr-line-soft"
            >
              <span class="text-[15px]">{{ pr.icon }}</span>
              <span class="min-w-0 flex-1 leading-tight">
                <span class="block truncate text-[11.5px] font-semibold wr-t1">{{ pr.title }}</span>
                <span class="block text-[10.5px] wr-t3">{{ pr.id }} · {{ pr.department }}</span>
              </span>
              <span class="hidden shrink-0 items-center gap-1.5 md:flex">
                <span class="h-1 w-16 overflow-hidden rounded-full bg-black/[.07] dark:bg-white/10">
                  <span
                    class="block h-full rounded-full"
                    :style="{
                      width: Math.round((pr.doneTasks / pr.totalTasks) * 100) + '%',
                      background: 'hsl(var(--wr-lp-brand))',
                    }"
                  />
                </span>
                <span class="text-[10.5px] tabular-nums wr-t3">{{ pr.doneTasks }}/{{ pr.totalTasks }}</span>
              </span>
            </div>
          </div>
        </section>
      </div>

      <!-- Right: events + activity -->
      <div class="app-aside flex min-h-0 flex-col gap-3">
        <section class="shrink-0">
          <h4 class="mb-2 text-[12.5px] font-semibold wr-t1">Nearest Events</h4>
          <div class="flex flex-col gap-1.5">
            <div
              v-for="e in DEMO_EVENTS"
              :key="e.title"
              class="wr-app-well flex items-center gap-2.5 rounded-lg border px-2.5 py-2 wr-line-soft"
            >
              <span class="shrink-0 text-center leading-none">
                <span class="block text-[14px] font-bold tabular-nums wr-t1">{{ e.day }}</span>
                <span class="block text-[10px] font-semibold wr-t3">{{ e.month }}</span>
              </span>
              <span class="min-w-0 leading-tight">
                <span class="block truncate text-[11px] font-semibold wr-t1">{{ e.title }}</span>
                <span class="block truncate text-[10.5px] wr-t3">{{ e.time }} · {{ e.who }}</span>
              </span>
            </div>
          </div>
        </section>

        <section class="flex min-h-0 flex-1 flex-col">
          <h4 class="mb-2 shrink-0 text-[12.5px] font-semibold wr-t1">Activity Stream</h4>
          <div class="flex min-h-0 flex-col gap-2 overflow-hidden">
            <div v-for="a in DEMO_ACTIVITY" :key="a.target" class="flex gap-2">
              <span
                class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black/[.06] text-[10px] font-bold wr-t2 dark:bg-white/10"
                >{{ a.who }}</span
              >
              <p class="min-w-0 text-[10.5px] leading-snug wr-t2">
                <span class="font-semibold wr-t1">{{ a.name }}</span>
                {{ a.action }}
                <span class="font-medium wr-t1">{{ a.target }}</span>
                <span class="wr-t3"> · {{ a.detail }} · {{ a.when }}</span>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
