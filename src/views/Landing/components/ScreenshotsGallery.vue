<script setup lang="ts">
import { ref } from "vue";
import { useRevealOnScroll } from "@/composables/useRevealOnScroll";

import dashboard from "@/assets/landing/screenshots/dashboard.jpg";
import kanbanBoard from "@/assets/landing/screenshots/kanban-board.jpeg";
import projectDetail from "@/assets/landing/screenshots/project-detail.jpeg";
import calendar from "@/assets/landing/screenshots/calendar.jpeg";
import events from "@/assets/landing/screenshots/events.jpeg";
import documentHub from "@/assets/landing/screenshots/document-hub.jpeg";
import teamDirectory from "@/assets/landing/screenshots/team-directory.jpeg";
import profile from "@/assets/landing/screenshots/profile.jpg";

const root = ref<HTMLElement | null>(null);
useRevealOnScroll(root);

const screens = [
  { src: dashboard, title: "Dashboard", description: "A role-scoped overview of workload, projects, and activity." },
  { src: kanbanBoard, title: "Kanban board", description: "Drag tasks across To Do, In Progress, Review, and Done." },
  { src: projectDetail, title: "Project & task detail", description: "Full context on a task — assignee, priority, time, activity." },
  { src: calendar, title: "Calendar", description: "Every deadline and event mapped against your month." },
  { src: events, title: "Events", description: "Company and department events, organized in one place." },
  { src: documentHub, title: "Document hub", description: "Project documents, links, and files kept alongside the work." },
  { src: teamDirectory, title: "Team directory", description: "See who's on the team, their role, and their department." },
  { src: profile, title: "Profile & workload", description: "A member's own projects and standing at a glance." },
];
</script>

<template>
  <section id="screenshots" ref="root" class="mx-auto max-w-[1280px] px-4 py-16 md:px-8 lg:py-24">
    <div data-reveal class="mx-auto max-w-2xl text-center">
      <p class="text-xs font-bold uppercase tracking-[.08em] text-primary-strong">Take a look inside</p>
      <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Built for the way teams actually work</h2>
    </div>

    <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <figure
        v-for="screen in screens"
        :key="screen.title"
        data-reveal
        class="group overflow-hidden rounded-2xl border border-white/50 bg-white/40 shadow-[0_10px_30px_rgba(10,22,41,0.07)] transition-transform duration-300 hover:-translate-y-1.5"
      >
        <div class="flex items-center gap-1.5 border-b border-white/50 bg-white/50 px-3 py-2">
          <span class="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
          <span class="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span class="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        </div>
        <div class="aspect-[4/3] overflow-hidden bg-white">
          <img
            :src="screen.src"
            :alt="screen.title"
            loading="lazy"
            class="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <figcaption class="p-4">
          <p class="text-sm font-bold text-ink">{{ screen.title }}</p>
          <p class="mt-1 text-xs leading-relaxed text-[#5B6472]">{{ screen.description }}</p>
        </figcaption>
      </figure>
    </div>
  </section>
</template>
