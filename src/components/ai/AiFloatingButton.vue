<script setup lang="ts">
// Persistent entry point into the full-page AI workspace -- replaces the
// old per-project "AI Tools" modal button. Fixed to the bottom-right corner
// of the viewport, visible across the whole dashboard shell.
import { Sparkles } from "lucide-vue-next";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

function open() {
  const projectId = typeof route.query.id === "string" ? route.query.id : undefined;
  router.push({ name: "admin-dashboard", query: { section: "ai-workspace", ...(projectId ? { project: projectId } : {}) } });
}
</script>

<template>
  <button
    v-if="route.query.section !== 'ai-workspace'"
    type="button"
    title="AI Workspace"
    class="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-500 text-white shadow-lg shadow-primary/30 transition hover:scale-105 hover:shadow-xl active:scale-95"
    @click="open"
  >
    <Sparkles class="h-6 w-6" />
  </button>
</template>
