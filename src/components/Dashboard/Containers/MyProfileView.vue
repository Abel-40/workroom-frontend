<script setup lang="ts">
import { computed, ref } from "vue";
import { ArrowDown, ArrowUp, Calendar, Funnel, MapPin, Pencil, Settings } from "lucide-vue-next";
import { RouterLink } from "vue-router";
import Header from "./SubConatiners/Header.vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/authStore";
import { useUserProfileStore } from "@/stores/userProfileStore";
import { useProjectStore } from "@/stores/projectStore";
import { useEmployeeStore } from "@/stores/employeeStore";

const authStore = useAuthStore();
const profileStore = useUserProfileStore();
const projectStore = useProjectStore();
const employeeStore = useEmployeeStore();

const tab = ref<"projects" | "team" | "vacations">("projects");
const displayName = computed(() => authStore.logedInUserInfo?.user?.username || "Abel");
const canEditProfile = computed(() =>
  ["company_admin", "department_leader"].includes(authStore.logedInUserInfo?.user?.role ?? "")
);

const initials = (name: string) =>
  (name || "?").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

const priorityIcon = (level: string) => (level === "low" ? ArrowDown : ArrowUp);
const priorityColor = (level: string) => {
  switch (level) {
    case "high": return "text-red-500";
    case "medium": return "text-yellow-500";
    case "low": return "text-green-500";
    default: return "text-gray-500";
  }
};

const levelBadgeClass: Record<string, string> = {
  Junior: "bg-slate-100 text-slate-600",
  Middle: "bg-blue-50 text-primary",
  Senior: "bg-violet-50 text-violet-600",
};
</script>

