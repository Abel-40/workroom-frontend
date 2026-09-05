<script setup lang="ts">
/**
 * Hero. Its job is comprehension, not spectacle: what Workroom is, who runs
 * it, why it beats the tools it replaces -- then a product visual big enough
 * to create curiosity. Asymmetric by design so it doesn't read as the
 * centred-headline-over-screenshot template.
 */
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { ArrowRight } from "lucide-vue-next";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import AppFrame from "../product/AppFrame.vue";
import ScreenDashboard from "../product/screens/ScreenDashboard.vue";

const copy = ref<HTMLElement | null>(null);
const visual = ref<HTMLElement | null>(null);

onMounted(() => {
  if (prefersReducedMotion() || !copy.value) return;
  // One short entrance, from a visible resting state -- nothing is parked at
  // opacity 0 waiting on the observer.
  gsap.from(copy.value.children, {
    opacity: 0,
    y: 18,
    duration: 0.6,
    stagger: 0.07,
    ease: "power3.out",
  });
  gsap.from(visual.value, { opacity: 0, y: 26, duration: 0.8, delay: 0.15, ease: "power3.out" });
});
</script>

<template>
  <section class="relative overflow-hidden">
    <div class="mx-auto max-w-[1560px] px-5 pb-0 pt-14 lg:px-10 lg:pt-24">
      <div class="grid items-end gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,10fr)] lg:gap-12">
        <!-- Copy -->
        <div ref="copy" class="max-w-xl pb-2 lg:pb-10">
          <p class="text-[11px] font-semibold uppercase tracking-[.16em]" style="color: hsl(var(--wr-lp-brand))">
            Work management for growing companies
          </p>

          <h1
            class="mt-4 text-[clamp(2.4rem,5.2vw,4.1rem)] font-bold leading-[1.02] tracking-[-0.028em] wr-t1"
            style="text-wrap: balance"
          >
            Every project, person and plan in one workspace.
          </h1>

          <p class="mt-5 max-w-lg text-[17px] leading-relaxed wr-t2">
            Workroom gives company and department leaders a single place to organize
            projects, assign work across teams, see who has capacity, and let AI turn a
            brief into a structured plan the team can actually run.
          </p>

          <div class="mt-8 flex flex-wrap items-center gap-3">
            <RouterLink
              to="/auth/"
              class="inline-flex h-11 items-center gap-1.5 rounded-lg px-6 text-[14px] font-semibold text-white transition-transform hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style="
                background: linear-gradient(135deg, hsl(var(--wr-lp-brand)), hsl(var(--wr-lp-accent)));
                outline-color: hsl(var(--wr-lp-brand));
              "
            >
              Get started free <ArrowRight class="h-4 w-4" />
            </RouterLink>
            <a
              href="#walkthrough"
              class="inline-flex h-11 items-center rounded-lg border px-6 text-[14px] font-semibold wr-t1 wr-line transition-colors hover:bg-black/[.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:hover:bg-white/[.05]"
              style="outline-color: hsl(var(--wr-lp-brand))"
            >
              See inside Workroom
            </a>
          </div>

          <p class="mt-5 text-[12.5px] wr-t3">
            Free while you set up your company · No card required
          </p>
        </div>

        <!-- Product visual: given the larger half of the grid so the app, not
             the copy, is the thing the eye lands on. Kept whole -- an earlier
             right-edge bleed cut the activity stream mid-sentence. -->
        <div ref="visual" class="relative">
          <div class="wr-hero-frame">
            <AppFrame active="dashboard">
              <ScreenDashboard />
            </AppFrame>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.wr-hero-frame {
  height: clamp(360px, 60vh, 660px);
}
.wr-hero-frame :deep(.wr-app) {
  height: 100%;
}

@media (min-width: 1024px) {
  .wr-hero-frame {
    height: clamp(470px, 72vh, 780px);
  }
}
</style>
