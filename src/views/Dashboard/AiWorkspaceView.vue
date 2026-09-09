<script setup lang="ts">
// Full-page AI workspace: three modes of one coherent surface rather than
// three unrelated pages. Each panel owns its own project-selection pill and
// composer footer (spec: identical shape across tools); this view only
// tracks which mode/project is active (via the URL query, so switching
// never triggers a full page reload) and hosts the two pieces of chrome
// that are genuinely shared -- the guided tour overlay and the help hub.
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { HelpCircle } from "lucide-vue-next";
import { useProjectStore } from "@/stores/projectStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useAiWorkspaceUiStore } from "@/stores/aiWorkspaceUiStore";
import type { AiMode } from "@/types/aiWorkspace";
import AiPlanCreator from "@/components/ai/AiPlanCreator.vue";
import AiAssistantPanel from "@/components/ai/AiAssistantPanel.vue";
import AiHealthCheckPanel from "@/components/ai/AiHealthCheckPanel.vue";
import HelpHubPanel from "@/components/ai/shared/HelpHubPanel.vue";
import GuidedTourOverlay from "@/components/ai/shared/GuidedTourOverlay.vue";

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const directoryStore = useDirectoryStore();
const uiStore = useAiWorkspaceUiStore();

const activeMode = computed<AiMode>(() => {
  const mode = route.query.mode;
  return mode === "assistant" || mode === "health" ? mode : "plan";
});

const selectedProjectId = computed<string | null>(() =>
  typeof route.query.project === "string" ? route.query.project : null
);

function setMode(mode: AiMode) {
  router.replace({ query: { ...route.query, mode } });
}

function selectProject(projectId: string | null) {
  router.replace({ query: { ...route.query, project: projectId ?? undefined } });
}

const assistantPrefillPrompt = ref("");

function handleGeneratePlanFromAssistant(prefillPrompt: string) {
  assistantPrefillPrompt.value = prefillPrompt;
  setMode("plan");
}

function viewInBacklog() {
  if (!selectedProjectId.value) return;
  router.push({
    name: "admin-dashboard",
    query: { section: "projects", id: selectedProjectId.value, details: "true", aiGenerated: "true" },
  });
}

// Help hub + guided tour -- both are page-level chrome shared identically
// across the three tools, so they're owned here rather than duplicated
// per-panel.
const helpHubOpen = ref(false);
const activeTour = ref<AiMode | null>(null);

function openHelp() {
  activeTour.value = null;
  helpHubOpen.value = true;
}
function startTour(mode: AiMode) {
  helpHubOpen.value = false;
  activeTour.value = mode;
}
function finishTour() {
  if (activeTour.value) uiStore.markCompleted(activeTour.value);
  activeTour.value = null;
}

// Auto-start a tool's walkthrough the first time it's opened, if the user
// hasn't turned that off and hasn't already completed it.
watch(
  activeMode,
  (mode) => {
    // Clear the handoff prefill only once its target mode has been left, so
    // the value survives the very transition that's meant to deliver it.
    if (mode !== "plan") assistantPrefillPrompt.value = "";
    if (uiStore.tourEnabled && !uiStore.hasCompleted(mode) && !activeTour.value) {
      nextTick(() => window.setTimeout(() => (activeTour.value = mode), 400));
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (!projectStore.projects.length) projectStore.fetchProjects();
  if (!directoryStore.loaded) directoryStore.fetchAll();
});
</script>

<template>
  <!-- h-full, not a 100vh calc: AppShell's content region is already sized to
       "viewport minus shell padding minus header", so this just fills it. -->
  <div class="relative flex h-full w-full flex-1 flex-col p-4">
    <!-- min-h-0 lets this flex-1 slot actually shrink to the space available,
         instead of growing to fit its content -- without it the panel below
         can't reliably fill "whatever's left" and the footer stops tracking
         the real bottom of the available area. -->
    <div class="min-h-0 flex-1">
      <AiPlanCreator
        v-if="activeMode === 'plan'"
        :project-id="selectedProjectId"
        :prefill-prompt="assistantPrefillPrompt"
        :mode="activeMode"
        @view-in-backlog="viewInBacklog"
        @request-project-change="selectProject"
        @update:mode="setMode"
      />
      <AiAssistantPanel
        v-else-if="activeMode === 'assistant'"
        :project-id="selectedProjectId"
        :mode="activeMode"
        @generate-plan="handleGeneratePlanFromAssistant"
        @update:project-id="selectProject"
        @update:mode="setMode"
      />
      <AiHealthCheckPanel
        v-else
        :project-id="selectedProjectId"
        :mode="activeMode"
        @update:project-id="selectProject"
        @update:mode="setMode"
      />
    </div>

    <!-- Single corner help launcher for the whole workspace -- shared across
         all three tools rather than repeated inline in each composer. -->
    <button
      type="button"
      title="Help with the AI workspace"
      class="fixed bottom-6 left-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-subtle shadow-lg transition hover:border-primary/40 hover:text-primary"
      @click="openHelp"
    >
      <HelpCircle class="h-5 w-5" />
    </button>

    <HelpHubPanel
      v-if="helpHubOpen"
      :active-mode="activeMode"
      @close="helpHubOpen = false"
      @start="startTour"
    />
    <GuidedTourOverlay
      v-if="activeTour"
      :mode="activeTour"
      @close="finishTour"
    />
  </div>
</template>
