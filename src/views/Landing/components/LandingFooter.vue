<script setup lang="ts">
import { RouterLink } from "vue-router";

const groups = [
  { title: "Product", links: ["Walkthrough", "How it fits", "AI Workspace"] },
  { title: "Company", links: ["About", "Careers", "Contact"] },
  { title: "Legal", links: ["Privacy", "Terms", "Security"] },
];
const year = new Date().getFullYear();
</script>

<template>
  <footer class="border-t wr-line">
    <div class="mx-auto max-w-[1560px] px-5 py-14 lg:px-10">
      <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <RouterLink to="/" class="flex items-center gap-2">
            <span
              class="flex h-7 w-7 items-center justify-center rounded-lg text-[13px] font-bold text-white"
              style="background: linear-gradient(135deg, hsl(var(--wr-lp-brand)), hsl(var(--wr-lp-accent)))"
              >W</span
            >
            <span class="text-[15px] font-bold tracking-tight wr-t1">Workroom</span>
          </RouterLink>
          <p class="mt-3 max-w-xs text-[13px] leading-relaxed wr-t2">
            Projects, people, capacity and AI planning in one workspace.
          </p>
        </div>

        <div v-for="g in groups" :key="g.title">
          <p class="text-[11px] font-semibold uppercase tracking-[.14em] wr-t3">{{ g.title }}</p>
          <ul class="mt-3 flex flex-col gap-2">
            <li v-for="l in g.links" :key="l">
              <span class="text-[13.5px] wr-t2 transition-opacity hover:opacity-70">{{ l }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-12 flex flex-wrap items-center gap-3 border-t pt-6 wr-line">
        <p class="text-[12.5px] wr-t3">© {{ year }} Workroom. All rights reserved.</p>
        <span class="flex-1" />
        <RouterLink to="/auth/" class="text-[12.5px] font-semibold" style="color: hsl(var(--wr-lp-brand))">
          Get started free →
        </RouterLink>
      </div>
    </div>
  </footer>
</template>
