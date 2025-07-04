<script setup lang="ts">
import Sidebar from "@/components/Dashboard/Containers/Sidebar.vue";
import Dashboard from "@/components/Dashboard/Containers/Dashboard.vue";
import EventContainer from "@/components/Dashboard/Containers/EventsConainer.vue";
import ProjectsContianer from "@/components/Dashboard/Containers/ProjectsContainer.vue";
import ProjectsTask from "@/components/Dashboard/Containers/ProjectsTask.vue";
import LandingPage from "@/components/Dashboard/Containers/LandingPage.vue";
import Users from "@/components/Dashboard/Containers/UsersList.vue";
import { useRoute } from "vue-router";
import { computed, ref } from "vue";
import Navbar from "@/components/Dashboard/Containers/SubConatiners/Navbar.vue";
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

function handleSidebarCollapse(state: boolean) {
  isCollapsed.value = state;
}

const isSidebarVisible = ref(false);

const toggleSidebar = () => {
  isSidebarVisible.value = !isSidebarVisible.value;
};
</script>
<template>
  <div class="relative w-full min-h-screen bg-[#F4F9FD] overflow-x-hidden">
    <!-- Sidebar: fixed, full height -->
    
    <Navbar :is-collapsed="isCollapsed" @toggle-sidebar="toggleSidebar" />
    <!-- Main area: navbar and content -->
    <div :class="isCollapsed ? 'pl-20' : 'md:pl-64'">
      <!-- Navbar: sticky below premium bar -->
      <Sidebar
      class="fixed top-20 left-0 h-full z-50"
      @collapse="handleSidebarCollapse"
      :showSidebar="isSidebarVisible"
    />
      <!-- Main content: scrollable -->
      <div class="pt-12 mb:pl-6">
        <component :is="showSection" v-if="showSection" />
        <router-view v-else />
      </div>
    </div>
  </div>
</template>
