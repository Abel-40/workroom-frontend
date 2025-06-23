<script setup lang="ts">
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
        <div class="w-full flex p-4 gap-5 bg-white rounded-3xl border border-gray-200 shadow-sm">
          <div
            class="w-full grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x"
          >
            <!-- Left Side -->
            <div class="p-4">
              <div class="flex items-center gap-3 mb-3">
                <img
                  :src="props.project.icon"
                  alt="Project icon"
                  class="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p class="text-sm text-[#91929E]">{{props.project.id}}</p>
                  <h3 class="font-medium">{{props.project.title}}</h3>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <div
                  class="flex items-center gap-1 text-sm text-[#91929E]"
                >
                  <Calendar class="w-4 h-4" />
                  <span>Created {{props.project.createdAt}}</span>
                </div>
                <div class="flex items-center gap-1 text-yellow-500">
                  <ArrowUp class="w-4 h-4" />
                  <span class="text-sm">{{props.project.priority.level}}</span>
                </div>
              </div>
            </div>

            <!-- Right Side -->
            <div class="p-4">
              <h4 class="font-medium mb-3">Project Data</h4>
              <div class="flex justify-between">
                <div>
                  <p class="text-sm text-[#91929E]">All tasks</p>
                  <p class="font-medium">{{props.project.tasks.total}}</p>
                </div>
                <div>
                  <p class="text-sm text-[#91929E]">Active tasks</p>
                  <p class="font-medium">{{props.project.tasks.active}}</p>
                </div>
                <div class="text-center">
                  <p class="text-sm text-[#91929E]">Assignees</p>
                  <img
                    :src="props.project.assignee"
                    class="w-8 h-8 rounded-full mx-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
</template>