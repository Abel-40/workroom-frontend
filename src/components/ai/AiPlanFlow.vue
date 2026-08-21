<script setup lang="ts">
// Renders a generated plan as Start -> task -> task -> Done. When there's
// enough room this is the diagonal cascading staircase from the reference
// design; otherwise it becomes a true vertical timeline (no horizontal
// offset/scroll) since the offset math can't just be hidden with CSS --
// spec explicitly asks for graceful small-screen adaptation, not a
// horizontal-scroll fallback. Driven by this component's OWN rendered width
// (ResizeObserver), not the viewport's -- the dashboard shell reserves a
// fixed ~272px for its sidebar regardless of viewport size, so a
// viewport-based media query would badly misjudge how much room is actually
// available here.
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useAiStore, type AiGeneratedTask } from "@/stores/aiStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import { priorityBadgeClass } from "@/lib/aiBadges";
import AiAvatar from "@/components/ai/AiAvatar.vue";

const props = defineProps<{
  tasks: AiGeneratedTask[];
  projectId: string;
}>();

const emit = defineEmits<{
  (e: "select", task: AiGeneratedTask): void;
}>();

const aiStore = useAiStore();
const directoryStore = useDirectoryStore();

const rootEl = ref<HTMLElement | null>(null);
const containerWidth = ref(0);
const isWide = computed(() => containerWidth.value >= 560);
let observer: ResizeObserver | null = null;

onMounted(() => {
  if (!rootEl.value) return;
  observer = new ResizeObserver((entries) => {
    containerWidth.value = entries[0]?.contentRect.width ?? 0;
  });
  observer.observe(rootEl.value);
});
onBeforeUnmount(() => observer?.disconnect());

// Horizontal step per row, capped so a long plan doesn't run off-screen.
const STEP_PX = 52;

function departmentName(task: AiGeneratedTask) {
  return task.suggestedDepartmentId ? directoryStore.departments.find((d) => d.id === task.suggestedDepartmentId)?.name : null;
}
function assigneeName(task: AiGeneratedTask) {
  if (!task.assignedToId) return null;
  return aiStore.eligibleAssigneesFor(props.projectId).find((m) => m.id === task.assignedToId)?.name ?? null;
}

const dotClass = computed(() => (task: AiGeneratedTask) => priorityBadgeClass(task.priority).split(" ")[1]?.replace("text-", "bg-") ?? "bg-amber-500");
</script>

<template>
  <div ref="rootEl" class="w-full overflow-x-auto py-6">
    <!-- Wide: diagonal staircase -->
    <div v-if="isWide" class="flex min-w-max flex-col-reverse items-end gap-3">
      <div class="flex items-center gap-3" :style="{ marginRight: `${(tasks.length + 1) * STEP_PX}px` }">
        <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-xs font-semibold text-primary">
          Start
        </div>
      </div>

      <template v-for="(task, index) in tasks" :key="task.id">
        <div class="flex items-center gap-3" :style="{ marginRight: `${(tasks.length - index) * STEP_PX}px` }">
          <svg class="h-6 w-10 shrink-0 text-primary/30" viewBox="0 0 40 24" fill="none">
            <path d="M4 20 Q20 20 36 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <path d="M30 3 L36 4 L33 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
          </svg>
          <button
            type="button"
            class="group flex w-60 shrink-0 flex-col items-start gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
            @click="emit('select', task)"
          >
            <div class="flex w-full items-start gap-2">
              <span :class="dotClass(task)" class="mt-1.5 h-2 w-2 shrink-0 rounded-full" />
              <span class="min-w-0 flex-1">
                <span class="block text-xs font-medium text-subtle">Step {{ index + 1 }} of {{ tasks.length }}</span>
                <span class="line-clamp-2 text-sm font-medium text-ink">{{ task.title }}</span>
              </span>
              <span v-if="!task.commentResolved" class="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-400" title="Has a pending comment" />
            </div>
            <div v-if="departmentName(task) || assigneeName(task)" class="flex w-full flex-wrap items-center gap-1.5">
              <span v-if="departmentName(task)" class="truncate rounded-full bg-page px-2 py-0.5 text-[11px] font-medium text-subtle">
                {{ departmentName(task) }}
              </span>
              <span v-if="assigneeName(task)" class="ml-auto flex items-center gap-1 text-[11px] text-subtle">
                <AiAvatar :name="assigneeName(task)!" :seed="task.assignedToId!" />
              </span>
            </div>
          </button>
        </div>
      </template>

      <div class="flex items-center gap-3">
        <svg class="h-6 w-10 shrink-0 text-primary/30" viewBox="0 0 40 24" fill="none">
          <path d="M4 20 Q20 20 36 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <path d="M30 3 L36 4 L33 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
        </svg>
        <div class="flex h-12 items-center justify-center rounded-2xl border-2 border-emerald-400 bg-emerald-50 px-5 text-sm font-semibold text-emerald-600">
          Done
        </div>
      </div>
    </div>

    <!-- Narrow: vertical timeline, no horizontal offset -->
    <div v-else class="flex flex-col items-start gap-0">
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-[11px] font-semibold text-primary">
        Start
      </div>
      <div class="ml-5 h-4 w-px bg-gray-200" />

      <template v-for="(task, index) in tasks" :key="task.id">
        <button
          type="button"
          class="flex w-full items-start gap-3 rounded-2xl border border-gray-200 bg-white p-3 text-left shadow-sm transition hover:border-primary/50"
          @click="emit('select', task)"
        >
          <span class="flex h-4 w-4 shrink-0 items-center justify-center">
            <span :class="dotClass(task)" class="h-2 w-2 rounded-full" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block text-xs font-medium text-subtle">Step {{ index + 1 }} of {{ tasks.length }}</span>
            <span class="line-clamp-2 text-sm font-medium text-ink">{{ task.title }}</span>
            <span v-if="departmentName(task)" class="mt-1 inline-block rounded-full bg-page px-2 py-0.5 text-[11px] font-medium text-subtle">
              {{ departmentName(task) }}
            </span>
          </span>
          <span v-if="!task.commentResolved" class="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-400" title="Has a pending comment" />
        </button>
        <div v-if="index < tasks.length - 1" class="ml-5 h-4 w-px bg-gray-200" />
      </template>

      <div class="ml-5 h-4 w-px bg-gray-200" />
      <div class="flex h-10 items-center justify-center rounded-2xl border-2 border-emerald-400 bg-emerald-50 px-4 text-[11px] font-semibold text-emerald-600">
        Done
      </div>
    </div>
  </div>
</template>
