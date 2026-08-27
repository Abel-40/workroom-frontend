<script setup lang="ts">
// DM's "My Activity" -- personal, not company-wide. Same task-aggregation
// approach as DmDashboard's "Today" (no flat "my tasks" endpoint exists --
// see ROLES.md "Dashboard"), broadened to all of a DM's assigned tasks
// across their own projects, not just today's. "On-time rate" and
// "completed this week" are derived from `updatedAt` as a completion-time
// proxy -- the backend has no dedicated `completed_at` timestamp, but a
// task's `updatedAt` reflects its last status transition, which for a
// Done task is when it was completed.
import { computed, onMounted, ref } from "vue";
import { CalendarCheck, CheckCircle2, Clock, ListChecks } from "lucide-vue-next";
import StatCard from "@/components/shared/StatCard.vue";
import GlassCard from "@/components/shared/GlassCard.vue";
import PageHeader from "@/components/shared/PageHeader.vue";
import SectionKicker from "@/components/shared/SectionKicker.vue";
import MetricBar from "@/components/shared/MetricBar.vue";
import EmptyState from "@/components/shared/EmptyState.vue";
import SkeletonCard from "@/components/shared/SkeletonCard.vue";
import { useProjectStore } from "@/stores/projectStore";
import { usePermissions } from "@/composables/usePermissions";
import type { TaskType } from "@/types/types";

const projectStore = useProjectStore();
const { userId: myUserId } = usePermissions();
const loading = ref(true);

const myProjects = computed(() =>
  projectStore.projects.filter((p) => p.createdById === myUserId.value || p.assigneeIds?.includes(myUserId.value ?? ""))
);

const myTasks = computed(() => {
  const rows: Array<TaskType & { projectTitle: string }> = [];
  for (const project of myProjects.value) {
    for (const task of project.task.tasks ?? []) {
      if (task.assignedToId === myUserId.value) rows.push({ ...task, projectTitle: project.title });
    }
  }
  return rows;
});

const completedTasks = computed(() => myTasks.value.filter((t) => t.status === "Done"));
const completedThisWeek = computed(() => {
  const weekAgo = Date.now() - 7 * 86_400_000;
  return completedTasks.value.filter((t) => new Date(t.updatedAt).getTime() >= weekAgo).length;
});
const onTimeRate = computed(() => {
  const withDeadline = completedTasks.value.filter((t) => t.deadline);
  if (!withDeadline.length) return null;
  const onTime = withDeadline.filter((t) => new Date(t.updatedAt).getTime() <= new Date(t.deadline).getTime()).length;
  return Math.round((onTime / withDeadline.length) * 100);
});

const timeByProject = computed(() => {
  const map = new Map<string, { title: string; hours: number }>();
  for (const task of myTasks.value) {
    if (!task.spentTimeHours) continue;
    const entry = map.get(task.projectId) ?? { title: task.projectTitle, hours: 0 };
    entry.hours += task.spentTimeHours;
    map.set(task.projectId, entry);
  }
  return [...map.values()].sort((a, b) => b.hours - a.hours);
});
const maxHours = computed(() => Math.max(1, ...timeByProject.value.map((p) => p.hours)));

onMounted(async () => {
  loading.value = true;
  await projectStore.fetchProjects();
  await Promise.all(myProjects.value.map((p) => projectStore.fetchTasks(p.id)));
  loading.value = false;
});
</script>

<template>
  <div class="p-4">
    <PageHeader kicker="Personal" title="My Activity" />

    <div v-if="loading" class="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
      <SkeletonCard v-for="i in 3" :key="i" :rows="1" />
    </div>
    <div v-else class="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
      <StatCard label="Tasks completed" :value="completedTasks.length" :icon="CheckCircle2" />
      <StatCard label="Completed this week" :value="completedThisWeek" :icon="CalendarCheck" />
      <StatCard label="On-time rate" :value="onTimeRate === null ? '—' : `${onTimeRate}%`" :icon="ListChecks" />
    </div>

    <SectionKicker label="Time by project" />
    <SkeletonCard v-if="loading" :rows="3" />
    <GlassCard v-else>
      <EmptyState v-if="!timeByProject.length" :icon="Clock" message="No logged time yet." />
      <div v-else class="space-y-4">
        <MetricBar
          v-for="entry in timeByProject"
          :key="entry.title"
          :label="entry.title"
          :value="(entry.hours / maxHours) * 100"
          :sublabel="`${entry.hours}h`"
        />
      </div>
    </GlassCard>
  </div>
</template>
