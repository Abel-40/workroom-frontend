<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ArrowDown, ArrowUp, Calendar, Check, FileText, Funnel, MapPin, Pencil, Settings, Upload } from "lucide-vue-next";
import { RouterLink } from "vue-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ProjectImage from "@/components/projects/ProjectImage.vue";
import { useToast } from "@/components/ui/toast/use-toast";
import { useAuthStore } from "@/stores/authStore";
import { useUserProfileStore } from "@/stores/userProfileStore";
import { useProjectStore } from "@/stores/projectStore";
import { useEmployeeStore, type EmployeeRole } from "@/stores/employeeStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import { formatShortDate } from "@/lib/dates";

const authStore = useAuthStore();
const profileStore = useUserProfileStore();
const projectStore = useProjectStore();
const employeeStore = useEmployeeStore();
const directoryStore = useDirectoryStore();
const { toast } = useToast();

const tab = ref<"projects" | "team" | "vacations">("projects");

onMounted(() => {
  employeeStore.fetchEmployees();
  if (!directoryStore.loaded) directoryStore.fetchAll();
  if (!projectStore.projects.length) projectStore.fetchProjects();
  profileStore.fetchProfile();
});

// Self-service: editing your own profile isn't role-gated -- every member
// edits their own Position/Location/Birthday/Skype/CV regardless of company
// role. "Company"/"Email" below are read-only, sourced from real session
// data (authStore), never part of the editable form.
const isEditingProfile = ref(false);
const savingProfile = ref(false);
const profileForm = reactive({
  profession: "",
  address: "",
  phoneNumber: "",
  birthday: "" as string,
  skype: "",
});

const startEditingProfile = () => {
  profileForm.profession = profileStore.profile.profession;
  profileForm.address = profileStore.profile.address;
  profileForm.phoneNumber = profileStore.profile.phoneNumber;
  profileForm.birthday = profileStore.profile.birthday ?? "";
  profileForm.skype = profileStore.profile.skype;
  isEditingProfile.value = true;
};

const saveProfileEdits = async () => {
  savingProfile.value = true;
  const { error } = await profileStore.saveProfile({
    profession: profileForm.profession,
    address: profileForm.address,
    phoneNumber: profileForm.phoneNumber,
    birthday: profileForm.birthday || null,
    skype: profileForm.skype,
  });
  savingProfile.value = false;
  if (error) {
    toast({ title: "Profile not updated", description: error, variant: "destructive" });
    return;
  }
  isEditingProfile.value = false;
};

const toggleProfileEdit = () => {
  if (isEditingProfile.value) saveProfileEdits();
  else startEditingProfile();
};

const resumeInput = ref<HTMLInputElement | null>(null);
const uploadingResume = ref(false);
const triggerResumeUpload = () => resumeInput.value?.click();
const onResumeSelected = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  uploadingResume.value = true;
  const { error } = await profileStore.uploadResume(file);
  uploadingResume.value = false;
  (event.target as HTMLInputElement).value = "";
  if (error) {
    toast({ title: "Resume not uploaded", description: error, variant: "destructive" });
    return;
  }
  toast({ title: "Resume uploaded" });
};
const downloadResume = async () => {
  const { error } = await profileStore.downloadResume(`${displayName.value}-resume`);
  if (error) toast({ title: "Download failed", description: error, variant: "destructive" });
};

