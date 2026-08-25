<script setup lang="ts">
import {
  Menu,
  Kanban,
  ChartNoAxesGantt,
  Funnel,
  Plus,
  Pencil,
  ArrowUp,
  Calendar,
  Trash2,
  MoveLeft,
  ChevronRight,
  ArrowDown,ArrowLeft,ArrowRight,
  Check,
  Sparkles,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import TaskCard from "@/components/cards/TaskCard.vue";
import Header from "@/components/layout/Header.vue";
import TaskBoardView from "@/components/projects/TaskBoardView.vue";
import TaskTimelineView from "@/components/projects/TaskTimelineView.vue";
import TaskDetailPanel from "@/components/projects/TaskDetailPanel.vue";
import TaskInfoSidebar from "@/components/projects/TaskInfoSidebar.vue";
import EmptyTasksState from "@/components/projects/EmptyTasksState.vue";
import AddTaskModal from "@/components/projects/AddTaskModal.vue";
import CreateProjectModal from "@/components/projects/CreateProjectModal.vue";
import ProjectImage from "@/components/projects/ProjectImage.vue";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog.vue";
import { useToast } from "@/components/ui/toast/use-toast";
import { formatShortDate } from "@/lib/dates";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import { useEmployeeStore } from "@/stores/employeeStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import type { Project, TaskType } from "@/types/types";
import { addDays, format } from "date-fns";
import { ref, onMounted, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRouter, useRoute } from "vue-router";
import filterModal from "@/components/projects/FilterModal.vue";
import filterComposables from "@/composables/filterComposables";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const { onOpen, isOpen } = filterComposables();

const router = useRouter();
const route = useRoute();
const { toast } = useToast();
const projectsStore = useProjectStore();
const authStore = useAuthStore();
const employeeStore = useEmployeeStore();
const directoryStore = useDirectoryStore();
const { selectedProject, selectedTask } = storeToRefs(projectsStore);
// const selectedProject = ref(projectsStore.getSelectedState)
const onClick = (project: Project) => {
  selectedProject.value = project;
  projectsStore.selectTask(null);
  isEditingProject.value = false;
};

const isAddTaskOpen = ref(false);
const isAddProjectOpen = ref(false);
const isEditingProject = ref(false);

// Set when the AI panel's "View generated tasks" action is used -- switches
// the Kanban board to show only this project's AI-generated tasks until
// cleared. Local UI state only, not persisted.
const showOnlyAiGeneratedTasks = ref(false);
const onViewGeneratedTasks = () => {
  selectedTaskStyle.value = "Kanban";
  showOnlyAiGeneratedTasks.value = true;
};
const boardTasks = computed(() => {
  const tasks = selectedProject.value?.task.tasks || [];
  return showOnlyAiGeneratedTasks.value ? tasks.filter((t) => t.source === "ai_generated") : tasks;
});

// Editable assignees (edit mode only) -- same type-to-mention picker as
// CreateProjectModal, staged locally and persisted alongside title/
// description when the user leaves edit mode.
const editAssignees = ref<{ id: string; name: string }[]>([]);
const assigneeInput = ref("");
const showMentions = ref(false);
const mentionMatches = computed(() => {
  const lastAt = assigneeInput.value.lastIndexOf("@");
  if (lastAt < 0) return [];
  const query = assigneeInput.value.slice(lastAt + 1).toLowerCase();
  return employeeStore.employees
    .filter((e) => !editAssignees.value.some((s) => s.id === e.id))
    .filter((e) => e.name.toLowerCase().includes(query))
    .slice(0, 6);
});
const onAssigneeInput = () => {
  const lastAt = assigneeInput.value.lastIndexOf("@");
  showMentions.value = lastAt >= 0 && (lastAt === 0 || assigneeInput.value[lastAt - 1] === " ");
};
const pickAssignee = (person: { id: string; name: string }) => {
  editAssignees.value.push({ id: person.id, name: person.name });
  assigneeInput.value = "";
  showMentions.value = false;
};
const removeAssignee = (id: string) => {
  editAssignees.value = editAssignees.value.filter((p) => p.id !== id);
};
const onAssigneeInputBlur = () => {
  setTimeout(() => {
    showMentions.value = false;
  }, 150);
};

const toggleEditProject = async () => {
  if (isEditingProject.value && selectedProject.value) {
    // Leaving edit mode: persist the title/description/assignee edits made in place.
    await projectsStore.updateProject(selectedProject.value.id, {
      title: selectedProject.value.title,
      description: selectedProject.value.description,
      collaboratorIds: editAssignees.value.map((p) => p.id),
    });
    isEditingProject.value = false;
    return;
  }
  // Entering edit mode: seed the assignee picker from the project's current collaborators.
  editAssignees.value = (selectedProject.value?.assigneeIds ?? [])
    .map((id) => {
      const employee = employeeStore.employees.find((e) => e.id === id);
      return employee ? { id, name: employee.name } : null;
    })
    .filter((p): p is { id: string; name: string } => !!p);
  assigneeInput.value = "";
  isEditingProject.value = true;
};

// Cover image (edit mode only) -- applied immediately since it's a real
// upload/API call, not a value that fits the staged title/description edit.
const coverMode = ref<"link" | "upload">("link");
const coverUrl = ref("");
const coverFileInput = ref<HTMLInputElement | null>(null);
const savingCover = ref(false);
const onCoverLinkSave = async () => {
  if (!selectedProject.value || !coverUrl.value.trim()) return;
  savingCover.value = true;
  const { error } = await projectsStore.setProjectImageLink(selectedProject.value.id, coverUrl.value.trim());
  savingCover.value = false;
  if (error) {
    toast({ title: "Cover image not set", description: error, variant: "destructive" });
    return;
  }
  coverUrl.value = "";
};
const onCoverFileChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file || !selectedProject.value) return;
  savingCover.value = true;
  const { error } = await projectsStore.uploadProjectImage(selectedProject.value.id, file);
  savingCover.value = false;
  if (coverFileInput.value) coverFileInput.value.value = "";
  if (error) toast({ title: "Cover image not uploaded", description: error, variant: "destructive" });
};
const onCoverRemove = async () => {
  if (!selectedProject.value) return;
  savingCover.value = true;
  const { error } = await projectsStore.removeProjectImage(selectedProject.value.id);
  savingCover.value = false;
  if (error) toast({ title: "Cover image not removed", description: error, variant: "destructive" });
};

