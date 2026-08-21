<script setup lang="ts">
// Three-capability explainer shown before any project context is set --
// replaces the old plain "Select a project…" dashed box.
import { HeartPulse, MessageSquare, Sparkles } from "lucide-vue-next";
import type { AiMode } from "@/components/ai/AiModeSwitcher.vue";

defineEmits<{ (e: "choose", mode: AiMode): void }>();

const CAPABILITIES: { mode: AiMode; icon: typeof Sparkles; title: string; description: string }[] = [
  { mode: "plan", icon: Sparkles, title: "Plan", description: "Turn a project idea into an actionable task plan." },
  { mode: "assistant", icon: MessageSquare, title: "Assist", description: "Work with your project using an AI assistant." },
  { mode: "health", icon: HeartPulse, title: "Health", description: "Understand what's happening in your project and spot potential problems." },
];
</script>

<template>
  <div class="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
    <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-500 text-white shadow-md shadow-primary/20">
      <Sparkles class="h-6 w-6" />
    </span>
    <h3 class="mt-4 text-base font-semibold text-ink">Pick a project to get started</h3>
    <p class="mx-auto mt-1 max-w-sm text-sm text-subtle">
      Choose a project above, or switch to Plan Creator and mention one with <span class="font-mono text-xs text-ink">@</span> instead.
    </p>

    <div class="mt-6 grid gap-3 sm:grid-cols-3">
      <button
        v-for="cap in CAPABILITIES"
        :key="cap.mode"
        type="button"
        class="group flex flex-col items-start gap-2 rounded-xl border border-gray-100 bg-page/40 p-4 text-left transition hover:border-primary/40 hover:bg-white hover:shadow-md"
        @click="$emit('choose', cap.mode)"
      >
        <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-primary shadow-sm transition group-hover:scale-105">
          <component :is="cap.icon" class="h-4 w-4" />
        </span>
        <span class="text-sm font-semibold text-ink">{{ cap.title }}</span>
        <span class="text-xs leading-relaxed text-subtle">{{ cap.description }}</span>
      </button>
    </div>
  </div>
</template>
