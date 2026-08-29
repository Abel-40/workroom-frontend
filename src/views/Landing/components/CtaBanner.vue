<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { ArrowRight } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { useRevealOnScroll } from "@/composables/useRevealOnScroll";

const root = ref<HTMLElement | null>(null);
useRevealOnScroll(root);
</script>

<template>
  <section ref="root" class="mx-auto max-w-[1280px] px-4 pb-16 md:px-8 lg:pb-24">
    <div
      data-reveal
      class="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#3F8CFF] to-accent-2 px-8 py-14 text-center shadow-[0_30px_70px_-20px_rgba(63,140,255,0.55)] sm:px-16"
    >
      <div class="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      <div class="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

      <h2 class="relative text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Ready to plan smarter?</h2>
      <p class="relative mx-auto mt-3 max-w-lg text-sm text-white/85 sm:text-base">
        Create your company workspace and turn your first project brief into a task plan today.
      </p>
      <div class="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button as-child size="lg" class="h-12 bg-white px-7 text-primary-strong shadow-lg hover:bg-white/90">
          <RouterLink to="/auth/">
            Get started free <ArrowRight class="ml-1.5 h-4 w-4" />
          </RouterLink>
        </Button>
        <RouterLink to="/auth/login/" class="text-sm font-semibold text-white underline-offset-4 hover:underline">
          Already have an account? Log in
        </RouterLink>
      </div>
    </div>
  </section>
</template>
