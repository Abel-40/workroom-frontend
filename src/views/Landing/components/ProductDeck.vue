<script setup lang="ts">
/**
 * The product walkthrough: seven real Workroom screens that stack.
 *
 * Mechanism. The stack itself is layout, not animation -- consecutive
 * siblings that `position: sticky` at the same growing offset. Later screens
 * cover earlier ones by DOM order, so the sequence is bound to scroll
 * position by construction: scrolling up reverses it exactly, and reversing
 * mid-transition is simply the same function of scrollY evaluated backwards.
 * There is no timeline to fight and no state to desynchronise.
 *
 * Depth. One rAF-coalesced loop writes a 0..1 `--p` per screen -- how far the
 * *next* screen has come to cover it -- which CSS turns into a small scale and
 * a veil. It reads at most seven rects per frame and only runs while the deck
 * is on screen. If it never runs (reduced motion, or JS off) the stack still
 * works; only the depth cue is missing.
 */
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import AppFrame from "../product/AppFrame.vue";
import ScreenDashboard from "../product/screens/ScreenDashboard.vue";
import ScreenProjects from "../product/screens/ScreenProjects.vue";
import ScreenTasks from "../product/screens/ScreenTasks.vue";
import ScreenDepartments from "../product/screens/ScreenDepartments.vue";
import ScreenWorkload from "../product/screens/ScreenWorkload.vue";
import ScreenAiPlanner from "../product/screens/ScreenAiPlanner.vue";
import ScreenAiAssistant from "../product/screens/ScreenAiAssistant.vue";
import { prefersReducedMotion } from "@/lib/gsap";

/** Each screen answers one question about the product. */
const screens = [
  { nav: "dashboard", label: "Dashboard", q: "What can I see at a glance?", a: "Workload, projects, events and activity for the whole company on one screen.", comp: ScreenDashboard, hint: "Search projects, tasks and people" },
  { nav: "projects", label: "Projects", q: "How do I organize work?", a: "Projects belong to departments, carry a visibility rule, and track their own progress.", comp: ScreenProjects, hint: "Search projects" },
  { nav: "projects", label: "Tasks", q: "How does work get executed?", a: "A Kanban board with the four statuses your team actually uses, typed by sector.", comp: ScreenTasks, hint: "Search tasks in Mobile App v2" },
  { nav: "departments", label: "Departments", q: "How does the organization collaborate?", a: "Departments own people and projects. Roles decide what each member can reach.", comp: ScreenDepartments, hint: "Search departments and members" },
  { nav: "analytics", label: "Workload", q: "Who actually has capacity?", a: "Capacity per person and per department, with the reassignment made obvious.", comp: ScreenWorkload, hint: "Search insights" },
  { nav: "ai-workspace", label: "AI Planner", q: "How do I turn an idea into structured work?", a: "Describe an outcome; get a sequenced, assigned, dependency-aware draft plan to review.", comp: ScreenAiPlanner, hint: "Search AI generations" },
  { nav: "ai-workspace", label: "AI Assistant", q: "Can AI answer questions about my work?", a: "Grounded in this company's own projects — it cites the pages it used.", comp: ScreenAiAssistant, hint: "Ask about these pages…" },
];

const root = ref<HTMLElement | null>(null);
const itemRefs = ref<HTMLElement[]>([]);
const activeIndex = ref(0);

const setItemRef = (el: unknown, i: number) => {
  if (el instanceof HTMLElement) itemRefs.value[i] = el;
};

let rafId = 0;
let listening = false;
let observer: IntersectionObserver | undefined;

/** Stacking offset per screen, mirrored from the CSS custom properties. */
const readPx = (name: string, fallback: number) => {
  if (!root.value) return fallback;
  const v = getComputedStyle(root.value).getPropertyValue(name);
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
};

const update = () => {
  rafId = 0;
  const els = itemRefs.value;
  if (!els.length) return;

  const vh = window.innerHeight;
  const pin = readPx("--deck-pin", 80);
  const step = readPx("--deck-step", 10);
  let active = 0;

  for (let i = 0; i < els.length; i++) {
    const el = els[i];
    if (!el) continue;
    const next = els[i + 1];
    let p = 0;

    if (next) {
      // The covering screen travels from the viewport bottom to its own pin.
      const pinTop = pin + (i + 1) * step;
      const span = vh - pinTop;
      if (span > 0) {
        p = (vh - next.getBoundingClientRect().top) / span;
        p = p < 0 ? 0 : p > 1 ? 1 : p;
      }
    }

    el.style.setProperty("--p", p.toFixed(3));
    if (p > 0.5) active = i + 1;
  }

  activeIndex.value = active;
};

const onScroll = () => {
  if (!rafId) rafId = requestAnimationFrame(update);
};

const listen = (on: boolean) => {
  if (on === listening) return;
  listening = on;
  if (on) {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
  } else {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  }
};

