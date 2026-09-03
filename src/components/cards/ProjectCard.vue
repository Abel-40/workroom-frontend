<script setup lang="ts">
import { Calendar, ArrowUp, ArrowDown } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ProjectImage from "@/components/projects/ProjectImage.vue";
import { formatShortDate } from "@/lib/dates";
import type { Project } from "@/types/types";

const props = defineProps<{ project: Project }>();

const router = useRouter();
const goToDetail = () =>
  router.push({ name: "admin-dashboard", query: { section: "projects", id: props.project.id } });

const shortId = (id: string) => id.slice(0, 8).toUpperCase();

const initials = (name: string) =>
  (name || "?").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
</script>

<template>
  <div
    class="w-full flex p-4 gap-5 bg-card rounded-3xl border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer"
    role="button"
    tabindex="0"
    @click="goToDetail"
    @keydown.enter="goToDetail"
  >
    <div class="w-full grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
      <!-- Left Side -->
      <div class="p-4 min-w-0">
        <div class="flex items-center gap-3 mb-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-page ring-2 ring-white shadow-[0_0_0_3px_rgba(63,140,255,0.15)]">
            <ProjectImage v-if="props.project.image" :image="props.project.image" :alt="props.project.title">
              <template #fallback>
                <span class="text-lg">{{ props.project.icon }}</span>
              </template>
            </ProjectImage>
            <span v-else class="text-lg">{{ props.project.icon }}</span>
          </div>
          <div class="min-w-0">
            <p class="text-xs font-mono tracking-wide text-subtle" :title="props.project.id">{{ shortId(props.project.id) }}</p>
            <h3 class="font-medium text-ink truncate" :title="props.project.title">{{ props.project.title }}</h3>
          </div>
        </div>
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-1 text-sm text-subtle">
            <Calendar class="w-4 h-4" />
            <span>Created {{ formatShortDate(props.project.createdAt) }}</span>
          </div>
          <div class="flex items-center gap-1 rounded-full bg-page px-2 py-1" :class="props.project.priority.color">
            <component :is="props.project.priority.icon === 'ArrowDown' ? ArrowDown : ArrowUp" class="w-3.5 h-3.5" />
            <span class="text-xs font-medium capitalize">{{ props.project.priority.level }}</span>
          </div>
        </div>
      </div>

      <!-- Right Side -->
      <div class="p-4">
        <h4 class="font-medium mb-3 text-ink">Project Data</h4>
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm text-subtle">All tasks</p>
            <p class="font-semibold text-ink">{{ props.project.task.total }}</p>
          </div>
          <div>
            <p class="text-sm text-subtle">Active tasks</p>
            <p class="font-semibold text-primary">{{ props.project.task.active }}</p>
          </div>
          <div class="text-center">
            <p class="text-sm text-subtle">Assignees</p>
            <div v-if="props.project.assignee.length" class="mt-1 flex -space-x-2">
              <Avatar
                v-for="name in props.project.assignee.slice(0, 3)"
                :key="name"
                size="sm"
                class="h-7 w-7 border-2 border-white text-[10px]"
                :title="name"
              >
                <AvatarFallback>{{ initials(name) }}</AvatarFallback>
              </Avatar>
              <span
                v-if="props.project.assignee.length > 3"
                class="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-page text-[10px] font-medium text-subtle"
              >
                +{{ props.project.assignee.length - 3 }}
              </span>
            </div>
            <p v-else class="mt-1 text-xs text-subtle">None</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
