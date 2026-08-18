<script setup lang="ts">
import { computed, ref } from "vue";
import { Check, FolderOpen, MoveLeft, Paperclip, Pencil, Plus, Share2, Sparkles, Trash2, X } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header.vue";
import ShareFolderModal from "@/components/info-portal/ShareFolderModal.vue";
import { useInfoPortalStore, type InfoFolder, type InfoPageBlock } from "@/stores/infoPortalStore";

const infoStore = useInfoPortalStore();
const selectedFolder = ref<InfoFolder | null>(null);
const selectedPageId = ref<string | null>(null);
const isShareOpen = ref(false);
const isEditingPage = ref(false);
const searchQuery = ref("");
const onSearch = (value: string) => {
  searchQuery.value = value;
};

const openFolder = (folder: InfoFolder) => {
  selectedFolder.value = folder;
  selectedPageId.value = folder.pages[0]?.id ?? null;
  isEditingPage.value = false;
};
const backToPortal = () => {
  selectedFolder.value = null;
  selectedPageId.value = null;
  isEditingPage.value = false;
};
const selectPage = (pageId: string) => {
  selectedPageId.value = pageId;
  isEditingPage.value = false;
};

const selectedPage = computed(() =>
  selectedFolder.value?.pages.find((p) => p.id === selectedPageId.value) ?? null
);

const filteredFolders = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return infoStore.folders;
  return infoStore.folders.filter((folder) => folder.name.toLowerCase().includes(query));
});

const filteredPages = computed(() => {
  if (!selectedFolder.value) return [];
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return selectedFolder.value.pages;
  return selectedFolder.value.pages.filter((page) => page.title.toLowerCase().includes(query));
});

const toggleEditPage = () => {
  isEditingPage.value = !isEditingPage.value;
};

const touchPage = () => {
  if (selectedPage.value) selectedPage.value.lastModified = new Date().toISOString().slice(0, 10);
};

const addBlock = (type: InfoPageBlock["type"]) => {
  if (!selectedPage.value) return;
  selectedPage.value.blocks.push(type === "list" ? { type, items: [""] } : { type, text: "" });
  touchPage();
};

const removeBlock = (index: number) => {
  if (!selectedPage.value) return;
  selectedPage.value.blocks.splice(index, 1);
  touchPage();
};

const addListItem = (block: InfoPageBlock) => {
  block.items = block.items ? [...block.items, ""] : [""];
  touchPage();
};

const removeListItem = (block: InfoPageBlock, index: number) => {
  block.items?.splice(index, 1);
  touchPage();
};

const addPage = () => {
  if (!selectedFolder.value) return;
  const title = `New Page ${selectedFolder.value.pages.length + 1}`;
  const page = infoStore.addPage(selectedFolder.value.id, title);
  if (page) selectedPageId.value = page.id;
};

const addFolder = () => {
  const name = `New Folder ${infoStore.folders.length + 1}`;
  infoStore.addFolder(name);
};

const folderColor: Record<string, string> = {
  amber: "text-amber-500 bg-amber-50",
  emerald: "text-emerald-500 bg-emerald-50",
  cyan: "text-cyan-500 bg-cyan-50",
  violet: "text-violet-500 bg-violet-50",
};
</script>

