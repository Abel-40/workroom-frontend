import { ref, watch } from "vue";

// Module-level singleton: Sidebar.vue and AppShell.vue both need this value
// in sync without prop-drilling or an emit round-trip, and it's a pure UI
// preference (not domain data), so a Pinia store would be overkill.
const STORAGE_KEY = "wr-sidebar-collapsed";

const collapsed = ref(false);
try {
  collapsed.value = localStorage.getItem(STORAGE_KEY) === "1";
} catch {
  // localStorage unavailable (private mode, disabled storage) -- default expanded.
}

watch(collapsed, (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    // best-effort persistence only
  }
});

export function useSidebarCollapsed() {
  return { collapsed, toggle: () => (collapsed.value = !collapsed.value) };
}