type PriorityLevel = "low" | "medium" | "high";
const PRIORITY_OPTIONS: { value: PriorityLevel; label: string }[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];
const ROLE_OPTIONS: { value: EmployeeRole; label: string }[] = [
  { value: "Owner", label: "Owner" },
  { value: "DL", label: "Department Leader" },
  { value: "DM", label: "Department Member" },
];
const projectPriorityFilter = ref<PriorityLevel[]>([]);
const teamDepartmentFilter = ref<string[]>([]);
const teamRoleFilter = ref<EmployeeRole[]>([]);
const activeFilterCount = computed(() =>
  tab.value === "projects"
    ? projectPriorityFilter.value.length
    : tab.value === "team"
      ? teamDepartmentFilter.value.length + teamRoleFilter.value.length
      : 0
);
const togglePriorityFilter = (value: PriorityLevel, checked: boolean) => {
  projectPriorityFilter.value = checked
    ? [...projectPriorityFilter.value, value]
    : projectPriorityFilter.value.filter((existing) => existing !== value);
};
const toggleTeamDepartmentFilter = (name: string, checked: boolean) => {
  teamDepartmentFilter.value = checked
    ? [...teamDepartmentFilter.value, name]
    : teamDepartmentFilter.value.filter((existing) => existing !== name);
};
const toggleTeamRoleFilter = (role: EmployeeRole, checked: boolean) => {
  teamRoleFilter.value = checked
    ? [...teamRoleFilter.value, role]
    : teamRoleFilter.value.filter((existing) => existing !== role);
};
const clearActiveTabFilters = () => {
  projectPriorityFilter.value = [];
  teamDepartmentFilter.value = [];
  teamRoleFilter.value = [];
};

const filteredProjects = computed(() => {
  const projects = projectStore.projects;
  if (!projectPriorityFilter.value.length) return projects.slice(0, 6);
  return projects.filter((p) => projectPriorityFilter.value.includes(p.priority.level)).slice(0, 6);
});
const filteredTeam = computed(() => {
  return employeeStore.employees.filter((employee) => {
    const matchesDepartment =
      !teamDepartmentFilter.value.length ||
      (!!employee.department && teamDepartmentFilter.value.includes(employee.department));
    const matchesRole = !teamRoleFilter.value.length || teamRoleFilter.value.includes(employee.role);
    return matchesDepartment && matchesRole;
  });
});
const displayName = computed(() => authStore.logedInUserInfo?.user?.username || "Abel");

const initials = (name: string) =>
  (name || "?").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

const shortProjectId = (id: string) => id.slice(0, 8).toUpperCase();

const priorityIcon = (level: string) => (level === "low" ? ArrowDown : ArrowUp);
const priorityColor = (level: string) => {
  switch (level) {
    case "high": return "text-red-500";
    case "medium": return "text-yellow-500";
    case "low": return "text-green-500";
    default: return "text-subtle";
  }
};

const roleBadgeClass: Record<string, string> = {
  Owner: "bg-violet-50 text-violet-600",
  DL: "bg-blue-50 text-primary",
  DM: "bg-slate-100 text-slate-600",
};
</script>

