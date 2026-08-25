<script setup lang="ts">
// Backed by the real Folder/Page API (pagesStore/pages app) -- the same
// system the AI Assistant's page picker and "save as page" features use.
// Editing a page keeps a local draft while isEditingPage is true and
// persists it in one PATCH when the user finishes editing, rather than a
// request per keystroke.
//
// Three screens share this one view -- folders -> a folder's pages -> a
// single page -- derived from selection state (screen computed below)
// rather than tracked as a separate field, so "back" is just clearing the
// deepest selection and there's no separate state to keep in sync.
import { computed, ref, watch } from "vue";
import {
  ArrowLeft, Check, CheckSquare, FileText, FolderOpen, MoreVertical, Paperclip, Pencil,
  Plus, Share2, Sparkles, Trash2, X,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast/use-toast";
import Header from "@/components/layout/Header.vue";
import ShareFolderModal from "@/components/info-portal/ShareFolderModal.vue";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog.vue";
import { renderInlineMarkdown } from "@/lib/markdown";
import { formatShortDate } from "@/lib/dates";
import { usePagesStore, type PageBlock, type PageFolder, type WorkroomPage } from "@/stores/pagesStore";

const pagesStore = usePagesStore();
const { toast } = useToast();
const selectedFolder = ref<PageFolder | null>(null);
const selectedPageId = ref<string | null>(null);
const isShareOpen = ref(false);
const isEditingPage = ref(false);
const searchQuery = ref("");
const draftTitle = ref("");
const draftBlocks = ref<PageBlock[]>([]);
const saving = ref(false);
const deleting = ref(false);
const onSearch = (value: string) => {
  searchQuery.value = value;
};

if (!pagesStore.loaded) pagesStore.fetchFolders();

const screen = computed<"folders" | "pages" | "page">(() => {
  if (!selectedFolder.value) return "folders";
  if (!selectedPageId.value) return "pages";
  return "page";
});

const openFolder = async (folder: PageFolder) => {
  selectedFolder.value = folder;
  selectedPageId.value = null;
  isEditingPage.value = false;
  pageSelectMode.value = false;
  selectedPageIdsForDelete.value = new Set();
  await pagesStore.fetchPages(folder.id);
};
const backToFolders = () => {
  selectedFolder.value = null;
  selectedPageId.value = null;
  isEditingPage.value = false;
  folderSelectMode.value = false;
  selectedFolderIds.value = new Set();
};
const openPage = (pageId: string) => {
  selectedPageId.value = pageId;
  isEditingPage.value = false;
  // The folder listing omits blocks -- hydrate this page's real content
  // before it's rendered/edited.
  if (selectedFolder.value) pagesStore.fetchPage(pageId, selectedFolder.value.id);
};
const backToPages = () => {
  selectedPageId.value = null;
  isEditingPage.value = false;
};

const folderPages = computed(() => (selectedFolder.value ? pagesStore.pagesFor(selectedFolder.value.id) : []));
const selectedPage = computed(() => folderPages.value.find((p) => p.id === selectedPageId.value) ?? null);

const filteredFolders = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return pagesStore.folders;
  return pagesStore.folders.filter((folder) => folder.name.toLowerCase().includes(query));
});

const filteredPages = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return folderPages.value;
  return folderPages.value.filter((page) => page.title.toLowerCase().includes(query));
});

watch(selectedPage, (page) => {
  draftTitle.value = page?.title ?? "";
  draftBlocks.value = page ? JSON.parse(JSON.stringify(page.blocks)) : [];
});

const toggleEditPage = async () => {
  if (isEditingPage.value && selectedFolder.value && selectedPage.value) {
    saving.value = true;
    const { error } = await pagesStore.updatePage(selectedPage.value.id, selectedFolder.value.id, {
      title: draftTitle.value, blocks: draftBlocks.value,
    });
    saving.value = false;
    if (error) {
      toast({ title: "Couldn't save the page", description: error, variant: "destructive" });
      return;
    }
  }
  isEditingPage.value = !isEditingPage.value;
};

