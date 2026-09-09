<script setup lang="ts">
// Lightweight custom spotlight tour -- no tour library exists in this repo
// and every other piece of AI-workspace chrome is already bespoke Tailwind,
// so a small home-grown overlay (scrim + cutout + tooltip card) is enough
// rather than pulling in a new dependency for four moving parts.
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { ArrowLeft, ArrowRight, Sparkles, X } from "lucide-vue-next";
import type { AiMode } from "@/types/aiWorkspace";
import { TOUR_LABELS, TOUR_STEPS } from "@/lib/aiTourSteps";

const props = defineProps<{ mode: AiMode }>();
const emit = defineEmits<{ (e: "close"): void }>();

const steps = computed(() => TOUR_STEPS[props.mode]);
const stepIndex = ref(0);
const step = computed(() => steps.value[stepIndex.value]);
const isLast = computed(() => stepIndex.value === steps.value.length - 1);

const rect = ref<DOMRect | null>(null);
const PAD = 8;

function locateTarget() {
  const key = step.value?.target;
  if (!key) {
    rect.value = null;
    return;
  }
  const el = document.querySelector<HTMLElement>(`[data-tour="${key}"]`);
  if (!el) {
    rect.value = null;
    return;
  }
  el.scrollIntoView({ block: "center", behavior: "smooth" });
  window.setTimeout(() => {
    rect.value = el.getBoundingClientRect();
  }, 260);
}

function onViewportChange() {
  if (!step.value?.target) return;
  const el = document.querySelector<HTMLElement>(`[data-tour="${step.value.target}"]`);
  rect.value = el ? el.getBoundingClientRect() : null;
}

watch(stepIndex, () => nextTick(locateTarget));
onMounted(() => {
  nextTick(locateTarget);
  window.addEventListener("resize", onViewportChange);
  window.addEventListener("scroll", onViewportChange, true);
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", onViewportChange);
  window.removeEventListener("scroll", onViewportChange, true);
});

const cardStyle = computed(() => {
  const r = rect.value;
  if (!r) {
    return { position: "fixed" as const, left: "50%", top: "62%", transform: "translate(-50%, -50%)" };
  }
  const cardWidth = 360;
  const approxCardHeight = 220;
  const margin = 16;
  let top = r.bottom + margin;
  let transformY = "";
  const spaceBelow = window.innerHeight - r.bottom;
  const spaceAbove = r.top;
  if (spaceBelow < approxCardHeight + margin && spaceAbove > spaceBelow) {
    // Not enough room below -- flip above, but never push the card above
    // the visible viewport (step 5/6's targets sit high on the page, so a
    // naive flip put the card at a negative effective top).
    top = Math.max(r.top - margin, approxCardHeight + margin);
    transformY = "translateY(-100%)";
  }
  let left = r.left + r.width / 2;
  left = Math.min(Math.max(left, cardWidth / 2 + margin), window.innerWidth - cardWidth / 2 - margin);
  return {
    position: "fixed" as const,
    left: `${left}px`,
    top: `${top}px`,
    transform: `translateX(-50%) ${transformY}`,
  };
});

function next() {
  if (isLast.value) {
    emit("close");
    return;
  }
  stepIndex.value++;
}
function back() {
  if (stepIndex.value > 0) stepIndex.value--;
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") emit("close");
  if (e.key === "ArrowRight") next();
  if (e.key === "ArrowLeft") back();
}
onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[80]">
      <!-- Scrim built from up to 4 rectangles around the spotlighted
           element, so the target itself stays fully interactive and
           unobscured without needing an SVG mask. -->
      <template v-if="rect">
        <div class="absolute inset-x-0 top-0 bg-black/50 transition-all" :style="{ height: `${Math.max(rect.top - PAD, 0)}px` }" />
        <div class="absolute inset-x-0 bottom-0 bg-black/50 transition-all" :style="{ top: `${rect.bottom + PAD}px` }" />
        <div class="absolute bg-black/50 transition-all" :style="{ top: `${rect.top - PAD}px`, height: `${rect.height + PAD * 2}px`, left: '0', width: `${Math.max(rect.left - PAD, 0)}px` }" />
        <div class="absolute bg-black/50 transition-all" :style="{ top: `${rect.top - PAD}px`, height: `${rect.height + PAD * 2}px`, left: `${rect.right + PAD}px`, right: '0' }" />
        <div
          class="pointer-events-none absolute rounded-xl ring-2 ring-primary transition-all"
          :style="{ top: `${rect.top - PAD}px`, left: `${rect.left - PAD}px`, width: `${rect.width + PAD * 2}px`, height: `${rect.height + PAD * 2}px`, boxShadow: '0 0 0 4px rgba(63,140,255,0.25)' }"
        />
      </template>
      <div v-else class="absolute inset-0 bg-black/50" />

      <div class="absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-2 rounded-full bg-card px-4 py-2 text-sm shadow-lg">
        <Sparkles class="h-3.5 w-3.5 text-primary" />
        <span class="font-medium text-ink">{{ TOUR_LABELS[mode] }}</span>
        <span class="text-subtle">{{ steps.length }} controls · about a minute</span>
      </div>

      <div class="w-[360px] rounded-2xl bg-card p-5 shadow-2xl" :style="cardStyle">
        <div class="mb-2 flex items-center justify-between">
          <span class="rounded-full bg-info px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-info-foreground">
            Step {{ stepIndex + 1 }} of {{ steps.length }}
          </span>
          <button type="button" class="text-xs font-medium text-subtle hover:text-ink" @click="emit('close')">Skip tour</button>
        </div>
        <h4 class="text-base font-semibold text-ink">{{ step.title }}</h4>
        <p class="mt-1.5 text-sm leading-relaxed text-subtle">{{ step.description }}</p>

        <div class="mt-4 flex items-center justify-between gap-3">
          <div class="flex gap-1">
            <span
              v-for="(s, i) in steps" :key="i"
              class="h-1 w-5 rounded-full transition-colors"
              :class="i === stepIndex ? 'bg-primary' : 'bg-page'"
            />
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-sm text-subtle disabled:opacity-40"
              :disabled="stepIndex === 0"
              @click="back"
            >
              <ArrowLeft class="h-3.5 w-3.5" /> Back
            </button>
            <button type="button" class="flex items-center gap-1 rounded-xl bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground" @click="next">
              {{ isLast ? "Done" : "Next" }} <ArrowRight v-if="!isLast" class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        class="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-card text-subtle shadow-lg hover:text-ink"
        @click="emit('close')"
      >
        <X class="h-4 w-4" />
      </button>
    </div>
  </Teleport>
</template>
