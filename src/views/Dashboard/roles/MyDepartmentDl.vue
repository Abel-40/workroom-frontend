<script setup lang="ts">
// DL's "My Department" -- a spotlight card for their own department (the
// one the flat six-department grid CM/Owner see would bury), other
// departments listed below as compact rows. The backend already lets a DL
// manage other departments too (departments:manage has no department-id
// scoping in the catalog -- see DepartmentDetailView.vue's canManage,
// unchanged), so "Open" on another department still lands on a fully
// editable page; this view only changes what's *emphasized* on landing.
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Building2, ChevronRight, Crown, Plus, Users } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/shared/GlassCard.vue";
import PageHeader from "@/components/shared/PageHeader.vue";
import SectionKicker from "@/components/shared/SectionKicker.vue";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useProjectStore } from "@/stores/projectStore";
import { usePermissions } from "@/composables/usePermissions";

const router = useRouter();
const directoryStore = useDirectoryStore();
const projectStore = useProjectStore();
const { departmentId: myDepartmentId } = usePermissions();

const myDepartment = computed(() => directoryStore.departments.find((d) => d.id === myDepartmentId.value) ?? null);
const otherDepartments = computed(() => directoryStore.departments.filter((d) => d.id !== myDepartmentId.value));
const activeProjectsIn = (departmentId: string) =>
  projectStore.projects.filter((p) => p.departmentId === departmentId && p.status === "Active").length;

onMounted(async () => {
  if (!directoryStore.loaded) await directoryStore.fetchAll();
  await projectStore.fetchProjects();
});

const openDepartment = (departmentId: string) =>
  router.push({ name: "admin-dashboard", query: { section: "department-detail", departmentId } });
</script>

<template>
  <div class="p-4">
    <PageHeader kicker="Department" title="My Department" />

    <div v-if="myDepartment" class="mb-6">
      <SectionKicker label="Your department" />
      <GlassCard padding="airy">
        <div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 class="text-xl font-bold text-ink">{{ myDepartment.name }}</h2>
            <p v-if="myDepartment.description" class="mt-1 text-sm text-[#7D8592]">{{ myDepartment.description }}</p>
            <div class="mt-3 flex flex-wrap items-center gap-4 text-sm text-[#7D8592]">
              <span class="flex items-center gap-1.5"><Users class="h-4 w-4" /> {{ myDepartment.memberCount }} people</span>
              <span class="flex items-center gap-1.5"><Building2 class="h-4 w-4" /> {{ activeProjectsIn(myDepartment.id) }} active projects</span>
              <span class="flex items-center gap-1.5"><Crown class="h-4 w-4" /> {{ myDepartment.leaderName ?? "No leader assigned" }}</span>
            </div>
          </div>
          <Button
            class="bg-gradient-to-br from-[#3F8CFF] to-accent-2 text-white shadow-[0_8px_22px_rgba(63,140,255,0.38)] hover:shadow-lg"
            @click="openDepartment(myDepartment.id)"
          >
            Manage
          </Button>
        </div>
      </GlassCard>
    </div>

    <div>
      <SectionKicker label="Other departments" />
      <div v-if="!otherDepartments.length" class="rounded-xl border border-dashed border-slate-900/10 px-6 py-8 text-center text-sm text-[#7D8592]">
        No other departments yet.
      </div>
      <div v-else class="wr-glass divide-y divide-slate-900/[.06] rounded-2xl">
        <button
          v-for="dept in otherDepartments"
          :key="dept.id"
          type="button"
          class="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-white/50"
          @click="openDepartment(dept.id)"
        >
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-ink">{{ dept.name }}</p>
            <p class="truncate text-xs text-[#7D8592]">{{ dept.memberCount }} people &middot; {{ dept.leaderName ?? "No leader" }}</p>
          </div>
          <span class="flex shrink-0 items-center gap-1 text-xs font-semibold text-primary-strong">
            Open <ChevronRight class="h-3.5 w-3.5" />
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