<template>
  <div class="flex-1 p-4">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-xl font-semibold">My Profile</h1>
      <RouterLink :to="{ name: 'admin-dashboard', query: { section: 'settings' } }" class="flex h-9 w-9 items-center justify-center rounded-lg bg-card shadow-sm text-subtle hover:text-ink">
        <Settings class="h-4 w-4" />
      </RouterLink>
    </div>

    <div class="flex flex-col gap-6 lg:flex-row">
      <!-- Profile card -->
      <aside class="w-full rounded-2xl border border-border bg-card p-4 lg:w-72">
        <div class="flex items-start justify-between">
          <Avatar size="sm" class="h-16 w-16 text-lg"><AvatarFallback>{{ initials(displayName) }}</AvatarFallback></Avatar>
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-lg border disabled:opacity-50"
            :class="isEditingProfile ? 'border-primary bg-primary/10 text-primary' : 'border-border text-subtle hover:border-primary/40'"
            :title="isEditingProfile ? 'Save changes' : 'Edit profile'"
            :disabled="savingProfile"
            @click="toggleProfileEdit"
          >
            <Check v-if="isEditingProfile" class="h-4 w-4" />
            <Pencil v-else class="h-4 w-4" />
          </button>
        </div>
        <p class="mt-3 font-semibold text-ink">{{ displayName }}</p>
        <p class="text-sm text-subtle">{{ profileStore.profile.profession || "No position set" }}</p>

        <p class="mt-6 mb-2 text-sm font-semibold text-ink">Main info</p>
        <div class="space-y-3">
          <div class="space-y-1">
            <Label class="text-xs text-subtle">Position</Label>
            <Input v-if="isEditingProfile" v-model="profileForm.profession" class="rounded-xl" />
            <p v-else class="truncate text-sm text-ink">{{ profileStore.profile.profession || "—" }}</p>
          </div>
          <div class="space-y-1">
            <Label class="text-xs text-subtle">Company</Label>
            <p class="truncate text-sm text-ink">{{ authStore.logedInUserInfo?.company_name || "—" }}</p>
          </div>
          <div class="space-y-1">
            <Label class="text-xs text-subtle">Location</Label>
            <template v-if="isEditingProfile">
              <div class="relative">
                <Input v-model="profileForm.address" class="rounded-xl pr-8" />
                <MapPin class="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
              </div>
            </template>
            <p v-else class="truncate text-sm text-ink">{{ profileStore.profile.address || "—" }}</p>
          </div>
          <div class="space-y-1">
            <Label class="text-xs text-subtle">Birthday Date</Label>
            <Input v-if="isEditingProfile" v-model="profileForm.birthday" type="date" class="rounded-xl" />
            <p v-else class="truncate text-sm text-ink">{{ profileStore.profile.birthday || "—" }}</p>
          </div>
        </div>

        <p class="mt-6 mb-2 text-sm font-semibold text-ink">Contact Info</p>
        <div class="space-y-3">
          <div class="space-y-1">
            <Label class="text-xs text-subtle">Email</Label>
            <p class="truncate text-sm text-ink">{{ authStore.logedInUserInfo?.user?.email || "—" }}</p>
          </div>
          <div class="space-y-1">
            <Label class="text-xs text-subtle">Mobile Number</Label>
            <Input v-if="isEditingProfile" v-model="profileForm.phoneNumber" class="rounded-xl" />
            <p v-else class="truncate text-sm text-ink">{{ profileStore.profile.phoneNumber || "—" }}</p>
          </div>
          <div class="space-y-1">
            <Label class="text-xs text-subtle">Skype</Label>
            <Input v-if="isEditingProfile" v-model="profileForm.skype" placeholder="skype id" class="rounded-xl" />
            <p v-else class="truncate text-sm text-ink">{{ profileStore.profile.skype || "—" }}</p>
          </div>
        </div>

        <p class="mt-6 mb-2 text-sm font-semibold text-ink">Resume / CV</p>
        <div class="space-y-2">
          <Button
            v-if="profileStore.profile.hasResume"
            variant="outline"
            class="w-full justify-start rounded-xl"
            @click="downloadResume"
          >
            <FileText class="mr-2 h-4 w-4" /> Download current resume
          </Button>
          <p v-else class="text-sm text-subtle">No resume uploaded yet.</p>
          <input ref="resumeInput" type="file" accept=".pdf,.doc,.docx" class="hidden" @change="onResumeSelected" />
          <Button
            variant="outline"
            class="w-full justify-start rounded-xl"
            :disabled="uploadingResume"
            @click="triggerResumeUpload"
          >
            <Upload class="mr-2 h-4 w-4" /> {{ profileStore.profile.hasResume ? "Replace resume" : "Upload resume" }}
          </Button>
          <p class="text-xs text-subtle">PDF or Word, up to 5MB.</p>
        </div>
      </aside>

      <!-- Tabs content -->
      <div class="flex-1">
        <div class="mb-4 flex items-center justify-between">
          <div class="flex rounded-xl bg-card p-1 shadow-sm">
            <button type="button" class="rounded-lg px-4 py-1.5 text-sm font-medium transition" :class="tab === 'projects' ? 'bg-primary text-white' : 'text-ink'" @click="tab = 'projects'">Projects</button>
            <button type="button" class="rounded-lg px-4 py-1.5 text-sm font-medium transition" :class="tab === 'team' ? 'bg-primary text-white' : 'text-ink'" @click="tab = 'team'">Team</button>
            <button type="button" class="rounded-lg px-4 py-1.5 text-sm font-medium transition" :class="tab === 'vacations' ? 'bg-primary text-white' : 'text-ink'" @click="tab = 'vacations'">My vacations</button>
          </div>
          <Popover v-if="tab !== 'vacations'">
            <PopoverTrigger as-child>
              <Button variant="ghost" size="icon" class="relative bg-card shadow-sm">
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
                <p class="text-xs font-medium text-subtle">Filter {{ tab }}</p>
                <button
                  v-if="activeFilterCount"
                  type="button"
                  class="text-xs font-medium text-primary hover:underline"
                  @click="clearActiveTabFilters"
                >
                  Clear
                </button>
              </div>

              <template v-if="tab === 'projects'">
                <p class="mb-1.5 mt-3 text-xs font-medium text-subtle">Priority</p>
                <div class="space-y-1">
                  <label
                    v-for="option in PRIORITY_OPTIONS"
                    :key="option.value"
                    class="flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1 text-sm hover:bg-page"
                  >
                    <Checkbox
                      :model-value="projectPriorityFilter.includes(option.value)"
                      @update:model-value="(checked) => togglePriorityFilter(option.value, checked === true)"
                    />
                    <span>{{ option.label }}</span>
                  </label>
                </div>
              </template>

              <template v-else>
                <p class="mb-1.5 mt-3 text-xs font-medium text-subtle">Department</p>
                <div class="max-h-32 space-y-1 overflow-y-auto">
                  <label
                    v-for="dept in directoryStore.departments"
                    :key="dept.id"
                    class="flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1 text-sm hover:bg-page"
                  >
                    <Checkbox
                      :model-value="teamDepartmentFilter.includes(dept.name)"
                      @update:model-value="(checked) => toggleTeamDepartmentFilter(dept.name, checked === true)"
                    />
                    <span class="truncate">{{ dept.name }}</span>
                  </label>
                </div>
                <p class="mb-1.5 mt-3 text-xs font-medium text-subtle">Role</p>
                <div class="space-y-1">
                  <label
                    v-for="option in ROLE_OPTIONS"
                    :key="option.value"
                    class="flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1 text-sm hover:bg-page"
                  >
                    <Checkbox
                      :model-value="teamRoleFilter.includes(option.value)"
                      @update:model-value="(checked) => toggleTeamRoleFilter(option.value, checked === true)"
                    />
                    <span>{{ option.label }}</span>
                  </label>
                </div>
              </template>
            </PopoverContent>
          </Popover>
        </div>

        <div v-if="tab === 'projects'" class="space-y-4">
          <p v-if="!filteredProjects.length" class="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-subtle">
            No projects match the selected filters.
          </p>
          <div
            v-for="project in filteredProjects"
            :key="project.id"
            class="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <div class="flex min-w-0 items-center gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-page text-xl">
                <ProjectImage v-if="project.image" :image="project.image" :alt="project.title">
                  <template #fallback>
                    <span>{{ project.icon }}</span>
                  </template>
                </ProjectImage>
                <span v-else>{{ project.icon }}</span>
              </div>
              <div class="min-w-0">
                <p class="text-xs text-subtle" :title="project.id">{{ shortProjectId(project.id) }}</p>
                <p class="truncate font-medium text-ink" :title="project.title">{{ project.title }}</p>
                <p class="flex items-center gap-1 text-xs text-subtle"><Calendar class="h-3 w-3" /> Created {{ formatShortDate(project.createdAt) }}</p>
              </div>
            </div>
            <div class="flex shrink-0 items-center gap-6 text-sm">
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
          <p v-if="!filteredTeam.length" class="col-span-full rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-subtle">
            No teammates match the selected filters.
          </p>
          <div v-for="employee in filteredTeam" :key="employee.id" class="flex flex-col items-center rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
            <Avatar size="sm" class="h-14 w-14 text-sm">
              <AvatarFallback>{{ initials(employee.name) }}</AvatarFallback>
            </Avatar>
            <p class="mt-2 font-medium text-ink">{{ employee.name }}</p>
            <p class="text-xs text-subtle">{{ employee.department ?? "No department" }}</p>
            <span class="mt-1 rounded-full px-2 py-0.5 text-[10px] font-medium" :class="roleBadgeClass[employee.role]">{{ employee.roleLabel }}</span>
          </div>
        </div>

        <div v-else class="rounded-2xl border border-border bg-card p-10 text-center text-sm text-subtle">
          No vacations scheduled.
        </div>
      </div>
    </div>
  </div>
</template>
