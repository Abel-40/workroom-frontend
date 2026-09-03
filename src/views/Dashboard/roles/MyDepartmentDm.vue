<script setup lang="ts">
// DM's "My Department" -- read-only, single department, no create/rename/
// reassign controls of any kind (nothing here calls a mutating
// directoryStore action). Shows the department's real member roster (same
// data PeopleView.vue's DL roster uses) rather than the abstract Teams list
// -- a team can mix members from several departments (see
// DepartmentsView.vue), so it's a weaker match for "who's in my department"
// than the roster itself.
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Crown, MessageSquare, Users } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import GlassCard from "@/components/shared/GlassCard.vue";
import PageHeader from "@/components/shared/PageHeader.vue";
import SectionKicker from "@/components/shared/SectionKicker.vue";
import EmptyState from "@/components/shared/EmptyState.vue";
import { ILLUSTRATIONS } from "@/lib/illustrations";
import { avatarColorFor } from "@/lib/avatarColor";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useEmployeeStore } from "@/stores/employeeStore";
import { usePermissions } from "@/composables/usePermissions";

const router = useRouter();
const directoryStore = useDirectoryStore();
const employeeStore = useEmployeeStore();
const { departmentId: myDepartmentId, userId: myUserId } = usePermissions();

const myDepartment = computed(() => directoryStore.departments.find((d) => d.id === myDepartmentId.value) ?? null);
const departmentMembers = computed(() =>
  employeeStore.employees.filter((e) => e.department === myDepartment.value?.name)
);

onMounted(async () => {
  if (!directoryStore.loaded) await directoryStore.fetchAll();
  if (!employeeStore.employees.length) await employeeStore.fetchEmployees();
});

const messageLeader = () => router.push({ name: "admin-dashboard", query: { section: "messenger" } });
const initials = (name: string) => (name || "?").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
</script>

<template>
  <div class="p-4">
    <PageHeader kicker="Department" title="My Department" />

    <EmptyState
      v-if="!myDepartment"
      size="lg"
      :icon="Users"
      :image="ILLUSTRATIONS.emptyDepartment"
      image-alt="No department yet"
      title="No department yet"
      message="You're not assigned to a department yet."
    />
    <template v-else>
      <GlassCard variant="flat" padding="airy" class="mb-6">
        <h2 class="text-xl font-bold text-ink">{{ myDepartment.name }}</h2>
        <p v-if="myDepartment.description" class="mt-1 text-sm text-subtle">{{ myDepartment.description }}</p>
        <div class="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap items-center gap-4 text-sm text-subtle">
            <span class="flex items-center gap-1.5"><Users class="h-4 w-4" /> {{ myDepartment.memberCount }} people</span>
            <span class="flex items-center gap-1.5"><Crown class="h-4 w-4" /> {{ myDepartment.leaderName ?? "No leader assigned" }}</span>
          </div>
          <Button v-if="myDepartment.leaderId" variant="outline" size="sm" class="h-8 rounded-lg text-xs" @click="messageLeader">
            <MessageSquare class="mr-1 h-3.5 w-3.5" /> Message leader
          </Button>
        </div>
      </GlassCard>

      <SectionKicker label="Your team" />
      <EmptyState
        v-if="!departmentMembers.length"
        size="lg"
        :icon="Users"
        :image="ILLUSTRATIONS.emptyEmployees"
        image-alt="No one in this department yet"
        message="No one in this department yet."
      />
      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <GlassCard
          v-for="employee in departmentMembers"
          :key="employee.id"
          variant="flat"
          padding="dense"
          :class="employee.id === myUserId ? 'ring-2 ring-amber-400' : ''"
        >
          <div class="flex flex-col items-center text-center">
            <Avatar size="sm" class="h-14 w-14 text-sm">
              <AvatarFallback :class="[avatarColorFor(employee.id).bg, avatarColorFor(employee.id).text]">
                {{ initials(employee.name) }}
              </AvatarFallback>
            </Avatar>
            <p class="mt-2 flex items-center gap-1.5 font-medium text-ink">
              {{ employee.name }}
              <span v-if="employee.id === myUserId" class="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                You
              </span>
            </p>
            <p class="text-xs text-subtle">{{ employee.profession ?? employee.roleLabel }}</p>
            <span class="mt-1.5 rounded-full bg-page px-2 py-0.5 text-[10px] font-medium text-subtle">
              {{ employee.roleLabel }}
            </span>
          </div>
        </GlassCard>
      </div>
    </template>
  </div>
</template>
