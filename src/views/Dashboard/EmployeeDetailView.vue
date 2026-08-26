<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ChevronLeft, Crown, Users } from "lucide-vue-next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast/use-toast";
import Header from "@/components/layout/Header.vue";
import { useAuthStore } from "@/stores/authStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useEmployeeStore, ROLE_LABELS, type EmployeeRole } from "@/stores/employeeStore";
import { hasPermission } from "@/lib/permissions";

const route = useRoute();
const router = useRouter();
const { toast } = useToast();
const authStore = useAuthStore();
const directoryStore = useDirectoryStore();
const employeeStore = useEmployeeStore();

const employeeId = computed(() => String(route.query.employeeId ?? ""));
const employee = computed(() => employeeStore.employees.find((e) => e.id === employeeId.value) ?? null);

const loading = ref(true);
onMounted(async () => {
  if (!directoryStore.loaded) directoryStore.fetchAll();
  loading.value = true;
  await employeeStore.fetchEmployeeById(employeeId.value);
  loading.value = false;
});
watch(employeeId, async (id) => {
  if (!id) return;
  loading.value = true;
  await employeeStore.fetchEmployeeById(id);
  loading.value = false;
});

// Mirrors the backend's members:manage_role / members:remove permission
// grants: Owner and Company Manager can manage members; a Company Manager
// still cannot escalate anyone to Company Manager (enforced server-side).
const canManage = computed(() => ["Owner", "CM"].includes(authStore.logedInUserInfo?.role ?? ""));
// Department/team leadership assignment is departments:manage/teams:manage,
// which DL also holds -- broader than canManage above (used for role/status/
// department changes, which really are Owner/CM-only).
const canManageLeadership = computed(() => hasPermission(authStore.logedInUserInfo?.role, "departments:manage"));
const isSelf = computed(() => employeeId.value === authStore.logedInUserInfo?.user?.id);

const initials = (name: string) =>
  (name || "?").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

const togglingStatus = ref(false);
const onToggleActive = async (value: boolean) => {
  if (!employee.value) return;
  togglingStatus.value = true;
  const { error } = await employeeStore.setActiveStatus(employee.value.id, value);
  togglingStatus.value = false;
  if (error) toast({ title: "Status not updated", description: error, variant: "destructive" });
};

const NO_DEPARTMENT = "none";
const changingDepartment = ref(false);
const departmentValue = computed({
  get: () => {
    const dept = directoryStore.departments.find((d) => d.name === employee.value?.department);
    return dept?.id ?? NO_DEPARTMENT;
  },
  set: async (value: string) => {
    if (!employee.value) return;
    changingDepartment.value = true;
    const { error } = await employeeStore.changeDepartment(
      employee.value.id,
      value === NO_DEPARTMENT ? null : value
    );
    changingDepartment.value = false;
    if (error) toast({ title: "Department not changed", description: error, variant: "destructive" });
  },
});

const changingRole = ref(false);
const roleValue = computed({
  get: () => employee.value?.role ?? "DM",
  set: async (value: EmployeeRole) => {
    if (!employee.value || value === employee.value.role) return;
    changingRole.value = true;
    const { error } = await employeeStore.changeRole(employee.value.id, value);
    changingRole.value = false;
    if (error) toast({ title: "Role not changed", description: error, variant: "destructive" });
  },
});
// A Company Manager can never grant/be granted the Company Manager role
// (server-enforced) -- hide it from the picker for anyone but the Owner.
const roleOptions = computed(() => {
  const values: EmployeeRole[] = authStore.logedInUserInfo?.role === "Owner" ? ["CM", "DL", "DM"] : ["DL", "DM"];
  return values.map((value) => ({ value, label: ROLE_LABELS[value] }));
});

const leadingDepartments = computed(() =>
  directoryStore.departments.filter((d) => d.leaderId === employeeId.value)
);
const leadingTeams = computed(() => directoryStore.teams.filter((t) => t.leaderId === employeeId.value));

