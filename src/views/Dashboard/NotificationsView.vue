<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { ArrowLeft, ArrowRight } from "lucide-vue-next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useNotificationStore } from "@/stores/notificationStore";
import { useProjectStore } from "@/stores/projectStore";
import { formatDateTime } from "@/lib/dates";

const notificationStore = useNotificationStore();
const projectStore = useProjectStore();

const ALL = "__all__";
const typeFilter = ref(ALL);
const projectFilter = ref(ALL);
const taskFilter = ref(ALL);
const dateFrom = ref("");
const dateTo = ref("");
const page = ref(1);

const TYPE_OPTIONS = [
  { value: "task_assigned", label: "Task Assigned" },
  { value: "task_completed", label: "Task Completed" },
  { value: "invitation_accepted", label: "Invitation Accepted" },
  { value: "ai_generation_completed", label: "AI Generation Completed" },
  { value: "ai_generation_failed", label: "AI Generation Failed" },
];

// The task filter only makes sense once a project is chosen -- reuses the
// project store's own task list (fetched on demand) rather than building a
// separate global task-list store just for this one filter.
const selectedProjectTasks = computed(() => {
  if (projectFilter.value === ALL) return [];
  return projectStore.findProject(projectFilter.value)?.task.tasks ?? [];
});
watch(projectFilter, async (id) => {
  taskFilter.value = ALL;
  if (id !== ALL && !projectStore.findProject(id)?.task.tasks) {
    await projectStore.fetchTasks(id);
  }
});

const load = () => {
  notificationStore.fetchNotifications({
    type: typeFilter.value === ALL ? undefined : typeFilter.value,
    relatedObjectType: taskFilter.value !== ALL ? "task" : projectFilter.value !== ALL ? "project" : undefined,
    relatedObjectId: taskFilter.value !== ALL ? taskFilter.value : projectFilter.value !== ALL ? projectFilter.value : undefined,
    dateFrom: dateFrom.value || undefined,
    dateTo: dateTo.value || undefined,
    page: page.value,
    pageSize: 20,
  });
};

onMounted(() => {
  if (!projectStore.projects.length) projectStore.fetchProjects();
  load();
});
watch([typeFilter, projectFilter, taskFilter, dateFrom, dateTo], () => {
  page.value = 1;
  load();
});
watch(page, load);

const formatTime = formatDateTime;
const initials = (title: string) =>
  (title || "?").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

const totalPages = computed(() =>
  notificationStore.meta ? Math.max(1, Math.ceil(notificationStore.meta.count / notificationStore.meta.page_size)) : 1
);
</script>

<template>
  <div class="flex-1 p-4">
    <div class="mb-6">
      <h1 class="text-xl font-semibold">Notifications</h1>
    </div>

    <div class="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3">
      <Select v-model="typeFilter">
        <SelectTrigger class="w-44 rounded-xl text-sm">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem :value="ALL">All types</SelectItem>
            <SelectItem v-for="opt in TYPE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select v-model="projectFilter">
        <SelectTrigger class="w-44 rounded-xl text-sm">
          <SelectValue placeholder="All projects" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem :value="ALL">All projects</SelectItem>
            <SelectItem v-for="p in projectStore.projects" :key="p.id" :value="p.id">{{ p.title }}</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select v-model="taskFilter" :disabled="projectFilter === ALL">
        <SelectTrigger class="w-44 rounded-xl text-sm">
          <SelectValue placeholder="All tasks" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem :value="ALL">All tasks</SelectItem>
            <SelectItem v-for="t in selectedProjectTasks" :key="t.id" :value="t.id">{{ t.title }}</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Input v-model="dateFrom" type="date" class="w-40 rounded-xl text-sm" />
      <Input v-model="dateTo" type="date" class="w-40 rounded-xl text-sm" />
    </div>

    <div class="rounded-2xl border border-border bg-card">
      <div v-if="notificationStore.loading" class="p-8 text-center text-sm text-subtle">Loading…</div>
      <div v-else-if="!notificationStore.notifications.length" class="p-8 text-center text-sm text-subtle">
        No notifications match these filters.
      </div>
      <div v-else class="divide-y divide-border">
        <div
          v-for="notif in notificationStore.notifications"
          :key="notif.id"
          class="flex items-start gap-3 px-4 py-3"
          :class="!notif.isRead ? 'bg-primary/5' : ''"
        >
          <Avatar size="sm" class="h-9 w-9 shrink-0 text-xs">
            <AvatarFallback>{{ initials(notif.title) }}</AvatarFallback>
          </Avatar>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <p class="text-sm font-medium text-ink">{{ notif.title }}</p>
              <span
                v-if="notif.category === 'critical'"
                class="rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-500/15 dark:text-red-400"
              >
                Critical
              </span>
            </div>
            <p v-if="notif.message" class="mt-0.5 text-sm text-subtle">{{ notif.message }}</p>
            <p class="mt-1 text-xs text-subtle">{{ formatTime(notif.createdAt) }}</p>
          </div>
          <button
            v-if="!notif.isRead"
            type="button"
            class="shrink-0 text-xs font-medium text-primary hover:underline"
            @click="notificationStore.markRead(notif.id)"
          >
            Mark read
          </button>
        </div>
      </div>
    </div>

    <div v-if="notificationStore.meta && notificationStore.meta.count > 0" class="mt-4 flex items-center justify-end gap-3 text-sm text-subtle">
      <span>Page {{ page }} of {{ totalPages }}</span>
      <button type="button" class="rounded-lg p-1 hover:bg-page disabled:opacity-40" :disabled="page === 1" @click="page--">
        <ArrowLeft class="h-4 w-4" />
      </button>
      <button type="button" class="rounded-lg p-1 hover:bg-page disabled:opacity-40" :disabled="!notificationStore.meta.has_next" @click="page++">
        <ArrowRight class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
