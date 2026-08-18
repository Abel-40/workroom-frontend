<script setup lang="ts">
import ActivityStream from '@/components/dashboard/ActivityStream.vue';
import Events from '@/components/dashboard/EventsWidget.vue';
import Header from '@/components/layout/Header.vue';
import Projects from '@/components/dashboard/ProjectsWidget.vue';
import WorkloadStats from '@/components/dashboard/WorkloadStats.vue';
import {Calendar} from "lucide-vue-next";
</script>

<template>
  <div class="flex-1 p-4">
    <div class="mb-6">
      <Header/>
          <!-- Page Title -->
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <p class="text-sm text-[#7D8592]">Welcome back, Abel</p>
                <h1 class="text-xl font-semibold">Dashboard</h1>
              </div>
            <div
              class="flex items-center gap-2 bg-[#E6EDF5] px-3 py-2 rounded-md border border-[#3F8CFF]/10 shadow-sm hover:bg-[#DCE7F6] transition-colors duration-200"
            >
              <Calendar class="w-4 h-4 text-[#3F8CFF]" />
              <span class="text-sm font-medium text-[#0A1629]">feb 16, 2025 - April 16, 2025</span>
            </div>
          </div>
    </div>
    <!-- Workload and Events Section -->
    <div class="flex flex-col lg:flex-row gap-6 mb-6">
      <WorkloadStats/>
      <Events/>
    </div>

    <!-- Projects and Activity Section -->
    <div class="flex flex-col lg:flex-row gap-6">
      <Projects/>
      <ActivityStream/>
    </div>
  </div>
</template>