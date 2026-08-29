<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { Sparkles, ArrowRight } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import RoleDashboardPreview from "./RoleDashboardPreview.vue";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const badge = ref<HTMLElement | null>(null);
const heading = ref<HTMLElement | null>(null);
const copy = ref<HTMLElement | null>(null);
const ctas = ref<HTMLElement | null>(null);
const preview = ref<HTMLElement | null>(null);

onMounted(() => {
  if (prefersReducedMotion()) return;
  gsap
    .timeline({ defaults: { ease: "power3.out" } })
    .from(badge.value, { opacity: 0, y: 16, duration: 0.5 })
    .from(heading.value, { opacity: 0, y: 24, duration: 0.7 }, "-=0.3")
    .from(copy.value, { opacity: 0, y: 20, duration: 0.6 }, "-=0.4")
    .from(ctas.value, { opacity: 0, y: 16, duration: 0.5 }, "-=0.35")
    .from(preview.value, { opacity: 0, y: 32, scale: 0.97, duration: 0.8 }, "-=0.6");
});
</script>

<template>
  <section class="relative overflow-hidden pb-16 pt-14 sm:pt-20 lg:pb-24 lg:pt-24">
    <div class="mx-auto grid max-w-[1280px] items-center gap-12 px-4 md:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
      <div>
        <div ref="badge" class="inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-1.5 text-xs font-bold uppercase tracking-[.04em] text-primary-strong">
          <Sparkles class="h-3.5 w-3.5" /> AI-powered work management
        </div>

        <h1 ref="heading" class="mt-5 text-[40px] font-extrabold leading-[1.08] tracking-tight text-ink sm:text-[52px] lg:text-[58px]">
          Plan smarter.
          <br />
          <span class="bg-gradient-to-r from-[#3F8CFF] to-accent-2 bg-clip-text text-transparent">Execute faster.</span>
        </h1>

        <p ref="copy" class="mt-6 max-w-xl text-base leading-relaxed text-[#5B6472] sm:text-lg">
          Workroom brings your company, projects, and tasks into one workspace &mdash; then lets AI turn a
          project brief into a structured, ready-to-run task plan your team can execute on a Kanban board.
        </p>

        <div ref="ctas" class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button as-child size="lg" class="h-12 bg-gradient-to-br from-[#3F8CFF] to-accent-2 px-7 text-white shadow-[0_10px_28px_rgba(63,140,255,0.38)] hover:shadow-lg">
            <RouterLink to="/auth/">
              Get started free <ArrowRight class="ml-1.5 h-4 w-4" />
            </RouterLink>
          </Button>
          <a
            href="#screenshots"
            class="inline-flex h-12 items-center justify-center rounded-lg border border-slate-900/10 bg-white/60 px-7 text-sm font-semibold text-ink transition hover:bg-white/90"
          >
            See it in action
          </a>
        </div>
      </div>

      <div ref="preview" class="mx-auto w-full max-w-[440px] lg:max-w-none">
        <RoleDashboardPreview />
      </div>
    </div>
  </section>
</template>