const transferringOwner = ref(false);
const ownerValue = computed({
  get: () => selectedProject.value?.currentOwnerId ?? selectedProject.value?.createdById ?? "",
  set: async (value: string) => {
    if (!selectedProject.value || !value || value === selectedProject.value.currentOwnerId) return;
    transferringOwner.value = true;
    const { error } = await projectsStore.transferOwnership(selectedProject.value.id, value);
    transferringOwner.value = false;
    if (error) toast({ title: "Ownership not transferred", description: error, variant: "destructive" });
  },
});

const archiving = ref(false);
const isDeleteProjectDialogOpen = ref(false);
const archiveCurrentProject = async () => {
  if (!selectedProject.value) return;
  archiving.value = true;
  const ok = await projectsStore.archiveProject(selectedProject.value.id);
  archiving.value = false;
  isDeleteProjectDialogOpen.value = false;
  if (ok) goBack();
};
const onSelectTask = (task: TaskType) => {
  projectsStore.selectTask(task);
  showDetial.value = true;
};
const closeTaskDetail = () => projectsStore.selectTask(null);

const projectDeadline = (project: Project | null) => {
  if (!project) return "Not set";
  if (project.deadline) return formatShortDate(project.deadline);
  const created = new Date(project.createdAt);
  if (Number.isNaN(created.getTime())) return "Not set";
  return format(addDays(created, 30), "MMM d, yyyy");
};

// Trimmed display id -- the real id is a full UUID, too long to show inline;
// the full value is still available via the title tooltip.
const shortProjectId = (id: string | null | undefined) => (id ? id.slice(0, 8).toUpperCase() : "");

// "See more" for long descriptions in the detail panel.
const DESCRIPTION_PREVIEW_LENGTH = 160;
const showFullDescription = ref(false);
const descriptionIsLong = computed(
  () => (selectedProject.value?.description?.length ?? 0) > DESCRIPTION_PREVIEW_LENGTH
);
const descriptionPreview = computed(() => {
  const text = selectedProject.value?.description ?? "";
  if (!descriptionIsLong.value || showFullDescription.value) return text;
  return text.slice(0, DESCRIPTION_PREVIEW_LENGTH).trimEnd() + "…";
});
watch(selectedProject, () => {
  showFullDescription.value = false;
});

// Tasks are fetched lazily per-project (not bundled with the project list
// itself) -- whenever the open project changes, load its real task list.
const tasksLoading = ref(false);
watch(
  selectedProject,
  async (project) => {
    showOnlyAiGeneratedTasks.value = false;
    if (!project) return;
    tasksLoading.value = true;
    await projectsStore.fetchTasks(project.id);
    tasksLoading.value = false;
  },
  { immediate: true }
);

