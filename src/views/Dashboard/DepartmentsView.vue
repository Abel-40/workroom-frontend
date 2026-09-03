<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Plus, Users, Crown } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Header from "@/components/layout/Header.vue";
import CreateDepartmentModal from "@/components/departments/CreateDepartmentModal.vue";
import CreateTeamModal from "@/components/departments/CreateTeamModal.vue";
import EmptyState from "@/components/shared/EmptyState.vue";
import { ILLUSTRATIONS } from "@/lib/illustrations";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useEmployeeStore } from "@/stores/employeeStore";
import { usePermissions } from "@/composables/usePermissions";
import { useRouter } from "vue-router";

const directoryStore = useDirectoryStore();
const employeeStore = useEmployeeStore();
const router = useRouter();
const { can } = usePermissions();

const openDepartment = (departmentId: string) =>
  router.push({ name: "admin-dashboard", query: { section: "department-detail", departmentId } });
const openTeam = (teamId: string) =>
  router.push({ name: "admin-dashboard", query: { section: "team-detail", teamId } });

const tab = ref<"departments" | "teams">("departments");
const isDepartmentModalOpen = ref(false);
const isTeamModalOpen = ref(false);
const searchQuery = ref("");
const onSearch = (value: string) => {
  searchQuery.value = value;
};

onMounted(() => {
  directoryStore.fetchAll();
  if (!employeeStore.employees.length) employeeStore.fetchEmployees();
});

const canManage = computed(() => can("departments:manage"));

const initials = (name: string) =>
  (name || "?").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

const membersOf = (departmentName: string) =>
  employeeStore.employees.filter((e) => e.department === departmentName);

const filteredDepartments = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return directoryStore.departments;
  return directoryStore.departments.filter((d) => d.name.toLowerCase().includes(query));
});

const filteredTeams = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return directoryStore.teams;
  return directoryStore.teams.filter((t) => t.name.toLowerCase().includes(query));
});

const teamMembers = (memberIds: string[]) =>
  memberIds
    .map((id) => employeeStore.employees.find((e) => e.id === id))
    .filter((e): e is NonNullable<typeof e> => !!e);
</script>

