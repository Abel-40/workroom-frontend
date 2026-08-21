<script setup lang="ts">
// Full-page AI workspace: three modes of one coherent surface rather than
// three unrelated pages. Project selection is split deliberately: Plan
// Creator has no separate picker at all (selected via @mention inside its
// composer, see AiComposer.vue), while Assistant/Health -- which have no
// natural place to "mention" a project -- keep a compact context pill.
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Sparkles } from "lucide-vue-next";
import { useProjectStore } from "@/stores/projectStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import AiModeSwitcher, { type AiMode } from "@/components/ai/AiModeSwitcher.vue";
import AiProjectPicker from "@/components/ai/AiProjectPicker.vue";
import AiEmptyState from "@/components/ai/AiEmptyState.vue";
import AiPlanCreator from "@/components/ai/AiPlanCreator.vue";
import AiAssistantPanel from "@/components/ai/AiAssistantPanel.vue";
import AiHealthCheckPanel from "@/components/ai/AiHealthCheckPanel.vue";

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const directoryStore = useDirectoryStore();

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

const assistantPrefill = ref("");

function handleGeneratePlanFromAssistant(prefillPrompt: string) {
  assistantPrefill.value = prefillPrompt;
  setMode("plan");
}

function viewInBacklog() {
  if (!selectedProjectId.value) return;
  router.push({
    name: "admin-dashboard",
    query: { section: "projects", id: selectedProjectId.value, details: "true", aiGenerated: "true" },
  });
}

onMounted(() => {
  if (!projectStore.projects.length) projectStore.fetchProjects();
  if (!directoryStore.loaded) directoryStore.fetchAll();
});

watch(activeMode, (mode) => {
  if (mode !== "plan") assistantPrefill.value = "";
});
</script>

<template>
  <div class="w-full max-w-5xl px-4 py-6 md:px-8 xl:max-w-6xl">
    <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="flex items-center gap-2 text-2xl font-semibold text-ink">
          <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-500 text-white">
            <Sparkles class="h-4 w-4" />
          </span>
          AI Workspace
        </h1>
        <p class="mt-1 text-sm text-subtle">Plan, ask, and check the health of your projects with AI.</p>
      </div>
      <AiProjectPicker
        v-if="activeMode !== 'plan'"
        :projects="projectStore.projects"
        :model-value="selectedProjectId"
        @update:model-value="selectProject"
      />
    </div>

    <div class="mb-5 max-w-md">
      <AiModeSwitcher :model-value="activeMode" @update:model-value="setMode" />
    </div>

    <AiEmptyState v-if="activeMode !== 'plan' && !selectedProjectId" @choose="setMode" />

    <div v-else class="space-y-4">
      <AiPlanCreator
        v-if="activeMode === 'plan'"
        :project-id="selectedProjectId"
        :prefill-prompt="assistantPrefill"
        @view-in-backlog="viewInBacklog"
        @request-project-change="selectProject"
      />
      <AiAssistantPanel
        v-else-if="activeMode === 'assistant'"
        :project-id="selectedProjectId"
        @generate-plan="handleGeneratePlanFromAssistant"
      />
      <AiHealthCheckPanel v-else :project-id="selectedProjectId" />
    </div>
  </div>
</template>
