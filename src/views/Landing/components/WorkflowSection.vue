<script setup lang="ts">
import { ref } from "vue";
import { UserPlus, Building2, FolderPlus, Sparkles, KanbanSquare, LineChart } from "lucide-vue-next";
import { useRevealOnScroll } from "@/composables/useRevealOnScroll";

const root = ref<HTMLElement | null>(null);
useRevealOnScroll(root);

const steps = [
  { icon: UserPlus, title: "Create an account", description: "Sign up and set up your profile in under a minute." },
  { icon: Building2, title: "Set up your company", description: "Add departments, invite members, and assign roles." },
  { icon: FolderPlus, title: "Start a project", description: "Create a project and choose who can see it." },
  { icon: Sparkles, title: "Plan with AI or manually", description: "Generate a task breakdown with AI, or add tasks yourself." },
  { icon: KanbanSquare, title: "Execute on the board", description: "Assign, prioritize, and move tasks across your Kanban board." },
  { icon: LineChart, title: "Track progress", description: "Watch completion and activity roll up into real analytics." },
];
</script>

<template>
  <section id="workflow" ref="root" class="mx-auto max-w-[1280px] px-4 py-16 md:px-8 lg:py-24">
    <div data-reveal class="mx-auto max-w-2xl text-center">
      <p class="text-xs font-bold uppercase tracking-[.08em] text-primary-strong">How it works</p>
      <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">From idea to shipped work, in one loop</h2>
    </div>

    <div class="relative mt-14">
      <div class="absolute left-1/2 top-6 hidden h-px w-[calc(100%-8rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-slate-900/10 to-transparent lg:block" />
      <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-6 lg:gap-4">
        <div v-for="(step, i) in steps" :key="step.title" data-reveal class="relative text-center">
          <div class="relative z-10 mx-auto grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-[#3F8CFF] to-accent-2 text-white shadow-[0_8px_20px_rgba(63,140,255,0.35)]">
            <component :is="step.icon" class="h-5 w-5" />
          </div>
          <p class="mt-4 text-[11px] font-bold uppercase tracking-[.05em] text-primary-strong">Step {{ i + 1 }}</p>
          <h3 class="mt-1 text-sm font-bold text-ink">{{ step.title }}</h3>
          <p class="mt-1.5 text-xs leading-relaxed text-[#5B6472]">{{ step.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