const assignDeptId = ref("");
const assigningDeptLeader = ref(false);
const assignDepartmentLeader = async () => {
  if (!assignDeptId.value) return;
  assigningDeptLeader.value = true;
  const { error } = await directoryStore.setDepartmentLeader(assignDeptId.value, employeeId.value);
  assigningDeptLeader.value = false;
  if (error) {
    toast({ title: "Leadership not assigned", description: error, variant: "destructive" });
    return;
  }
  assignDeptId.value = "";
  // Assigning department leadership can promote the member's role
  // server-side (see users.services.set_department_leader) -- refetch so
  // the Role select reflects it without a manual page reload.
  await employeeStore.fetchEmployeeById(employeeId.value);
};
const revokeDepartmentLeader = async (departmentId: string) => {
  assigningDeptLeader.value = true;
  const { error } = await directoryStore.revokeDepartmentLeader(departmentId);
  assigningDeptLeader.value = false;
  if (error) {
    toast({ title: "Leadership not revoked", description: error, variant: "destructive" });
    return;
  }
  await employeeStore.fetchEmployeeById(employeeId.value);
};

const assignTeamId = ref("");
const assigningTeamLeader = ref(false);
const assignTeamLeader = async () => {
  if (!assignTeamId.value) return;
  assigningTeamLeader.value = true;
  const { error } = await directoryStore.setTeamLeader(assignTeamId.value, employeeId.value);
  assigningTeamLeader.value = false;
  if (error) toast({ title: "Leadership not assigned", description: error, variant: "destructive" });
  else assignTeamId.value = "";
};
const revokeTeamLeader = async (teamId: string) => {
  assigningTeamLeader.value = true;
  const { error } = await directoryStore.revokeTeamLeader(teamId);
  assigningTeamLeader.value = false;
  if (error) toast({ title: "Leadership not revoked", description: error, variant: "destructive" });
};

const goBack = () => router.push({ name: "admin-dashboard", query: { section: "employees" } });
</script>

