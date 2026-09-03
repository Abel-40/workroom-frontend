<script setup lang="ts">
// DM's "Colleagues" -- light read-only card grid, scoped to people they
// actually share a project or team with (not the whole company roster).
// No role/status/row-menu/invite -- Message is the only affordance, and
// even that only routes to Messenger generally (see PeopleView.vue's
// header comment: Messenger itself is mock/local-only, V1-excluded --
// there's no real "open a thread with this specific person" to wire up).
// No "Online" tab/status dot -- there's no real presence tracking in this
// app, and showing one anyway would be exactly the kind of placeholder
// functionality the project rules forbid.
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { MessageSquare, Search, Users } from "lucide-vue-next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import GlassCard from "@/components/shared/GlassCard.vue";
import PageHeader from "@/components/shared/PageHeader.vue";
import EmptyState from "@/components/shared/EmptyState.vue";
import SkeletonCard from "@/components/shared/SkeletonCard.vue";
import { ILLUSTRATIONS } from "@/lib/illustrations";
import { avatarColorFor } from "@/lib/avatarColor";
import { useEmployeeStore, type Employee } from "@/stores/employeeStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useProjectStore } from "@/stores/projectStore";
import { usePermissions } from "@/composables/usePermissions";

const router = useRouter();
const employeeStore = useEmployeeStore();
const directoryStore = useDirectoryStore();
const projectStore = useProjectStore();
const { userId: myUserId, departmentId: myDepartmentId } = usePermissions();

const loading = ref(true);
const searchQuery = ref("");
const scope = ref<"all" | "department">("all");

const myDepartmentName = computed(
  () => directoryStore.departments.find((d) => d.id === myDepartmentId.value)?.name ?? null
);

const sharedColleagueIds = computed(() => {
  const ids = new Set<string>();
  for (const team of directoryStore.teams) {
    if (team.memberIds.includes(myUserId.value ?? "")) {
      for (const id of team.memberIds) if (id !== myUserId.value) ids.add(id);
    }
  }
  for (const project of projectStore.projects) {
    const inThisProject =
      project.createdById === myUserId.value || project.assigneeIds?.includes(myUserId.value ?? "");
    if (!inThisProject) continue;
    if (project.createdById && project.createdById !== myUserId.value) ids.add(project.createdById);
    for (const id of project.assigneeIds ?? []) if (id !== myUserId.value) ids.add(id);
  }
  return ids;
});

const colleagues = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  return employeeStore.employees
    .filter((e) => sharedColleagueIds.value.has(e.id))
    .filter((e) => scope.value === "all" || e.department === myDepartmentName.value)
    .filter((e) => !query || e.name.toLowerCase().includes(query) || e.email.toLowerCase().includes(query));
});

onMounted(async () => {
  loading.value = true;
  await Promise.all([
    employeeStore.employees.length ? Promise.resolve() : employeeStore.fetchEmployees(),
    directoryStore.loaded ? Promise.resolve() : directoryStore.fetchAll(),
    projectStore.fetchProjects(),
  ]);
  loading.value = false;
});

const messageEmployee = (_employee: Employee) => router.push({ name: "admin-dashboard", query: { section: "messenger" } });
const initials = (name: string) => (name || "?").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
</script>

<template>
  <div class="p-4">
    <PageHeader kicker="People you work with" :title="`Colleagues (${colleagues.length})`">
      <template #actions>
        <div class="flex items-center gap-1 rounded-xl bg-page p-1">
          <button
            type="button"
            class="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
            :class="scope === 'all' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-subtle hover:text-ink'"
            @click="scope = 'all'"
          >
            All
          </button>
          <button
            type="button"
            class="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
            :class="scope === 'department' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-subtle hover:text-ink'"
            @click="scope = 'department'"
          >
            My department
          </button>
        </div>
      </template>
    </PageHeader>

    <div class="relative mb-5 max-w-sm">
      <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
      <Input v-model="searchQuery" placeholder="Search colleagues…" class="rounded-xl pl-9" />
    </div>

    <div v-if="loading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <SkeletonCard v-for="i in 4" :key="i" :rows="1" />
    </div>
    <EmptyState
      v-else-if="!colleagues.length"
      size="lg"
      :icon="Users"
      :image="searchQuery ? undefined : ILLUSTRATIONS.emptyColleaguesDm"
      image-alt="No colleagues yet"
      :message="searchQuery ? `No one matches “${searchQuery}”.` : 'No shared projects or teams yet -- join or create one to see colleagues here.'"
    />
    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <GlassCard v-for="employee in colleagues" :key="employee.id" variant="flat" padding="dense">
        <div class="flex flex-col items-center text-center">
          <Avatar size="sm" class="h-14 w-14 text-sm">
            <AvatarFallback :class="[avatarColorFor(employee.id).bg, avatarColorFor(employee.id).text]">
              {{ initials(employee.name) }}
            </AvatarFallback>
          </Avatar>
          <p class="mt-2 font-medium text-ink">{{ employee.name }}</p>
          <p class="text-xs text-subtle">{{ employee.profession ?? employee.roleLabel }}</p>
          <span v-if="employee.department" class="mt-1.5 rounded-full bg-page px-2 py-0.5 text-[10px] font-medium text-subtle">
            {{ employee.department }}
          </span>
        </div>
        <div class="mt-4 flex justify-center">
          <Button
            size="sm"
            class="h-8 w-full rounded-lg bg-primary/10 text-xs text-primary hover:bg-primary/20"
            @click="messageEmployee(employee)"
          >
            <MessageSquare class="mr-1 h-3.5 w-3.5" /> Message
          </Button>
        </div>
      </GlassCard>
    </div>
  </div>
</template>
