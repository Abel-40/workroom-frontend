<script setup lang="ts">
// Shared project selector for all three AI tools (Plan Creator/Assistant/
// Health Check) -- one selection mechanism, reflected into the workspace's
// URL by the parent, per the "don't build three separate implementations"
// requirement.
import { computed, ref } from "vue";
import { Check, ChevronsUpDown, Search } from "lucide-vue-next";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Project } from "@/types/types";

const props = defineProps<{
  projects: Project[];
  modelValue: string | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", projectId: string | null): void;
}>();

const open = ref(false);
const query = ref("");

const selected = computed(() => props.projects.find((p) => p.id === props.modelValue) ?? null);
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return props.projects;
  return props.projects.filter((p) => p.title.toLowerCase().includes(q));
});

function pick(project: Project) {
  emit("update:modelValue", project.id);
  open.value = false;
  query.value = "";
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1.5 pl-3 pr-2.5 text-sm text-ink shadow-sm transition hover:border-primary/40"
      >
        <span class="text-[11px] font-medium uppercase tracking-wide text-subtle">Project</span>
        <span class="max-w-[14rem] truncate font-medium" :class="selected ? 'text-ink' : 'text-subtle'">
          {{ selected?.title || "Select…" }}
        </span>
        <ChevronsUpDown class="h-3.5 w-3.5 shrink-0 text-subtle" />
      </button>
    </PopoverTrigger>
    <PopoverContent class="w-[--reka-popover-trigger-width] p-0" align="start">
      <div class="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
        <Search class="h-4 w-4 text-subtle" />
        <input
          v-model="query"
          type="text"
          placeholder="Search projects…"
          class="w-full text-sm text-ink placeholder:text-subtle focus:outline-none"
        />
      </div>
      <div class="max-h-64 overflow-y-auto p-1">
        <p v-if="filtered.length === 0" class="px-2 py-3 text-center text-xs text-subtle">No projects found</p>
        <button
          v-for="project in filtered"
          :key="project.id"
          type="button"
          class="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-page"
          @click="pick(project)"
        >
          <span class="truncate text-ink">{{ project.title }}</span>
          <Check v-if="project.id === modelValue" class="h-4 w-4 shrink-0 text-primary" />
        </button>
      </div>
    </PopoverContent>
  </Popover>
</template>
