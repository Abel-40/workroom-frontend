<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  FolderKanban,
  CheckCircle2,
  ListTodo,
  Users,
  FolderPlus,
  ArrowRightLeft,
  UserPlus,
  UserCheck,
  UserMinus,
  Building2,
} from "lucide-vue-next";
import Header from "@/components/layout/Header.vue";
import UserCard from "@/components/cards/UserCard.vue";
import { useAnalyticsStore } from "@/stores/analyticsStore";
import { useActivityStore, type ActivityType } from "@/stores/activityStore";
import { useEmployeeStore } from "@/stores/employeeStore";
import { formatRelativeTime } from "@/lib/dates";

const analyticsStore = useAnalyticsStore();
const activityStore = useActivityStore();
const employeeStore = useEmployeeStore();
const router = useRouter();

const activityLimit = ref(15);
onMounted(async () => {
  await Promise.all([
    analyticsStore.fetchAll(),
    activityStore.fetchActivities(activityLimit.value),
    employeeStore.employees.length ? Promise.resolve() : employeeStore.fetchEmployees(),
  ]);
});

const loadMoreActivity = () => {
  activityLimit.value += 15;
  activityStore.fetchActivities(activityLimit.value);
};

const openEmployee = (employeeId: string) =>
  router.push({ name: "admin-dashboard", query: { section: "employee-detail", employeeId } });

const stats = computed(() => analyticsStore.companyStats);
const statCards = computed(() => [
  { label: "Total Projects", value: stats.value?.projectCount ?? 0, icon: FolderKanban, color: "text-[#3F8CFF]" },
  { label: "Active Projects", value: stats.value?.activeProjects ?? 0, icon: ListTodo, color: "text-amber-500" },
  { label: "Completed Projects", value: stats.value?.completedProjects ?? 0, icon: CheckCircle2, color: "text-green-500" },
  { label: "Company Members", value: stats.value?.memberCount ?? 0, icon: Users, color: "text-purple-500" },
  { label: "Total Tasks", value: stats.value?.taskCount ?? 0, icon: ListTodo, color: "text-[#3F8CFF]" },
  { label: "Completed Tasks", value: stats.value?.completedTasks ?? 0, icon: CheckCircle2, color: "text-green-500" },
]);

const ICONS: Record<ActivityType, typeof FolderPlus> = {
  project_created: FolderPlus,
  project_completed: CheckCircle2,
  project_ownership_transferred: ArrowRightLeft,
  member_invited: UserPlus,
  member_joined: UserCheck,
  member_removed: UserMinus,
  department_created: Building2,
  team_created: Users,
};
const iconFor = (type: ActivityType) => ICONS[type] ?? FolderPlus;
</script>

<template>
  <div class="flex-1 p-4">
    <div class="mb-6">
      <Header />
      <h1 class="text-xl font-semibold">Analytics &amp; Company Insights</h1>
      <p class="mt-1 text-sm text-subtle">Project, task, department, and activity overview for your company.</p>
    </div>

    <!-- Stat cards -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <div v-for="card in statCards" :key="card.label" class="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <component :is="card.icon" class="h-5 w-5" :class="card.color" />
        <p class="mt-2 text-2xl font-semibold text-ink">{{ card.value }}</p>
        <p class="text-xs text-subtle">{{ card.label }}</p>
      </div>
    </div>

    <div class="mt-6 flex flex-col gap-6 lg:flex-row">
      <div class="lg:w-2/3 space-y-6">
        <!-- Department breakdown -->
        <div class="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <h2 class="mb-4 font-semibold text-ink">Departments</h2>
          <div v-if="!analyticsStore.departmentStats.length" class="py-6 text-center text-sm text-subtle">
            No departments yet.
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full min-w-[480px] text-sm">
              <thead>
                <tr class="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-subtle">
                  <th class="pb-2 font-medium">Department</th>
                  <th class="pb-2 font-medium">Members</th>
                  <th class="pb-2 font-medium">Projects</th>
                  <th class="pb-2 font-medium">Tasks</th>
                  <th class="pb-2 font-medium">Completed</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="d in analyticsStore.departmentStats" :key="d.id" class="border-b border-gray-50 last:border-0">
                  <td class="py-2 font-medium text-ink">{{ d.name }}</td>
                  <td class="py-2 text-subtle">{{ d.memberCount }}</td>
                  <td class="py-2 text-subtle">{{ d.projectCount }}</td>
                  <td class="py-2 text-subtle">{{ d.taskCount }}</td>
                  <td class="py-2 text-subtle">{{ d.completedTaskCount }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Workload -->
        <div class="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <h2 class="mb-4 font-semibold text-ink">Member Workload</h2>
          <div v-if="!employeeStore.employees.length" class="py-6 text-center text-sm text-subtle">
            No members yet.
          </div>
          <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <UserCard
              v-for="user in employeeStore.employees"
              :key="user.id"
              :name="user.name"
              :role="user.roleLabel"
              :department="user.department ?? undefined"
              @click="openEmployee(user.id)"
            />
          </div>
        </div>
      </div>

      <!-- Full activity feed -->
      <div class="lg:w-1/3">
        <div class="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <h2 class="mb-4 font-semibold text-ink">Company Activity</h2>
          <div v-if="!activityStore.activities.length" class="py-6 text-center text-sm text-subtle">
            No company activity yet.
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="activity in activityStore.activities"
              :key="activity.id"
              class="flex items-start gap-2 rounded-lg bg-page p-3"
            >
              <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                <component :is="iconFor(activity.type)" class="h-4 w-4 text-primary" />
              </span>
              <div class="min-w-0">
                <p class="text-sm text-ink">{{ activity.summary }}</p>
                <p class="text-xs text-subtle">{{ formatRelativeTime(activity.createdAt) }}</p>
              </div>
            </div>
            <button
              type="button"
              class="w-full rounded-lg py-1.5 text-xs font-medium text-primary hover:bg-page disabled:opacity-50"
              :disabled="activityStore.loading"
              @click="loadMoreActivity"
            >
              Load more
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
