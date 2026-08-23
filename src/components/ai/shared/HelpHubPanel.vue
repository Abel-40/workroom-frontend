<script setup lang="ts">
// Right-side "Using the AI workspace" panel: one card per tool, the current
// tool expanded with its full step summary, the other two collapsed to a
// single row. A fixed-position panel rather than a new Sheet primitive --
// this repo has no shadcn Sheet, and a right-anchored fixed div with a
// backdrop covers the same spec without adding a new dependency.
import { computed } from "vue";
import { BarChart3, ListChecks, MessageSquare, Play, X } from "lucide-vue-next";
import { Switch } from "@/components/ui/switch";
import type { AiMode } from "@/types/aiWorkspace";
import { TOUR_STEPS, TOUR_SUMMARY } from "@/lib/aiTourSteps";
import { useAiWorkspaceUiStore } from "@/stores/aiWorkspaceUiStore";

const props = defineProps<{ activeMode: AiMode }>();
const emit = defineEmits<{ (e: "close"): void; (e: "start", mode: AiMode): void }>();

const uiStore = useAiWorkspaceUiStore();

const TOOLS: { mode: AiMode; icon: typeof ListChecks }[] = [
  { mode: "plan", icon: ListChecks },
  { mode: "assistant", icon: MessageSquare },
  { mode: "health", icon: BarChart3 },
];

function stepCount(mode: AiMode) {
  return TOUR_STEPS[mode].length;
}

const firstVisitLabel = computed(() => {
  const completedOn = uiStore.completedAt[props.activeMode];
  if (!completedOn) return null;
  const date = new Date(completedOn);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
});
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[70]">
      <div class="absolute inset-0 bg-black/30" @click="emit('close')" />
      <div class="absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col gap-5 overflow-y-auto bg-white p-6 shadow-2xl">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-[10.5px] font-semibold uppercase tracking-wide text-subtle">Help</p>
            <h3 class="text-xl font-bold text-ink">Using the AI workspace</h3>
          </div>
          <button type="button" class="flex h-8 w-8 items-center justify-center rounded-full text-subtle hover:bg-page" @click="emit('close')">
            <X class="h-4 w-4" />
          </button>
        </div>

        <div class="flex flex-col gap-3">
          <div
            v-for="tool in TOOLS" :key="tool.mode"
            class="rounded-2xl p-4 transition"
            :class="tool.mode === activeMode ? 'border border-primary/40 bg-info/30' : 'border border-gray-100 bg-white'"
          >
            <div class="flex items-start gap-3">
              <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
                <component :is="tool.icon" class="h-4 w-4" />
              </span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-2">
                  <p class="font-semibold text-ink">{{ TOUR_SUMMARY[tool.mode].title }}</p>
                  <span v-if="tool.mode === activeMode" class="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-primary shadow-sm">This page</span>
                </div>

                <template v-if="tool.mode === activeMode">
                  <p class="mt-1 text-sm text-subtle">{{ TOUR_SUMMARY[tool.mode].description }}</p>
                  <ol class="mt-3 space-y-2">
                    <li v-for="(bullet, i) in TOUR_SUMMARY[tool.mode].bullets" :key="i" class="flex items-start gap-2 text-sm text-ink">
                      <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">{{ i + 1 }}</span>
                      {{ bullet }}
                    </li>
                  </ol>
                  <button
                    type="button"
                    class="mt-4 flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white"
                    @click="emit('start', tool.mode)"
                  >
                    <Play class="h-3.5 w-3.5" /> Start walkthrough
                    <span class="ml-1 text-xs font-normal text-white/80">{{ stepCount(tool.mode) }} steps</span>
                  </button>
                </template>
                <div v-else class="mt-1 flex items-center justify-between">
                  <span class="text-xs text-subtle">{{ stepCount(tool.mode) }} steps</span>
                  <button type="button" class="text-sm font-medium text-primary" @click="emit('start', tool.mode)">Start</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-auto flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
          <div>
            <p class="text-sm font-medium text-ink">Show the tour on my first visit</p>
            <p class="text-xs text-subtle">
              {{ firstVisitLabel ? `Off since you completed it on ${firstVisitLabel}` : "Auto-starts the walkthrough the first time you open a tool" }}
            </p>
          </div>
          <Switch :model-value="uiStore.tourEnabled" @update:model-value="(v) => (uiStore.tourEnabled = v)" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