// Selects the project named by ?id=... (set when arriving via a project
// card's click-through, e.g. from the Dashboard widget) if it's present and
// found in the already-fetched, already-authorized project list; otherwise
// falls back to the first project, same as before this existed.
const selectProjectFromRoute = () => {
  const id = route.query.id;
  if (typeof id === "string") {
    const match = projectsStore.projects.find((p) => p.id === id);
    if (match) {
      selectedProject.value = match;
      showDetial.value = true;
      return;
    }
  }
  selectedProject.value = paginatedProjects.value[0];
};

// first selected project value
onMounted(async ()=>{
  // Employees load first so project creator names resolve when mapping.
  await employeeStore.fetchEmployees();
  if (!directoryStore.loaded) await directoryStore.fetchAll();
  await projectsStore.fetchProjects();
  selectProjectFromRoute();
  // Reached from the AI workspace's "View tasks in backlog" link -- show
  // the board filtered to just this project's AI-generated tasks.
  if (route.query.aiGenerated === "true") onViewGeneratedTasks();
})
// Re-select when the ?id= query param changes (e.g. clicking a different
// project card while already on this section).
watch(() => route.query.id, (id) => {
  if (typeof id === "string" && projectsStore.projects.length) selectProjectFromRoute();
});
// Update whenever a new project is added -- createProject unshifts the
// newest project to the front of the list.
watch(
  () => projectsStore.projects.length,
  () => {
    if (projectsStore.projects.length > 0 && typeof route.query.id !== "string") {
      selectedProject.value = projectsStore.projects[0];
    }
  }
);


const projectType = ref<'Active'|'In Active'|'Done'>('Active')
const onViewDetail = (project: Project) => {
  selectedProject.value = project;
  projectsStore.selectTask(null);
  isEditingProject.value = false;
  router.push({
    path: "/admin/dashboard/",
    query: {
      section: "projects",
      id: selectedProject.value.id,
      details: selectedProject.value.title,
    },
  });
  showDetial.value = true;
};
const { showDetial } = storeToRefs(projectsStore);
const goBack = () => {
  projectsStore.selectTask(null);
  isEditingProject.value = false;
  router.push({
    path: "/admin/dashboard/",
    query: {
      section: "projects"
    },
  });
  showDetial.value = false;
};
const setFocus = ref(selectedProject.value?.id);
const setActive = (id: string) => {
  if (selectedProject.value?.id === id) return ["bg-blue-50"];
};
const activeBorder = (id: string) => {
  if (selectedProject.value?.id === id)
    return ["border-r-blue-400 border-r-[4px]"];
};

const getPriorityColor = (level: "high" | "medium" | "low" | undefined) => {
  switch (level) {
    case "high":
      return "text-red-500";
    case "medium":
      return " text-yellow-500";
    case "low":
      return "text-green-500";
    default:
      return "text-gray-500";
  }
};

const getIcon = (level: "high" | "medium" | "low" | undefined) => {
  switch (level) {
    case "high":
      return ArrowUp;
    case "medium":
      return ArrowUp;
    case "low":
      return ArrowDown;
  }
};

const TaskListStyle = [
  { style: "list", icon: Menu },
  { style: "Kanban", icon: Kanban },
  { style: "ChartNoAxesGantt", icon: ChartNoAxesGantt },
];
const selectedTaskStyle = ref(TaskListStyle[0].style);
const setActiveForIcons = (style: string) => {
  if (selectedTaskStyle.value === style)
    return ["border-[1px] border-blue-400 text-blue-400"];
};
const active = (index: number) => {
  selectedTaskStyle.value = TaskListStyle[index].style;
};

interface FilterOption {
  period?: {
    start: Date | null;
    end: Date | null;
  };
  taskGroups?: string[]; // e.g. ["Design", "Development"]
  assignedBy?: string[]; // e.g. ["Abel", "Danel"]
  assignees?: string[]; // modelValue
  estimate?: string; // duration as string
  priority?: "low" | "medium" | "high" | null;
}
// No default date filter -- "end: new Date()" here would freeze an upper
// bound at page-load time and silently hide any project created afterward
// (e.g. right after submitting Create Project) until a full reload.
const selectedFilters = ref<FilterOption>({
  period: {
    start: null,
    end: null,
  },
  taskGroups: [],
  assignedBy: [],
  assignees: [],
  estimate: "",
  priority: null,
});

const ApplyFilter = (filters: FilterOption) => {
  selectedFilters.value = filters;
  selectedProject.value = paginatedProjects.value[0]
};
const projects = computed(()=>{
  return projectsStore.projects.filter((project)=> project.status === projectType.value)
})
const BacklogTasks = computed(()=>{
  return selectedProject.value?.task.tasks?.filter((task)=>{
    return task.status === 'To Do'
  })
})

