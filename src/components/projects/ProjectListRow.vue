<script setup lang="ts">
import { ChevronRight } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import ProjectImage from "@/components/projects/ProjectImage.vue";
import type { Project } from "@/types/types";

const props = defineProps<{
  project: Project;
  active: boolean;
}>();

const emit = defineEmits<{
  (e: "select"): void;
  (e: "view-detail"): void;
}>();

const shortProjectId = (id: string) => id.slice(0, 8).toUpperCase();
</script>

<template>
  <div class="h-[90px] text-sm flex justify-between lg:text-md cursor-pointer gap-1" @click="emit('select')">
    <div class="w-[95%] h-full px-3 py-3 rounded-l-xl" :class="active ? 'bg-blue-50' : ''">
      <div class="flex h-full w-full items-center gap-2 overflow-hidden rounded-xl px-4 py-2">
        <div class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-page">
          <ProjectImage v-if="project.image" :image="project.image" :alt="project.title">
            <template #fallback>
              <span class="text-base">{{ project.icon }}</span>
            </template>
          </ProjectImage>
          <span v-else class="text-base">{{ project.icon }}</span>
        </div>
        <div class="min-w-0">
          <p class="text-xs text-subtle" :title="project.id">{{ shortProjectId(project.id) }}</p>
          <p class="font-medium truncate" :title="project.title">{{ project.title }}</p>
          <div class="cursor-pointer flex items-center">
            <Button variant="link" as="a" class="text-primary px-0 py-0 h-auto" @click.stop="emit('view-detail')">
              View details
            </Button>
            <ChevronRight class="w-4 h-4 text-primary" />
          </div>
        </div>
      </div>
    </div>
    <div class="rounded-xl" :class="active ? 'border-r-blue-400 border-r-[4px]' : ''"></div>
  </div>
</template>
