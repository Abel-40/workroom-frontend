<script setup lang="ts">
import { onMounted } from "vue";
import { ChevronRight } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import ProjectCard from "@/components/cards/ProjectCard.vue";
import { useProjectStore } from "@/stores/projectStore";
import { useEmployeeStore } from "@/stores/employeeStore";

const projectStore = useProjectStore();
const employeeStore = useEmployeeStore();

onMounted(async () => {
  // Employees load first so project creator/assignee names resolve when mapping.
  if (!employeeStore.employees.length) await employeeStore.fetchEmployees();
  if (!projectStore.projects.length) await projectStore.fetchProjects();
});
</script>

<template>
  <div class="w-full lg:w-2/3 space-y-4">
    <div class="flex justify-between items-center">
      <h2 class="font-semibold text-[#0A1629] relative pl-3 before:absolute before:left-0 before:top-0.5 before:h-4 before:w-1 before:rounded-full before:bg-[#3F8CFF]">Projects</h2>
      <Button as="a" variant="link" class="text-sm p-0 group text-[#3F8CFF]">
        <RouterLink :to="{ name: 'admin-dashboard', query: { section: 'projects' } }">View all </RouterLink>
        <ChevronRight class="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </Button>
    </div>

    <!-- Project Cards -->
    <div v-if="projectStore.projects.length" class="space-y-4">
      <ProjectCard v-for="project in projectStore.projects.slice(0, 3)" :key="project.id" :project="project" />
    </div>
    <div v-else class="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-subtle">
      No projects yet.
    </div>
  </div>
</template>
