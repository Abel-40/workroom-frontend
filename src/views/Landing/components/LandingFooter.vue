<script setup lang="ts">
import { RouterLink } from "vue-router";
import WorkroomMark from "@/components/shared/WorkroomMark.vue";

const year = new Date().getFullYear();

type FooterLink = { label: string; href?: string; to?: string };

const columns: Array<{ heading: string; links: FooterLink[] }> = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#workflow" },
      { label: "Screenshots", href: "#screenshots" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Log in", to: "/auth/login/" },
      { label: "Create a company", to: "/auth/" },
    ],
  },
];
</script>

<template>
  <footer class="border-t border-white/50 bg-white/40">
    <div class="mx-auto max-w-[1280px] px-4 py-12 md:px-8">
      <div class="grid gap-10 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div class="flex items-center gap-2">
            <WorkroomMark class="h-8 w-8" />
            <span class="text-lg font-extrabold tracking-tight text-ink">Workroom</span>
          </div>
          <p class="mt-3 max-w-xs text-sm leading-relaxed text-[#5B6472]">
            AI-assisted work management for teams &mdash; companies, projects, tasks, and execution in one workspace.
          </p>
        </div>

        <div v-for="column in columns" :key="column.heading">
          <p class="text-xs font-bold uppercase tracking-[.06em] text-[#9AA3B5]">{{ column.heading }}</p>
          <ul class="mt-3 space-y-2.5">
            <li v-for="link in column.links" :key="link.label">
              <a v-if="link.href" :href="link.href" class="text-sm text-[#5B6472] transition hover:text-ink">{{ link.label }}</a>
              <RouterLink v-else :to="link.to!" class="text-sm text-[#5B6472] transition hover:text-ink">{{ link.label }}</RouterLink>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-10 border-t border-white/50 pt-6 text-xs text-[#9AA3B5]">
        &copy; {{ year }} Workroom. All rights reserved.
      </div>
    </div>
  </footer>
</template>
