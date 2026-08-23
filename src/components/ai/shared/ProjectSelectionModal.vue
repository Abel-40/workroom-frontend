<script setup lang="ts">
// Shared project-selection modal used identically by Planner, Assistant and
// Health Check (spec: "one shared component"). Single select.
import { computed, ref, watch } from "vue";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-vue-next";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusTag from "@/components/ai/shared/StatusTag.vue";
import type { Project } from "@/types/types";

type SortKey = "updated" | "name" | "status";

const props = withDefaults(
  defineProps<{
    projects: Project[];
    initialProjectId?: string | null;
    stepLabel?: string;
    continueLabel?: string;
  }>(),
  { initialProjectId: null, stepLabel: "", continueLabel: "Continue" }
);

const emit = defineEmits<{
  (e: "confirm", projectId: string): void;
}>();

const open = defineModel<boolean>("open", { required: true });

const query = ref("");
const sort = ref<SortKey>("updated");
const selected = ref<string | null>(null);

watch(open, (isOpen) => {
  if (isOpen) {
    selected.value = props.initialProjectId;
    query.value = "";
    sort.value = "updated";
  }
});

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  const list = props.projects.filter((p) => !q || p.title.toLowerCase().includes(q));
  return [...list].sort((a, b) => {
    if (sort.value === "name") return a.title.localeCompare(b.title);
    if (sort.value === "status") return a.status.localeCompare(b.status);
    const bTime = new Date(b.updatedAt || b.createdAt).getTime();
    const aTime = new Date(a.updatedAt || a.createdAt).getTime();
    return bTime - aTime;
  });
});

const statusTone = (status: Project["status"]) =>
  status === "Done" ? "success" : status === "In Active" ? "neutral" : "info";

function formatDate(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function confirm() {
  if (!selected.value) return;
  emit("confirm", selected.value);
  open.value = false;
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-[620px] gap-0 rounded-3xl p-0">
      <div class="flex flex-col gap-4 p-6 pb-5">
        <div class="flex items-start gap-3">
          <div class="flex flex-col gap-1">
            <span v-if="stepLabel" class="text-[10.5px] font-semibold uppercase tracking-wide text-subtle">{{ stepLabel }}</span>
            <span class="text-xl font-bold tracking-tight text-ink">Select a project</span>
            <span class="text-sm text-subtle">Only projects you have access to are listed.</span>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
          <div class="flex flex-1 items-center gap-2 rounded-xl bg-surface px-3.5 py-2.5 text-subtle">
            <Search class="h-4 w-4 shrink-0" />
            <input
              v-model="query"
              type="text"
              placeholder="Search projects"
              class="w-full bg-transparent text-sm text-ink placeholder:text-subtle focus:outline-none"
            />
          </div>
          <Select v-model="sort">
            <SelectTrigger class="w-[190px] gap-2 rounded-xl text-sm">
              <SlidersHorizontal class="h-3.5 w-3.5 text-subtle" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="updated">Recently updated</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div class="flex max-h-[404px] flex-col gap-2 overflow-y-auto pr-1">
          <p v-if="!filtered.length" class="py-8 text-center text-sm text-subtle">No projects found.</p>
          <button
            v-for="project in filtered"
            :key="project.id"
            type="button"
            class="flex items-center gap-3.5 rounded-2xl border p-3.5 text-left transition"
            :class="selected === project.id ? 'border-primary bg-info/40' : 'border-transparent bg-surface hover:border-gray-200'"
            @click="selected = project.id"
          >
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-white text-xs font-bold text-primary shadow-sm">
              {{ project.title.slice(0, 2).toUpperCase() }}
            </span>
            <span class="min-w-0 flex-1">
              <span class="flex flex-wrap items-center gap-2">
                <span class="truncate text-sm font-medium text-ink">{{ project.title }}</span>
                <StatusTag :label="project.status" :tone="statusTone(project.status)" />
                <StatusTag v-if="project.hasSavedPlan" label="AI plan already saved" tone="warning" />
              </span>
              <span class="mt-0.5 block truncate text-xs text-subtle">
                {{ project.task.total }} tasks · updated {{ formatDate(project.updatedAt || project.createdAt) }}
              </span>
            </span>
            <span
              v-if="selected === project.id"
              class="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-primary text-white"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l5 5L19 7" /></svg>
            </span>
          </button>
        </div>

        <div class="flex items-center gap-3 pt-1">
          <span class="text-xs text-subtle">{{ selected ? "1 project selected" : "No project selected" }}</span>
          <div class="flex-1" />
          <button type="button" class="rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-subtle" @click="open = false">
            Cancel
          </button>
          <button
            type="button"
            class="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(63,140,255,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!selected"
            @click="confirm"
          >
            {{ continueLabel }}
            <ArrowRight class="h-4 w-4" />
          </button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
