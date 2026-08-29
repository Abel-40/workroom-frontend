<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { RouterLink } from "vue-router";
import { Menu, X } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import WorkroomMark from "@/components/shared/WorkroomMark.vue";

const scrolled = ref(false);
const mobileOpen = ref(false);

const onScroll = () => {
  scrolled.value = window.scrollY > 12;
};

onMounted(() => window.addEventListener("scroll", onScroll, { passive: true }));
onUnmounted(() => window.removeEventListener("scroll", onScroll));

const links = [
  { label: "Features", href: "#features" },
  { label: "Workflow", href: "#workflow" },
  { label: "Screenshots", href: "#screenshots" },
];

const closeMobile = () => (mobileOpen.value = false);
</script>

<template>
  <header
    class="sticky top-0 z-50 transition-all duration-300"
    :class="scrolled ? 'wr-glass border-b border-white/40 shadow-sm' : 'bg-transparent'"
  >
    <nav class="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 md:px-8">
      <RouterLink to="/" class="flex items-center gap-2" @click="closeMobile">
        <WorkroomMark class="h-8 w-8" />
        <span class="text-lg font-extrabold tracking-tight text-ink">Workroom</span>
      </RouterLink>

      <div class="hidden items-center gap-8 md:flex">
        <a
          v-for="link in links"
          :key="link.href"
          :href="link.href"
          class="text-sm font-medium text-[#5B6472] transition hover:text-ink"
        >
          {{ link.label }}
        </a>
      </div>

      <div class="hidden items-center gap-3 md:flex">
        <RouterLink to="/auth/login/" class="text-sm font-semibold text-ink transition hover:text-primary-strong">
          Log in
        </RouterLink>
        <Button as-child class="bg-gradient-to-br from-[#3F8CFF] to-accent-2 text-white shadow-[0_8px_22px_rgba(63,140,255,0.38)] hover:shadow-lg">
          <RouterLink to="/auth/">Get started free</RouterLink>
        </Button>
      </div>

      <button
        type="button"
        class="grid h-10 w-10 place-items-center rounded-lg text-ink md:hidden"
        aria-label="Toggle menu"
        @click="mobileOpen = !mobileOpen"
      >
        <component :is="mobileOpen ? X : Menu" class="h-6 w-6" />
      </button>
    </nav>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="mobileOpen" class="wr-glass border-t border-white/40 px-4 pb-4 md:hidden">
        <div class="flex flex-col gap-1 pt-2">
          <a
            v-for="link in links"
            :key="link.href"
            :href="link.href"
            class="rounded-lg px-2 py-2.5 text-sm font-medium text-ink hover:bg-white/50"
            @click="closeMobile"
          >
            {{ link.label }}
          </a>
          <RouterLink
            to="/auth/login/"
            class="rounded-lg px-2 py-2.5 text-sm font-semibold text-ink hover:bg-white/50"
            @click="closeMobile"
          >
            Log in
          </RouterLink>
          <Button as-child class="mt-1 w-full bg-gradient-to-br from-[#3F8CFF] to-accent-2 text-white">
            <RouterLink to="/auth/" @click="closeMobile">Get started free</RouterLink>
          </Button>
        </div>
      </div>
    </Transition>
  </header>
</template>
