<script setup lang="ts">
// "Select page from folder" -- Workroom pages only, backed by the real
// pages API (never local files). Multi-select, grouped by folder.
import { computed, ref, watch } from "vue";
import { Check, FileText, Search } from "lucide-vue-next";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { usePagesStore, type WorkroomPage } from "@/stores/pagesStore";
import { useEmployeeStore } from "@/stores/employeeStore";

const props = withDefaults(defineProps<{ initialSelectedIds?: string[] }>(), { initialSelectedIds: () => [] });

const emit = defineEmits<{
  (e: "confirm", pages: WorkroomPage[]): void;
}>();

const open = defineModel<boolean>("open", { required: true });

const pagesStore = usePagesStore();
const employeeStore = useEmployeeStore();
const query = ref("");
const selectedIds = ref<string[]>([]);

watch(open, (isOpen) => {
  if (isOpen) {
    selectedIds.value = [...props.initialSelectedIds];
    query.value = "";
    pagesStore.searchPages();
  }
});
watch(query, (value) => pagesStore.searchPages(value.trim()));

const groups = computed(() => {
  const byFolder = new Map<string, WorkroomPage[]>();
  for (const page of pagesStore.pickerResults) {
    const key = page.folderName || "Untitled folder";
    if (!byFolder.has(key)) byFolder.set(key, []);
    byFolder.get(key)!.push(page);
  }
  return [...byFolder.entries()];
});

function authorName(page: WorkroomPage) {
  return employeeStore.employees.find((e) => e.id === page.createdBy)?.name ?? "Unknown";
}
function formatDate(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function toggle(id: string) {
  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter((existing) => existing !== id)
    : [...selectedIds.value, id];
}
function confirm() {
  const chosen = pagesStore.pickerResults.filter((p) => selectedIds.value.includes(p.id));
  emit("confirm", chosen);
  open.value = false;
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-[620px] gap-0 rounded-3xl p-0">
      <div class="flex flex-col gap-4 p-6 pb-5">
        <div class="flex flex-col gap-1">
          <span class="text-xl font-bold tracking-tight text-ink">Select pages from folders</span>
          <span class="text-sm text-subtle">Choose Workroom pages to use as context -- not local files.</span>
        </div>

        <div class="flex items-center gap-2 rounded-xl bg-surface px-3.5 py-2.5 text-subtle">
          <Search class="h-4 w-4 shrink-0" />
          <input
            v-model="query"
            type="text"
            placeholder="Search pages"
            class="w-full bg-transparent text-sm text-ink placeholder:text-subtle focus:outline-none"
          />
        </div>

        <div class="flex max-h-[404px] flex-col gap-3.5 overflow-y-auto pr-1">
          <p v-if="!groups.length" class="py-8 text-center text-sm text-subtle">No pages found.</p>
          <div v-for="[folderName, pages] in groups" :key="folderName" class="flex flex-col gap-2">
            <span class="px-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-subtle">{{ folderName }}</span>
            <button
              v-for="page in pages"
              :key="page.id"
              type="button"
              class="flex items-center gap-3.5 rounded-2xl border p-3 text-left transition"
              :class="selectedIds.includes(page.id) ? 'border-primary bg-info/40' : 'border-transparent bg-surface hover:border-gray-200'"
              @click="toggle(page.id)"
            >
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-white text-primary shadow-sm">
                <FileText class="h-4 w-4" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-medium text-ink">{{ page.title }}</span>
                <span class="block truncate text-xs text-subtle">
                  {{ folderName }} · edited {{ formatDate(page.updatedAt) }} · {{ authorName(page) }}
                </span>
              </span>
              <span
                v-if="selectedIds.includes(page.id)"
                class="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-primary text-white"
              >
                <Check class="h-3 w-3" />
              </span>
            </button>
          </div>
        </div>

        <div class="flex items-center gap-3 pt-1">
          <span class="text-xs text-subtle">{{ selectedIds.length }} page(s) selected</span>
          <div class="flex-1" />
          <button type="button" class="rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-subtle" @click="open = false">
            Cancel
          </button>
          <button
            type="button"
            class="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(63,140,255,0.3)]"
            @click="confirm"
          >
            Add {{ selectedIds.length || "" }} page{{ selectedIds.length === 1 ? "" : "s" }}
          </button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
