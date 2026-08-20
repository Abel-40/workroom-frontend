<script setup lang="ts">
import {
  LayoutDashboard,
  WorkflowIcon,
  SquareDashedKanban,
  CalendarDays,
  Users,
  Building2,
  MessageSquare,
  FolderKanban,
  Headset,
  LogOut,
} from "lucide-vue-next";

import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import SupportModal from "./SupportModal.vue";
import { useAuthStore } from "@/stores/authStore";

const isSupportOpen = ref(false);
const authStore = useAuthStore();
const onLogout = () => {
  authStore.logout();
  router.push("/auth/login/");
};

const route = useRoute();
const router = useRouter();

// ✅ Make activeItem track the section query param reactively
const activeItem = ref(route.query.section ?? "dashboard"); // default to dashboard if missing

// ✅ Watch for route changes and keep activeItem updated
watch(
  () => route.query.section,
  (newSection) => {
    if (typeof newSection === "string") {
      activeItem.value = newSection;
    }
  },
  { immediate: true }
);

const navItems = [
  { title: "Dashboard", sectionName: "dashboard" },
  { title: "Projects", sectionName: "projects" },
  { title: "Calendar", sectionName: "calendar" },
  { title: "Employees", sectionName: "employees" },
  { title: "Departments", sectionName: "departments" },
  { title: "Messenger", sectionName: "messenger" },
  { title: "Info Portal", sectionName: "info-portal" },
];

const setNavIcon = (title: string) => {
  switch (title) {
    case "Dashboard":
      return LayoutDashboard;
    case "Projects":
      return SquareDashedKanban;
    case "Calendar":
      return CalendarDays;
    case "Employees":
      return Users;
    case "Departments":
      return Building2;
    case "Messenger":
      return MessageSquare;
    case "Info Portal":
      return FolderKanban;
    default:
      return WorkflowIcon;
  }
};

const setItemClass = (index: string) => {
  return activeItem.value === index
    ? "font-semibold bg-blue-50 text-[#3F8CFF]"
    : "text-[#7D8592]";
};

const setIconColor = (index: string) => {
  return activeItem.value === index
    ? "text-[#3F8CFF] stroke-[#3F8CFF]"
    : "text-[#7D8592] stroke-[#7D8592]";
};

</script>


<template>
  <!-- Sidebar -->
  <div class="w-full md:w-64 bg-white py-4 px-6 rounded-lg md:min-h-screen shadow-lg">
    <div class="flex flex-col justify-between h-full">
      <!-- Logo and Navigation -->
      <div class="space-y-6">
        <!-- Logo -->
        <div class="flex items-center gap-2 mb-6">
          <div class="w-10 h-10 bg-background rounded-lg flex items-center justify-center">
            <WorkflowIcon class="w-6 h-6 text-[#3F8CFF]" />
          </div>
          <span class="text-xl font-bold text-[#3F8CFF]">Workroom</span>
        </div>

        <!-- Navigation -->
        <nav class="space-y-2">
          <RouterLink
            v-for="(navItem, index) in navItems"
            :key="index"
            :to="{ name: 'admin-dashboard', query: { section: navItem.sectionName } }"
          >
            <div
              class="min-w-[90px] h-[50px] flex justify-between items-center cursor-pointer"
              @click="activeItem = navItem.sectionName"
            >
              <a
                class="flex-1 flex items-center gap-2 p-2 h-full rounded-xl"
                :class="setItemClass(navItem.sectionName)"
              >
                <component
                  :is="setNavIcon(navItem.title)"
                  class="w-5 h-5"
                  :class="setIconColor(navItem.sectionName)"
                />
                {{ navItem.title }}
              </a>
              <div
                class="w-0 h-full rounded-xl ml-4"
                :class="activeItem === navItem.sectionName ? 'border-l-[3px] border-blue-400' : ''"
              ></div>
            </div>
          </RouterLink>
        </nav>
      </div>

      <!-- Support -->
      <div class="mt-8">
        <div class="flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-br from-[#3F8CFF] to-[#6A5CFF] p-4 text-center text-white shadow-md">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
            <Headset class="h-6 w-6" />
          </div>
          <button
            type="button"
            class="flex w-full items-center justify-center gap-2 rounded-xl bg-white/15 py-2 text-sm font-medium transition hover:bg-white/25"
            @click="isSupportOpen = true"
          >
            <Headset class="h-4 w-4" />
            Support
          </button>
        </div>

        <button
          type="button"
          class="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium text-[#7D8592] transition hover:bg-blue-50 hover:text-[#3F8CFF]"
          @click="onLogout"
        >
          <LogOut class="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>

    <SupportModal v-model:open="isSupportOpen" />
  </div>
</template>
