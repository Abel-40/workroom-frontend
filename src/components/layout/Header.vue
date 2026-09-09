<script setup lang="ts">
import {
  Search,
  Bell,
  Moon,
  Sun,
  X,
  FolderKanban,
  Users,
  Building2,
  UserCircle,
} from "lucide-vue-next";

import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useNotificationStore } from "@/stores/notificationStore";
import { useProjectStore } from "@/stores/projectStore";
import { useEmployeeStore } from "@/stores/employeeStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import { usePermissions } from "@/composables/usePermissions";
import { useHeaderSearch } from "@/composables/useHeaderSearch";
import { getNavItems } from "@/lib/navConfig";
import { getVisibleSettingsTabs } from "@/lib/settingsTabs";
import NotificationsPanel from "@/components/layout/NotificationsPanel.vue";
import { useTheme } from "@/composables/useTheme";

const route = useRoute();
const router = useRouter();
const notificationStore = useNotificationStore();
const projectStore = useProjectStore();
const employeeStore = useEmployeeStore();
const directoryStore = useDirectoryStore();
const { role } = usePermissions();

const isNotificationsOpen = ref(false);
const isSearchFocused = ref(false);

/* ============================================================
   SEARCH
   ============================================================
   Client-side, over data already loaded for the current company --
   there's no backend search endpoint, and no globally-loaded task
   list (tasks are only fetched per-project), so Tasks aren't a
   searchable category here yet.

   The query lives in a shared singleton rather than local state: this
   header is mounted once by AppShell for the whole app, and list pages
   (Projects/Employees/Departments/Info Portal) filter themselves off the
   same value. */
const { query: searchQuery } = useHeaderSearch();

const clearSearch = () => {
  searchQuery.value = "";
};

// Switching sections keeps the one header instance mounted, so an old query
// would otherwise linger and silently filter the page you just landed on.
watch(() => route.query.section, clearSearch);

// Every reachable, searchable "page" result -- sidebar sections, My Profile,
// and each Settings tab individually (not just the Settings page as a whole,
// so e.g. searching "payments" lands directly on that tab). Settings tabs
// carry a `tab` query param that SettingsView.vue reads on mount to
// pre-select the right one; permission-gated the same way the Settings
// page itself gates them (see lib/settingsTabs.ts).
const pageResults = computed(() => {
  const navPages = getNavItems(role.value).map((item) => ({
    key: item.key,
    title: item.title,
    icon: item.icon,
    query: { section: item.sectionName },
  }));

  const profilePage = {
    key: "profile",
    title: "My Profile",
    icon: UserCircle,
    query: { section: "profile" },
  };

  const settingsPages = getVisibleSettingsTabs(role.value).map((tab) => ({
    key: `settings-${tab.key}`,
    title: `Settings – ${tab.label}`,
    icon: tab.icon,
    query: { section: "settings", tab: tab.key },
  }));

  return [...navPages, profilePage, ...settingsPages];
});

const normalizedQuery = computed(() => searchQuery.value.trim().toLowerCase());
const showResults = computed(() => isSearchFocused.value && normalizedQuery.value.length > 0);

const matchedProjects = computed(() => {
  const q = normalizedQuery.value;
  if (!q) return [];
  return projectStore.projects.filter((p) => p.title.toLowerCase().includes(q)).slice(0, 5);
});

const matchedPeople = computed(() => {
  const q = normalizedQuery.value;
  if (!q) return [];
  return employeeStore.employees.filter((e) => e.name.toLowerCase().includes(q)).slice(0, 5);
});

const matchedDepartments = computed(() => {
  const q = normalizedQuery.value;
  if (!q) return [];
  return directoryStore.departments.filter((d) => d.name.toLowerCase().includes(q)).slice(0, 5);
});

const matchedPages = computed(() => {
  const q = normalizedQuery.value;
  if (!q) return [];
  return pageResults.value.filter((item) => item.title.toLowerCase().includes(q)).slice(0, 6);
});

const hasResults = computed(
  () =>
    matchedProjects.value.length > 0 ||
    matchedPeople.value.length > 0 ||
    matchedDepartments.value.length > 0 ||
    matchedPages.value.length > 0
);

const goToResult = (query: Record<string, string>) => {
  router.push({ name: "admin-dashboard", query });
  clearSearch();
  isSearchFocused.value = false;
};

