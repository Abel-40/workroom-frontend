<script setup lang="ts">
import {
  ChevronDown,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  UserRound,
} from "lucide-vue-next";

import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import logoUrl from "@/assets/logo.png";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/authStore";
import { ROLE_LABELS } from "@/stores/employeeStore";
import { usePermissions } from "@/composables/usePermissions";
import { useSidebarCollapsed } from "@/composables/useSidebarCollapsed";
import { getNavItems, getScopeNote } from "@/lib/navConfig";

const authStore = useAuthStore();
const { role } = usePermissions();
const { collapsed, toggle } = useSidebarCollapsed();

const route = useRoute();
const router = useRouter();

// Ported straight from Header.vue -- same three actions, now triggered from
// the sidebar's own user card instead of the header's avatar dropdown.
const onLogout = () => {
  authStore.logout();
  router.push("/auth/login/");
};
const goToProfile = () => router.push({ name: "admin-dashboard", query: { section: "profile" } });
const goToSettings = () => router.push({ name: "admin-dashboard", query: { section: "settings" } });

const displayName = computed(() => authStore.logedInUserInfo?.user?.username || "Abel");
const roleLabel = computed(() => (role.value ? ROLE_LABELS[role.value] : ""));
const initials = (name: string) =>
  (name || "?").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

// Make activeItem track the section query param reactively
const activeItem = ref(route.query.section ?? "dashboard");
watch(
  () => route.query.section,
  (newSection) => {
    if (typeof newSection === "string") activeItem.value = newSection;
  },
  { immediate: true }
);

const navItems = computed(() => getNavItems(role.value));
const scopeNote = computed(() => getScopeNote(role.value));

const setItemClass = (section: string) =>
  activeItem.value === section ? "font-semibold bg-primary-soft text-primary" : "text-muted-foreground";
const setIconColor = (section: string) =>
  activeItem.value === section ? "text-primary stroke-primary" : "text-muted-foreground stroke-muted-foreground";
</script>

<template>
  <!-- Desktop / tablet rail -->
  <nav
    aria-label="Primary"
    class="wr-rail sticky top-4 hidden h-[calc(100vh-2rem)] shrink-0 flex-col justify-between overflow-y-auto rounded-2xl py-4 md:flex"
    :class="collapsed ? 'w-[72px] px-2' : 'w-64 px-4 xl:w-64'"
  >
    <div class="space-y-6">
      <div v-if="collapsed" class="flex flex-col items-center gap-2 px-1">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-card">
          <img :src="logoUrl" alt="" class="h-6 w-6 object-contain" />
        </div>
        <button
          type="button"
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          title="Expand sidebar"
          @click="toggle"
        >
          <PanelLeftOpen class="h-4 w-4" />
        </button>
      </div>
      <div v-else class="flex items-center justify-between gap-2 px-1">
        <div class="flex min-w-0 items-center gap-2">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-card">
            <img :src="logoUrl" alt="" class="h-6 w-6 object-contain" />
          </div>
          <span class="truncate text-xl font-bold text-primary">Workroom</span>
        </div>
        <button
          type="button"
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          title="Collapse sidebar"
          @click="toggle"
        >
          <PanelLeftClose class="h-4 w-4" />
        </button>
      </div>

      <ul class="space-y-1">
        <li v-for="navItem in navItems" :key="navItem.key">
          <RouterLink
            :to="{ name: 'admin-dashboard', query: { section: navItem.sectionName } }"
            :aria-current="activeItem === navItem.sectionName ? 'page' : undefined"
            :title="collapsed ? navItem.title : undefined"
            class="flex h-11 items-center gap-3 rounded-xl px-2.5 outline-none transition focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            :class="[setItemClass(navItem.sectionName), collapsed ? 'justify-center' : '']"
            @click="activeItem = navItem.sectionName"
          >
            <component :is="navItem.icon" class="h-5 w-5 shrink-0" :class="setIconColor(navItem.sectionName)" />
            <span v-if="!collapsed" class="truncate text-sm">{{ navItem.title }}</span>
          </RouterLink>
        </li>
      </ul>
    </div>

    <div class="space-y-3">
      <p
        v-if="scopeNote && !collapsed"
        class="wr-well rounded-xl px-3 py-2 text-[11px] leading-snug text-muted-foreground"
      >
        {{ scopeNote }}
      </p>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-xl p-2 text-left transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            :class="collapsed ? 'justify-center' : ''"
            :title="collapsed ? displayName : undefined"
          >
            <Avatar size="sm" class="h-8 w-8 shrink-0 text-xs">
              <AvatarFallback>{{ initials(displayName) }}</AvatarFallback>
            </Avatar>
            <span v-if="!collapsed" class="min-w-0 flex-1">
              <span class="block truncate text-sm font-medium text-ink">{{ displayName }}</span>
              <span class="block truncate text-xs text-subtle">{{ roleLabel }}</span>
            </span>
            <ChevronDown v-if="!collapsed" class="h-4 w-4 shrink-0 text-subtle" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" class="w-56">
          <DropdownMenuItem @click="goToProfile">
            <UserRound class="mr-2 h-4 w-4" /> My Profile
          </DropdownMenuItem>
          <DropdownMenuItem @click="goToSettings">
            <Settings class="mr-2 h-4 w-4" /> Settings
          </DropdownMenuItem>
          <DropdownMenuItem class="text-destructive" @click="onLogout">
            <LogOut class="mr-2 h-4 w-4" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </nav>

  <!-- Mobile bottom bar -->
  <nav
    aria-label="Primary"
    class="wr-rail fixed inset-x-3 bottom-3 z-50 flex items-center justify-between gap-1 overflow-x-auto rounded-2xl px-2 py-2 md:hidden"
  >
    <RouterLink
      v-for="navItem in navItems"
      :key="navItem.key"
      :to="{ name: 'admin-dashboard', query: { section: navItem.sectionName } }"
      :aria-current="activeItem === navItem.sectionName ? 'page' : undefined"
      class="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-1.5 outline-none focus-visible:ring-2 focus-visible:ring-primary"
      :class="setItemClass(navItem.sectionName)"
      @click="activeItem = navItem.sectionName"
    >
      <component :is="navItem.icon" class="h-5 w-5 shrink-0" :class="setIconColor(navItem.sectionName)" />
    </RouterLink>
  </nav>
</template>
