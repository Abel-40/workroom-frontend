<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ChevronLeft, Check, Pencil, Crown, Users, X } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { useDirectoryStore } from "@/stores/directoryStore";
import { useEmployeeStore } from "@/stores/employeeStore";
import { usePermissions } from "@/composables/usePermissions";

const route = useRoute();
const router = useRouter();
const { toast } = useToast();
const directoryStore = useDirectoryStore();
const employeeStore = useEmployeeStore();
const { can } = usePermissions();

onMounted(() => {
  if (!directoryStore.loaded) directoryStore.fetchAll();
  if (!employeeStore.employees.length) employeeStore.fetchEmployees();
});

const departmentId = computed(() => String(route.query.departmentId ?? ""));
const department = computed(() => directoryStore.departments.find((d) => d.id === departmentId.value) ?? null);

const canManage = computed(() => can("departments:manage"));

const initials = (name: string) =>
  (name || "?").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

const members = computed(() =>
  department.value ? employeeStore.employees.filter((e) => e.department === department.value!.name) : []
);

const isEditing = ref(false);
const editName = ref("");
const editDescription = ref("");
const saving = ref(false);

watch(
  department,
  (dept) => {
    if (dept && !isEditing.value) {
      editName.value = dept.name;
      editDescription.value = dept.description;
    }
  },
  { immediate: true }
);

const startEdit = () => {
  if (!department.value) return;
  editName.value = department.value.name;
  editDescription.value = department.value.description;
  isEditing.value = true;
};

const saveEdit = async () => {
  if (!department.value) return;
  saving.value = true;
  const { errors } = await directoryStore.updateDepartment(department.value.id, {
    name: editName.value.trim(),
    description: editDescription.value,
  });
  saving.value = false;
  if (errors) {
    toast({ title: "Department not updated", description: Object.values(errors).flat().join(" "), variant: "destructive" });
    return;
  }
  isEditing.value = false;
};

const assigningLeader = ref(false);
const assignLeader = async (userId: string) => {
  if (!department.value) return;
  assigningLeader.value = true;
  const { error } = await directoryStore.setDepartmentLeader(department.value.id, userId);
  assigningLeader.value = false;
  if (error) toast({ title: "Leader not assigned", description: error, variant: "destructive" });
};

const revokeLeader = async () => {
  if (!department.value) return;
  assigningLeader.value = true;
  const { error } = await directoryStore.revokeDepartmentLeader(department.value.id);
  assigningLeader.value = false;
  if (error) toast({ title: "Leader not revoked", description: error, variant: "destructive" });
};

const goBack = () => router.push({ name: "admin-dashboard", query: { section: "departments" } });
</script>

<template>
  <div class="flex-1 p-4">
    <div class="mb-6">
      <Header />
      <button type="button" class="flex items-center gap-1 text-sm text-primary" @click="goBack">
        <ChevronLeft class="h-4 w-4" /> Departments &amp; Teams
      </button>
    </div>

    <div v-if="!department" class="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
      <p class="font-medium text-ink">Department not found</p>
    </div>

    <div v-else class="max-w-2xl rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 flex-1">
          <input
            v-if="isEditing"
            v-model="editName"
            class="w-full rounded-lg border border-gray-200 px-2 py-1 text-xl font-semibold text-ink focus:border-primary focus:outline-none"
          />
          <h1 v-else class="truncate text-xl font-semibold text-ink">{{ department.name }}</h1>
        </div>
        <button
          v-if="canManage"
          type="button"
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border hover:border-primary/40"
          :class="isEditing ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-400'"
          :disabled="saving"
          @click="isEditing ? saveEdit() : startEdit()"
        >
          <Check v-if="isEditing" class="h-4 w-4" />
          <Pencil v-else class="h-4 w-4" />
        </button>
      </div>

      <div class="mt-3">
        <textarea
          v-if="isEditing"
          v-model="editDescription"
          rows="3"
          placeholder="Add a description"
          class="w-full resize-y rounded-lg border border-gray-200 px-2 py-1 text-sm text-ink focus:border-primary focus:outline-none"
        />
        <p v-else-if="department.description" class="text-sm text-subtle">{{ department.description }}</p>
        <p v-else class="text-sm italic text-subtle">No description</p>
      </div>

      <div class="mt-6 flex items-center justify-between rounded-xl bg-page p-3">
        <div class="flex items-center gap-2">
          <Crown class="h-4 w-4 text-subtle" />
          <span class="text-sm font-medium text-ink">{{ department.leaderName ?? "No leader assigned" }}</span>
        </div>
        <div v-if="canManage" class="flex items-center gap-2">
          <Select :disabled="assigningLeader" @update:model-value="(v) => assignLeader(v as string)">
            <SelectTrigger class="h-8 w-40 rounded-lg text-xs">
              <SelectValue placeholder="Assign leader" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="person in members" :key="person.id" :value="person.id">
                  {{ person.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <button
            v-if="department.leaderId"
            type="button"
            class="flex h-7 w-7 items-center justify-center rounded-lg text-subtle hover:bg-white hover:text-red-500"
            title="Revoke leadership"
            :disabled="assigningLeader"
            @click="revokeLeader"
          >
            <X class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div class="mt-6">
        <div class="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink">
          <Users class="h-4 w-4" /> Members ({{ members.length }})
        </div>
        <div v-if="members.length" class="space-y-2">
          <div v-for="person in members" :key="person.id" class="flex items-center gap-2">
            <Avatar size="sm" class="h-8 w-8 text-xs">
              <AvatarFallback>{{ initials(person.name) }}</AvatarFallback>
            </Avatar>
            <div>
              <p class="text-sm text-ink">{{ person.name }}</p>
              <p class="text-xs text-subtle">{{ person.roleLabel }}</p>
            </div>
          </div>
        </div>
        <p v-else class="text-sm italic text-subtle">No members in this department yet</p>
      </div>
    </div>
  </div>
</template>
