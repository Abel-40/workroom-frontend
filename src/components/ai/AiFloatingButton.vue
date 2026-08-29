<script setup lang="ts">
// Persistent entry point into quick-create actions -- replaced the old
// single-purpose "open the AI workspace" circle with an expandable menu
// (Popover, same pattern as TaskStatusPill.vue) so Create Project/Task/
// Folder/Pages live alongside the original AI Workspace shortcut. Fixed to
// the bottom-right corner of the viewport, visible across the whole
// dashboard shell (see DashboardLayout.vue's #floating slot).
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  FileText,
  FolderPlus,
  ListPlus,
  Plus,
  Sparkles,
  X,
} from "lucide-vue-next";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/components/ui/toast/use-toast";
import { usePagesStore } from "@/stores/pagesStore";
import CreateProjectModal from "@/components/projects/CreateProjectModal.vue";

const route = useRoute();
const router = useRouter();
const { toast } = useToast();
const pagesStore = usePagesStore();

const open = ref(false);
const isCreateProjectOpen = ref(false);

const isOnSection = (section: string) => route.query.section === section;

// Create Project: CreateProjectModal is self-contained (no required props,
// fetches its own directory/employee data) -- render it directly here
// instead of navigating anywhere.
const onCreateProject = () => {
  open.value = false;
  isCreateProjectOpen.value = true;
};

// Create Task: AddTaskModal requires a projectId prop the floating menu
// doesn't have on its own. If the user is already viewing a project (Projects
// section with ?id=), carry that id along so ProjectsView can open the modal
// immediately; otherwise land on the projects list with a one-shot
// ?openTask=true flag (mirrors the existing ?aiGenerated=true pattern) so it
// auto-opens once a project is selected -- either the list's own default
// selection or one the user picks.
const onCreateTask = () => {
  open.value = false;
  const projectId = isOnSection("projects") && typeof route.query.id === "string" ? route.query.id : undefined;
  router.push({
    path: "/admin/dashboard/",
    query: { section: "projects", ...(projectId ? { id: projectId } : {}), openTask: "true" },
  });
};

// Create Folder: Info Portal's own "Add Folder" is instant/unnamed
// (pagesStore.createFolder("New Folder N")) -- reuse that exact behavior
// here for consistency rather than building a separate naming modal, then
// land on the Info Portal so the new folder is visible.
const onCreateFolder = async () => {
  open.value = false;
  if (!pagesStore.loaded) await pagesStore.fetchFolders();
  const name = `New Folder ${pagesStore.folders.length + 1}`;
  const { error } = await pagesStore.createFolder(name);
  if (error) {
    toast({ title: "Couldn't create the folder", description: error, variant: "destructive" });
    return;
  }
  router.push({ path: "/admin/dashboard/", query: { section: "info-portal" } });
};

// Create Pages: always opens in a genuine new tab. If the user is currently
// viewing a specific folder in the Info Portal (?folderId=, now written by
// InfoPortalView itself when a folder is open), carry that folder along so
// the new tab creates the page in the same place; otherwise InfoPortalView
// falls back to the first available folder (see its own newPage handling).
const onCreatePages = () => {
  open.value = false;
  const folderId = isOnSection("info-portal") && typeof route.query.folderId === "string" ? route.query.folderId : undefined;
  const href = router.resolve({
    path: "/admin/dashboard/",
    query: { section: "info-portal", newPage: "true", ...(folderId ? { folderId } : {}) },
  }).href;
  window.open(href, "_blank");
};

// AI Workroom: unchanged from the button's previous single-purpose behavior.
const onAiWorkroom = () => {
  open.value = false;
  const projectId = typeof route.query.id === "string" ? route.query.id : undefined;
  router.push({ name: "admin-dashboard", query: { section: "ai-workspace", ...(projectId ? { project: projectId } : {}) } });
};

const menuItems = computed(() => [
  { key: "project", label: "Create project", icon: Plus, action: onCreateProject },
  { key: "task", label: "Create task", icon: ListPlus, action: onCreateTask },
  { key: "folder", label: "Create folder", icon: FolderPlus, action: onCreateFolder },
  { key: "pages", label: "Create pages", icon: FileText, action: onCreatePages },
  { key: "ai", label: "AI Workroom", icon: Sparkles, action: onAiWorkroom },
]);
</script>

<template>
  <!-- Transparent scrim: dims/clicks-through-closes the rest of the page
       while the menu is open, per the expandable-menu design. -->
  <div v-if="open" class="fixed inset-0 z-40 bg-black/10" aria-hidden="true" />

  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <button
        type="button"
        title="Quick create"
        class="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-500 text-white shadow-lg shadow-primary/30 transition hover:scale-105 hover:shadow-xl active:scale-95 md:bottom-6"
      >
        <X v-if="open" class="h-6 w-6" />
        <Plus v-else class="h-6 w-6" />
      </button>
    </PopoverTrigger>
    <PopoverContent side="top" align="end" :side-offset="12" class="z-50 w-64 rounded-2xl p-2">
      <button
        v-for="item in menuItems"
        :key="item.key"
        type="button"
        class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-page"
        @click="item.action"
      >
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <component :is="item.icon" class="h-4 w-4" />
        </span>
        <span class="font-medium text-ink">{{ item.label }}</span>
      </button>
    </PopoverContent>
  </Popover>

  <CreateProjectModal v-model:open="isCreateProjectOpen" />
</template>
