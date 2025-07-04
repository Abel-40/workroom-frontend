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
  PanelRightClose,
  PanelLeftClose,
} from "lucide-vue-next";

import Button from "@/components/ui/button/Button.vue";
import { ref, watch, defineEmits, defineProps } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useRoute, useRouter } from "vue-router";


const emit = defineEmits(["collapse", "close-sidebar"]);
const props = defineProps<{ showSidebar: boolean }>();

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const activeItem = ref(route.query.section ?? "dashboard");

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

const isCollapsed = ref(false);

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
  emit("collapse", isCollapsed.value);
};

const navigateToSection = (section: string) => {
  activeItem.value = section;
  emit("close-sidebar"); // auto-close sidebar in mobile
  router.push({ name: "admin-dashboard", query: { section } });
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
const windowWidth = ref(window.innerWidth);

window.addEventListener("resize", () => {
  windowWidth.value = window.innerWidth;
});

</script>

<template>
 <div
  class="fixed top-0 bg-white flex flex-col transition-all duration-200 overflow-x-hidden md:z-40 z-[100] overflow-y-hidden"
  :class="[
    isCollapsed ? 'w-20' : windowWidth < 768 ? 'w-24' : 'w-64',
    windowWidth < 768 ? 'left-4' : 'left-1',
    'md:block',
    props.showSidebar ? 'block z-[100]' : 'hidden md:block'
  ]"
>
    <div class="flex items-center gap-2 justify-between px-2 py-4 mt-4 ">
      <span
        v-if="!isCollapsed"
        class="flex gap-2 text-xl font-bold text-[#3F8CFF]"
      >
        <WorkflowIcon class="w-6 h-6 text-[#3F8CFF]" />
        Workroom
      </span>
      <button
        @click="toggleCollapse"
        class="hidden md:flex items-center justify-center w-10 h-10 sticky top-0 z-10"
      >
        <PanelRightClose v-if="isCollapsed" class="w-5 h-5 text-[#3F8CFF]" />
        <PanelLeftClose v-else class="w-5 h-5 text-[#3F8CFF]" />
      </button>
    </div>

    <div class="flex flex-col bg-white pl-4 md:py-2 -ml-5 md:ml-0 lg:h-[80%] flex-1 overflow-y-auto overflow-x-hidden md:justify-around">
      <div class="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div class="absolute top-8 right-2 w-[100px] md:w-[150px] h-[100px] md:h-[150px] bg-blue-400 rounded-full blur-xl"></div>
        <div class="absolute bottom-6 left-0 w-[100px] md:w-[150px] h-[100px] md:h-[150px] bg-purple-400 rounded-full blur-xl"></div>
      </div>
      <nav class="space-y-2 lg:h-[75%] w-full">
        <div v-for="(navItem, index) in navItems" :key="index">
          <div
            class="min-w-[95px] h-[50px] flex justify-between items-center cursor-pointer"
            @click="navigateToSection(navItem.sectionName)"
          >
            <a
  class="w-full lg:min-w-[210px] h-full flex items-center sm:justify-center md:justify-start gap-2 p-2 lg:rounded-l-xl transition-all duration-200 sm:w-24"
  :class="[setItemClass(navItem.sectionName), isCollapsed || windowWidth < 768 ? 'justify-center' : 'justify-start']"
>
              <component
                :is="setNavIcon(navItem.title)"
                class="w-5 h-5"
                :class="setIconColor(navItem.sectionName)"
              />
             <span v-if="!isCollapsed && windowWidth >= 768" class="b">{{ navItem.title }}</span>

            </a>
            <div
              class="w-0 h-full rounded-xl ml-4 hidden md:block"
              :class="activeItem === navItem.sectionName ? 'border-l-[3px] border-blue-400' : ''"
            ></div>
          </div>
        </div>
      </nav>

      <div class="p-4">
      <Button
        class="bg-[#8aade1] w-full text-xs md:text-sm flex items-center justify-center"
        @click="logout"
      >
        <template v-if="!isCollapsed ">
          <h2 class="hidden md:block"> Support</h2>
           <CircleHelp class="w-4 h-4 md:w-5 md:h-5 ml-1" />
        </template>
        <template v-else>
          <CircleHelp class="w-5 h-5" />
        </template>
      </Button>
    </div>

    </div>
  </div>
</template>
