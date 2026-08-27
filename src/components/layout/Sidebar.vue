<script setup lang="ts">
import {
  WorkflowIcon,
  Headset,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-vue-next";

import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import SupportModal from "./SupportModal.vue";
import { useAuthStore } from "@/stores/authStore";
import { usePermissions } from "@/composables/usePermissions";
import { useSidebarCollapsed } from "@/composables/useSidebarCollapsed";
import { getNavItems, getScopeNote } from "@/lib/navConfig";

const isSupportOpen = ref(false);
const authStore = useAuthStore();
const { role } = usePermissions();
const { collapsed, toggle } = useSidebarCollapsed();

const route = useRoute();
const router = useRouter();

const onLogout = () => {
  authStore.logout();
  router.push("/auth/login/");
};

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
  activeItem.value === section ? "font-semibold bg-primary-soft text-primary" : "text-[#7D8592]";
const setIconColor = (section: string) =>
  activeItem.value === section ? "text-primary stroke-primary" : "text-[#7D8592] stroke-[#7D8592]";
</script>

<template>
  <!-- Desktop / tablet rail -->
  <nav
    aria-label="Primary"
    class="wr-rail sticky top-4 hidden h-[calc(100vh-2rem)] shrink-0 flex-col justify-between overflow-y-auto rounded-2xl py-4 md:flex"
    :class="collapsed ? 'w-[72px] px-2' : 'w-64 px-4 xl:w-64'"
  >
    <div class="space-y-6">
      <div class="flex items-center gap-2 px-1" :class="collapsed ? 'justify-center' : ''">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/70">
          <WorkflowIcon class="h-6 w-6 text-primary" />
        </div>
        <span v-if="!collapsed" class="truncate text-xl font-bold text-primary">Workroom</span>
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
        class="wr-well rounded-xl px-3 py-2 text-[11px] leading-snug text-[#7D8592]"
      >
        {{ scopeNote }}
      </p>

      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#3F8CFF] to-accent-2 py-2.5 text-sm font-medium text-white shadow-[0_8px_22px_rgba(63,140,255,0.38)] transition hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        :title="collapsed ? 'Support' : undefined"
        @click="isSupportOpen = true"
      >
        <Headset class="h-4 w-4 shrink-0" />
        <span v-if="!collapsed">Support</span>
      </button>

      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium text-[#7D8592] transition hover:bg-white/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        :title="collapsed ? 'Logout' : undefined"
        @click="onLogout"
      >
        <LogOut class="h-4 w-4 shrink-0" />
        <span v-if="!collapsed">Logout</span>
      </button>

      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-medium text-[#7D8592] transition hover:bg-white/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        @click="toggle"
      >
        <component :is="collapsed ? PanelLeftOpen : PanelLeftClose" class="h-4 w-4 shrink-0" />
        <span v-if="!collapsed">Collapse</span>
      </button>
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

  <SupportModal v-model:open="isSupportOpen" />
</template>
