<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ArrowLeft, ArrowRight, Funnel, MoreVertical, Plus } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast/use-toast";
import Header from "@/components/layout/Header.vue";
import EmployeeInviteModal from "@/components/employees/EmployeeInviteModal.vue";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog.vue";
import { useEmployeeStore, type Employee, type EmployeeRole, type RemovalBlockers } from "@/stores/employeeStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useAuthStore } from "@/stores/authStore";
import { hasPermission } from "@/lib/permissions";
import { usePermissions } from "@/composables/usePermissions";
import { useRouter } from "vue-router";

const employeeStore = useEmployeeStore();
const directoryStore = useDirectoryStore();
const authStore = useAuthStore();
const router = useRouter();
const { role: myRole, isMemberRowLocked } = usePermissions();
const canInvite = computed(() => hasPermission(authStore.logedInUserInfo?.role, "members:invite"));
const canRemove = computed(() => hasPermission(authStore.logedInUserInfo?.role, "members:remove"));
const canChangeRole = computed(() => hasPermission(authStore.logedInUserInfo?.role, "members:manage_role"));
const canPromoteToCm = computed(() => hasPermission(authStore.logedInUserInfo?.role, "members:manage_cm_role"));
const { toast } = useToast();

// Member/DL rows only, per the spec -- Owner/CM rows stay locked (plain
// text, no row menu; see isMemberRowLocked) regardless of who's viewing.
const roleCellOptions = computed((): { value: EmployeeRole; label: string }[] => {
  const options: { value: EmployeeRole; label: string }[] = [
    { value: "DM", label: "Department Member" },
    { value: "DL", label: "Department Leader" },
  ];
  if (canPromoteToCm.value) options.push({ value: "CM", label: "Company Manager" });
  return options;
});
const changingRoleId = ref<string | null>(null);
const changeEmployeeRole = async (employee: Employee, role: EmployeeRole) => {
  if (role === employee.role) return;
  changingRoleId.value = employee.id;
  const { error } = await employeeStore.changeRole(employee.id, role);
  changingRoleId.value = null;
  if (error) toast({ title: "Role not changed", description: error, variant: "destructive" });
};
const layout = ref<"list" | "activity">("list");
const isInviteOpen = ref(false);

const openProfile = (employee: Employee) =>
  router.push({ name: "admin-dashboard", query: { section: "employee-detail", employeeId: employee.id } });

const removingId = ref<string | null>(null);
const reassignTarget = ref<{ employee: Employee; blockers: RemovalBlockers } | null>(null);
const reassignToId = ref("");
const reassigning = ref(false);
const employeePendingRemoval = ref<Employee | null>(null);

const confirmRemove = (employee: Employee) => {
  employeePendingRemoval.value = employee;
};

const removeEmployee = async () => {
  const employee = employeePendingRemoval.value;
  if (!employee) return;
  removingId.value = employee.id;
  const result = await employeeStore.remove(employee.id);
  removingId.value = null;
  employeePendingRemoval.value = null;
  if (result.reassignmentRequired) {
    reassignTarget.value = { employee, blockers: result.reassignmentRequired };
    reassignToId.value = "";
    return;
  }
  if (result.error) {
    toast({ title: "Member not removed", description: result.error, variant: "destructive" });
  }
};

const confirmReassignAndRemove = async () => {
  if (!reassignTarget.value || !reassignToId.value) return;
  reassigning.value = true;
  const result = await employeeStore.remove(reassignTarget.value.employee.id, reassignToId.value);
  reassigning.value = false;
  if (result.ok) {
    reassignTarget.value = null;
    return;
  }
  toast({ title: "Member not removed", description: result.error ?? "Failed to reassign and remove", variant: "destructive" });
};
const currentPage = ref(1);
const perPage = 8;
const searchQuery = ref("");
const onSearch = (value: string) => {
  searchQuery.value = value;
  currentPage.value = 1;
};

onMounted(() => {
  employeeStore.fetchEmployees();
  if (!directoryStore.loaded) directoryStore.fetchAll();
});

