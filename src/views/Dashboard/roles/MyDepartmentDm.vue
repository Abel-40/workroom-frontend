<script setup lang="ts">
// DM's "My Department" -- read-only, single department, no create/rename/
// reassign/team-edit controls of any kind (nothing here calls a mutating
// directoryStore action). Teams have no department field in the data model
// (a team can mix members from several departments -- see
// DepartmentsView.vue's empty state), so "team list" here means "teams
// with at least one member from this department," which is the closest
// real proxy to "teams in my department."
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Crown, MessageSquare, Users } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/shared/GlassCard.vue";
import PageHeader from "@/components/shared/PageHeader.vue";
import SectionKicker from "@/components/shared/SectionKicker.vue";
import EmptyState from "@/components/shared/EmptyState.vue";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useEmployeeStore } from "@/stores/employeeStore";
import { usePermissions } from "@/composables/usePermissions";

const router = useRouter();
const directoryStore = useDirectoryStore();
const employeeStore = useEmployeeStore();
const { departmentId: myDepartmentId, userId: myUserId } = usePermissions();

const myDepartment = computed(() => directoryStore.departments.find((d) => d.id === myDepartmentId.value) ?? null);
const departmentMemberIds = computed(
  () => new Set(employeeStore.employees.filter((e) => e.department === myDepartment.value?.name).map((e) => e.id))
);
const departmentTeams = computed(() =>
  directoryStore.teams.filter((t) => t.memberIds.some((id) => departmentMemberIds.value.has(id)))
);
const myTeamId = computed(() => directoryStore.teams.find((t) => t.memberIds.includes(myUserId.value ?? ""))?.id ?? null);

onMounted(async () => {
  if (!directoryStore.loaded) await directoryStore.fetchAll();
  if (!employeeStore.employees.length) await employeeStore.fetchEmployees();
});

const messageLeader = () => router.push({ name: "admin-dashboard", query: { section: "messenger" } });
</script>

<template>
  <div class="p-4">
    <PageHeader kicker="Department" title="My Department" />

    <div v-if="!myDepartment" class="wr-glass rounded-2xl p-10 text-center text-sm text-[#7D8592]">
      You're not assigned to a department yet.
    </div>
    <template v-else>
      <GlassCard padding="airy" class="mb-6">
        <h2 class="text-xl font-bold text-ink">{{ myDepartment.name }}</h2>
        <p v-if="myDepartment.description" class="mt-1 text-sm text-[#7D8592]">{{ myDepartment.description }}</p>
        <div class="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap items-center gap-4 text-sm text-[#7D8592]">
            <span class="flex items-center gap-1.5"><Users class="h-4 w-4" /> {{ myDepartment.memberCount }} people</span>
            <span class="flex items-center gap-1.5"><Crown class="h-4 w-4" /> {{ myDepartment.leaderName ?? "No leader assigned" }}</span>
          </div>
          <Button v-if="myDepartment.leaderId" variant="outline" size="sm" class="h-8 rounded-lg text-xs" @click="messageLeader">
            <MessageSquare class="mr-1 h-3.5 w-3.5" /> Message leader
          </Button>
        </div>
      </GlassCard>

      <SectionKicker label="Teams" />
      <GlassCard v-if="!departmentTeams.length">
        <EmptyState :icon="Users" message="No teams in this department yet." />
      </GlassCard>
      <div v-else class="wr-glass divide-y divide-slate-900/[.06] rounded-2xl">
        <div v-for="team in departmentTeams" :key="team.id" class="flex items-center justify-between gap-3 px-4 py-3">
          <div class="min-w-0">
            <p class="flex items-center gap-2 truncate text-sm font-semibold text-ink">
              {{ team.name }}
              <span v-if="team.id === myTeamId" class="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold text-primary-strong">
                Your team
              </span>
            </p>
            <p class="truncate text-xs text-[#7D8592]">{{ team.memberIds.length }} members &middot; led by {{ team.leaderName ?? "no one yet" }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
