<script setup lang="ts">
// "Save response as page" -- creates a real Workroom page (pages API),
// never a local file. Reuses the same folder picker data as the Info Portal.
import { ref, watch } from "vue";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import MarkdownText from "@/components/ai/shared/MarkdownText.vue";
import { usePagesStore } from "@/stores/pagesStore";

const props = defineProps<{
  defaultTitle: string;
  contentPreview: string;
  projectName: string;
}>();

const emit = defineEmits<{
  (e: "confirm", input: { title: string; folderId?: string; newFolderName?: string }): void;
}>();

const open = defineModel<boolean>("open", { required: true });

const pagesStore = usePagesStore();
const title = ref("");
const folderId = ref<string>("");
const newFolderName = ref("");

watch(open, (isOpen) => {
  if (isOpen) {
    title.value = props.defaultTitle;
    folderId.value = pagesStore.folders[0]?.id ?? "";
    newFolderName.value = "";
    if (!pagesStore.loaded) pagesStore.fetchFolders();
  }
});

function confirm() {
  if (!title.value.trim()) return;
  emit("confirm", {
    title: title.value.trim(),
    folderId: newFolderName.value.trim() ? undefined : folderId.value || undefined,
    newFolderName: newFolderName.value.trim() || undefined,
  });
  open.value = false;
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-[560px] gap-0 rounded-3xl p-0">
      <div class="flex flex-col gap-4 p-6 pb-5">
        <div class="flex flex-col gap-1">
          <span class="text-xl font-bold tracking-tight text-ink">Save as a page</span>
          <span class="text-sm text-subtle">Creates a normal Workroom page linked to {{ projectName }}.</span>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-subtle">Page title</label>
          <Input v-model="title" class="rounded-xl" placeholder="Page title" />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-subtle">Folder</label>
          <Select v-model="folderId" :disabled="!!newFolderName.trim()">
            <SelectTrigger class="rounded-xl">
              <SelectValue placeholder="Choose a folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="folder in pagesStore.folders" :key="folder.id" :value="folder.id">
                  {{ folder.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Input v-model="newFolderName" class="rounded-xl" placeholder="…or create a new folder" />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-subtle">Content preview</label>
          <div class="max-h-40 overflow-y-auto rounded-xl bg-surface p-3 text-sm text-subtle">
            <MarkdownText :text="contentPreview" />
          </div>
        </div>

        <div class="flex items-center gap-3 pt-1">
          <div class="flex-1" />
          <button type="button" class="rounded-xl border border-border px-4 py-2.5 text-sm text-subtle" @click="open = false">
            Cancel
          </button>
          <button
            type="button"
            class="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(63,140,255,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!title.trim()"
            @click="confirm"
          >
            Save page
          </button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
