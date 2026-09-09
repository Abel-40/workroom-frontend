<script setup lang="ts">
// AI Planner -- "How can AI help me turn an idea into structured work?"
// The AI Workspace's Plan Creator. Follows the real flow from
// components/ai/AiPlanCreator.vue: select project, select assignees, set a
// task limit, describe the outcome; the generation carries an id and a
// lifecycle, and the result is a reviewable draft, not silent writes.
import { Sparkles, Check, CornerDownRight } from "lucide-vue-next";
import { DEMO_AI_PLAN } from "../demoWorkspace";
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden">
    <div class="flex shrink-0 items-center gap-2 border-b px-4 py-2.5 wr-line">
      <h3 class="text-[15px] font-bold tracking-tight wr-t1">AI Workspace</h3>
      <nav class="ml-3 flex gap-4 text-[11px]">
        <span class="border-b-2 pb-0.5 font-semibold" style="border-color: hsl(var(--wr-lp-brand)); color: hsl(var(--wr-lp-brand))">Plan Creator</span>
        <span class="pb-0.5 wr-t3">Assistant</span>
        <span class="pb-0.5 wr-t3">Health Check</span>
      </nav>
    </div>

    <div class="app-planner grid min-h-0 flex-1 overflow-hidden">
      <!-- Request side -->
      <aside class="wr-app-well flex min-h-0 flex-col gap-3 overflow-hidden border-r p-3.5 wr-line">
        <div class="flex flex-col gap-1">
          <span class="text-[10.5px] font-semibold uppercase tracking-wider wr-t3">1 — Select project</span>
          <span class="flex items-center gap-2 rounded-lg border px-2.5 py-2 wr-line-soft" style="background: hsl(var(--wr-lp-app))">
            <span class="text-[13px]">💳</span>
            <span class="text-[11.5px] font-semibold wr-t1">{{ DEMO_AI_PLAN.project }}</span>
          </span>
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-[10.5px] font-semibold uppercase tracking-wider wr-t3">2 — Select assignees</span>
          <span class="flex flex-wrap gap-1">
            <span
              v-for="a in ['MC', 'JL', 'SO', 'PN', 'NB']"
              :key="a"
              class="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style="background: linear-gradient(135deg, hsl(var(--wr-lp-brand)), hsl(var(--wr-lp-accent)))"
              >{{ a }}</span
            >
          </span>
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-[10.5px] font-semibold uppercase tracking-wider wr-t3">3 — Set task limit</span>
          <span class="flex items-center gap-2">
            <span class="h-1 flex-1 overflow-hidden rounded-full bg-black/[.08] dark:bg-white/10">
              <span class="block h-full w-1/2 rounded-full" style="background: hsl(var(--wr-lp-brand))" />
            </span>
            <span class="text-[11px] font-semibold tabular-nums wr-t1">{{ DEMO_AI_PLAN.taskLimit }}</span>
          </span>
        </div>

        <div class="flex min-h-0 flex-1 flex-col gap-1">
          <span class="text-[10.5px] font-semibold uppercase tracking-wider wr-t3">Describe the outcome</span>
          <p
            class="flex-1 rounded-lg border p-2.5 text-[11px] leading-relaxed wr-t2 wr-line-soft"
            style="background: hsl(var(--wr-lp-app))"
          >
            {{ DEMO_AI_PLAN.brief }}
          </p>
        </div>

        <span
          class="flex shrink-0 items-center justify-center gap-1.5 rounded-lg py-2 text-[11.5px] font-semibold text-white"
          style="background: linear-gradient(135deg, hsl(var(--wr-lp-brand)), hsl(var(--wr-lp-accent)))"
        >
          <Sparkles class="h-3.5 w-3.5" /> Generate plan
        </span>
      </aside>

      <!-- Generated plan -->
      <div class="flex min-h-0 flex-col overflow-hidden">
        <div class="flex shrink-0 flex-wrap items-center gap-2 px-4 py-2.5">
          <p class="text-[12.5px] font-semibold wr-t1">
            Generated plan
            <span class="font-normal wr-t3"
              >· {{ DEMO_AI_PLAN.project }} · {{ DEMO_AI_PLAN.tasks.length }} of
              {{ DEMO_AI_PLAN.tasks.length }} tasks · draft</span
            >
          </p>
          <span class="flex-1" />
          <span
            class="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide"
            style="background: hsl(152 55% 38% / .14); color: hsl(152 55% 34%)"
          >
            <Check class="h-2.5 w-2.5" /> {{ DEMO_AI_PLAN.status }}
          </span>
          <span class="text-[10.5px] tabular-nums wr-t3">{{ DEMO_AI_PLAN.generationId }} · {{ DEMO_AI_PLAN.durationSeconds }}s</span>
        </div>

        <div
          class="app-arow grid shrink-0 gap-2 border-y px-4 py-1.5 text-[10.5px] font-semibold uppercase tracking-wider wr-t3 wr-line"
        >
          <span>#</span><span>Task</span><span>Department</span><span>Task type</span><span>Effort</span><span>Owner</span>
        </div>

        <div class="min-h-0 flex-1 overflow-hidden">
          <div
            v-for="t in DEMO_AI_PLAN.tasks"
            :key="t.seq"
            class="app-arow grid items-center gap-2 border-b px-4 py-2.5 wr-line-soft"
          >
            <span class="text-[10.5px] font-semibold tabular-nums wr-t3">{{ t.seq }}</span>
            <span class="min-w-0">
              <span class="block truncate text-[11.5px] font-medium wr-t1">{{ t.name }}</span>
              <span v-if="t.dependsOn" class="flex items-center gap-1 text-[10.5px] wr-t3">
                <CornerDownRight class="h-2.5 w-2.5" /> depends on {{ t.dependsOn }}
              </span>
            </span>
            <span class="truncate text-[10.5px] wr-t2">{{ t.department }}</span>
            <span class="truncate text-[10.5px] wr-t2">{{ t.type }}</span>
            <span class="text-[10.5px] tabular-nums wr-t2">{{ t.effort }}</span>
            <span
              class="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style="background: linear-gradient(135deg, hsl(var(--wr-lp-brand)), hsl(var(--wr-lp-accent)))"
              >{{ t.assignee }}</span
            >
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-2 border-t px-4 py-2.5 wr-line">
          <p class="text-[10.5px] wr-t3">Review before saving — nothing is written to the project until you approve.</p>
          <span class="flex-1" />
          <span class="rounded-md border px-2.5 py-1 text-[10.5px] font-medium wr-t2 wr-line">Request changes</span>
          <span
            class="rounded-md px-2.5 py-1 text-[10.5px] font-semibold text-white"
            style="background: linear-gradient(135deg, hsl(var(--wr-lp-brand)), hsl(var(--wr-lp-accent)))"
            >Save 6 tasks</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
