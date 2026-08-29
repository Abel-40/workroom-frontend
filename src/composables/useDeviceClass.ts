import { computed, ref } from "vue";

// Module-level singleton, same shape/justification as useTheme.ts: a pure
// viewport-derived UI fact, not domain data -- a Pinia store would be
// overkill, and every consumer (the axios read-only interceptor, Kanban drag
// handler, "Create X" buttons, the floating quick-create menu) needs the
// same live value without prop-drilling.
const MOBILE_QUERY = "(max-width: 767px)";
const TABLET_QUERY = "(min-width: 768px) and (max-width: 1024px)";

function matches(query: string): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia(query).matches
    : false;
}

const isMobile = ref(matches(MOBILE_QUERY));
const isTablet = ref(matches(TABLET_QUERY));

function watchQuery(query: string, target: typeof isMobile) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
  const media = window.matchMedia(query);
  const onChange = (event: MediaQueryListEvent) => (target.value = event.matches);
  if (media.addEventListener) media.addEventListener("change", onChange);
  else media.addListener(onChange); // Safari < 14 fallback
}

watchQuery(MOBILE_QUERY, isMobile);
watchQuery(TABLET_QUERY, isTablet);

const isDesktop = computed(() => !isMobile.value && !isTablet.value);
// Mobile is read-only app-wide (see the axios request interceptor in
// plugins/axios.ts) -- tablet and desktop both keep full read/write access.
const isReadOnly = computed(() => isMobile.value);

export function useDeviceClass() {
  return { isMobile, isTablet, isDesktop, isReadOnly };
}