<template>
  <CreateDepartmentModal v-model:open="isDepartmentModalOpen" />
  <CreateTeamModal v-model:open="isTeamModalOpen" />

  <div class="flex-1 p-4">
    <div class="mb-6">
      <Header @update:search="onSearch" />
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 class="text-xl font-semibold">Departments &amp; Teams</h1>
        <div class="flex items-center gap-3">
          <div class="flex rounded-xl bg-page p-1">
            <button
              type="button"
              class="rounded-lg px-4 py-1.5 text-sm font-medium transition"
              :class="tab === 'departments' ? 'bg-primary text-primary-foreground' : 'text-ink'"
              @click="tab = 'departments'"
            >
              Departments ({{ directoryStore.departments.length }})
            </button>
            <button
              type="button"
              class="rounded-lg px-4 py-1.5 text-sm font-medium transition"
              :class="tab === 'teams' ? 'bg-primary text-primary-foreground' : 'text-ink'"
              @click="tab = 'teams'"
            >
              Teams ({{ directoryStore.teams.length }})
            </button>
          </div>
          <Button v-if="canManage && tab === 'departments'" class="rounded-xl" @click="isDepartmentModalOpen = true">
            <Plus class="w-4 h-4" /> Add Department
          </Button>
          <Button v-if="canManage && tab === 'teams'" class="rounded-xl" @click="isTeamModalOpen = true">
            <Plus class="w-4 h-4" /> Add Team
          </Button>
        </div>
      </div>
      <p v-if="!canManage" class="-mt-4 mb-2 text-xs text-subtle">
        Only company admins or department leaders can create departments or teams.
      </p>
    </div>

    <!-- Departments tab -->
    <div v-if="tab === 'departments'">
      <EmptyState
        v-if="directoryStore.departments.length === 0"
        size="lg"
        :image="ILLUSTRATIONS.emptyDepartmentsAndTeams"
        image-alt="No departments yet"
        title="No departments yet"
        message="Create your company's first department to start organizing members."
      >
        <Button v-if="canManage" class="rounded-xl" @click="isDepartmentModalOpen = true">
          <Plus class="w-4 h-4" /> Add Department
        </Button>
      </EmptyState>
      <div v-else-if="filteredDepartments.length === 0" class="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <p class="font-medium text-ink">No departments match "{{ searchQuery }}"</p>
      </div>
      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="department in filteredDepartments"
          :key="department.id"
          class="cursor-pointer rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          role="button"
          tabindex="0"
          @click="openDepartment(department.id)"
          @keydown.enter="openDepartment(department.id)"
        >
          <div class="flex items-start justify-between gap-2">
            <p class="min-w-0 truncate font-semibold text-ink" :title="department.name">{{ department.name }}</p>
            <span class="flex shrink-0 items-center gap-1 rounded-full bg-page px-2 py-0.5 text-xs text-subtle">
              <Users class="h-3 w-3" /> {{ department.memberCount }}
            </span>
          </div>
          <p v-if="department.description" class="mt-1 line-clamp-2 text-sm text-subtle">{{ department.description }}</p>
          <p v-else class="mt-1 text-sm italic text-subtle">No description</p>

          <div class="mt-3 flex items-center gap-2 text-xs text-subtle">
            <Crown class="h-3.5 w-3.5" />
            <span>{{ department.leaderName ?? "No leader assigned" }}</span>
          </div>

          <div v-if="membersOf(department.name).length" class="mt-3 flex -space-x-2">
            <Avatar
              v-for="person in membersOf(department.name).slice(0, 6)"
              :key="person.id"
              size="sm"
              class="h-7 w-7 border-2 border-card text-[10px]"
              :title="person.name"
            >
              <AvatarFallback>{{ initials(person.name) }}</AvatarFallback>
            </Avatar>
            <span
              v-if="membersOf(department.name).length > 6"
              class="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-page text-[10px] font-medium text-subtle"
            >
              +{{ membersOf(department.name).length - 6 }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Teams tab -->
    <div v-else>
      <EmptyState
        v-if="directoryStore.teams.length === 0"
        size="lg"
        :image="ILLUSTRATIONS.emptyDepartmentsAndTeams"
        image-alt="No teams yet"
        title="No teams yet"
        message="Teams mix members from different departments for a specific project or initiative."
      >
        <Button v-if="canManage" class="rounded-xl" @click="isTeamModalOpen = true">
          <Plus class="w-4 h-4" /> Add Team
        </Button>
      </EmptyState>
      <div v-else-if="filteredTeams.length === 0" class="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <p class="font-medium text-ink">No teams match "{{ searchQuery }}"</p>
      </div>
      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="team in filteredTeams"
          :key="team.id"
          class="cursor-pointer rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          role="button"
          tabindex="0"
          @click="openTeam(team.id)"
          @keydown.enter="openTeam(team.id)"
        >
          <div class="flex items-start justify-between gap-2">
            <p class="min-w-0 truncate font-semibold text-ink" :title="team.name">{{ team.name }}</p>
            <span class="flex shrink-0 items-center gap-1 rounded-full bg-page px-2 py-0.5 text-xs text-subtle">
              <Users class="h-3 w-3" /> {{ team.memberIds.length }}
            </span>
          </div>
          <p v-if="team.description" class="mt-1 line-clamp-2 text-sm text-subtle">{{ team.description }}</p>
          <p v-else class="mt-1 text-sm italic text-subtle">No description</p>

          <div class="mt-3 flex items-center gap-2 text-xs text-subtle">
            <Crown class="h-3.5 w-3.5" />
            <span>{{ team.leaderName ?? "No leader assigned" }}</span>
          </div>

          <div v-if="teamMembers(team.memberIds).length" class="mt-3 space-y-1">
            <div
              v-for="person in teamMembers(team.memberIds).slice(0, 5)"
              :key="person.id"
              class="flex items-center gap-2"
            >
              <Avatar size="sm" class="h-6 w-6 shrink-0 text-[10px]">
                <AvatarFallback>{{ initials(person.name) }}</AvatarFallback>
              </Avatar>
              <span class="truncate text-xs text-ink">{{ person.name }}</span>
              <span class="shrink-0 text-[10px] text-subtle">{{ person.department ?? "No department" }}</span>
            </div>
            <p v-if="team.memberIds.length > 5" class="pl-8 text-[10px] text-subtle">
              +{{ team.memberIds.length - 5 }} more
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
