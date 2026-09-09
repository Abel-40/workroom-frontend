<script setup lang="ts">
// Workload -- "How do I understand who has capacity?"
// Reached from the dashboard's "View Company Insights". Data-led composition:
// capacity per person, distribution per department, and the reassignment this
// view exists to make obvious.
import { TriangleAlert, ArrowRight } from "lucide-vue-next";
import { DEMO_PEOPLE, DEMO_DEPARTMENTS } from "../demoWorkspace";

const loadTone = (n: number) =>
  n > 100 ? "hsl(353 74% 55%)" : n > 85 ? "hsl(38 92% 50%)" : "hsl(var(--wr-lp-brand))";
const loadLabel = (n: number) => (n > 100 ? "Over capacity" : n > 85 ? "Near capacity" : "Healthy");

const maxBar = 120;
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden">
    <div class="flex shrink-0 items-center gap-2 border-b px-4 py-2.5 wr-line">
      <h3 class="text-[15px] font-bold tracking-tight wr-t1">Company Insights</h3>
      <span class="flex-1" />
      <span class="flex gap-3 text-[10.5px] wr-t3">
        <span class="flex items-center gap-1"><span class="h-1.5 w-1.5 rounded-full" style="background: hsl(var(--wr-lp-brand))" />Healthy</span>
        <span class="flex items-center gap-1"><span class="h-1.5 w-1.5 rounded-full" style="background: hsl(38 92% 50%)" />Near</span>
        <span class="flex items-center gap-1"><span class="h-1.5 w-1.5 rounded-full" style="background: hsl(353 74% 55%)" />Over</span>
      </span>
    </div>

    <div class="app-work grid min-h-0 flex-1 gap-4 overflow-hidden p-4">
      <!-- Per-person capacity -->
      <section class="flex min-h-0 flex-col">
        <p class="mb-3 shrink-0 text-[11.5px] font-semibold wr-t1">Capacity by person</p>
        <div class="flex min-h-0 flex-1 flex-col justify-between gap-2.5">
          <div v-for="p in DEMO_PEOPLE" :key="p.name" class="flex items-center gap-2.5">
            <span
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style="background: linear-gradient(135deg, hsl(var(--wr-lp-brand)), hsl(var(--wr-lp-accent)))"
              >{{ p.initials }}</span
            >
            <span class="w-24 shrink-0 truncate text-[11px] font-medium wr-t1">{{ p.name }}</span>
            <span class="relative h-4 flex-1 overflow-hidden rounded bg-black/[.05] dark:bg-white/[.06]">
              <span
                class="block h-full rounded"
                :style="{ width: (p.load / maxBar) * 100 + '%', background: loadTone(p.load) }"
              />
              <!-- 100% capacity marker -->
              <span
                class="absolute inset-y-0 w-px"
                :style="{ left: (100 / maxBar) * 100 + '%', background: 'hsl(var(--wr-lp-text) / .35)' }"
              />
            </span>
            <span class="w-9 shrink-0 text-right text-[11px] font-semibold tabular-nums" :style="{ color: loadTone(p.load) }">{{ p.load }}%</span>
            <span class="hidden w-24 shrink-0 text-[10.5px] wr-t3 lg:block">{{ loadLabel(p.load) }}</span>
          </div>
        </div>
        <p class="mt-3 shrink-0 text-[10.5px] wr-t3">Vertical rule marks 100% of contracted capacity.</p>
      </section>

      <!-- Distribution + the action this screen exists for -->
      <section class="flex min-h-0 flex-col gap-3">
        <div>
          <p class="mb-2 text-[11.5px] font-semibold wr-t1">Load by department</p>
          <div class="flex flex-col gap-2">
            <div v-for="d in DEMO_DEPARTMENTS" :key="d.name" class="flex items-center gap-2">
              <span class="w-20 shrink-0 truncate text-[10.5px] wr-t2">{{ d.name }}</span>
              <span class="h-2.5 flex-1 overflow-hidden rounded bg-black/[.05] dark:bg-white/[.06]">
                <span class="block h-full rounded" :style="{ width: d.load + '%', background: loadTone(d.load) }" />
              </span>
              <span class="w-8 shrink-0 text-right text-[10px] tabular-nums wr-t3">{{ d.load }}%</span>
            </div>
          </div>
        </div>

        <div
          class="rounded-lg border p-3"
          style="border-color: hsl(38 92% 50% / .4); background: hsl(38 92% 50% / .08)"
        >
          <p class="flex items-center gap-1.5 text-[11px] font-semibold" style="color: hsl(38 80% 38%)">
            <TriangleAlert class="h-3.5 w-3.5" /> 1 person over capacity
          </p>
          <p class="mt-1.5 text-[10.5px] leading-snug wr-t2">
            Maya Chen is at 112% with 9 active tasks. Design is the only department above 90%.
          </p>
          <p class="mt-2 flex items-center gap-1.5 text-[10.5px] font-medium" style="color: hsl(var(--wr-lp-brand))">
            Reassign 2 tasks to Sam Okoro <ArrowRight class="h-3 w-3" />
          </p>
        </div>

        <div class="wr-app-well mt-auto grid grid-cols-3 gap-2 rounded-lg border p-2.5 wr-line-soft">
          <span class="text-center leading-tight">
            <span class="block text-[16px] font-bold tabular-nums wr-t1">24</span>
            <span class="block text-[10.5px] wr-t3">Members</span>
          </span>
          <span class="text-center leading-tight">
            <span class="block text-[16px] font-bold tabular-nums wr-t1">73%</span>
            <span class="block text-[10.5px] wr-t3">Avg load</span>
          </span>
          <span class="text-center leading-tight">
            <span class="block text-[16px] font-bold tabular-nums wr-t1">32</span>
            <span class="block text-[10.5px] wr-t3">Open tasks</span>
          </span>
        </div>
      </section>
    </div>
  </div>
</template>
