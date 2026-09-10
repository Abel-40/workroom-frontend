<script setup lang="ts">
// Static counterpart of AiAssistantPanel: conversation, sources, actions,
// project context, composer, and history. No AI store or network request is
// used on the public landing page.
import { computed } from "vue";
import { Copy, FileText, Link2, MoreVertical, Save, Send, Sparkles } from "lucide-vue-next";
import { DEMO_AI_THREAD, DEMO_TASKS } from "../demoWorkspace";

const referencedTasks = computed(() => DEMO_TASKS.filter((task) => ["WR-401", "WR-388", "WR-371"].includes(task.id)));
</script>

<template>
  <div class="flex h-full min-h-0 gap-3 overflow-hidden p-3">
    <div class="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border p-3 wr-app-well wr-line-soft">
      <div class="flex shrink-0 items-center justify-between border-b pb-2.5 wr-line-soft"><div><p class="text-[12px] font-semibold wr-t1">Assistant</p><p class="text-[9.5px] wr-t3">Grounded in {{ DEMO_AI_THREAD.project }}</p></div><span class="rounded-xl border px-2 py-1 text-[9.5px] wr-t2 wr-line">Select project⌄</span></div>
      <div class="min-h-0 flex-1 space-y-3 overflow-hidden py-3">
        <div class="flex justify-end"><p class="max-w-[80%] rounded-2xl rounded-br-md px-3 py-2.5 text-[10.5px] leading-relaxed text-white" style="background: linear-gradient(135deg, hsl(var(--wr-lp-brand)), hsl(var(--wr-lp-accent)))">{{ DEMO_AI_THREAD.question }}</p></div>
        <div class="flex gap-2"><span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg" style="background: hsl(var(--wr-lp-brand) / .12)"><Sparkles class="h-3 w-3" style="color: hsl(var(--wr-lp-brand))" /></span><div class="min-w-0 flex-1"><div class="mb-1 flex items-center gap-2"><span class="rounded-md bg-black/[.05] px-1.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-wide" style="color: hsl(var(--wr-lp-brand))">AI response</span><span class="text-[9px] wr-t3">Generated from 3 selected pages</span></div><p class="text-[10.5px] leading-relaxed wr-t1">{{ DEMO_AI_THREAD.answer }}</p><div class="mt-2 flex flex-wrap gap-1.5"><span v-for="task in referencedTasks" :key="task.id" class="flex items-center gap-1 rounded-lg border px-2 py-1 text-[9px] wr-line-soft"><span class="font-mono wr-t3">{{ task.id }}</span><span class="max-w-[120px] truncate wr-t1">{{ task.name }}</span><span class="h-1.5 w-1.5 rounded-full" :style="{ background: task.status === 'In Review' ? 'hsl(38 92% 45%)' : task.status === 'Done' ? 'hsl(152 55% 38%)' : 'hsl(353 74% 55%)' }" /></span></div><div class="mt-2 flex flex-wrap gap-1.5"><span class="flex items-center gap-1 rounded-lg border px-2 py-1 text-[9px] font-medium" style="border-color: hsl(var(--wr-lp-brand) / .25); color: hsl(var(--wr-lp-brand))"><Sparkles class="h-2.5 w-2.5" /> Generate a plan for this</span><span class="flex items-center gap-1 rounded-lg border px-2 py-1 text-[9px] wr-t3 wr-line"><Copy class="h-2.5 w-2.5" /> Copy</span><span class="flex items-center gap-1 rounded-lg border px-2 py-1 text-[9px] wr-t3 wr-line"><Save class="h-2.5 w-2.5" /> Save as page</span></div></div></div>
      </div>
      <div class="flex shrink-0 items-center gap-2 border-t pt-2.5 wr-line-soft"><span class="rounded-xl border px-2 py-1 text-[9px] wr-t3 wr-line">Plan Creator⌄</span><div class="flex min-w-0 flex-1 items-center gap-2 rounded-full border px-3 py-1.5 wr-line"><span class="min-w-0 flex-1 truncate text-[9.5px] wr-t3">Ask about these pages…</span><Send class="h-3 w-3" style="color: hsl(var(--wr-lp-brand))" /></div><span class="flex h-6 w-6 items-center justify-center rounded-full border wr-line"><Link2 class="h-3 w-3 wr-t3" /></span><span class="hidden items-center gap-1 rounded-full border px-2 py-1 text-[9px] wr-t3 sm:flex wr-line"><FileText class="h-2.5 w-2.5" /> Select page</span></div>
    </div>

    <aside class="app-aside flex w-[190px] shrink-0 flex-col rounded-2xl border p-2.5 shadow-sm wr-line-soft" style="background: hsl(var(--wr-lp-app) / .72)"><p class="mb-2 px-1 text-[9.5px] font-semibold uppercase tracking-wider wr-t3">History</p><div class="space-y-1.5"><div class="group relative rounded-xl px-2.5 py-2" style="background: hsl(var(--wr-lp-brand) / .08)"><p class="pr-4 text-[9.5px] font-medium leading-snug wr-t1">{{ DEMO_AI_THREAD.question }}</p><p class="mt-1 text-[8.5px] wr-t3">Just now</p><MoreVertical class="absolute right-1.5 top-2 h-3 w-3 wr-t3" /></div><div class="rounded-xl px-2.5 py-2 wr-app-well"><p class="text-[9.5px] font-medium wr-t1">Where is the rollout risk?</p><p class="mt-1 text-[8.5px] wr-t3">Yesterday</p></div></div><div class="mt-auto border-t pt-3 wr-line-soft"><p class="mb-1.5 text-[9.5px] font-semibold uppercase tracking-wider wr-t3">Sources &amp; links</p><div v-for="page in DEMO_AI_THREAD.pagesUsed" :key="page" class="flex items-center gap-1.5 py-1 text-[9px] wr-t2"><Link2 class="h-2.5 w-2.5 shrink-0 wr-t3" /><span class="truncate">{{ page }}</span></div></div></aside>
  </div>
</template>
