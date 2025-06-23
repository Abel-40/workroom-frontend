<script setup lang="ts">
import {
  LayoutDashboard,
  WorkflowIcon,
  Puzzle,
  SquareDashedKanban,
  Users,
  ChartNoAxesCombined,
  CircleEllipsis,
  LogOut,
} from "lucide-vue-next";

import Button from "@/components/ui/button/Button.vue";
import { ref, watch } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

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
  { title: "Departments", sectionName: "departments" },
  { title: "Projects", sectionName: "projects" },
  { title: "Users", sectionName: "users" },
  { title: "Performance", sectionName: "performance" },
  { title: "Others", sectionName: "other" },
];

// ✅ Router navigation on click to sync section query
const navigateToSection = (section: string) => {
  activeItem.value = section;
  router.push({ path: "/auth/", query: { section } });
};

const setNavIcon = (title: string) => {
  switch (title) {
    case "Dashboard":
      return LayoutDashboard;
    case "Projects":
      return SquareDashedKanban;
    case "Users":
      return Users;
    case "Performance":
      return ChartNoAxesCombined;
    case "Departments":
      return Puzzle;
    case "Others":
      return CircleEllipsis;
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

const logout = () => {
  if (authStore.logedInUserInfo.is_authenticated) {
    authStore.logout();
    router.push("/Auth/login/");
  }
};
</script>


<template>
  <!-- Sidebar -->
  <div class="w-full md:w-64 bg-white py-4 pl-6 rounded-lg md:min-h-screen shadow-lg">
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
                class="min-w-[210px] flex items-center gap-2 p-2 h-full rounded-xl"
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

      <!-- User Profile and Logout -->
      <div class="mt-8 space-y-4 flex flex-col items-center">
        <div class="p-2 rounded-lg w-[200px]">
          <img
            src="https://plus.unsplash.com/premium_photo-1661290256778-3b821d52c514?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="User profile"
            class="rounded-lg object-cover"
          />
        </div>
        <Button class="flex items-center  gap-2 text-gray-600 hover:text-gray-900"  @click="logout">
          <LogOut class="w-5 h-5"/>
          <span>Logout</span>
        </Button>
      </div>
    </div>
  </div>
</template>
