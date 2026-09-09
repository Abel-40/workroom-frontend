<script setup lang="ts">
/**
 * Public navigation. Transparent over the hero, then a blurred hairline bar
 * once the page moves -- the state change is the only motion here, so it
 * doesn't compete with the walkthrough.
 *
 * Carries the app's own theme control: a visitor who prefers dark should meet
 * the landing page, and then the product, in dark.
 */
import { ref, onMounted, onBeforeUnmount } from "vue";
import { RouterLink } from "vue-router";
import { Sun, Moon, Monitor } from "lucide-vue-next";
import { useTheme, type ThemePreference } from "@/composables/useTheme";

const { theme, setTheme } = useTheme();
const scrolled = ref(false);

let rafId = 0;
const onScroll = () => {
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    rafId = 0;
    scrolled.value = window.scrollY > 12;
  });
};

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
  if (rafId) cancelAnimationFrame(rafId);
});

const modes: Array<{ key: ThemePreference; icon: typeof Sun; label: string }> = [
  { key: "light", icon: Sun, label: "Light" },
  { key: "dark", icon: Moon, label: "Dark" },
  { key: "system", icon: Monitor, label: "System" },
];
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 transition-colors duration-300"
    :class="scrolled ? 'wr-nav-scrolled' : ''"
  >
    <div class="mx-auto flex h-[60px] max-w-[1560px] items-center gap-3 px-5 lg:px-10">
      <RouterLink to="/" class="flex items-center gap-2">
        <span
          class="flex h-7 w-7 items-center justify-center rounded-lg text-[13px] font-bold text-white"
          style="background: linear-gradient(135deg, hsl(var(--wr-lp-brand)), hsl(var(--wr-lp-accent)))"
          >W</span
        >
        <span class="text-[15px] font-bold tracking-tight wr-t1">Workroom</span>
      </RouterLink>

      <nav class="ml-6 hidden items-center gap-6 md:flex">
        <a href="#walkthrough" class="text-[13.5px] wr-t2 transition-colors hover:opacity-70">Product</a>
        <a href="#connected" class="text-[13.5px] wr-t2 transition-colors hover:opacity-70">How it fits</a>
        <a href="#ai" class="text-[13.5px] wr-t2 transition-colors hover:opacity-70">AI</a>
      </nav>

      <span class="flex-1" />

      <!-- Theme control: three states, matching useTheme -->
      <div class="hidden items-center gap-0.5 rounded-lg border p-0.5 wr-line sm:flex">
        <button
          v-for="m in modes"
          :key="m.key"
          type="button"
          class="flex h-7 w-7 items-center justify-center rounded-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
          :class="theme === m.key ? 'wr-t1' : 'wr-t3 hover:opacity-70'"
          :style="[
            theme === m.key ? 'background: hsl(var(--wr-lp-brand) / .14)' : '',
            'outline-color: hsl(var(--wr-lp-brand))',
          ]"
          :aria-label="`${m.label} theme`"
          :aria-pressed="theme === m.key"
          @click="setTheme(m.key)"
        >
          <component :is="m.icon" class="h-3.5 w-3.5" />
        </button>
      </div>

      <RouterLink to="/auth/login/" class="hidden text-[13.5px] font-medium wr-t2 transition-colors hover:opacity-70 sm:block">
        Log in
      </RouterLink>
      <RouterLink
        to="/auth/"
        class="inline-flex h-9 items-center rounded-lg px-4 text-[13.5px] font-semibold text-white transition-transform hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style="
          background: linear-gradient(135deg, hsl(var(--wr-lp-brand)), hsl(var(--wr-lp-accent)));
          outline-color: hsl(var(--wr-lp-brand));
        "
      >
        Get started
      </RouterLink>
    </div>
  </header>
</template>

<style scoped>
.wr-nav-scrolled {
  background: hsl(var(--wr-lp-ground) / 0.72);
  backdrop-filter: blur(18px) saturate(150%);
  -webkit-backdrop-filter: blur(18px) saturate(150%);
  border-bottom: 1px solid hsl(var(--wr-lp-line));
}
</style>
