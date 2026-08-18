<script setup lang="ts">
import { computed, ref } from "vue";
import { ArrowLeft, ArrowRight, Funnel, MoreVertical, Plus } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Header from "./SubConatiners/Header.vue";
import EmployeeInviteModal from "./EmployeeInviteModal.vue";
import { useEmployeeStore } from "@/stores/employeeStore";

const employeeStore = useEmployeeStore();
const layout = ref<"list" | "activity">("list");
const isInviteOpen = ref(false);
const currentPage = ref(1);
const perPage = 8;
const searchQuery = ref("");
const onSearch = (value: string) => {
  searchQuery.value = value;
  currentPage.value = 1;
};

const filteredEmployees = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return employeeStore.employees;
  return employeeStore.employees.filter((employee) =>
    [employee.name, employee.email, employee.role, employee.department].some((field) =>
      field?.toLowerCase().includes(query)
    )
  );
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

const levelBadgeClass: Record<string, string> = {
  Junior: "bg-slate-100 text-slate-600",
  Middle: "bg-blue-50 text-primary",
  Senior: "bg-violet-50 text-violet-600",
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
          <Button variant="ghost" size="icon" class="bg-white shadow-sm">
            <Funnel class="w-4 h-4" />
          </Button>
          <Button class="rounded-xl" @click="isInviteOpen = true">
            <Plus class="w-4 h-4" /> Add Employee
          </Button>
        </div>
      </div>
    </div>

    <!-- Empty states -->
    <div v-if="employeeStore.total === 0" class="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
      <p class="font-medium text-ink">No employees yet</p>
      <p class="mt-1 text-sm text-subtle">Invite your first teammate to get started.</p>
      <Button class="mt-4 rounded-xl" @click="isInviteOpen = true">
        <Plus class="w-4 h-4" /> Add Employee
      </Button>
    </div>
    <div v-else-if="filteredEmployees.length === 0" class="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
      <p class="font-medium text-ink">No employees match "{{ searchQuery }}"</p>
      <p class="mt-1 text-sm text-subtle">Try a different name, email, position, or department.</p>
    </div>

    <!-- List layout -->
    <div v-else-if="layout === 'list'" class="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
      <div class="min-w-[860px]">
        <div
          class="grid grid-cols-[2fr_1fr_1fr_0.7fr_1.3fr_40px] items-center gap-4 border-b border-gray-100 px-4 py-3 text-xs font-medium uppercase tracking-wide text-subtle"
        >
          <span>Employee</span>
          <span>Gender</span>
          <span>Birthday</span>
          <span>Age</span>
          <span>Position</span>
          <span></span>
        </div>

        <div
          v-for="employee in paginated"
          :key="employee.id"
          class="grid grid-cols-[2fr_1fr_1fr_0.7fr_1.3fr_40px] items-center gap-4 border-b border-gray-50 px-4 py-3 last:border-b-0 hover:bg-page/40"
        >
          <div class="flex min-w-0 items-center gap-3">
            <img :src="employee.imageSrc" class="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white" />
            <div class="min-w-0">
              <p class="truncate font-medium text-ink">{{ employee.name }}</p>
              <p class="truncate text-xs text-subtle">{{ employee.email }}</p>
            </div>
          </div>
          <p class="text-sm text-ink">{{ employee.gender }}</p>
          <p class="text-sm text-ink">{{ employee.birthday }}</p>
          <p class="text-sm text-ink">{{ employee.fullAge }}</p>
          <div class="flex items-center gap-2">
            <p class="truncate text-sm text-ink">{{ employee.role }}</p>
            <span class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium" :class="levelBadgeClass[employee.level]">
              {{ employee.level }}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <button type="button" class="justify-self-end rounded-lg p-1.5 text-subtle hover:bg-page hover:text-ink">
                <MoreVertical class="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Profile</DropdownMenuItem>
              <DropdownMenuItem>Message</DropdownMenuItem>
              <DropdownMenuItem class="text-red-500">Remove</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>

    <!-- Activity layout -->
    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="employee in paginated"
        :key="employee.id"
        class="rounded-2xl border border-gray-100 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        :class="employee.highlight ? 'bg-amber-400 text-white' : 'bg-white'"
      >
        <div class="flex flex-col items-center text-center">
          <img :src="employee.imageSrc" class="h-14 w-14 rounded-full object-cover ring-2 ring-white" />
          <p class="mt-2 font-medium" :class="employee.highlight ? 'text-white' : 'text-ink'">{{ employee.name }}</p>
          <p class="text-xs" :class="employee.highlight ? 'text-white/80' : 'text-subtle'">{{ employee.role }}</p>
          <span
            class="mt-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
            :class="employee.highlight ? 'bg-white/20 text-white' : levelBadgeClass[employee.level]"
          >
            {{ employee.level }}
          </span>
        </div>
        <div class="mt-4 grid grid-cols-3 gap-2 text-center">
          <div>
            <p class="font-semibold" :class="employee.highlight ? 'text-white' : 'text-ink'">{{ employee.backlogTasks }}</p>
            <p class="text-[10px]" :class="employee.highlight ? 'text-white/80' : 'text-subtle'">Backlog tasks</p>
          </div>
          <div>
            <p class="font-semibold" :class="employee.highlight ? 'text-white' : 'text-ink'">{{ employee.tasksInProgress }}</p>
            <p class="text-[10px]" :class="employee.highlight ? 'text-white/80' : 'text-subtle'">Tasks In Progress</p>
          </div>
          <div>
            <p class="font-semibold" :class="employee.highlight ? 'text-white' : 'text-ink'">{{ employee.tasksInReview }}</p>
            <p class="text-[10px]" :class="employee.highlight ? 'text-white/80' : 'text-subtle'">Tasks In Review</p>
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
  </div>
</template>