<template>
  <div class="flex-1 p-4">
    <Header />
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-xl font-semibold">My Profile</h1>
      <RouterLink :to="{ name: 'admin-dashboard', query: { section: 'settings' } }" class="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm text-subtle hover:text-ink">
        <Settings class="h-4 w-4" />
      </RouterLink>
    </div>

    <div class="flex flex-col gap-6 lg:flex-row">
      <!-- Profile card -->
      <aside class="w-full rounded-2xl border border-gray-100 bg-white p-4 lg:w-72">
        <div class="flex items-start justify-between">
          <Avatar size="sm" class="h-16 w-16 text-lg"><AvatarFallback>{{ initials(displayName) }}</AvatarFallback></Avatar>
          <button
            v-if="canEditProfile"
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-subtle hover:border-primary/40"
          >
            <Pencil class="h-4 w-4" />
          </button>
        </div>
        <p class="mt-3 font-semibold text-ink">{{ displayName }}</p>
        <p class="text-sm text-subtle">{{ profileStore.profile.position }}</p>
        <p v-if="!canEditProfile" class="mt-2 text-xs text-subtle">
          Only company admins or department leaders can edit this profile.
        </p>

        <p class="mt-6 mb-2 text-sm font-semibold text-ink">Main info</p>
        <div class="space-y-3">
          <div class="space-y-1">
            <Label class="text-xs text-subtle">Position</Label>
            <Input v-model="profileStore.profile.position" :disabled="!canEditProfile" class="rounded-xl" />
          </div>
          <div class="space-y-1">
            <Label class="text-xs text-subtle">Company</Label>
            <Input v-model="profileStore.profile.company" :disabled="!canEditProfile" class="rounded-xl" />
          </div>
          <div class="space-y-1">
            <Label class="text-xs text-subtle">Location</Label>
            <div class="relative">
              <Input v-model="profileStore.profile.location" :disabled="!canEditProfile" class="rounded-xl pr-8" />
              <MapPin class="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            </div>
          </div>
          <div class="space-y-1">
            <Label class="text-xs text-subtle">Birthday Date</Label>
            <div class="relative">
              <Input v-model="profileStore.profile.birthdayDate" :disabled="!canEditProfile" type="date" class="rounded-xl pr-8" />
            </div>
          </div>
        </div>

        <p class="mt-6 mb-2 text-sm font-semibold text-ink">Contact Info</p>
        <div class="space-y-3">
          <div class="space-y-1">
            <Label class="text-xs text-subtle">Email</Label>
            <Input v-model="profileStore.profile.email" :disabled="!canEditProfile" placeholder="you@email.com" class="rounded-xl" />
          </div>
          <div class="space-y-1">
            <Label class="text-xs text-subtle">Mobile Number</Label>
            <Input v-model="profileStore.profile.mobileNumber" :disabled="!canEditProfile" class="rounded-xl" />
          </div>
          <div class="space-y-1">
            <Label class="text-xs text-subtle">Skype</Label>
            <Input v-model="profileStore.profile.skype" :disabled="!canEditProfile" placeholder="skype id" class="rounded-xl" />
          </div>
        </div>
      </aside>

      <!-- Tabs content -->
      <div class="flex-1">
        <div class="mb-4 flex items-center justify-between">
          <div class="flex rounded-xl bg-white p-1 shadow-sm">
            <button type="button" class="rounded-lg px-4 py-1.5 text-sm font-medium transition" :class="tab === 'projects' ? 'bg-primary text-white' : 'text-ink'" @click="tab = 'projects'">Projects</button>
            <button type="button" class="rounded-lg px-4 py-1.5 text-sm font-medium transition" :class="tab === 'team' ? 'bg-primary text-white' : 'text-ink'" @click="tab = 'team'">Team</button>
            <button type="button" class="rounded-lg px-4 py-1.5 text-sm font-medium transition" :class="tab === 'vacations' ? 'bg-primary text-white' : 'text-ink'" @click="tab = 'vacations'">My vacations</button>
          </div>
          <Button variant="ghost" size="icon" class="bg-white shadow-sm">
            <Funnel class="w-4 h-4" />
          </Button>
        </div>

        <div v-if="tab === 'projects'" class="space-y-4">
          <div
            v-for="project in projectStore.projects.slice(0, 6)"
            :key="project.id"
            class="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <div class="flex items-center gap-3">
              <span class="flex h-10 w-10 items-center justify-center rounded-full bg-page text-xl">{{ project.icon }}</span>
              <div>
                <p class="text-xs text-subtle">{{ project.id }}</p>
                <p class="font-medium text-ink">{{ project.title }}</p>
                <p class="flex items-center gap-1 text-xs text-subtle"><Calendar class="h-3 w-3" /> Created {{ project.createdAt }}</p>
              </div>
            </div>
            <div class="flex items-center gap-6 text-sm">
              <div class="text-center">
                <p class="text-xs text-subtle">All tasks</p>
                <p class="font-semibold text-ink">{{ project.task.total }}</p>
              </div>
              <div class="text-center">
                <p class="text-xs text-subtle">Active tasks</p>
                <p class="font-semibold text-primary">{{ project.task.active }}</p>
              </div>
              <span class="flex items-center gap-1" :class="priorityColor(project.priority.level)">
                <component :is="priorityIcon(project.priority.level)" class="h-3.5 w-3.5" />
                {{ project.priority.level }}
              </span>
            </div>
          </div>
        </div>

        <div v-else-if="tab === 'team'" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="employee in employeeStore.employees" :key="employee.id" class="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm">
            <img :src="employee.imageSrc" class="h-14 w-14 rounded-full object-cover" />
            <p class="mt-2 font-medium text-ink">{{ employee.name }}</p>
            <p class="text-xs text-subtle">{{ employee.role }}</p>
            <span class="mt-1 rounded-full px-2 py-0.5 text-[10px] font-medium" :class="levelBadgeClass[employee.level]">{{ employee.level }}</span>
          </div>
        </div>

        <div v-else class="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-subtle">
          No vacations scheduled.
        </div>
      </div>
    </div>
  </div>
</template>