<template>
  <div class="flex-1 p-4">
    <div class="mb-6">
      <Header />
      <button type="button" class="flex items-center gap-1 text-sm text-primary" @click="goBack">
        <ChevronLeft class="h-4 w-4" /> Employees
      </button>
    </div>

    <div v-if="loading" class="rounded-2xl border border-gray-100 bg-white p-12 text-center text-sm text-subtle">
      Loading…
    </div>
    <div v-else-if="!employee" class="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
      <p class="font-medium text-ink">Employee not found</p>
    </div>

    <div v-else class="flex flex-col gap-4 lg:flex-row">
      <div class="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:w-80">
        <div class="flex flex-col items-center text-center">
          <Avatar size="sm" class="h-16 w-16 text-lg">
            <AvatarFallback>{{ initials(employee.name) }}</AvatarFallback>
          </Avatar>
          <p class="mt-3 text-lg font-semibold text-ink">{{ employee.name }}</p>
          <p class="text-sm text-subtle">{{ employee.email }}</p>
          <span class="mt-2 rounded-full bg-page px-2.5 py-1 text-xs font-medium text-ink">
            {{ employee.roleLabel }}
          </span>
          <span
            class="mt-1 text-xs font-medium"
            :class="employee.isActive ? 'text-green-600' : 'text-red-500'"
          >
            {{ employee.isActive ? "Active" : "Deactivated" }}
          </span>
        </div>

        <div v-if="canManage && !isSelf" class="mt-6 space-y-4 border-t border-gray-100 pt-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-ink">Active</span>
            <Switch
              :model-value="employee.isActive"
              :disabled="togglingStatus"
              @update:model-value="onToggleActive"
            />
          </div>

          <div class="space-y-1.5">
            <p class="text-xs text-subtle">Role</p>
            <Select v-model="roleValue" :disabled="changingRole">
              <SelectTrigger class="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="opt in roleOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-1.5">
            <p class="text-xs text-subtle">Department</p>
            <Select v-model="departmentValue" :disabled="changingDepartment">
              <SelectTrigger class="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem :value="NO_DEPARTMENT">No department</SelectItem>
                  <SelectItem v-for="d in directoryStore.departments" :key="d.id" :value="d.id">
                    {{ d.name }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <p v-else-if="isSelf" class="mt-4 text-center text-xs text-subtle">You can't manage your own membership.</p>
      </div>

      <div class="flex-1 space-y-4">
        <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 class="mb-4 text-sm font-semibold text-ink">Workload</h3>
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <p class="text-xl font-semibold text-ink">{{ employee.todoCount }}</p>
              <p class="text-xs text-subtle">To Do</p>
            </div>
            <div>
              <p class="text-xl font-semibold text-ink">{{ employee.inProgressCount }}</p>
              <p class="text-xs text-subtle">In Progress</p>
            </div>
            <div>
              <p class="text-xl font-semibold text-ink">{{ employee.inReviewCount }}</p>
              <p class="text-xs text-subtle">In Review</p>
            </div>
          </div>
        </div>

        <div v-if="canManageLeadership && !isSelf" class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 class="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ink">
            <Crown class="h-4 w-4" /> Department Leadership
          </h3>
          <div v-if="leadingDepartments.length" class="mb-3 space-y-1.5">
            <div v-for="d in leadingDepartments" :key="d.id" class="flex items-center justify-between text-sm">
              <span class="text-ink">{{ d.name }}</span>
              <button
                type="button"
                class="text-xs font-medium text-red-500 hover:underline disabled:opacity-50"
                :disabled="assigningDeptLeader"
                @click="revokeDepartmentLeader(d.id)"
              >
                Revoke
              </button>
            </div>
          </div>
          <div class="flex gap-2">
            <Select v-model="assignDeptId" :disabled="assigningDeptLeader">
              <SelectTrigger class="rounded-xl text-xs">
                <SelectValue placeholder="Make leader of…" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem
                    v-for="d in directoryStore.departments.filter((d) => d.leaderId !== employeeId)"
                    :key="d.id"
                    :value="d.id"
                  >
                    {{ d.name }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <button
              type="button"
              class="shrink-0 rounded-xl bg-primary px-3 text-xs font-medium text-white disabled:opacity-50"
              :disabled="!assignDeptId || assigningDeptLeader"
              @click="assignDepartmentLeader"
            >
              Assign
            </button>
          </div>
        </div>

        <div v-if="canManageLeadership && !isSelf" class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 class="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ink">
            <Users class="h-4 w-4" /> Team Leadership
          </h3>
          <div v-if="leadingTeams.length" class="mb-3 space-y-1.5">
            <div v-for="t in leadingTeams" :key="t.id" class="flex items-center justify-between text-sm">
              <span class="text-ink">{{ t.name }}</span>
              <button
                type="button"
                class="text-xs font-medium text-red-500 hover:underline disabled:opacity-50"
                :disabled="assigningTeamLeader"
                @click="revokeTeamLeader(t.id)"
              >
                Revoke
              </button>
            </div>
          </div>
          <div class="flex gap-2">
            <Select v-model="assignTeamId" :disabled="assigningTeamLeader">
              <SelectTrigger class="rounded-xl text-xs">
                <SelectValue placeholder="Make leader of…" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem
                    v-for="t in directoryStore.teams.filter((t) => t.leaderId !== employeeId)"
                    :key="t.id"
                    :value="t.id"
                  >
                    {{ t.name }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <button
              type="button"
              class="shrink-0 rounded-xl bg-primary px-3 text-xs font-medium text-white disabled:opacity-50"
              :disabled="!assignTeamId || assigningTeamLeader"
              @click="assignTeamLeader"
            >
              Assign
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