<template>
  <ShareFolderModal v-model:open="isShareOpen" />
  <div class="flex-1 p-4">
    <div class="mb-6">
      <Header @update:search="onSearch" />
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <template v-if="selectedFolder">
            <button type="button" class="flex items-center gap-1 text-sm text-primary" @click="backToPortal">
              <MoveLeft class="h-4 w-4" /> Back to Info Portal
            </button>
            <h1 class="mt-1 text-xl font-semibold">{{ selectedFolder.name }}</h1>
          </template>
          <h1 v-else class="text-xl font-semibold">Info Portal</h1>
        </div>
        <Button class="rounded-xl" @click="selectedFolder ? addPage() : addFolder()">
          <Plus class="w-4 h-4" /> {{ selectedFolder ? "Add Page" : "Add Folder" }}
        </Button>
      </div>
    </div>

    <!-- Folder grid -->
    <template v-if="!selectedFolder">
      <div class="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div class="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 lg:col-span-2">
          <h2 class="text-lg font-semibold text-ink">Your project data warehouse</h2>
          <p class="mt-2 max-w-sm text-sm text-subtle">
            Add project data, create thematic pages, edit data, share information with team members.
          </p>
          <FolderOpen class="pointer-events-none absolute -right-4 -top-4 h-32 w-32 text-primary/10" />
        </div>
        <div class="rounded-2xl border border-gray-100 bg-white p-6">
          <p class="text-sm text-subtle">Current Projects</p>
          <p class="mt-1 text-3xl font-semibold text-ink">{{ infoStore.folders.length }}</p>
          <p class="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-500">
            <Sparkles class="h-3 w-3" /> Growth +3
          </p>
        </div>
      </div>

      <p v-if="!filteredFolders.length" class="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-subtle">
        No folders match "{{ searchQuery }}"
      </p>
      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <button
          v-for="folder in filteredFolders"
          :key="folder.id"
          type="button"
          class="rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          @click="openFolder(folder)"
        >
          <div class="flex h-10 w-10 items-center justify-center rounded-xl" :class="folderColor[folder.color]">
            <FolderOpen class="h-5 w-5" />
          </div>
          <p class="mt-3 font-medium text-ink">{{ folder.name }}</p>
          <p class="text-xs text-subtle">{{ folder.pages.length }} pages</p>
        </button>
      </div>
    </template>

    <!-- Folder detail: pages list + page content -->
    <div v-else class="flex flex-col gap-4 lg:flex-row">
      <div class="w-full rounded-2xl border border-gray-100 bg-white lg:w-64">
        <div class="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <p class="text-sm font-semibold text-ink">Pages</p>
          <button type="button" class="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white" @click="addPage">
            <Plus class="h-4 w-4" />
          </button>
        </div>
        <button
          v-for="page in filteredPages"
          :key="page.id"
          type="button"
          class="block w-full border-b border-gray-50 px-4 py-3 text-left last:border-b-0"
          :class="selectedPageId === page.id ? 'bg-blue-50 text-primary' : 'hover:bg-page/50'"
          @click="selectPage(page.id)"
        >
          <p class="text-sm font-medium">{{ page.title }}</p>
          <p class="text-xs text-subtle">Last modified {{ page.lastModified }}</p>
        </button>
        <p v-if="!filteredPages.length" class="px-4 py-6 text-center text-sm text-subtle">
          No pages match "{{ searchQuery }}"
        </p>
      </div>

      <div v-if="selectedPage" class="flex-1 rounded-2xl border border-gray-100 bg-white p-6">
        <div class="mb-4 flex items-center justify-between gap-3">
          <input
            v-if="isEditingPage"
            v-model="selectedPage.title"
            placeholder="Page title"
            class="flex-1 rounded-lg border border-gray-200 px-2 py-1 text-sm font-semibold text-ink focus:border-primary focus:outline-none"
            @input="touchPage"
          />
          <h3 v-else class="text-sm font-semibold text-ink">{{ selectedPage.title }}</h3>
          <div class="flex shrink-0 gap-2">
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-lg border hover:border-primary/40"
              :class="isEditingPage ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200'"
              :title="isEditingPage ? 'Done editing' : 'Edit page'"
              @click="toggleEditPage"
            >
              <Check v-if="isEditingPage" class="h-4 w-4" />
              <Pencil v-else class="h-4 w-4" />
            </button>
            <button type="button" class="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:border-primary/40" @click="isShareOpen = true">
              <Share2 class="h-4 w-4" /> Share
            </button>
          </div>
        </div>

        <div class="space-y-3">
          <div v-for="(block, index) in selectedPage.blocks" :key="index" class="group relative">
            <input
              v-if="block.type === 'heading' && isEditingPage"
              v-model="block.text"
              placeholder="Heading"
              class="w-full rounded-lg border border-transparent bg-page/40 px-2 py-1.5 font-semibold text-ink focus:border-primary focus:bg-white focus:outline-none"
              @input="touchPage"
            />
            <h4 v-else-if="block.type === 'heading'" class="font-semibold text-ink">{{ block.text }}</h4>

            <textarea
              v-if="block.type === 'paragraph' && isEditingPage"
              v-model="block.text"
              rows="3"
              placeholder="Write something..."
              class="w-full resize-y rounded-lg border border-transparent bg-page/40 px-2 py-1.5 text-sm leading-relaxed text-ink focus:border-primary focus:bg-white focus:outline-none"
              @input="touchPage"
            />
            <p v-else-if="block.type === 'paragraph'" class="text-sm leading-relaxed text-subtle">{{ block.text }}</p>

            <ul v-if="block.type === 'list' && !isEditingPage" class="list-disc space-y-1 pl-5 text-sm text-subtle">
              <li v-for="(item, i) in block.items" :key="i">{{ item }}</li>
            </ul>
            <div v-else-if="block.type === 'list'" class="space-y-1.5">
              <div v-for="(item, i) in block.items" :key="i" class="flex items-center gap-2">
                <span class="text-subtle">•</span>
                <input
                  v-model="block.items![i]"
                  placeholder="List item"
                  class="flex-1 rounded-lg border border-transparent bg-page/40 px-2 py-1 text-sm text-ink focus:border-primary focus:bg-white focus:outline-none"
                  @input="touchPage"
                />
                <button type="button" class="text-subtle hover:text-red-500" @click="removeListItem(block, i)">
                  <X class="h-3.5 w-3.5" />
                </button>
              </div>
              <button type="button" class="text-xs font-medium text-primary" @click="addListItem(block)">+ Add item</button>
            </div>

            <div v-if="block.type === 'attachment'" class="flex items-center gap-3 rounded-xl border border-gray-100 bg-page p-3">
              <div class="h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br from-primary to-violet-500" />
              <p class="text-sm font-medium text-ink">{{ block.fileName }}</p>
              <Paperclip class="ml-auto h-4 w-4 text-subtle" />
            </div>

            <button
              v-if="isEditingPage"
              type="button"
              class="absolute -right-2 -top-2 hidden h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-subtle hover:border-red-300 hover:text-red-500 group-hover:flex"
              title="Remove block"
              @click="removeBlock(index)"
            >
              <Trash2 class="h-3.5 w-3.5" />
            </button>
          </div>

          <p v-if="!selectedPage.blocks.length" class="text-sm text-subtle">This page is empty.</p>
        </div>

        <div v-if="isEditingPage" class="mt-4 flex flex-wrap gap-2 border-t border-dashed border-gray-200 pt-4">
          <button type="button" class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-ink hover:border-primary/40" @click="addBlock('heading')">+ Heading</button>
          <button type="button" class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-ink hover:border-primary/40" @click="addBlock('paragraph')">+ Paragraph</button>
          <button type="button" class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-ink hover:border-primary/40" @click="addBlock('list')">+ List</button>
        </div>
      </div>
    </div>
  </div>
</template>