const initials = (name: string) =>
  (name || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const ROLE_OPTIONS: { value: EmployeeRole; label: string }[] = [
  { value: "Owner", label: "Owner" },
  { value: "CM", label: "Company Manager" },
  { value: "DL", label: "Department Leader" },
  { value: "DM", label: "Department Member" },
];
const departmentFilter = ref<string[]>([]);
const roleFilter = ref<EmployeeRole[]>([]);
const activeFilterCount = computed(() => departmentFilter.value.length + roleFilter.value.length);
const toggleDepartmentFilter = (name: string, checked: boolean) => {
  departmentFilter.value = checked
    ? [...departmentFilter.value, name]
    : departmentFilter.value.filter((existing) => existing !== name);
  currentPage.value = 1;
};
const toggleRoleFilter = (role: EmployeeRole, checked: boolean) => {
  roleFilter.value = checked ? [...roleFilter.value, role] : roleFilter.value.filter((existing) => existing !== role);
  currentPage.value = 1;
};
const clearEmployeeFilters = () => {
  departmentFilter.value = [];
  roleFilter.value = [];
};

const filteredEmployees = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  return employeeStore.employees.filter((employee) => {
    const matchesQuery =
      !query ||
      [employee.name, employee.email, employee.roleLabel, employee.department].some((field) =>
        field?.toLowerCase().includes(query)
      );
    const matchesDepartment =
      !departmentFilter.value.length || (!!employee.department && departmentFilter.value.includes(employee.department));
    const matchesRole = !roleFilter.value.length || roleFilter.value.includes(employee.role);
    return matchesQuery && matchesDepartment && matchesRole;
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredEmployees.value.length / perPage)));
const paginated = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return filteredEmployees.value.slice(start, start + perPage);
});
const rangeLabel = computed(() => {
  if (!filteredEmployees.value.length) return "0 of 0";
  const start = (currentPage.value - 1) * perPage + 1;
  const end = Math.min(currentPage.value * perPage, filteredEmployees.value.length);
  return `${start}-${end} of ${filteredEmployees.value.length}`;
});

const roleBadgeClass: Record<string, string> = {
  Owner: "bg-violet-50 text-violet-600",
  CM: "bg-indigo-50 text-indigo-600",
  DL: "bg-blue-50 text-primary",
  DM: "bg-slate-100 text-slate-600",
};
</script>

