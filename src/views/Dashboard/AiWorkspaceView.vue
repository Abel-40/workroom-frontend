<script setup lang="ts">
// Full-page AI workspace: replaces the old modal-based "AI Tools" entry.
// One shared project selector drives all three tools, per spec §8 ("do not
// create three completely separate implementations for project selection").
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProjectStore } from "@/stores/projectStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import AiProjectPicker from "@/components/ai/AiProjectPicker.vue";
import AiPlanCreator from "@/components/ai/AiPlanCreator.vue";
import AiAssistantPanel from "@/components/ai/AiAssistantPanel.vue";
import AiHealthCheckPanel from "@/components/ai/AiHealthCheckPanel.vue";

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const directoryStore = useDirectoryStore();

type Tool = "plan" | "assistant" | "health";
const TOOLS: { value: Tool; label: string }[] = [
  { value: "plan", label: "AI Plan Creator" },
  { value: "assistant", label: "AI Assistant" },
  { value: "health", label: "AI Health Check" },
];
const activeTool = ref<Tool>("plan");
const assistantPrefill = ref("");

const selectedProjectId = computed<string | null>(() =>
  typeof route.query.project === "string" ? route.query.project : null
);

function selectProject(projectId: string | null) {
  router.replace({ query: { ...route.query, project: projectId ?? undefined } });
}

function handleGeneratePlanFromAssistant(prefillPrompt: string) {
  assistantPrefill.value = prefillPrompt;
  activeTool.value = "plan";
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

watch(activeTool, () => {
  if (activeTool.value !== "plan") assistantPrefill.value = "";
});
</script>

<template>
  <div class="w-full max-w-4xl px-4 py-6 md:px-8">
    <h1 class="mb-1 text-2xl font-semibold text-ink">AI Workspace</h1>
    <p class="mb-6 text-sm text-subtle">Plan, ask, and check the health of your projects with AI.</p>

    <div class="mb-4 flex gap-1 rounded-xl bg-page p-1">
      <button
        v-for="tool in TOOLS"
        :key="tool.value"
        type="button"
        class="flex-1 rounded-lg py-2 text-sm font-medium transition"
        :class="activeTool === tool.value ? 'bg-white text-ink shadow-sm' : 'text-subtle'"
        @click="activeTool = tool.value"
      >
        {{ tool.label }}
      </button>
    </div>

    <div class="mb-4">
      <AiProjectPicker :projects="projectStore.projects" :model-value="selectedProjectId" @update:model-value="selectProject" />
    </div>

    <div class="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <AiPlanCreator
        v-if="activeTool === 'plan'"
        :project-id="selectedProjectId"
        :prefill-prompt="assistantPrefill"
        @view-in-backlog="viewInBacklog"
        @request-project-change="selectProject"
      />
      <AiAssistantPanel
        v-else-if="activeTool === 'assistant'"
        :project-id="selectedProjectId"
        @generate-plan="handleGeneratePlanFromAssistant"
      />
      <AiHealthCheckPanel v-else :project-id="selectedProjectId" />
    </div>
  </div>
</template>
