<script setup lang="ts">
import {
  LayoutDashboard,
  WorkflowIcon,
  Puzzle,
  SquareDashedKanban,
  Users,
  ChartNoAxesCombined,
  CircleEllipsis,
  CircleHelp,
  Menu,
  X,
} from "lucide-vue-next";

import Button from "@/components/ui/button/Button.vue";
import { ref, watch } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// Make activeItem track the section query param reactively
const activeItem = ref(route.query.section ?? "dashboard"); // default to dashboard if missing

// Watch for route changes and keep activeItem updated
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
  { title: "Department and teams", sectionName: "departments" },
  { title: "Projects", sectionName: "projects" },
  { title: "Users", sectionName: "users" },
  { title: "Performance", sectionName: "performance" },
  { title: "Others", sectionName: "other" },
];

const isMenuOpen = ref(false);
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};


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
    router.push("/auth/login/");
  }
};

</script>

<template>
  <!-- Sidebar -->
  <div class="w-full pr-5 md:w-auto md:pr-0 fixed min-h-full">
    <div class="flex flex-col justify-between h-full  bg-white rounded-lg">
      <!-- Logo and Navigation -->
      <div class="md:space-y-2 h-full">
        <!-- Logo -->
        <div class="flex justify-between items-center py-4  px-6 -mt-3 bg-white rounded-lg -ml-5 md:mt-0 md:ml-0">
          <div class="flex items-center gap-2">
            <WorkflowIcon class="w-6 h-6 text-[#3F8CFF]" />
            <span class="text-xl font-bold text-[#3F8CFF]">Workroom</span>
          </div>
          <button @click="toggleMenu" class="md:hidden ">
            <component
              :is="isMenuOpen ? X : Menu"
              class="w-6 h-6 text-[#3F8CFF]"
            />
          </button>
        </div>
        <div
          :class="[isMenuOpen ? 'block' : 'hidden', 'md:block']"
          class="flex flex-col justify-center bg-white pl-4  md:py-2 -ml-5 md:ml-0 lg:h-[80%]"
        >
          <!-- Navigation -->
          <nav class="space-y-2 lg:h-[75%] w-full">
            <RouterLink
              v-for="(navItem, index) in navItems"
              :key="index"
              :to="{
                name: 'admin-dashboard',
                query: { section: navItem.sectionName },
              }"
            >
              <div
                class="min-w-[95px] h-[50px] flex justify-between items-center cursor-pointer"
                @click="activeItem = navItem.sectionName"
              >
                <a
                  class=" w-full lg:min-w-[210px] h-full flex items-center gap-2 p-2 lg:rounded-l-xl"
                  :class="setItemClass(navItem.sectionName)"
                  @click="toggleMenu"
                >
                  <component
                    :is="setNavIcon(navItem.title)"
                    class="w-5 h-5"
                    :class="setIconColor(navItem.sectionName)"
                  />
                  {{ navItem.title }}
                </a>
                <div
                  class="w-0 h-full rounded-xl ml-4 hidden md:block"
                  :class="
                    activeItem === navItem.sectionName
                      ? 'border-l-[3px] border-blue-400'
                      : ''
                  "
                ></div>
              </div>
            </RouterLink>
          </nav>

          
          <div class="space-y-4 flex justify-center ">
            <div class="p-2 rounded-lg w-full">
              <div
                class="bg-[url('https://plus.unsplash.com/premium_photo-1681487966346-cb4a0c7a2a72?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] rounded-lg w-full max-w-[150px] aspect-square bg-cover bg-center  lg:flex lg:flex-col justify-end px-3 pb-2 hidden"
              >
                <Button
                  class="bg-[#3F8CFF] transition-all scale-100 duration-100 hover:scale-105 hover:bg-blue-300 text-xs md:text-sm"
                  @click="logout"
                >
                  Support <CircleHelp class="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </div>

              <div
                class="px-3 pb-2 lg:hidden flex justify-center"
              >
                <Button
                  class="bg-[#3F8CFF] transition-all scale-100 duration-100 hover:scale-105 hover:bg-blue-300 text-xs md:text-sm lg:hidden"
                  @click="logout"
                >
                  Support <CircleHelp class="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