<template>
  <EmployeeInviteModal v-model:open="isInviteOpen" />
  <div class="flex-1 p-4">
    <div class="mb-6">
      <Header @update:search="onSearch" />
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 class="text-xl font-semibold">Employees ({{ filteredEmployees.length }})</h1>
        <div class="flex items-center gap-3">
          <div class="flex rounded-xl bg-page p-1">
            <button
              type="button"
              class="rounded-lg px-4 py-1.5 text-sm font-medium transition"
              :class="layout === 'list' ? 'bg-primary text-white' : 'text-ink'"
              @click="layout = 'list'"
            >
              List
            </button>
            <button
              type="button"
              class="rounded-lg px-4 py-1.5 text-sm font-medium transition"
              :class="layout === 'activity' ? 'bg-primary text-white' : 'text-ink'"
              @click="layout = 'activity'"
            >
              Activity
            </button>
          </div>
          <Popover>
            <PopoverTrigger as-child>
              <Button variant="ghost" size="icon" class="relative bg-white shadow-sm">
                <Funnel class="w-4 h-4" />
                <span
                  v-if="activeFilterCount"
                  class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-white"
                >
                  {{ activeFilterCount }}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-64 p-3" align="end">
              <div class="flex items-center justify-between">
                <p class="text-xs font-medium text-subtle">Filter employees</p>
                <button
                  v-if="activeFilterCount"
                  type="button"
                  class="text-xs font-medium text-primary hover:underline"
                  @click="clearEmployeeFilters"
                >
                  Clear
                </button>
              </div>

              <p class="mb-1.5 mt-3 text-xs font-medium text-subtle">Department</p>
              <div class="max-h-32 space-y-1 overflow-y-auto">
                <label
                  v-for="dept in directoryStore.departments"
                  :key="dept.id"
                  class="flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1 text-sm hover:bg-page"
                >
                  <Checkbox
                    :model-value="departmentFilter.includes(dept.name)"
                    @update:model-value="(checked) => toggleDepartmentFilter(dept.name, checked === true)"
                  />
                  <span class="truncate">{{ dept.name }}</span>
                </label>
              </div>

              <p class="mb-1.5 mt-3 text-xs font-medium text-subtle">Role</p>
              <div class="space-y-1">
                <label
                  v-for="role in ROLE_OPTIONS"
                  :key="role.value"
                  class="flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1 text-sm hover:bg-page"
                >
                  <Checkbox
                    :model-value="roleFilter.includes(role.value)"
                    @update:model-value="(checked) => toggleRoleFilter(role.value, checked === true)"
                  />
                  <span>{{ role.label }}</span>
                </label>
              </div>
            </PopoverContent>
          </Popover>
          <Button v-if="canInvite" class="rounded-xl" @click="isInviteOpen = true">
            <Plus class="w-4 h-4" /> Add Employee
          </Button>
        </div>
      </div>
    </div>

    <!-- Empty states -->
    <div v-if="employeeStore.total === 0" class="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
      <p class="font-medium text-ink">No employees yet</p>
      <p class="mt-1 text-sm text-subtle">Invite your first teammate to get started.</p>
      <Button v-if="canInvite" class="mt-4 rounded-xl" @click="isInviteOpen = true">
        <Plus class="w-4 h-4" /> Add Employee
      </Button>
    </div>
    <div v-else-if="filteredEmployees.length === 0" class="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
      <p class="font-medium text-ink">
        {{ searchQuery ? `No employees match "${searchQuery}"` : "No employees match the selected filters" }}
      </p>
      <p class="mt-1 text-sm text-subtle">Try a different name, email, department, or clear the filters.</p>
    </div>

    <!-- List layout -->
    <div v-else-if="layout === 'list'" class="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
      <div class="min-w-[860px]">
        <div
          class="grid grid-cols-[2fr_1fr_1fr_0.8fr_40px] items-center gap-4 border-b border-gray-100 px-4 py-3 text-xs font-medium uppercase tracking-wide text-subtle"
        >
          <span>Employee</span>
          <span>Department</span>
          <span>Role</span>
          <span>Status</span>
          <span></span>
        </div>

        <div
          v-for="employee in paginated"
          :key="employee.id"
          class="grid grid-cols-[2fr_1fr_1fr_0.8fr_40px] items-center gap-4 border-b border-gray-50 px-4 py-3 last:border-b-0 hover:bg-page/40"
        >
          <div class="flex min-w-0 cursor-pointer items-center gap-3" @click="openProfile(employee)">
            <Avatar size="sm" class="h-10 w-10 shrink-0 text-xs">
              <AvatarFallback>{{ initials(employee.name) }}</AvatarFallback>
            </Avatar>
            <div class="min-w-0">
              <p class="truncate font-medium text-ink hover:underline">{{ employee.name }}</p>
              <p class="truncate text-xs text-subtle">{{ employee.email }}</p>
            </div>
          </div>
          <p class="text-sm text-ink">{{ employee.department ?? "—" }}</p>

          <!-- Role: editable Select for Member/DL rows when I can manage roles;
               Owner/CM rows (or when I lack the permission) stay plain text --
               see isMemberRowLocked. -->
          <Select
            v-if="canChangeRole && !isMemberRowLocked(employee.role)"
            :model-value="employee.role"
            :disabled="changingRoleId === employee.id"
            @update:model-value="(value) => changeEmployeeRole(employee, value as EmployeeRole)"
          >
            <SelectTrigger class="h-8 rounded-lg text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="opt in roleCellOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <span v-else class="shrink-0 justify-self-start rounded-full px-2 py-0.5 text-xs font-medium" :class="roleBadgeClass[employee.role]">
            {{ employee.roleLabel }}
          </span>

          <span
            class="shrink-0 justify-self-start rounded-full px-2 py-0.5 text-xs font-medium"
            :class="employee.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'"
          >
            {{ employee.isActive ? "Active" : "Inactive" }}
          </span>

          <DropdownMenu v-if="!isMemberRowLocked(employee.role)">
            <DropdownMenuTrigger as-child>
              <button type="button" class="justify-self-end rounded-lg p-1.5 text-subtle hover:bg-page hover:text-ink">
                <MoreVertical class="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem @click="openProfile(employee)">View Profile</DropdownMenuItem>
              <DropdownMenuItem
                v-if="canRemove"
                class="text-red-500"
                :disabled="removingId === employee.id"
                @click="confirmRemove(employee)"
              >
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <span v-else></span>
        </div>
      </div>
    </div>

    <!-- Activity layout -->
    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="employee in paginated"
        :key="employee.id"
        class="cursor-pointer rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        role="button"
        tabindex="0"
        @click="openProfile(employee)"
        @keydown.enter="openProfile(employee)"
      >
        <div class="flex flex-col items-center text-center">
          <Avatar size="sm" class="h-14 w-14 text-sm">
            <AvatarFallback>{{ initials(employee.name) }}</AvatarFallback>
          </Avatar>
          <p class="mt-2 font-medium text-ink">{{ employee.name }}</p>
          <p class="text-xs text-subtle">{{ employee.department ?? "No department" }}</p>
          <span class="mt-1 rounded-full px-2 py-0.5 text-[10px] font-medium" :class="roleBadgeClass[employee.role]">
            {{ employee.roleLabel }}
          </span>
        </div>
        <div class="mt-4 grid grid-cols-3 gap-2 text-center">
          <div>
            <p class="font-semibold text-ink">{{ employee.todoCount }}</p>
            <p class="text-[10px] text-subtle">To Do</p>
          </div>
          <div>
            <p class="font-semibold text-ink">{{ employee.inProgressCount }}</p>
            <p class="text-[10px] text-subtle">In Progress</p>
          </div>
          <div>
            <p class="font-semibold text-ink">{{ employee.inReviewCount }}</p>
            <p class="text-[10px] text-subtle">In Review</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="employeeStore.total > 0" class="mt-4 flex items-center justify-end gap-3 text-sm text-subtle">
      <span>{{ rangeLabel }}</span>
      <button type="button" class="rounded-lg p-1 hover:bg-page disabled:opacity-40" :disabled="currentPage === 1" @click="currentPage--">
        <ArrowLeft class="h-4 w-4" />
      </button>
      <button type="button" class="rounded-lg p-1 hover:bg-page disabled:opacity-40" :disabled="currentPage === totalPages" @click="currentPage++">
        <ArrowRight class="h-4 w-4" />
      </button>
    </div>

    <ConfirmDeleteDialog
      :open="!!employeePendingRemoval"
      title="Remove team member?"
      :description="`Remove ${employeePendingRemoval?.name} from the company? This can't be undone.`"
      confirm-label="Remove"
      :loading="removingId === employeePendingRemoval?.id"
      @update:open="(v) => { if (!v) employeePendingRemoval = null; }"
      @confirm="removeEmployee"
    />

    <Dialog :open="!!reassignTarget" @update:open="(v) => { if (!v) reassignTarget = null }">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Reassign before removing {{ reassignTarget?.employee.name }}</DialogTitle>
        </DialogHeader>
        <div class="space-y-3 text-sm">
          <p class="text-subtle">
            This member currently owns active projects or tasks. Choose someone to take them over before removal.
          </p>
          <ul v-if="reassignTarget?.blockers.projects.length" class="list-inside list-disc space-y-1">
            <li v-for="p in reassignTarget.blockers.projects" :key="p.id">Project: {{ p.title }}</li>
          </ul>
          <ul v-if="reassignTarget?.blockers.tasks.length" class="list-inside list-disc space-y-1">
            <li v-for="t in reassignTarget.blockers.tasks" :key="t.id">Task: {{ t.title }}</li>
          </ul>
          <Select v-model="reassignToId">
            <SelectTrigger class="rounded-xl">
              <SelectValue placeholder="Reassign to…" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem
                  v-for="person in employeeStore.employees.filter((e) => e.id !== reassignTarget?.employee.id)"
                  :key="person.id"
                  :value="person.id"
                >
                  {{ person.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button class="rounded-xl" :disabled="!reassignToId || reassigning" @click="confirmReassignAndRemove">
            {{ reassigning ? "Reassigning…" : "Reassign & Remove" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
