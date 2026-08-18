<script setup lang="ts">
import { Calendar, ArrowUp, ArrowDown } from "lucide-vue-next";

interface ProjectType {
  id: string;
  title: string;
  icon: string;
  createdAt: string;
  priority: {
    level: 'low' | 'medium' | 'high';
    icon: 'ArrowDown' | 'ArrowUp'; 
    color: string;
  };
  tasks: {
    total: number;
    active: number;
  };
  assignee: string;
}
const props = defineProps<{project:ProjectType}>()
</script>


<template>
        <div class="w-full flex p-4 gap-5 bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-md hover:border-[#3F8CFF]/20 transition-all duration-200">
          <div
            class="w-full grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x"
          >
            <!-- Left Side -->
            <div class="p-4">
              <div class="flex items-center gap-3 mb-3">
                <img
                  :src="props.project.icon"
                  alt="Project icon"
                  class="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-[0_0_0_3px_rgba(63,140,255,0.15)]"
                />
                <div>
                  <p class="text-xs font-mono tracking-wide text-[#91929E]">{{props.project.id}}</p>
                  <h3 class="font-medium text-[#0A1629]">{{props.project.title}}</h3>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <div
                  class="flex items-center gap-1 text-sm text-[#91929E]"
                >
                  <Calendar class="w-4 h-4" />
                  <span>Created {{props.project.createdAt}}</span>
                </div>
                <div class="flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1" :class="props.project.priority.color">
                  <component :is="props.project.priority.icon === 'ArrowDown' ? ArrowDown : ArrowUp" class="w-3.5 h-3.5" />
                  <span class="text-xs font-medium capitalize">{{props.project.priority.level}}</span>
                </div>
              </div>
            </div>

            <!-- Right Side -->
            <div class="p-4">
              <h4 class="font-medium mb-3 text-[#0A1629]">Project Data</h4>
              <div class="flex justify-between">
                <div>
                  <p class="text-sm text-[#91929E]">All tasks</p>
                  <p class="font-semibold text-[#0A1629]">{{props.project.tasks.total}}</p>
                </div>
                <div>
                  <p class="text-sm text-[#91929E]">Active tasks</p>
                  <p class="font-semibold text-[#3F8CFF]">{{props.project.tasks.active}}</p>
                </div>
                <div class="text-center">
                  <p class="text-sm text-[#91929E]">Assignees</p>
                  <img
                    :src="props.project.assignee"
                    class="w-8 h-8 rounded-full mx-auto ring-2 ring-white shadow-[0_0_0_2px_rgba(63,140,255,0.15)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
</template>