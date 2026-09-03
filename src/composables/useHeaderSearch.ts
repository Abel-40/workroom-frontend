import { ref } from "vue";

// Module-level singleton, same justification as useSidebarCollapsed.ts: the
// global search box lives in AppShell's header now (one instance for the
// whole app, so it can stay fixed while pages scroll underneath), which means
// list pages can no longer receive keystrokes from it via a per-page emit.
// They watch this instead. Header owns the writes; pages only read.
const query = ref("");

export function useHeaderSearch() {
  return {
    query,
    reset: () => {
      query.value = "";
    },
  };
}
