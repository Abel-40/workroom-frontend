<script setup lang="ts">
// AI Assistant -- "How can I work with an intelligent assistant inside my
// workspace?" Uses the real panel's vocabulary: sources attached, pages used,
// and an answer grounded in this company's own project data rather than a
// generic chat bubble.
import { Sparkles, FileText, ArrowRight, Activity } from "lucide-vue-next";
import { DEMO_AI_THREAD, DEMO_AI_HEALTH } from "../demoWorkspace";
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden">
    <div class="flex shrink-0 items-center gap-2 border-b px-4 py-2.5 wr-line">
      <h3 class="text-[15px] font-bold tracking-tight wr-t1">AI Workspace</h3>
      <nav class="ml-3 flex gap-4 text-[11px]">
        <span class="pb-0.5 wr-t3">Plan Creator</span>
        <span class="border-b-2 pb-0.5 font-semibold" style="border-color: hsl(var(--wr-lp-brand)); color: hsl(var(--wr-lp-brand))">Assistant</span>
        <span class="pb-0.5 wr-t3">Health Check</span>
      </nav>
      <span class="flex-1" />
      <span class="rounded-md border px-2 py-1 text-[10.5px] wr-t2 wr-line">{{ DEMO_AI_THREAD.project }}</span>
    </div>

    <div class="app-assist grid min-h-0 flex-1 overflow-hidden">
      <!-- Conversation -->
      <div class="flex min-h-0 flex-col gap-3 overflow-hidden p-4">
        <!-- Question -->
        <div class="flex justify-end">
          <p
            class="max-w-[78%] rounded-2xl rounded-br-md px-3.5 py-2.5 text-[11.5px] leading-relaxed text-white"
            style="background: linear-gradient(135deg, hsl(var(--wr-lp-brand)), hsl(var(--wr-lp-accent)))"
          >
            {{ DEMO_AI_THREAD.question }}
          </p>
        </div>

        <!-- Answer -->
        <div class="flex min-h-0 gap-2.5">
          <span
            class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
            style="background: hsl(var(--wr-lp-brand) / .14)"
          >
            <Sparkles class="h-3.5 w-3.5" style="color: hsl(var(--wr-lp-brand))" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-[10px] font-semibold uppercase tracking-wider wr-t3">AI response</p>
            <p class="mt-1.5 text-[12px] leading-relaxed wr-t1">{{ DEMO_AI_THREAD.answer }}</p>

            <!-- Referenced work, linked back into the product -->
            <div class="mt-3 flex flex-col gap-1.5">
              <div
                v-for="t in [
                  { id: 'WR-401', name: 'Fix checkout validation on retry', who: 'JL', state: 'Overdue 2d', tone: 'hsl(353 74% 55%)' },
                  { id: 'WR-388', name: 'Saved-card selection UI', who: 'SO', state: 'In Review', tone: 'hsl(38 92% 45%)' },
                  { id: 'WR-371', name: 'Regression pass on payments', who: 'PN', state: 'Blocked', tone: 'hsl(218 11% 55%)' },
                ]"
                :key="t.id"
                class="wr-app-well flex items-center gap-2 rounded-lg border px-2.5 py-1.5 wr-line-soft"
              >
                <span class="h-1.5 w-1.5 shrink-0 rounded-full" :style="{ background: t.tone }" />
                <span class="text-[10px] font-semibold tabular-nums wr-t3">{{ t.id }}</span>
                <span class="min-w-0 flex-1 truncate text-[11px] wr-t1">{{ t.name }}</span>
                <span class="shrink-0 text-[10.5px] font-medium" :style="{ color: t.tone }">{{ t.state }}</span>
                <span
                  class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style="background: linear-gradient(135deg, hsl(var(--wr-lp-brand)), hsl(var(--wr-lp-accent)))"
                  >{{ t.who }}</span
                >
              </div>
            </div>

            <div
              class="mt-3 rounded-lg border p-2.5"
              style="border-color: hsl(var(--wr-lp-brand) / .35); background: hsl(var(--wr-lp-brand) / .07)"
            >
              <p class="text-[11px] leading-snug wr-t1">{{ DEMO_AI_THREAD.suggestion }}</p>
              <p class="mt-1.5 flex items-center gap-1 text-[10.5px] font-semibold" style="color: hsl(var(--wr-lp-brand))">
                Reassign WR-412 <ArrowRight class="h-3 w-3" />
              </p>
            </div>
          </div>
        </div>

        <div class="mt-auto flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2.5 wr-line">
          <span class="flex-1 text-[11px] wr-t3">Ask about these pages…</span>
          <span
            class="flex h-6 w-6 items-center justify-center rounded-lg text-white"
            style="background: linear-gradient(135deg, hsl(var(--wr-lp-brand)), hsl(var(--wr-lp-accent)))"
          >
            <ArrowRight class="h-3 w-3" />
          </span>
        </div>
      </div>

      <!-- Sources + health check -->
      <aside class="app-aside wr-app-well flex min-h-0 flex-col gap-3 overflow-hidden border-l p-3 wr-line">
        <div>
          <p class="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wider wr-t3">Pages used</p>
          <div class="flex flex-col gap-1">
            <span
              v-for="p in DEMO_AI_THREAD.pagesUsed"
              :key="p"
              class="flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-[10.5px] wr-t2 wr-line-soft"
              style="background: hsl(var(--wr-lp-app))"
            >
              <FileText class="h-3 w-3 shrink-0 wr-t3" />
              <span class="truncate">{{ p }}</span>
            </span>
          </div>
        </div>

        <div class="border-t pt-3 wr-line-soft">
          <p class="mb-2 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider wr-t3">
            <Activity class="h-3 w-3" /> Health check report
          </p>
          <div class="flex items-baseline gap-1.5">
            <span class="text-[26px] font-bold leading-none tabular-nums wr-t1">{{ DEMO_AI_HEALTH.score }}</span>
            <span class="text-[10.5px] font-medium" style="color: hsl(38 80% 42%)">{{ DEMO_AI_HEALTH.label }}</span>
          </div>
          <div class="mt-2 flex h-1.5 overflow-hidden rounded-full bg-black/[.07] dark:bg-white/10">
            <span class="block h-full" :style="{ width: DEMO_AI_HEALTH.score + '%', background: 'hsl(38 92% 50%)' }" />
          </div>
          <div class="mt-2.5 grid grid-cols-3 gap-1 text-center">
            <span class="leading-tight">
              <span class="block text-[12px] font-bold tabular-nums wr-t1">{{ DEMO_AI_HEALTH.completed }}</span>
              <span class="block text-[10px] wr-t3">Completed</span>
            </span>
            <span class="leading-tight">
              <span class="block text-[12px] font-bold tabular-nums wr-t1">{{ DEMO_AI_HEALTH.inProgress }}</span>
              <span class="block text-[10px] wr-t3">In progress</span>
            </span>
            <span class="leading-tight">
              <span class="block text-[12px] font-bold tabular-nums" style="color: hsl(353 74% 55%)">{{ DEMO_AI_HEALTH.overdue }}</span>
              <span class="block text-[10px] wr-t3">Overdue</span>
            </span>
          </div>
          <p class="mt-2.5 text-[10px] leading-snug wr-t2">
            <span class="font-semibold wr-t1">AI Insight · </span>{{ DEMO_AI_HEALTH.insight }}
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>
