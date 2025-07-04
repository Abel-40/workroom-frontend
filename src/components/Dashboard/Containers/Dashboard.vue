<script setup lang="ts">
import ActivityStream from './SubConatiners/ActivityStream.vue';
import Events from './SubConatiners/Events.vue';
import Projects from './SubConatiners/Projects.vue';
import WorkloadStats from './SubConatiners/WorkloadStats.vue';
import {Calendar} from "lucide-vue-next";
</script>

<template>
  <div class="flex-1 p-4 mt-16">
    <div class="mb-6">
    
          <!-- Page Title -->
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div class="-mt-24 md:mt-0 ">
                <p class="text-sm text-[#7D8592]">Welcome back, Abel</p>
                <h1 class="text-xl font-semibold">Dashboard</h1>
              </div>
            <div
              class="flex items-center gap-2 bg-[#E6EDF5] px-3 py-2 rounded-md"
            >
              <Calendar class="w-4 h-4" />
              <span class="text-sm">feb 16, 2025 - April 16, 2025</span>
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