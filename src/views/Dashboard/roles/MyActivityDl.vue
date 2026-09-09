<script setup lang="ts">
// DL's "Analytics" (nav keeps the "Analytics" label per navConfig -- only
// DM's is renamed "My Activity") -- department-level instead of
// company-wide. `DepartmentStats` has no time-series (just current totals),
// so there's no real "cycle time" trend to show -- see ROLES.md.
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { CheckCircle2, FolderKanban, ListTodo, Users } from "lucide-vue-next";
import StatCard from "@/components/shared/StatCard.vue";
import GlassCard from "@/components/shared/GlassCard.vue";
import PageHeader from "@/components/shared/PageHeader.vue";
import SectionKicker from "@/components/shared/SectionKicker.vue";
import PersonRow from "@/components/shared/PersonRow.vue";
import MetricBar from "@/components/shared/MetricBar.vue";
import EmptyState from "@/components/shared/EmptyState.vue";
import { ILLUSTRATIONS } from "@/lib/illustrations";
import { useAnalyticsStore } from "@/stores/analyticsStore";
import { useEmployeeStore } from "@/stores/employeeStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import { usePermissions } from "@/composables/usePermissions";

const analyticsStore = useAnalyticsStore();
const employeeStore = useEmployeeStore();
const directoryStore = useDirectoryStore();
const router = useRouter();
const { departmentId: myDepartmentId } = usePermissions();

const myDepartment = computed(() => directoryStore.departments.find((d) => d.id === myDepartmentId.value) ?? null);
const myStats = computed(() => analyticsStore.departmentStats.find((d) => d.id === myDepartmentId.value) ?? null);
const openTasks = computed(() => (myStats.value ? myStats.value.taskCount - myStats.value.completedTaskCount : 0));

const deptEmployees = computed(() =>
  [...employeeStore.employees.filter((e) => e.department === myDepartment.value?.name)].sort(
    (a, b) => b.activeTaskCount - a.activeTaskCount
  )
);
const FAIR_WORKLOAD_CAPACITY = 6;
const maxActive = computed(() =>
  Math.max(FAIR_WORKLOAD_CAPACITY, ...deptEmployees.value.map((e) => e.activeTaskCount))
);

onMounted(async () => {
  await Promise.all([
    analyticsStore.fetchDepartmentStats(),
    employeeStore.employees.length ? Promise.resolve() : employeeStore.fetchEmployees(),
    directoryStore.loaded ? Promise.resolve() : directoryStore.fetchAll(),
  ]);
});

const openEmployee = (employeeId: string) =>
  router.push({ name: "admin-dashboard", query: { section: "employee-detail", employeeId } });
</script>

<template>
  <div class="p-4">
    <PageHeader kicker="Department" title="Analytics" :subtitle="myDepartment?.name ?? undefined" />

    <div class="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard label="Members" :value="myStats?.memberCount ?? '—'" :icon="Users" />
      <StatCard label="Projects" :value="myStats?.projectCount ?? '—'" :icon="FolderKanban" />
      <StatCard label="Open tasks" :value="myStats ? openTasks : '—'" :icon="ListTodo" />
      <StatCard label="Completed tasks" :value="myStats?.completedTaskCount ?? '—'" :icon="CheckCircle2" />
    </div>

    <SectionKicker label="Team load" />
    <GlassCard v-if="!deptEmployees.length">
      <EmptyState
        :icon="Users"
        :image="ILLUSTRATIONS.dashboardEmptyWorkload"
        image-alt="No one in this department yet"
        message="No one in this department yet."
      />
    </GlassCard>
    <GlassCard v-else>
      <div class="space-y-1">
        <PersonRow
          v-for="employee in deptEmployees"
          :key="employee.id"
          :name="employee.name"
          :subtitle="employee.roleLabel"
          :avatar-url="employee.profilePictureUrl"
          clickable
          @click="openEmployee(employee.id)"
        >
          <template #trailing>
            <div class="w-32">
              <MetricBar label="" :value="(employee.activeTaskCount / maxActive) * 100" :sublabel="`${employee.activeTaskCount} active`" />
            </div>
          </template>
        </PersonRow>
      </div>
    </GlassCard>
  </div>
</template>