onMounted(() => {
  if (prefersReducedMotion() || !root.value) return;
  // Only track while the deck is actually on screen.
  observer = new IntersectionObserver(
    (entries) => listen(entries.some((e) => e.isIntersecting)),
    { rootMargin: "200px 0px" }
  );
  observer.observe(root.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  listen(false);
  if (rafId) cancelAnimationFrame(rafId);
});

const activeScreen = computed(() => screens[activeIndex.value]);
</script>

<template>
  <section
    ref="root"
    id="walkthrough"
    class="wr-lp-stage wr-deck-root relative border-y wr-line"
    aria-label="Workroom product walkthrough"
  >
    <div class="mx-auto max-w-[1560px] px-5 pb-[18vh] pt-16 lg:px-10 lg:pt-24">
      <!-- Section opening: stated once, not repeated above every screen -->
      <div class="mb-10 max-w-2xl lg:mb-16">
        <p class="text-[11px] font-semibold uppercase tracking-[.16em]" style="color: hsl(var(--wr-lp-brand))">
          The walkthrough
        </p>
        <h2 class="mt-3 text-[clamp(1.9rem,3.6vw,3rem)] font-bold leading-[1.06] tracking-[-0.02em] wr-t1" style="text-wrap: balance">
          Seven screens, one workspace.
        </h2>
        <p class="mt-4 text-[15px] leading-relaxed wr-t2">
          Scroll to move through Workroom the way your team would — each screen
          arrives over the last, exactly as far as you scroll.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-[210px_1fr] lg:gap-10">
        <!-- Rail: carries the narrative so the screens don't each need a heading -->
        <aside class="wr-deck-rail hidden lg:block">
          <ol class="flex flex-col gap-1">
            <li v-for="(s, i) in screens" :key="s.label">
              <span
                class="flex items-baseline gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors duration-300"
                :class="i === activeIndex ? 'font-semibold wr-t1' : 'wr-t3'"
                :style="i === activeIndex ? 'background: hsl(var(--wr-lp-brand) / .11)' : ''"
              >
                <span class="w-4 shrink-0 text-[10.5px] tabular-nums" :style="i === activeIndex ? 'color: hsl(var(--wr-lp-brand))' : ''">{{ i + 1 }}</span>
                {{ s.label }}
              </span>
            </li>
          </ol>
          <div class="mt-6 border-t pt-5 wr-line">
            <p class="text-[14px] font-semibold leading-snug wr-t1">{{ activeScreen.q }}</p>
            <p class="mt-2 text-[12.5px] leading-relaxed wr-t2">{{ activeScreen.a }}</p>
          </div>
        </aside>

        <!-- Mobile: the same seven, as a snap carousel -->
        <div class="lg:hidden">
          <p class="mb-3 text-[13px] font-semibold wr-t1">{{ screens[0].q }}</p>
        </div>

        <!-- The stack -->
        <div class="wr-deck flex flex-col">
          <div
            v-for="(s, i) in screens"
            :key="s.label"
            :ref="(el) => setItemRef(el, i)"
            class="wr-deck-item"
            :style="{ top: `calc(var(--deck-pin) + ${i} * var(--deck-step))`, '--z': i + 1 }"
          >
            <figure class="wr-deck-screen relative m-0">
              <div class="wr-deck-frame">
                <AppFrame :active="s.nav" :search-hint="s.hint">
                  <component :is="s.comp" />
                </AppFrame>
                <span class="wr-deck-veil" aria-hidden="true" />
              </div>
              <figcaption class="wr-deck-cap lg:hidden">
                <span class="text-[12px] font-semibold wr-t1">{{ i + 1 }}. {{ s.label }}</span>
                <span class="block text-[11.5px] leading-snug wr-t2">{{ s.a }}</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.wr-deck-root {
  /* Pin offset clears the fixed nav; step gives the stack a visible edge. */
  --deck-pin: clamp(72px, 8vh, 104px);
  --deck-step: 10px;
  --deck-h: clamp(440px, 78vh, 860px);
  --deck-gap: clamp(96px, 15vh, 190px);
}

.wr-deck {
  gap: var(--deck-gap);
}

.wr-deck-frame {
  position: relative;
  height: var(--deck-h);
}

.wr-deck-frame :deep(.wr-app) {
  height: 100%;
}

.wr-deck-rail {
  position: sticky;
  top: calc(var(--deck-pin) + 8px);
  align-self: start;
}

.wr-deck-cap {
  display: block;
  padding: 0.75rem 0.25rem 0;
}

/* Below the deck breakpoint: no sticky stack, no covered viewport. The same
   seven screens become a horizontal snap carousel, still advanced by the
   user's own scrolling, with each screen given a readable width. */
@media (max-width: 1023px) {
  .wr-deck {
    flex-direction: row;
    gap: 14px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-padding: 0 1rem;
    padding-bottom: 0.75rem;
    margin-inline: -1.25rem;
    padding-inline: 1.25rem;
    -webkit-overflow-scrolling: touch;
  }
  .wr-deck-item {
    flex: 0 0 min(92%, 680px);
    scroll-snap-align: center;
  }
  .wr-deck-frame {
    height: clamp(420px, 64vh, 600px);
  }
}
</style>