const addBlock = (type: PageBlock["type"]) => {
  draftBlocks.value.push(type === "list" ? { type, items: [""] } : { type, text: "" });
};
const removeBlock = (index: number) => {
  draftBlocks.value.splice(index, 1);
};
const addListItem = (block: PageBlock) => {
  block.items = block.items ? [...block.items, ""] : [""];
};
const removeListItem = (block: PageBlock, index: number) => {
  block.items?.splice(index, 1);
};

const addPage = async () => {
  if (!selectedFolder.value) return;
  const title = `New Page ${folderPages.value.length + 1}`;
  const { page, error } = await pagesStore.createPage(selectedFolder.value.id, {
    title, blocks: [{ type: "paragraph", text: "" }],
  });
  if (error) {
    toast({ title: "Couldn't create the page", description: error, variant: "destructive" });
    return;
  }
  if (page) openPage(page.id);
};

const addFolder = async () => {
  const name = `New Folder ${pagesStore.folders.length + 1}`;
  const { error } = await pagesStore.createFolder(name);
  if (error) toast({ title: "Couldn't create the folder", description: error, variant: "destructive" });
};

const folderColor: Record<string, string> = {
  amber: "text-amber-500 bg-amber-50",
  emerald: "text-emerald-500 bg-emerald-50",
  cyan: "text-cyan-500 bg-cyan-50",
  violet: "text-violet-500 bg-violet-50",
};

// --- Delete: an individual action (3-dot menu) plus a bulk-select mode,
// tracked independently for the folders grid and the pages grid since only
// one of those screens is ever visible at a time. ---
const folderSelectMode = ref(false);
const selectedFolderIds = ref<Set<string>>(new Set());
const pageSelectMode = ref(false);
const selectedPageIdsForDelete = ref<Set<string>>(new Set());

