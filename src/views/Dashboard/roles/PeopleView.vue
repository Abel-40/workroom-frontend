<script setup lang="ts">
// DL's "People" -- their department's roster as cards, not the company
// admin table (that's EmployeesView.vue, CM/Owner only). Two spec details
// don't map onto real data: "Team Lead" isn't a company Role (only
// Owner/CM/DL/DM exist -- team leadership is a separate per-team
// `Team.leaderId`), so the card tag is computed from that instead of
// invented as a fake role; "Invited" status has no backing list anywhere
// in this app (see ROLES.md "Dashboard" -- CM's Pending Invitations gap),
// so the tag is just Team Lead / Member.
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { MessageSquare, Plus, Search, UserMinus, Users } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GlassCard from "@/components/shared/GlassCard.vue";
import PageHeader from "@/components/shared/PageHeader.vue";
import EmptyState from "@/components/shared/EmptyState.vue";
import SkeletonCard from "@/components/shared/SkeletonCard.vue";
import { ILLUSTRATIONS } from "@/lib/illustrations";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import EmployeeInviteModal from "@/components/employees/EmployeeInviteModal.vue";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog.vue";
import { useEmployeeStore, type Employee } from "@/stores/employeeStore";
import { useDirectoryStore, type TeamEntry } from "@/stores/directoryStore";
import { usePermissions } from "@/composables/usePermissions";

const router = useRouter();
const employeeStore = useEmployeeStore();
const directoryStore = useDirectoryStore();
const { departmentId: myDepartmentId } = usePermissions();

const loading = ref(true);
const isInviteOpen = ref(false);
const searchQuery = ref("");
const removeTarget = ref<{ employee: Employee; team: TeamEntry } | null>(null);
const removing = ref(false);

const myDepartment = computed(() => directoryStore.departments.find((d) => d.id === myDepartmentId.value) ?? null);

const teamOf = (employeeId: string) => directoryStore.teams.find((t) => t.memberIds.includes(employeeId)) ?? null;
const isTeamLead = (employee: Employee) =>
  employee.role === "DL" || directoryStore.teams.some((t) => t.leaderId === employee.id);

const roster = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  return employeeStore.employees
    .filter((e) => e.department === myDepartment.value?.name)
    .filter((e) => !query || e.name.toLowerCase().includes(query) || e.email.toLowerCase().includes(query));
});

onMounted(async () => {
  loading.value = true;
  if (!employeeStore.employees.length) await employeeStore.fetchEmployees();
  if (!directoryStore.loaded) await directoryStore.fetchAll();
  loading.value = false;
});

const openProfile = (employee: Employee) =>
  router.push({ name: "admin-dashboard", query: { section: "employee-detail", employeeId: employee.id } });
const messageEmployee = () => router.push({ name: "admin-dashboard", query: { section: "messenger" } });

const askRemoveFromTeam = (employee: Employee) => {
  const team = teamOf(employee.id);
  if (team) removeTarget.value = { employee, team };
};
const confirmRemoveFromTeam = async () => {
  if (!removeTarget.value) return;
  removing.value = true;
  await directoryStore.updateTeam(removeTarget.value.team.id, {
    memberIds: removeTarget.value.team.memberIds.filter((id) => id !== removeTarget.value!.employee.id),
  });
  removing.value = false;
  removeTarget.value = null;
};

const initials = (name: string) => (name || "?").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
</script>

<template>
  <div class="p-4">
    <PageHeader
      kicker="Department"
      title="People"
      :subtitle="`${roster.length} people in ${myDepartment?.name ?? 'your department'}`"
    >
      <template #actions>
        <Button
          class="bg-gradient-to-br from-[#3F8CFF] to-accent-2 text-white shadow-[0_8px_22px_rgba(63,140,255,0.38)] hover:shadow-lg"
          @click="isInviteOpen = true"
        >
          <Plus class="mr-1.5 h-4 w-4" /> Invite to {{ myDepartment?.name ?? "department" }}
        </Button>
      </template>
    </PageHeader>

    <div class="relative mb-5 max-w-sm">
      <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
      <Input v-model="searchQuery" placeholder="Search people…" class="rounded-xl pl-9" />
    </div>

    <div v-if="loading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <SkeletonCard v-for="i in 4" :key="i" :rows="2" />
    </div>
    <EmptyState
      v-else-if="!roster.length"
      size="lg"
      :icon="Users"
      :image="searchQuery ? undefined : ILLUSTRATIONS.emptyEmployees"
      image-alt="No one in this department yet"
      :message="searchQuery ? `No one matches “${searchQuery}”.` : 'No one in this department yet.'"
    />
    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <GlassCard v-for="employee in roster" :key="employee.id" padding="dense">
        <div class="flex flex-col items-center text-center">
          <Avatar size="sm" class="h-14 w-14 text-sm">
            <AvatarFallback class="bg-primary-soft text-primary-strong">{{ initials(employee.name) }}</AvatarFallback>
          </Avatar>
          <p class="mt-2 cursor-pointer font-medium text-ink hover:underline" @click="openProfile(employee)">{{ employee.name }}</p>
          <p class="text-xs text-[#7D8592]">{{ teamOf(employee.id)?.name ?? "No team" }}</p>
          <span
            class="mt-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium"
            :class="isTeamLead(employee) ? 'bg-primary-soft text-primary-strong' : 'bg-slate-900/5 text-[#7D8592]'"
          >
            {{ isTeamLead(employee) ? "Team Lead" : "Member" }}
          </span>
        </div>
        <div class="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" class="h-8 rounded-lg text-xs" @click="messageEmployee">
            <MessageSquare class="mr-1 h-3.5 w-3.5" /> Message
          </Button>
          <Button
            v-if="teamOf(employee.id)"
            variant="outline"
            size="sm"
            class="h-8 rounded-lg text-xs text-red-500 hover:text-red-600"
            @click="askRemoveFromTeam(employee)"
          >
            <UserMinus class="mr-1 h-3.5 w-3.5" /> Remove from team
          </Button>
        </div>
      </GlassCard>
    </div>

    <EmployeeInviteModal v-model:open="isInviteOpen" :locked-department-id="myDepartmentId" />
    <ConfirmDeleteDialog
      :open="!!removeTarget"
      title="Remove from team?"
      :description="`Remove ${removeTarget?.employee.name} from ${removeTarget?.team.name}? They stay in the company and department.`"
      confirm-label="Remove"
      :loading="removing"
      @update:open="(v) => { if (!v) removeTarget = null }"
      @confirm="confirmRemoveFromTeam"
    />
  </div>
</template>
