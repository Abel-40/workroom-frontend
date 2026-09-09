<script setup lang="ts">
/**
 * Closing CTA. Spacious and typographic -- the largest type on the page after
 * the hero, and nothing else competing with the button.
 */
import { RouterLink } from "vue-router";
import { ArrowRight } from "lucide-vue-next";

const steps = [
  "Create your company and pick a sector",
  "Invite your first department",
  "Describe a project and let AI draft the plan",
];
</script>

<template>
  <section class="border-t wr-line">
    <div class="mx-auto max-w-[1560px] px-5 py-24 lg:px-10 lg:py-32">
      <div class="mx-auto max-w-3xl text-center">
        <h2
          class="text-[clamp(2rem,4.4vw,3.4rem)] font-bold leading-[1.06] tracking-[-0.025em] wr-t1"
          style="text-wrap: balance"
        >
          Start with one project.
        </h2>
        <p class="mx-auto mt-5 max-w-xl text-[16.5px] leading-relaxed wr-t2">
          Set up your company, invite the people who do the work, and see your first
          plan on a board within the hour.
        </p>

        <div class="mt-9 flex flex-wrap items-center justify-center gap-3">
          <RouterLink
            to="/auth/"
            class="inline-flex h-12 items-center gap-1.5 rounded-lg px-7 text-[15px] font-semibold text-white transition-transform hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style="
              background: linear-gradient(135deg, hsl(var(--wr-lp-brand)), hsl(var(--wr-lp-accent)));
              outline-color: hsl(var(--wr-lp-brand));
            "
          >
            Get started free <ArrowRight class="h-4 w-4" />
          </RouterLink>
          <RouterLink
            to="/auth/login/"
            class="inline-flex h-12 items-center rounded-lg border px-7 text-[15px] font-semibold wr-t1 wr-line transition-colors hover:bg-black/[.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:hover:bg-white/[.05]"
            style="outline-color: hsl(var(--wr-lp-brand))"
          >
            Log in
          </RouterLink>
        </div>

        <ol class="mx-auto mt-12 flex max-w-2xl flex-col gap-3 sm:flex-row sm:gap-8">
          <li v-for="(s, i) in steps" :key="s" class="flex flex-1 items-baseline gap-2.5 text-left">
            <span class="text-[11px] font-semibold tabular-nums" style="color: hsl(var(--wr-lp-brand))">{{ i + 1 }}</span>
            <span class="text-[13.5px] leading-snug wr-t2">{{ s }}</span>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>
