<script setup lang="ts">
import Sidebar from "@/components/Dashboard/Containers/Sidebar.vue";
import Dashboard from "@/components/Dashboard/Containers/Dashboard.vue";
import EventContainer from "@/components/Dashboard/Containers/EventsConainer.vue";
import ProjectsContianer from "@/components/Dashboard/Containers/ProjectsContainer.vue";
import ProjectsTask from "@/components/Dashboard/Containers/ProjectsTask.vue";
import LandingPage from "@/components/Dashboard/Containers/LandingPage.vue";
import Users from "@/components/Dashboard/Containers/UsersList.vue";
import { useRoute } from "vue-router";
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import Navbar from "@/components/Dashboard/Containers/SubConatiners/Navbar.vue";
import Workload from "@/components/Dashboard/Containers/SubConatiners/WorkloadStats.vue";

const route = useRoute();

const showSection = computed(() => {
  const section = route.query.section;
  if (section === "dashboard") return Dashboard;
  if (section === "events") return EventContainer;
  if (section === "landing") return LandingPage;
  if (section === "projects") return ProjectsTask;
  if (section === "users") return Users;
  if (section === "performance") return "";
  if (section === "others") return "";
  return null;
});

const isCollapsed = ref(false);
const isSidebarVisible = ref(false);

const sidebarRef = ref(null); // Vue component ref

function handleSidebarCollapse(state: boolean) {
  isCollapsed.value = state;
}

const toggleSidebar = () => {
  isSidebarVisible.value = !isSidebarVisible.value;
};

// Close sidebar on outside click
const handleClickOutside = (event: MouseEvent) => {
  if (
    isSidebarVisible.value &&
    sidebarRef.value &&
    sidebarRef.value.root && // DOM element exposed from Sidebar
    !sidebarRef.value.root.contains(event.target as Node)
  ) {
    isSidebarVisible.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div class="relative w-full min-h-screen bg-[#F4F9FD] overflow-x-hidden">
    <!-- Top navbar -->
    <Navbar :is-collapsed="isCollapsed" @toggle-sidebar="toggleSidebar" />

    <!-- Main area -->
    <div :class="isCollapsed ? 'pl-20' : 'md:pl-64'">
      <!-- Sidebar -->
      <Sidebar
        ref="sidebarRef"
        class="fixed top-20 left-0 h-full z-50"
        @collapse="handleSidebarCollapse"
        @close-sidebar="toggleSidebar"
        :showSidebar="isSidebarVisible"
      />

      <!-- Section with blue toggle line -->
      <!-- <Workload :is-collapsed="isCollapsed" @toggle-sidebar="toggleSidebar" /> -->

      <!-- Section content -->
      <div class="pt-12 mb:pl-6">
        <component :is="showSection" v-if="showSection" />
        <router-view v-else />
      </div>
    </div>
  </div>
</template>
