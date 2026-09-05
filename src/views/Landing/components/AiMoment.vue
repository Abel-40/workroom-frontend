<script setup lang="ts">
/**
 * The AI claim, shown as a transformation rather than described as a feature:
 * the sentence a manager types on the left, the structured, sequenced,
 * assigned work that comes back on the right.
 *
 * Composition is deliberately unlike the rest of the page -- an inverted
 * stage, two unequal columns, no app chrome -- so the AI moment reads as the
 * page's second peak rather than another section.
 */
import { DEMO_AI_PLAN } from "../product/demoWorkspace";
</script>

<template>
  <section id="ai" class="wr-ai-stage border-t wr-line">
    <div class="mx-auto max-w-[1560px] px-5 py-20 lg:px-10 lg:py-28">
      <div class="max-w-2xl">
        <p class="text-[11px] font-semibold uppercase tracking-[.16em]" style="color: hsl(var(--wr-lp-brand))">
          AI Workspace
        </p>
        <h2
          class="mt-3 text-[clamp(1.8rem,3.4vw,2.8rem)] font-bold leading-[1.08] tracking-[-0.022em] wr-t1"
          style="text-wrap: balance"
        >
          Describe the outcome. Get work your team can be assigned.
        </h2>
        <p class="mt-4 text-[15.5px] leading-relaxed wr-t2">
          Workroom's planner returns a reviewable draft — sequenced, estimated,
          routed to the right department, with dependencies intact. Nothing is
          written to the project until someone approves it.
        </p>
      </div>

      <div class="mt-12 grid gap-6 lg:grid-cols-[minmax(0,4fr)_auto_minmax(0,7fr)] lg:items-start lg:gap-8">
        <!-- The brief -->
        <div>
          <p class="mb-2.5 text-[10.5px] font-semibold uppercase tracking-[.14em] wr-t3">You write</p>
          <blockquote
            class="rounded-xl border p-5 text-[15px] leading-relaxed wr-t1 wr-line"
            style="background: hsl(var(--wr-lp-app))"
          >
            “{{ DEMO_AI_PLAN.brief }}”
          </blockquote>
          <p class="mt-3 text-[12px] wr-t3">
            Project · {{ DEMO_AI_PLAN.project }} &nbsp;·&nbsp; Task limit · {{ DEMO_AI_PLAN.taskLimit }}
          </p>
        </div>

        <!-- Connector -->
        <div class="hidden self-center lg:block" aria-hidden="true">
          <span class="block text-[22px]" style="color: hsl(var(--wr-lp-brand))">→</span>
        </div>

        <!-- The plan -->
        <div>
          <p class="mb-2.5 flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[.14em] wr-t3">
            Workroom returns
            <span class="rounded-full px-1.5 py-0.5 text-[9.5px] tabular-nums" style="background: hsl(var(--wr-lp-brand) / .14); color: hsl(var(--wr-lp-brand))">
              {{ DEMO_AI_PLAN.durationSeconds }}s
            </span>
          </p>
          <ol class="flex flex-col rounded-xl border wr-line" style="background: hsl(var(--wr-lp-app))">
            <li
              v-for="t in DEMO_AI_PLAN.tasks"
              :key="t.seq"
              class="grid grid-cols-[22px_1fr_auto] items-center gap-3 border-b px-4 py-3 last:border-b-0 wr-line-soft"
            >
              <span class="text-[11px] font-semibold tabular-nums wr-t3">{{ t.seq }}</span>
              <span class="min-w-0">
                <span class="block truncate text-[14px] font-medium wr-t1">{{ t.name }}</span>
                <span class="block text-[11.5px] wr-t3">
                  {{ t.department }} · {{ t.type }} · {{ t.effort }}
                  <template v-if="t.dependsOn"> · after {{ t.dependsOn }}</template>
                </span>
              </span>
              <span
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                style="background: linear-gradient(135deg, hsl(var(--wr-lp-brand)), hsl(var(--wr-lp-accent)))"
                >{{ t.assignee }}</span
              >
            </li>
          </ol>
        </div>
      </div>

      <!-- The other two AI surfaces, named without becoming three more cards -->
      <div class="mt-14 grid gap-8 border-t pt-10 wr-line sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p class="text-[14.5px] font-semibold wr-t1">Assistant</p>
          <p class="mt-1.5 text-[13.5px] leading-relaxed wr-t2">
            Answers questions about your own projects and cites the pages it used.
          </p>
        </div>
        <div>
          <p class="text-[14.5px] font-semibold wr-t1">Health Check</p>
          <p class="mt-1.5 text-[13.5px] leading-relaxed wr-t2">
            Scores a project's delivery risk and names where it's concentrated.
          </p>
        </div>
        <div>
          <p class="text-[14.5px] font-semibold wr-t1">Always reviewable</p>
          <p class="mt-1.5 text-[13.5px] leading-relaxed wr-t2">
            Every generation is traceable — status, model, timing, and who requested it.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* A distinct ground so the AI moment separates from the sections either
   side, in both themes, without another gradient blob. */
.wr-ai-stage {
  background: hsl(var(--wr-lp-stage));
}
</style>