// Task Group and Estimate filter on task-level data that isn't wired to the
// backend in this app yet (Tasks are still local-only -- see projectStore),
// so there's no real per-project task list to filter here. Task Group is
// read against the project's own Department instead (the closest real
// "what kind of work is this" signal already available on every project),
// and Estimate against the project's own span (deadline minus start date)
// rather than a task's logged estimate.
const projectDepartmentName = (project: Project): string | null => {
  if (!project.departmentId) return null;
  return directoryStore.departments.find((d) => d.id === project.departmentId)?.name ?? null;
};
const parseEstimateDays = (value: string): number | null => {
  const match = value.match(/(\d+(?:\.\d+)?)\s*(d|day|days|w|week|weeks|m|month|months)/i);
  if (!match) return null;
  const amount = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  if (unit.startsWith("w")) return amount * 7;
  if (unit.startsWith("m")) return amount * 30;
  return amount;
};
const projectSpanDays = (project: Project): number | null => {
  if (!project.startDate || !project.deadline) return null;
  const start = new Date(project.startDate).getTime();
  const end = new Date(project.deadline).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  return Math.max(0, (end - start) / (1000 * 60 * 60 * 24));
};

const filteredProjects = computed(() => {
  const filters = selectedFilters.value

  // If no filters are set, return all projects
  if (
    !filters.period?.start &&
    !filters.period?.end &&
    (!filters.taskGroups || filters.taskGroups.length === 0) &&
    (!filters.assignedBy || filters.assignedBy.length === 0) &&
    (!filters.assignees || filters.assignees.length === 0) &&
    !filters.estimate &&
    !filters.priority
  ) {
    return projects.value
  }

  const estimateDays = filters.estimate ? parseEstimateDays(filters.estimate) : null;

  return projects.value.filter((project) => {
    const projectDate = new Date(project.createdAt)
    const period = filters.period

    // Date filtering
    const matchesDate = !period || (
      (!period.start || projectDate >= period.start) &&
      (!period.end || projectDate <= period.end)
    )

    // Task Groups filtering -- matches the project's own Department (see
    // comment above); a project outside any of the checked departments (or
    // with no department at all) doesn't match.
    const matchesTaskGroups =
      !filters.taskGroups ||
      filters.taskGroups.length === 0 ||
      (() => {
        const departmentName = projectDepartmentName(project);
        return !!departmentName && filters.taskGroups!.some((g) => g.toLowerCase() === departmentName.toLowerCase());
      })()

    // Assigned By filtering
    const matchesAssignedBy =
      !filters.assignedBy ||
      filters.assignedBy.length === 0 ||
      filters.assignedBy.includes(project.assignedBy)

    // Assignees filtering (free-text names, matched case-insensitively so a
    // typo in casing doesn't silently drop an otherwise-correct match)
    const matchesAssignee = !filters.assignees || filters.assignees.length === 0 ||
      project.assignee.some((assignee) =>
        filters.assignees?.some((a) => a.trim().toLowerCase() === assignee.toLowerCase())
      )

    // Estimate filtering -- "at least" the entered span (deadline - start),
    // e.g. "30 days" matches projects running 30 days or longer.
    const matchesEstimate =
      !filters.estimate ||
      estimateDays === null ||
      (() => {
        const spanDays = projectSpanDays(project);
        return spanDays !== null && spanDays >= estimateDays;
      })()

    // Priority filtering
    const matchesPriority =
      !filters.priority ||
      project.priority?.level === filters.priority

    return (
      matchesDate &&
      matchesTaskGroups &&
      matchesAssignedBy &&
      matchesAssignee &&
      matchesEstimate &&
      matchesPriority
    )
  })
})

const searchQuery = ref("")
const searchedProjects = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return filteredProjects.value
  return filteredProjects.value.filter((project) =>
    [project.title, project.id, project.description].some((field) =>
      field?.toLowerCase().includes(query)
    )
  )
})

// 📄 Pagination
const currentPage = ref(1)
const itemPerPage = ref(5)
const onSearch = (value: string) => {
  searchQuery.value = value
  currentPage.value = 1
}

const totalPage = computed(() =>
  Math.ceil(searchedProjects.value.length / itemPerPage.value)
)

const paginatedProjects = computed(() => {
  const start = (currentPage.value - 1) * itemPerPage.value
  const end = start + itemPerPage.value
  return searchedProjects.value.slice(start, end)
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPage.value) {
    currentPage.value = page
  }
}

const goToNext = () => {
  if (currentPage.value < totalPage.value) {
    currentPage.value++
  }
}

const goToPrevious = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const totalProjects = computed(() => projectsStore.projects.length);
watch(()=>paginatedProjects.value,()=>{
  selectedProject.value = paginatedProjects.value[0]
})

