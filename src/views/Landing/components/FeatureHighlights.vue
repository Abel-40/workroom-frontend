<script setup lang="ts">
import { ref } from "vue";
import { Sparkles, Users, KanbanSquare, BarChart3 } from "lucide-vue-next";
import { useRevealOnScroll } from "@/composables/useRevealOnScroll";

const root = ref<HTMLElement | null>(null);
useRevealOnScroll(root);

const features = [
  {
    icon: Sparkles,
    title: "AI project decomposition",
    description: "Describe a project and get a structured, reviewable task plan back in seconds — not a blank page.",
  },
  {
    icon: Users,
    title: "Company workspaces & roles",
    description: "Departments, teams, and permissions built in, so members only ever see what they're meant to.",
  },
  {
    icon: KanbanSquare,
    title: "Kanban execution",
    description: "Move approved tasks onto a board, track status and priority, and keep deadlines visible.",
  },
  {
    icon: BarChart3,
    title: "Progress analytics",
    description: "See project completion and team activity at a glance, without digging through spreadsheets.",
  },
];
</script>

<template>
  <section id="features" ref="root" class="mx-auto max-w-[1280px] px-4 py-16 md:px-8 lg:py-24">
    <div data-reveal class="mx-auto max-w-2xl text-center">
      <p class="text-xs font-bold uppercase tracking-[.08em] text-primary-strong">Why Workroom</p>
      <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Everything a team needs to plan and ship work</h2>
    </div>

    <div class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="feature in features"
        :key="feature.title"
        data-reveal
        class="wr-glass rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1"
      >
        <div class="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#3F8CFF] to-accent-2 text-white shadow-[0_8px_20px_rgba(63,140,255,0.35)]">
          <component :is="feature.icon" class="h-5 w-5" />
        </div>
        <h3 class="mt-4 text-base font-bold text-ink">{{ feature.title }}</h3>
        <p class="mt-2 text-sm leading-relaxed text-[#5B6472]">{{ feature.description }}</p>
      </div>
    </div>
  </section>
</template>
