<script setup lang="ts">
// Shared project-selection modal used identically by Planner, Assistant and
// Health Check (spec: "one shared component"). Single select.
import { computed, ref, watch } from "vue";
import { ArrowRight, Search, SlidersHorizontal, X } from "lucide-vue-next";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusTag from "@/components/ai/shared/StatusTag.vue";
import { avatarPalette } from "@/lib/avatarPalette";
import { formatShortDate } from "@/lib/dates";
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

const formatDate = formatShortDate;

function confirm() {
  if (!selected.value) return;
  emit("confirm", selected.value);
  open.value = false;
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent hide-close class="flex h-[660px] max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-[680px] flex-col gap-0 overflow-hidden rounded-[24px] border-0 bg-card p-0 shadow-2xl">
      <div class="flex h-full min-h-0 flex-col gap-4 p-6 pb-5">
        <div class="flex items-start justify-between gap-3">
          <div class="flex flex-col gap-1">
            <span v-if="stepLabel" class="text-[10.5px] font-semibold uppercase tracking-wide text-subtle">{{ stepLabel }}</span>
            <span class="text-xl font-bold tracking-tight text-ink">Select a project</span>
            <span class="text-sm text-subtle">Only projects you have access to are listed.</span>
          </div>
          <button
            type="button"
            title="Close"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-page text-subtle transition hover:bg-page hover:text-ink"
            @click="open = false"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <div class="flex items-center gap-2.5">
          <div class="flex flex-1 items-center gap-2 rounded-xl bg-surface px-3.5 py-2.5 text-subtle border-2">
            <Search class="h-4 w-4 shrink-0" />
            <input
              v-model="query"
              type="text"
              placeholder="Search projects"
              class="w-full bg-transparent text-sm text-ink placeholder:text-subtle focus:outline-none"
            />
          </div>
          <Select v-model="sort">
            <SelectTrigger class="w-[220px] gap-2 rounded-xl text-sm">
              <SlidersHorizontal class="h-3.5 w-3.5 text-subtle" />
              <span class="text-subtle">Sort</span>
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

        <div class="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
          <p v-if="!filtered.length" class="py-8 text-center text-sm text-subtle">No projects found.</p>
          <button
            v-for="project in filtered"
            :key="project.id"
            type="button"
            class="flex items-center gap-3.5 rounded-2xl border-2 p-3.5 text-left transition"
            :class="selected === project.id ? 'border-primary bg-info/40' : 'border-2 bg-surface hover:border-border '"
            @click="selected = project.id"
          >
            <span
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] text-xs font-bold"
              :class="[avatarPalette(project.id).bg, avatarPalette(project.id).text]"
            >
              {{ project.title.slice(0, 2).toUpperCase() }}
            </span>
            <span class="min-w-0 flex-1">
              <span class="flex justify-between items-center gap-2">
                <span class="block max-w-[260px] truncate text-sm font-medium text-ink">
                  {{ project.title }}
                </span>
                <StatusTag :label="project.status" :tone="statusTone(project.status)" />
                <StatusTag v-if="project.hasSavedPlan" label="AI plan already saved" tone="warning" />
              </span>
              <span class="mt-0.5 block truncate text-xs text-subtle">
                {{ project.task.total }} tasks · {{ project.assigneeIds?.length ?? 0 }} members · updated {{ formatDate(project.updatedAt || project.createdAt) }}
              </span>
            </span>
            <span
              v-if="selected === project.id"
              class="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l5 5L19 7" /></svg>
            </span>
          </button>
        </div>

        <div class="flex items-center gap-3 pt-1">
          <span class="text-xs text-subtle">{{ selected ? "1 project selected" : "No project selected" }}</span>
          <div class="flex-1" />
          <button type="button" class="rounded-xl border border-border px-4 py-2.5 text-sm text-subtle" @click="open = false">
            Cancel
          </button>
          <button
            type="button"
            class="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_8px_24px_rgba(63,140,255,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
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
