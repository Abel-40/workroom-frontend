<script setup lang="ts">
// Sequence view: a snake-ordered grid of numbered step cards (row 1 reads
// left-to-right, row 2 right-to-left, and so on) connected by arrows, per
// the design brief. Card status is derived from real generated-task fields
// only -- comment resolution and assignment -- never invented: "Needs edit"
// means an open reviewer comment, "Ready" means an assignee is set (human
// or AI-suggested), otherwise "Backlog".
import { computed } from "vue";
import { ArrowDown, ArrowLeft, ArrowRight } from "lucide-vue-next";
import { useAiStore, type AiGeneratedTask } from "@/stores/aiStore";

const props = defineProps<{
  tasks: AiGeneratedTask[];
  projectId: string;
  selectedTaskId: string | null;
}>();

const emit = defineEmits<{
  (e: "select", task: AiGeneratedTask): void;
}>();

const aiStore = useAiStore();

const COLS = 4;
const cols = computed(() => Math.max(1, Math.min(COLS, props.tasks.length)));

function statusOf(task: AiGeneratedTask): { label: string; tone: string } {
  if (!task.commentResolved) return { label: "Needs edit", tone: "bg-amber-100 text-amber-700" };
  if (task.assignedToId || task.suggestedAssigneeId) return { label: "Ready", tone: "bg-emerald-100 text-emerald-700" };
  return { label: "Backlog", tone: "bg-muted text-subtle" };
}

interface Row {
  index: number;
  reversed: boolean;
  tasks: AiGeneratedTask[];
}
const rows = computed<Row[]>(() => {
  const out: Row[] = [];
  for (let i = 0; i < props.tasks.length; i += cols.value) {
    const rowIndex = out.length;
    const slice = props.tasks.slice(i, i + cols.value);
    out.push({ index: rowIndex, reversed: rowIndex % 2 === 1, tasks: rowIndex % 2 === 1 ? [...slice].reverse() : slice });
  }
  return out;
});

function arrowGapPositions(count: number) {
  return Array.from({ length: Math.max(0, count - 1) }, (_, i) => ((i + 1) / count) * 100);
}
function edgeFraction(reversed: boolean, colCount: number) {
  return reversed ? (0.5 / colCount) * 100 : ((colCount - 0.5) / colCount) * 100;
}

function assigneeName(task: AiGeneratedTask) {
  const id = task.assignedToId || task.suggestedAssigneeId;
  if (!id) return null;
  return aiStore.eligibleAssigneesFor(props.projectId).find((m) => m.id === id)?.name ?? null;
}
</script>

<template>
  <div class="flex flex-col gap-2 overflow-x-auto py-1">
    <template v-for="row in rows" :key="row.index">
      <div class="relative grid gap-x-6" :style="{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }">
        <button
          v-for="task in row.tasks" :key="task.id"
          type="button"
          class="flex min-h-[104px] flex-col justify-between rounded-2xl border bg-card p-4 text-left shadow-sm transition"
          :class="selectedTaskId === task.id ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/30'"
          @click="emit('select', task)"
        >
          <div class="flex items-center justify-between">
            <span class="text-[10.5px] font-semibold uppercase tracking-wide text-subtle">Step {{ tasks.indexOf(task) + 1 }}</span>
            <span class="h-2 w-2 rounded-full" :class="selectedTaskId === task.id ? 'bg-primary' : 'bg-muted'" />
          </div>
          <p class="line-clamp-2 text-sm font-semibold text-ink">{{ task.title }}</p>
          <div class="flex items-center justify-between gap-2">
            <span class="rounded-full px-2 py-0.5 text-[10.5px] font-medium" :class="statusOf(task).tone">{{ statusOf(task).label }}</span>
            <span v-if="assigneeName(task)" class="truncate text-[10.5px] text-subtle">{{ assigneeName(task) }}</span>
          </div>
        </button>

        <!-- Horizontal connectors between cards in this row -->
        <span
          v-for="(pct, i) in arrowGapPositions(row.tasks.length)" :key="`h-${row.index}-${i}`"
          class="pointer-events-none absolute top-1/2 z-10 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-card text-subtle shadow"
          :style="{ left: `${pct}%` }"
        >
          <component :is="row.reversed ? ArrowLeft : ArrowRight" class="h-3.5 w-3.5" />
        </span>
      </div>

      <!-- Vertical connector down to the next row, aligned under the last
           card visually reached in this row's reading direction. -->
      <div v-if="row.index < rows.length - 1" class="relative h-6">
        <span
          class="pointer-events-none absolute top-0 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full bg-card text-subtle shadow"
          :style="{ left: `${edgeFraction(row.reversed, row.tasks.length)}%` }"
        >
          <ArrowDown class="h-3.5 w-3.5" />
        </span>
      </div>
    </template>
  </div>
</template>