function toggleFolderSelectMode() {
  folderSelectMode.value = !folderSelectMode.value;
  selectedFolderIds.value = new Set();
}
function toggleFolderChecked(id: string) {
  const next = new Set(selectedFolderIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  selectedFolderIds.value = next;
}
// Shared delete-confirmation dialog: each delete action stages what it wants
// to do (title/description + the actual delete work) instead of running
// immediately, so every destructive action in this view goes through one
// approve/cancel modal rather than window.confirm().
const confirmDialogOpen = ref(false);
const confirmDialogTitle = ref("");
const confirmDialogDescription = ref("");
let pendingDeleteAction: (() => Promise<void>) | null = null;

function requestDelete(title: string, description: string, action: () => Promise<void>) {
  confirmDialogTitle.value = title;
  confirmDialogDescription.value = description;
  pendingDeleteAction = action;
  confirmDialogOpen.value = true;
}

async function runPendingDelete() {
  if (!pendingDeleteAction) return;
  await pendingDeleteAction();
  confirmDialogOpen.value = false;
  pendingDeleteAction = null;
}

async function deleteFolder(folder: PageFolder) {
  requestDelete(
    "Delete this folder?",
    `Delete "${folder.name}"? This also deletes every page inside it.`,
    async () => {
      deleting.value = true;
      const { error } = await pagesStore.deleteFolder(folder.id);
      deleting.value = false;
      if (error) toast({ title: "Couldn't delete the folder", description: error, variant: "destructive" });
    }
  );
}
async function deleteSelectedFolders() {
  const ids = [...selectedFolderIds.value];
  if (!ids.length) return;
  requestDelete(
    `Delete ${ids.length} folder${ids.length === 1 ? "" : "s"}?`,
    `Delete ${ids.length} folder${ids.length === 1 ? "" : "s"}? This also deletes every page inside them.`,
    async () => {
      deleting.value = true;
      const results = await Promise.all(ids.map((id) => pagesStore.deleteFolder(id)));
      deleting.value = false;
      const failed = results.filter((r) => r.error).length;
      if (failed) toast({ title: `Couldn't delete ${failed} folder${failed === 1 ? "" : "s"}`, variant: "destructive" });
      folderSelectMode.value = false;
      selectedFolderIds.value = new Set();
    }
  );
}

function togglePageSelectMode() {
  pageSelectMode.value = !pageSelectMode.value;
  selectedPageIdsForDelete.value = new Set();
}
function togglePageChecked(id: string) {
  const next = new Set(selectedPageIdsForDelete.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  selectedPageIdsForDelete.value = next;
}
async function deletePage(page: WorkroomPage) {
  if (!selectedFolder.value) return;
  const folder = selectedFolder.value;
  requestDelete("Delete this page?", `Delete "${page.title}"?`, async () => {
    deleting.value = true;
    const { error } = await pagesStore.deletePage(page.id, folder.id);
    deleting.value = false;
    if (error) {
      toast({ title: "Couldn't delete the page", description: error, variant: "destructive" });
      return;
    }
    if (selectedPageId.value === page.id) selectedPageId.value = null;
  });
}
async function deleteSelectedPages() {
  if (!selectedFolder.value) return;
  const ids = [...selectedPageIdsForDelete.value];
  if (!ids.length) return;
  const folderId = selectedFolder.value.id;
  requestDelete(
    `Delete ${ids.length} page${ids.length === 1 ? "" : "s"}?`,
    `Delete ${ids.length} page${ids.length === 1 ? "" : "s"}?`,
    async () => {
      deleting.value = true;
      const results = await Promise.all(ids.map((id) => pagesStore.deletePage(id, folderId)));
      deleting.value = false;
      const failed = results.filter((r) => r.error).length;
      if (failed) toast({ title: `Couldn't delete ${failed} page${failed === 1 ? "" : "s"}`, variant: "destructive" });
      pageSelectMode.value = false;
      selectedPageIdsForDelete.value = new Set();
    }
  );
}
</script>

<template>
  <ShareFolderModal v-model:open="isShareOpen" />
  <ConfirmDeleteDialog
    v-model:open="confirmDialogOpen"
    :title="confirmDialogTitle"
    :description="confirmDialogDescription"
    :loading="deleting"
    @confirm="runPendingDelete"
  />
  <div class="flex-1 p-4">
    <div class="mb-6">
      <Header @update:search="onSearch" />
      <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <template v-if="screen === 'pages'">
            <button type="button" class="flex items-center gap-1 text-sm text-primary" @click="backToFolders">
              <ArrowLeft class="h-4 w-4" /> Back to Info Portal
            </button>
            <h1 class="mt-1 text-xl font-semibold">{{ selectedFolder!.name }}</h1>
          </template>
          <template v-else-if="screen === 'page'">
            <button type="button" class="flex items-center gap-1 text-sm text-primary" @click="backToPages">
              <ArrowLeft class="h-4 w-4" /> Back to {{ selectedFolder!.name }}
            </button>
          </template>
          <h1 v-else class="text-xl font-semibold">Info Portal</h1>
        </div>

        <div v-if="screen === 'folders'" class="flex items-center gap-2">
          <template v-if="folderSelectMode">
            <span class="text-xs text-subtle">{{ selectedFolderIds.size }} selected</span>
            <Button variant="outline" class="rounded-xl" :disabled="!selectedFolderIds.size || deleting" @click="deleteSelectedFolders">
              <Trash2 class="h-4 w-4" /> Delete selected
            </Button>
            <Button variant="outline" class="rounded-xl" @click="toggleFolderSelectMode">Cancel</Button>
          </template>
          <template v-else>
            <Button variant="outline" class="rounded-xl" @click="toggleFolderSelectMode">
              <CheckSquare class="h-4 w-4" /> Select
            </Button>
            <Button class="rounded-xl" @click="addFolder">
              <Plus class="h-4 w-4" /> Add Folder
            </Button>
          </template>
        </div>

        <div v-else-if="screen === 'pages'" class="flex items-center gap-2">
          <template v-if="pageSelectMode">
            <span class="text-xs text-subtle">{{ selectedPageIdsForDelete.size }} selected</span>
            <Button variant="outline" class="rounded-xl" :disabled="!selectedPageIdsForDelete.size || deleting" @click="deleteSelectedPages">
              <Trash2 class="h-4 w-4" /> Delete selected
            </Button>
            <Button variant="outline" class="rounded-xl" @click="togglePageSelectMode">Cancel</Button>
          </template>
          <template v-else>
            <Button variant="outline" class="rounded-xl" @click="togglePageSelectMode">
              <CheckSquare class="h-4 w-4" /> Select
            </Button>
            <Button class="rounded-xl" @click="addPage">
              <Plus class="h-4 w-4" /> Add Page
            </Button>
          </template>
        </div>
      </div>
    </div>

    <!-- Screen 1: folder grid -->
    <template v-if="screen === 'folders'">
      <div class="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div class="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 lg:col-span-2">
          <h2 class="text-lg font-semibold text-ink">Your project data warehouse</h2>
          <p class="mt-2 max-w-sm text-sm text-subtle">
            Add project data, create thematic pages, edit data, share information with team members.
          </p>
          <FolderOpen class="pointer-events-none absolute -right-4 -top-4 h-32 w-32 text-primary/10" />
        </div>
        <div class="rounded-2xl border border-gray-100 bg-white p-6">
          <p class="text-sm text-subtle">Folders</p>
          <p class="mt-1 text-3xl font-semibold text-ink">{{ pagesStore.folders.length }}</p>
          <p class="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-500">
            <Sparkles class="h-3 w-3" /> Shared across your company
          </p>
        </div>
      </div>

      <p v-if="!filteredFolders.length" class="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-subtle">
        No folders match "{{ searchQuery }}"
      </p>
      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="folder in filteredFolders"
          :key="folder.id"
          class="group relative cursor-pointer rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          :class="selectedFolderIds.has(folder.id) ? 'border-primary bg-info/30' : 'border-gray-100 bg-white'"
          @click="folderSelectMode ? toggleFolderChecked(folder.id) : openFolder(folder)"
        >
          <div class="flex items-start justify-between">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl" :class="folderColor[folder.color]">
              <FolderOpen class="h-5 w-5" />
            </div>
            <Checkbox
              v-if="folderSelectMode"
              :model-value="selectedFolderIds.has(folder.id)"
              @update:model-value="toggleFolderChecked(folder.id)"
              @click.stop
            />
            <DropdownMenu v-else>
              <DropdownMenuTrigger as-child>
                <button
                  type="button"
                  class="flex h-7 w-7 items-center justify-center rounded-lg text-subtle opacity-0 transition hover:bg-page hover:text-ink group-hover:opacity-100"
                  @click.stop
                >
                  <MoreVertical class="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" @click.stop>
                <DropdownMenuItem class="text-red-500" @click="deleteFolder(folder)">
                  <Trash2 class="h-3.5 w-3.5" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p class="mt-3 font-medium text-ink">{{ folder.name }}</p>
          <p class="text-xs text-subtle">{{ pagesStore.pagesFor(folder.id).length || "—" }} pages</p>
        </div>
      </div>
    </template>

    <!-- Screen 2: this folder's pages, as square cards -->
    <template v-else-if="screen === 'pages'">
      <p v-if="!filteredPages.length" class="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-subtle">
        No pages match "{{ searchQuery }}"
      </p>
      <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div
          v-for="page in filteredPages"
          :key="page.id"
          class="group relative flex aspect-square cursor-pointer flex-col justify-between rounded-2xl border p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          :class="selectedPageIdsForDelete.has(page.id) ? 'border-primary bg-info/30' : 'border-gray-100 bg-white'"
          @click="pageSelectMode ? togglePageChecked(page.id) : openPage(page.id)"
        >
          <div class="flex items-start justify-between">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-page text-primary">
              <FileText class="h-4 w-4" />
            </span>
            <Checkbox
              v-if="pageSelectMode"
              :model-value="selectedPageIdsForDelete.has(page.id)"
              @update:model-value="togglePageChecked(page.id)"
              @click.stop
            />
            <DropdownMenu v-else>
              <DropdownMenuTrigger as-child>
                <button
                  type="button"
                  class="flex h-7 w-7 items-center justify-center rounded-lg text-subtle opacity-0 transition hover:bg-page hover:text-ink group-hover:opacity-100"
                  @click.stop
                >
                  <MoreVertical class="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" @click.stop>
                <DropdownMenuItem class="text-red-500" @click="deletePage(page)">
                  <Trash2 class="h-3.5 w-3.5" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div>
            <p class="line-clamp-2 text-sm font-medium text-ink">{{ page.title }}</p>
            <p class="mt-0.5 text-[10px] text-subtle">{{ formatShortDate(page.updatedAt) }}</p>
          </div>
        </div>
      </div>
    </template>

    <!-- Screen 3: a single page, full width -->
    <div v-else-if="screen === 'page' && selectedPage" class="flex-1 rounded-2xl border border-gray-100 bg-white p-6">
      <div class="mb-4 flex items-center justify-between gap-3">
        <input
          v-if="isEditingPage"
          v-model="draftTitle"
          placeholder="Page title"
          class="flex-1 rounded-lg border border-gray-200 px-2 py-1 text-sm font-semibold text-ink focus:border-primary focus:outline-none"
        />
        <h3 v-else class="text-sm font-semibold text-ink">{{ selectedPage.title }}</h3>
        <div class="flex shrink-0 gap-2">
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-lg border hover:border-primary/40 disabled:opacity-50"
            :class="isEditingPage ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200'"
            :disabled="saving"
            :title="isEditingPage ? 'Save and stop editing' : 'Edit page'"
            @click="toggleEditPage"
          >
            <Check v-if="isEditingPage" class="h-4 w-4" />
            <Pencil v-else class="h-4 w-4" />
          </button>
          <button type="button" class="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:border-primary/40" @click="isShareOpen = true">
            <Share2 class="h-4 w-4" /> Share
          </button>
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-subtle hover:border-red-300 hover:text-red-500"
            title="Delete page"
            @click="deletePage(selectedPage)"
          >
            <Trash2 class="h-4 w-4" />
          </button>
        </div>
      </div>

      <div class="space-y-3">
        <div v-for="(block, index) in (isEditingPage ? draftBlocks : selectedPage.blocks)" :key="index" class="group relative">
          <input
            v-if="block.type === 'heading' && isEditingPage"
            v-model="block.text"
            placeholder="Heading"
            class="w-full rounded-lg border border-transparent bg-page/40 px-2 py-1.5 font-semibold text-ink focus:border-primary focus:bg-white focus:outline-none"
          />
          <h4 v-else-if="block.type === 'heading'" class="font-semibold text-ink" v-html="renderInlineMarkdown(block.text || '')" />

          <textarea
            v-if="block.type === 'paragraph' && isEditingPage"
            v-model="block.text"
            rows="3"
            placeholder="Write something..."
            class="w-full resize-y rounded-lg border border-transparent bg-page/40 px-2 py-1.5 text-sm leading-relaxed text-ink focus:border-primary focus:bg-white focus:outline-none"
          />
          <p
            v-else-if="block.type === 'paragraph'"
            class="whitespace-pre-line text-sm leading-relaxed text-subtle"
            v-html="renderInlineMarkdown(block.text || '')"
          />

          <ul v-if="block.type === 'list' && !isEditingPage" class="list-disc space-y-1 pl-5 text-sm text-subtle">
            <li v-for="(item, i) in block.items" :key="i" v-html="renderInlineMarkdown(item)" />
          </ul>
          <div v-else-if="block.type === 'list'" class="space-y-1.5">
            <div v-for="(item, i) in block.items" :key="i" class="flex items-center gap-2">
              <span class="text-subtle">•</span>
              <input
                v-model="block.items![i]"
                placeholder="List item"
                class="flex-1 rounded-lg border border-transparent bg-page/40 px-2 py-1 text-sm text-ink focus:border-primary focus:bg-white focus:outline-none"
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

        <p v-if="!(isEditingPage ? draftBlocks : selectedPage.blocks).length" class="text-sm text-subtle">This page is empty.</p>
      </div>

      <div v-if="isEditingPage" class="mt-4 flex flex-wrap gap-2 border-t border-dashed border-gray-200 pt-4">
        <button type="button" class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-ink hover:border-primary/40" @click="addBlock('heading')">+ Heading</button>
        <button type="button" class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-ink hover:border-primary/40" @click="addBlock('paragraph')">+ Paragraph</button>
        <button type="button" class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-ink hover:border-primary/40" @click="addBlock('list')">+ List</button>
      </div>
    </div>
  </div>
</template>
