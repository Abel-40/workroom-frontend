import { defineStore } from "pinia";
import type { AiMode } from "@/types/aiWorkspace";

// Purely local UI preference (which walkthroughs have been completed, and
// whether new ones should auto-start) -- nothing here is shared across
// devices or users, so it lives in localStorage rather than the backend.
export const useAiWorkspaceUiStore = defineStore("aiWorkspaceUiStore", {
  state: () => ({
    tourEnabled: true,
    completedAt: {} as Partial<Record<AiMode, string>>,
  }),
  getters: {
    hasCompleted: (state) => (mode: AiMode) => !!state.completedAt[mode],
  },
  actions: {
    markCompleted(mode: AiMode) {
      this.completedAt[mode] = new Date().toISOString();
    },
    resetCompleted(mode: AiMode) {
      delete this.completedAt[mode];
    },
  },
  persist: {
    key: "pinia-aiWorkspaceUiStore",
    storage: localStorage,
  },
});