/*
 * "/" focuses the global search.
 * Escape clears it.
 */
const handleGlobalShortcut = (event: KeyboardEvent) => {
  if (
    event.key === "/" &&
    !["INPUT", "TEXTAREA"].includes(
      (event.target as HTMLElement)?.tagName
    )
  ) {
    event.preventDefault();

    const input = document.getElementById("global-search");

    input?.focus();
  }

  if (event.key === "Escape" && searchQuery.value) {
    clearSearch();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleGlobalShortcut);

  // Guarded -- most pages already load their own slice of this data;
  // this only fills in whatever a given page hasn't fetched yet, so
  // search works no matter which page the header is rendered on.
  if (!projectStore.projects.length) projectStore.fetchProjects();
  if (!employeeStore.employees.length) employeeStore.fetchEmployees();
  if (!directoryStore.loaded) directoryStore.fetchAll();
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleGlobalShortcut);
});

/* ============================================================
   THEME
   ============================================================ */

const { isDark, setTheme } = useTheme();

const toggleTheme = () => {
  setTheme(isDark.value ? "light" : "dark");
};
</script>

<template>
  <!-- ========================================================= -->
  <!-- GLOBAL HEADER -->
  <!-- ========================================================= -->

  <!-- No sticky/fixed positioning needed: AppShell renders this outside the
       scrolling region, so it physically can't scroll away. Transparent so it
       reads as the page background (.wr-shell's gradient) rather than a bar. -->
  <header
    class="mb-2 flex w-full shrink-0 items-center justify-between gap-4 bg-transparent"
  >
    <!-- ======================================================= -->
    <!-- SEARCH -->
    <!-- ======================================================= -->

    <div
      class="relative min-w-0 flex-1 md:max-w-xl"
    >
      <div
        class="group relative flex h-11 items-center rounded-xl border bg-card transition-all duration-200"
        :class="
          isSearchFocused
            ? 'border-[hsl(var(--primary-strong)/0.35)] shadow-[0_0_0_3px_hsl(var(--primary-soft)/0.55)]'
            : 'border-border shadow-sm hover:border-[hsl(var(--primary-strong)/0.2)] hover:shadow-md'
        "
      >
        <!-- Search icon -->
        <Search
          class="pointer-events-none absolute left-3.5 h-[17px] w-[17px] transition-colors duration-200"
          :class="
            isSearchFocused
              ? 'text-[hsl(var(--primary-strong))]'
              : 'text-subtle'
          "
        />

        <!-- Input -->
        <Input
          id="global-search"
          v-model="searchQuery"
          type="text"
          placeholder="Search anything..."
          autocomplete="off"
          class="h-full border-0 bg-transparent pl-10 pr-20 text-sm shadow-none placeholder:text-subtle focus-visible:ring-0"
          @focus="isSearchFocused = true"
          @blur="isSearchFocused = false"
        />

        <!-- Right search controls -->
        <div
          class="pointer-events-none absolute right-2.5 flex items-center gap-1.5"
        >
          <!-- Clear -->
          <button
            v-if="searchQuery"
            type="button"
            class="pointer-events-auto flex h-6 w-6 items-center justify-center rounded-md text-subtle transition-colors hover:bg-muted hover:text-ink"
            aria-label="Clear search"
            @mousedown.prevent
            @click="clearSearch"
          >
            <X class="h-3.5 w-3.5" />
          </button>

          <!-- Keyboard shortcut -->
          <kbd
            v-if="!searchQuery"
            class="hidden items-center rounded-md border border-border bg-muted/70 px-1.5 py-0.5 font-mono text-[10px] font-medium text-subtle sm:flex"
          >
            /
          </kbd>
        </div>
      </div>

      <!-- ===================================================== -->
      <!-- RESULTS -->
      <!-- ===================================================== -->

      <div
        v-if="showResults"
        class="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-card p-2 shadow-xl"
      >
        <div v-if="!hasResults" class="px-3 py-6 text-center text-sm text-subtle">
          No results for "{{ searchQuery }}"
        </div>

        <template v-else>
          <div v-if="matchedProjects.length" class="mb-1">
            <p class="px-2.5 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[.06em] text-subtle">Projects</p>
            <button
              v-for="project in matchedProjects"
              :key="project.id"
              type="button"
              class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-ink transition-colors hover:bg-muted"
              @mousedown.prevent
              @click="goToResult({ section: 'projects', id: project.id })"
            >
              <FolderKanban class="h-4 w-4 shrink-0 text-subtle" />
              <span class="truncate">{{ project.title }}</span>
            </button>
          </div>

          <div v-if="matchedPeople.length" class="mb-1">
            <p class="px-2.5 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[.06em] text-subtle">People</p>
            <button
              v-for="person in matchedPeople"
              :key="person.id"
              type="button"
              class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-ink transition-colors hover:bg-muted"
              @mousedown.prevent
              @click="goToResult({ section: 'employee-detail', employeeId: person.id })"
            >
              <Users class="h-4 w-4 shrink-0 text-subtle" />
              <span class="min-w-0 flex-1 truncate">{{ person.name }}</span>
              <span v-if="person.department" class="shrink-0 text-xs text-subtle">{{ person.department }}</span>
            </button>
          </div>

          <div v-if="matchedDepartments.length" class="mb-1">
            <p class="px-2.5 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[.06em] text-subtle">Departments</p>
            <button
              v-for="dept in matchedDepartments"
              :key="dept.id"
              type="button"
              class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-ink transition-colors hover:bg-muted"
              @mousedown.prevent
              @click="goToResult({ section: 'department-detail', departmentId: dept.id })"
            >
              <Building2 class="h-4 w-4 shrink-0 text-subtle" />
              <span class="truncate">{{ dept.name }}</span>
            </button>
          </div>

          <div v-if="matchedPages.length">
            <p class="px-2.5 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[.06em] text-subtle">Pages</p>
            <button
              v-for="page in matchedPages"
              :key="page.key"
              type="button"
              class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-ink transition-colors hover:bg-muted"
              @mousedown.prevent
              @click="goToResult(page.query)"
            >
              <component :is="page.icon" class="h-4 w-4 shrink-0 text-subtle" />
              <span class="truncate">{{ page.title }}</span>
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- ======================================================= -->
    <!-- RIGHT CONTROLS -->
    <!-- ======================================================= -->

    <div class="flex shrink-0 items-center gap-2 ">
      <!-- Theme -->
      <Button
        variant="ghost"
        size="icon"
        class="relative h-10 w-10 rounded-xl border border-transparent bg-card text-subtle shadow-sm transition-all duration-200 hover:border-border hover:bg-muted hover:text-ink hover:shadow-md"
        :title="
          isDark
            ? 'Switch to light mode'
            : 'Switch to dark mode'
        "
        :aria-label="
          isDark
            ? 'Switch to light mode'
            : 'Switch to dark mode'
        "
        @click="toggleTheme"
      >
        <Sun
          v-if="isDark"
          class="h-[18px] w-[18px] transition-transform duration-300"
        />

        <Moon
          v-else
          class="h-[18px] w-[18px] transition-transform duration-300"
        />
      </Button>

      <!-- Notifications -->
      <Popover v-model:open="isNotificationsOpen">
        <PopoverTrigger as-child>
          <Button
            variant="ghost"
            size="icon"
            class="relative h-10 w-10 rounded-xl border border-transparent bg-card text-subtle shadow-sm transition-all duration-200 hover:border-border hover:bg-muted hover:text-ink hover:shadow-md"
            aria-label="Notifications"
          >
            <Bell class="h-[18px] w-[18px]" />

            <!-- Unread indicator -->
            <span
              v-if="notificationStore.unreadCount"
              class="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-card"
            />

            <!-- Count -->
            <span
              v-if="
                notificationStore.unreadCount > 0 &&
                notificationStore.unreadCount < 10
              "
              class="absolute -right-1.5 -top-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white shadow-sm ring-2 ring-background"
            >
              {{ notificationStore.unreadCount }}
            </span>

            <span
              v-else-if="notificationStore.unreadCount >= 10"
              class="absolute -right-1.5 -top-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold leading-none text-white shadow-sm ring-2 ring-background"
            >
              9+
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          :side-offset="10"
          class="w-auto overflow-hidden rounded-2xl border-border bg-card p-0 shadow-xl"
        >
          <NotificationsPanel />
        </PopoverContent>
      </Popover>
    </div>
  </header>
</template>