</script>
<template>
  <filterModal
    v-if="isOpen"
    :intialFilters="selectedFilters"
    @apply="ApplyFilter"
  />
  <!--header +  project aside + projects Task -->
  <div class="w-full flex-col px-4 py-3">
    <!-- <p>{{ selectedFilters }}</p> -->
    <div class="mb-6">
      <!-- to header -->
      <Header @update:search="onSearch" />
      <!-- lower header -->
      <!-- Page Title -->
      <div
        class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
      >
        <div>
          <h1 class="text-2xl font-bold">Projects</h1>
        </div>
        <div class="flex items-center gap-2 px-2 py-2">
          <Button
            variant="outline"
            class="rounded-xl"
            @click="isAddProjectOpen = true"
          >
            <Plus class="w-4 h-4" /> Add Project
          </Button>
          <Button
            class="bg-primary hover:bg-blue-100 active:text-blue-500 active:bg-blue-100 text-white hover:bg-primary/90 rounded-xl"
            :disabled="!selectedProject"
            @click="isAddTaskOpen = true"
          >
            <Plus class="w-4 h-4" /> Add Task
          </Button>
        </div>
      </div>
    </div>

    <!--project aside + projects Task -->
    <div class="w-full flex flex-col lg:flex-row gap-6">
      <!-- aside -->
      <div
        class="w-full lg:w-1/4 rounded-2xl bg-white border border-gray-200 shadow-lg flex flex-col justify-between"
      >
      <div>
        <div class="h-[80px] border-b border-gray-200 px-4 py-3 flex justify-between items-center">
          <Select v-model="projectType">
            <SelectTrigger
              class="!border-none !ring-0 !focus:ring-0 !focus:border-none !outline-none !shadow-none font-semibold"
            >
            <SelectValue placeholder="Select a Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel class="!border-none">project type</SelectLabel>
                <SelectItem value="Active"> Active Projects </SelectItem>
                <SelectItem value="In Active"> In Active Projects</SelectItem>
                <SelectItem value="Done"> Completed Projects </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          
        </div>

            <!-- projects list -->
            <div class="space-y-2 pl-3 py-2">
              <template v-if="showDetial">
                <div class="w-64 px-4 py-6 bg-white">
                  <div class="flex items-center justify-between">
                    <span
                      class="flex justify-start cursor-pointer items-center"
                      @click="goBack"
                    >
                      <MoveLeft class="text-primary w-4" />
                      <Button as="a" variant="link" class="text-xs"> Back </Button>
                    </span>
                    <button
                      type="button"
                      class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border hover:border-primary/40"
                      :class="isEditingProject ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-400'"
                      :title="isEditingProject ? 'Done editing' : 'Edit title & description'"
                      @click="toggleEditProject"
                    >
                      <Check v-if="isEditingProject" class="h-3.5 w-3.5" />
                      <Pencil v-else class="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <!-- Cover image -->
                  <div class="mt-3">
                    <div class="flex h-28 w-full items-center justify-center overflow-hidden rounded-xl bg-page">
                      <ProjectImage
                        v-if="selectedProject?.image"
                        :image="selectedProject.image"
                        :alt="selectedProject.title"
                      >
                        <template #fallback>
                          <span class="text-3xl">{{ selectedProject?.icon }}</span>
                        </template>
                      </ProjectImage>
                      <span v-else class="text-3xl">{{ selectedProject?.icon }}</span>
                    </div>
                    <div v-if="isEditingProject" class="mt-2 space-y-1.5">
                      <div class="flex rounded-lg bg-page p-0.5 text-[11px]">
                        <button
                          type="button"
                          class="flex-1 rounded-md py-1 font-medium transition"
                          :class="coverMode === 'link' ? 'bg-white shadow-sm text-ink' : 'text-subtle'"
                          @click="coverMode = 'link'"
                        >
                          Link
                        </button>
                        <button
                          type="button"
                          class="flex-1 rounded-md py-1 font-medium transition"
                          :class="coverMode === 'upload' ? 'bg-white shadow-sm text-ink' : 'text-subtle'"
                          @click="coverMode = 'upload'"
                        >
                          Upload
                        </button>
                      </div>
                      <div v-if="coverMode === 'link'" class="flex gap-1">
                        <input
                          v-model="coverUrl"
                          type="url"
                          placeholder="https://example.com/cover.jpg"
                          class="w-full min-w-0 rounded-lg border border-gray-200 px-2 py-1 text-xs focus:border-primary focus:outline-none"
                        />
                        <button
                          type="button"
                          class="shrink-0 rounded-lg bg-primary px-2 text-xs font-medium text-white disabled:opacity-50"
                          :disabled="savingCover || !coverUrl.trim()"
                          @click="onCoverLinkSave"
                        >
                          Set
                        </button>
                      </div>
                      <input
                        v-else
                        ref="coverFileInput"
                        type="file"
                        accept="image/png,image/jpeg,image/gif,image/webp"
                        class="block w-full text-[11px] text-subtle file:mr-1.5 file:rounded-md file:border-0 file:bg-primary/10 file:px-1.5 file:py-0.5 file:text-[11px] file:font-medium file:text-primary"
                        :disabled="savingCover"
                        @change="onCoverFileChange"
                      />
                      <button
                        v-if="selectedProject?.image"
                        type="button"
                        class="text-[11px] font-medium text-red-500 hover:underline disabled:opacity-50"
                        :disabled="savingCover"
                        @click="onCoverRemove"
                      >
                        Remove image
                      </button>
                    </div>
                  </div>

                  <!-- Title -->
                  <div class="mt-3">
                    <div class="text-sm text-gray-400">Title</div>
                    <input
                      v-if="isEditingProject && selectedProject"
                      v-model="selectedProject.title"
                      class="mt-1 w-full rounded-lg border border-gray-200 px-2 py-1 text-sm font-semibold text-gray-800 focus:border-primary focus:outline-none"
                    />
                    <p v-else class="font-semibold text-gray-800 line-clamp-2 break-words" :title="selectedProject?.title">{{ selectedProject?.title }}</p>
                  </div>

                  <!-- Project Number -->
                  <div class="mt-4 text-sm text-gray-400">Project Number</div>
                  <div class="flex items-center justify-between">
                    <span class="font-semibold text-gray-800" :title="selectedProject?.id">{{
                      shortProjectId(selectedProject?.id)
                    }}</span>
                  </div>

                  <!-- Description -->
                  <div class="mt-4">
                    <div class="font-semibold text-gray-700 mb-1">Description</div>
                    <textarea
                      v-if="isEditingProject && selectedProject"
                      v-model="selectedProject.description"
                      rows="4"
                      class="w-full resize-y rounded-lg border border-gray-200 px-2 py-1 text-sm text-gray-700 focus:border-primary focus:outline-none"
                    />
                    <p v-else class="text-sm text-gray-500 break-words">
                      {{ descriptionPreview }}
                      <button
                        v-if="descriptionIsLong"
                        type="button"
                        class="text-primary font-medium hover:underline"
                        @click="showFullDescription = !showFullDescription"
                      >
                        {{ showFullDescription ? " See less" : " See more…" }}
                      </button>
                    </p>
                  </div>

                  <!-- Reporter -->
                  <div class="mt-4">
                    <div class="text-sm text-gray-400">Created By</div>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-sm text-gray-700">{{
                        selectedProject?.assignedBy
                      }}</span>
                    </div>
                  </div>

                  <!-- Owner (current, transferable -- distinct from the immutable Created By above) -->
                  <div class="mt-4">
                    <div class="text-sm text-gray-400">Owner</div>
                    <Select v-model="ownerValue" :disabled="transferringOwner">
                      <SelectTrigger class="mt-1 rounded-xl">
                        <SelectValue placeholder="Unowned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem v-for="person in employeeStore.employees" :key="person.id" :value="person.id">
                            {{ person.name }}
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <!-- Assignees -->
                  <div class="mt-4">
                    <div class="text-sm text-gray-400">Assignees</div>
                    <template v-if="isEditingProject">
                      <div v-if="editAssignees.length" class="mt-1 flex flex-wrap gap-1.5">
                        <span
                          v-for="person in editAssignees"
                          :key="person.id"
                          class="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                        >
                          {{ person.name }}
                          <button type="button" class="text-primary/60 hover:text-primary" @click="removeAssignee(person.id)">&times;</button>
                        </span>
                      </div>
                      <div class="relative mt-1.5">
                        <input
                          v-model="assigneeInput"
                          placeholder="Type @ to mention a teammate"
                          class="w-full rounded-lg border border-gray-200 px-2 py-1 text-xs focus:border-primary focus:outline-none"
                          @input="onAssigneeInput"
                          @blur="onAssigneeInputBlur"
                        />
                        <div
                          v-if="showMentions && mentionMatches.length"
                          class="absolute z-10 mt-1 w-full rounded-lg border border-gray-100 bg-white p-1 shadow-lg"
                        >
                          <button
                            v-for="person in mentionMatches"
                            :key="person.id"
                            type="button"
                            class="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1 text-left text-xs hover:bg-page"
                            @click="pickAssignee(person)"
                          >
                            <span>{{ person.name }}</span>
                            <span class="text-subtle">{{ person.roleLabel }}</span>
                          </button>
                        </div>
                      </div>
                    </template>
                    <div v-else-if="selectedProject?.assignee.length" class="mt-1 flex flex-wrap gap-1.5">
                      <span
                        v-for="name in selectedProject.assignee"
                        :key="name"
                        class="rounded-full bg-page px-2 py-0.5 text-xs font-medium text-gray-700"
                      >
                        {{ name }}
                      </span>
                    </div>
                    <p v-else class="mt-1 text-sm text-gray-400 italic">No one assigned yet</p>
                  </div>

                  <!-- Visibility -->
                  <div class="mt-4">
                    <div class="text-sm text-gray-400">Visibility</div>
                    <div class="text-sm font-medium text-gray-700 mt-1 capitalize">
                      {{ selectedProject?.visibility ?? "company" }}
                    </div>
                  </div>

                  <!-- Priority -->
                  <div class="mt-4">
                    <div class="text-sm text-gray-400">Priority</div>
                    <div class="flex items-center gap-1 text-yellow-500 mt-1">
                      <Component
                        :is="getIcon(selectedProject?.priority.level)"
                        :class="getPriorityColor(selectedProject?.priority.level)"
                      />
                      <span
                        class="text-sm font-medium"
                        :class="getPriorityColor(selectedProject?.priority.level)"
                        >{{ selectedProject?.priority.level }}</span
                      >
                    </div>
                  </div>

                  <!-- Deadline -->
                  <div class="mt-4">
                    <div class="text-sm text-gray-400">Dead Line</div>
                    <div class="text-sm font-semibold text-gray-700 mt-1">
                      {{ projectDeadline(selectedProject) }}
                    </div>
                  </div>

                  <!-- Created -->
                  <div class="mt-4 flex items-center gap-2 text-sm text-gray-400">
                    <Calendar class="w-4 h-4" />
                    <span>{{ formatShortDate(selectedProject?.createdAt) }}</span>
                  </div>

                  <!-- Action Icons -->
                  <div class="mt-6 flex gap-2">
                    <button
                      type="button"
                      class="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-50"
                      title="Archive project"
                      :disabled="archiving"
                      @click="isDeleteProjectDialogOpen = true"
                    >
                      <Trash2 class="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </template>

              <template v-else>
                <p v-if="!paginatedProjects.length && searchQuery" class="px-4 py-6 text-center text-sm text-subtle">
                  No projects match "{{ searchQuery }}"
                </p>
                <p v-else-if="!paginatedProjects.length" class="px-4 py-6 text-center text-sm text-subtle">
                  No projects to show.
                </p>
                <div v-else class="max-h-[500px]">
                  <div
                    class="h-[90px] text-sm flex justify-between lg:text-md cursor-pointer gap-1"
                    v-for="(project, index) in paginatedProjects"
                    :key="project.id"
                    @click="
                      () => {
                        onClick(project);
                      }
                    "
                  >
                    <!--smaller project card -->
                    <div
                      class="w-[95%] h-full px-3 py-3  rounded-l-xl"
                      :class="setActive(project.id)"
                    >
                      <!-- <SmallProjectCard :fields="{id:project.id,title:project.title}"  @view-detail="onViewDetail"/> -->
                      <div class="flex h-full w-full items-center gap-2 overflow-hidden rounded-xl px-4 py-2">
                        <div class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-page">
                          <ProjectImage v-if="project.image" :image="project.image" :alt="project.title">
                            <template #fallback>
                              <span class="text-base">{{ project.icon }}</span>
                            </template>
                          </ProjectImage>
                          <span v-else class="text-base">{{ project.icon }}</span>
                        </div>
                        <div class="min-w-0">
                          <p class="text-xs text-gray-500" :title="project.id">{{ shortProjectId(project.id) }}</p>
                          <p class="font-medium truncate" :title="project.title">{{ project.title }}</p>
                          <div class="cursor-pointer flex items-center">
                            <Button
                              variant="link"
                              as="a"
                              class="text-primary px-0 py-0 h-auto"
                              @click="onViewDetail(project)"
                            >
                              View details
                            </Button>
                            <ChevronRight class="w-4 h-4 text-primary" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="rounded-xl" :class="activeBorder(project.id)"></div>
                  </div>
                </div>
              </template>
            </div>
       </div>

            <div v-if="!showDetial" class="w-full flex justify-center items-center gap-2">
              <Button variant="link" @click="goToPrevious" :disabled="currentPage === 1">
                <ArrowLeft />
              </Button>
              <div v-for="(item, index) in totalPage" :key="index" >
                <div class="w-2 h-2 border rounded-full" :class="currentPage===index+1?'bg-black':''"></div>
              </div>
              <Button variant="link" @click="goToNext" :disabled="currentPage === totalPage" class="">
                <ArrowRight />
              </Button>
              </div>
            </div>
      <!--current project task list and Task header -->
      <div class="w-full lg:w-3/4">
        <!-- Task detail + task info (replaces the tasks view when a task is selected) -->
        <template v-if="selectedTask && selectedProject">
          <div class="flex flex-col gap-6 xl:flex-row xl:items-start">
            <TaskDetailPanel
              class="flex-1"
              :task="selectedTask"
              @close="closeTaskDetail"
            />
            <TaskInfoSidebar :project="selectedProject" :task="selectedTask" />
          </div>
        </template>

        <!-- Tasks views (list / board / timeline) -->
        <template v-else>
          <!-- header -->
          <div class="flex flex-col gap-3 mb-6">
            <!-- upper header -->
            <div class="flex justify-between items-center px-4">
              <p class="font-medium">Tasks</p>
              <div class="flex gap-4 justify-between items-center">
                <div class="flex gap-2" v-for="(style, index) in TaskListStyle">
                  <div
                    class="flex justify-center items-center bg-white rounded-lg w-8 h-8 hover:border-primary border"
                    @click="active(index)"
                    :class="setActiveForIcons(style.style)"
                  >
                    <Button variant="ghost" size="icon" class="w-8 h-8">
                      <Component
                        :is="style.icon"
                        class="w-4 h-4 hover:text-primary hover:stroke-primary active:text-primary active:stroke-primary"
                      />
                    </Button>
                  </div>
                </div>
              </div>
              <div
                class="flex justify-center items-center bg-white rounded-lg w-7 h-7"
                @click="onOpen"
              >
                <Button variant="ghost" size="icon" class="w-8 h-8">
                  <Funnel class="w-4 h-4" />
                </Button>
              </div>
            </div>

            <!-- lower header (list view only) -->
            <div
              v-if="selectedTaskStyle === 'list' && (selectedProject?.task.tasks?.length ?? 0) > 0"
              class="flex flex-col items-center justify-center w-full h-10 rounded-xl bg-page"
            >
              <h3 class="font-medium">Active Tasks</h3>
            </div>
          </div>

          <p v-if="tasksLoading" class="px-4 py-10 text-center text-sm text-subtle">Loading tasks…</p>

          <EmptyTasksState
            v-else-if="!selectedProject?.task.tasks?.length"
            @add-task="isAddTaskOpen = true"
          />

          <template v-else-if="selectedTaskStyle === 'list'">
            <!-- tasks list -->
            <div class="space-y-3 mb-6 px-8">
              <TaskCard
                v-for="task in selectedProject?.task.tasks?.filter((task)=>task.status !== 'To Do')"
                :key="task.id"
                :Task="task"
              />
            </div>

            <div v-if="BacklogTasks?.length"
              class="flex flex-col items-center justify-center w-full h-10 rounded-xl bg-page mb-3"
            >
              <h3 class="font-medium">Backlog</h3>
            </div>

            <!-- backlog tasks -->
            <div class="space-y-3 px-8 rounded-3xl">
              <TaskCard
                v-for="task in BacklogTasks"
                :key="task.id"
                :Task="task"
              />
            </div>
          </template>

          <template v-else-if="selectedTaskStyle === 'Kanban' && selectedProject">
            <div v-if="showOnlyAiGeneratedTasks" class="mb-3 flex items-center justify-between rounded-xl bg-primary/10 px-3 py-2 text-xs">
              <span class="flex items-center gap-1.5 font-medium text-primary"><Sparkles class="h-3.5 w-3.5" /> Showing AI-generated tasks only</span>
              <button type="button" class="font-medium text-primary underline" @click="showOnlyAiGeneratedTasks = false">Clear filter</button>
            </div>
            <TaskBoardView :tasks="boardTasks" @select="onSelectTask" />
          </template>

          <TaskTimelineView
            v-else-if="selectedTaskStyle === 'ChartNoAxesGantt'"
            :tasks="selectedProject?.task.tasks || []"
            :company-created-at="authStore.logedInUserInfo.company_created_at"
            @select="onSelectTask"
          />
        </template>
      </div>
    </div>
  </div>

  <AddTaskModal
    v-if="selectedProject"
    v-model:open="isAddTaskOpen"
    :project-id="selectedProject.id"
  />
  <CreateProjectModal v-model:open="isAddProjectOpen" />
  <ConfirmDeleteDialog
    v-model:open="isDeleteProjectDialogOpen"
    title="Delete this project?"
    :description="`This permanently deletes “${selectedProject?.title}” and all of its tasks. This can't be undone.`"
    :loading="archiving"
    @confirm="archiveCurrentProject"
  />
</template>
