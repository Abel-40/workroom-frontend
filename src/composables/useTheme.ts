import { computed, ref, watch } from "vue";

// Module-level singleton, same justification as useSidebarCollapsed.ts: a
// pure UI preference, not domain data -- a Pinia store would be overkill.
// index.html applies the persisted class synchronously before Vue even
// boots (avoids a flash of the wrong theme); this composable takes over
// from there and keeps it in sync (including live OS-theme changes while
// 'system' is active).
const STORAGE_KEY = "wr-theme";

export type ThemePreference = "light" | "dark" | "system";

function readStoredTheme(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    // localStorage unavailable (private mode, disabled storage) -- default to system.
  }
  return "system";
}

const theme = ref<ThemePreference>(readStoredTheme());

const systemPrefersDark = ref(
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
    : false
);

if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onChange = (event: MediaQueryListEvent) => (systemPrefersDark.value = event.matches);
  if (media.addEventListener) media.addEventListener("change", onChange);
  else media.addListener(onChange); // Safari < 14 fallback
}

const isDark = computed(() =>
  theme.value === "system" ? systemPrefersDark.value : theme.value === "dark"
);

function applyTheme() {
  document.documentElement.classList.toggle("dark", isDark.value);
}

watch(isDark, applyTheme, { immediate: true });

function setTheme(value: ThemePreference) {
  theme.value = value;
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // best-effort persistence only
  }
}

export function useTheme() {
  return { theme, isDark, setTheme };
}
