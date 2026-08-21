<script setup lang="ts">
// Renders a generated plan as the diagonal cascading staircase from the
// reference design: Start (bottom-right) -> task nodes stepping up-and-left
// -> Done (top-left), joined by curved connectors. Presentational only --
// isolated in its own component so the exact visual can be revised later
// without touching the plan review workflow around it.
import type { AiGeneratedTask } from "@/stores/aiStore";

defineProps<{
  tasks: AiGeneratedTask[];
}>();

const emit = defineEmits<{
  (e: "select", task: AiGeneratedTask): void;
}>();

// Horizontal step per row, capped so a long plan doesn't run off-screen --
// on narrow viewports this is overridden to 0 by the sm:ml-[...] classes below.
const STEP_PX = 56;
</script>

<template>
  <div class="w-full overflow-x-auto py-6">
    <div class="flex min-w-max flex-col-reverse items-end gap-3">
      <div class="flex items-center gap-3" :style="{ marginRight: `${(tasks.length + 1) * STEP_PX}px` }">
        <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-xs font-semibold text-primary">
          Start
        </div>
      </div>

      <template v-for="(task, index) in tasks" :key="task.id">
        <div class="flex items-center gap-3" :style="{ marginRight: `${(tasks.length - index) * STEP_PX}px` }">
          <svg class="h-6 w-10 shrink-0 text-gray-300" viewBox="0 0 40 24" fill="none">
            <path d="M4 20 Q20 20 36 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <path d="M30 3 L36 4 L33 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
          </svg>
          <button
            type="button"
            class="flex w-56 shrink-0 items-start gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-primary/50 hover:shadow-md"
            @click="emit('select', task)"
          >
            <span
              v-if="!task.commentResolved"
              class="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-400"
              title="Has a pending comment"
            />
            <span class="min-w-0 flex-1">
              <span class="block text-xs font-medium text-subtle">Task {{ index + 1 }}</span>
              <span class="line-clamp-2 block text-sm font-medium text-ink">{{ task.title }}</span>
            </span>
          </button>
        </div>
      </template>

      <div class="flex items-center gap-3">
        <svg class="h-6 w-10 shrink-0 text-gray-300" viewBox="0 0 40 24" fill="none">
          <path d="M4 20 Q20 20 36 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <path d="M30 3 L36 4 L33 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
        </svg>
        <div class="flex h-12 items-center justify-center rounded-2xl border-2 border-emerald-400 bg-emerald-50 px-5 text-sm font-semibold text-emerald-600">
          Done
        </div>
      </div>
    </div>
  </div>
</template>
