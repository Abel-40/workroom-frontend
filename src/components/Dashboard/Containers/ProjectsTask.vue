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
  Edit3,
  Link2,
  MoveLeft,
  ArrowDown,ArrowLeft,ArrowRight
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import TaskCard from "@/components/Dashboard/Cards/TaskCard.vue";
import Header from "@/components/Dashboard/Containers/SubConatiners/Header.vue";
import { useProjectStore } from "@/stores/projectStore";
import type { Project } from "@/types/types";
import { ref, onMounted, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRouter, useRoute } from "vue-router";
import filterModal from "./filterModal.vue";
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
const projectsStore = useProjectStore();
const { selectedProject } = storeToRefs(projectsStore);
// const selectedProject = ref(projectsStore.getSelectedState)
const onClick = (project: Project) => {
  selectedProject.value = project;
};
// first selected project value
onMounted(()=>{
  selectedProject.value = paginatedProjects.value[0]
})
// Update whenever a new project is added
watch(
  () => projectsStore.projects.length,
  () => {
    if (projectsStore.projects.length > 0) {
      selectedProject.value = [...projectsStore.projects].reverse()[0];
    }
  }
);


const projectType = ref<'Active'|'In Active'|'Done'>('Active')
const onViewDetail = (project: Project) => {
  selectedProject.value = project;
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
    end: Date;
  };
  taskGroups?: string[]; // e.g. ["Design", "Development"]
  assignedBy?: string[]; // e.g. ["Abel", "Danel"]
  assignees?: string[]; // modelValue
  estimate?: string; // duration as string
  priority?: "low" | "medium" | "high" | null;
}
const today = new Date();
const selectedFilters = ref<FilterOption>({
  period: {
    start: null,
    end: today,
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
// const projectsOtherThanTodo = computed(()=>{
//   return projectsStore.projects.filter((project)=>{
//     return project.task.status !== 'todo'
//   })
// })
console.log(projects.value)
const BacklogTasks = computed(()=>{
  return selectedProject.value?.task.tasks?.filter((task)=>{
    return task.status === 'To Do'
  })
})
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

  return projects.value.filter((project) => {
    const projectDate = new Date(project.createdAt)
    const period = filters.period

    // Date filtering
    const matchesDate = !period || (
      (!period.start || projectDate >= period.start) &&
      (!period.end || projectDate <= period.end)
    )

    // Task Groups filtering - assuming this filters project's tasks
    const matchesTaskGroups =
      !filters.taskGroups ||
      filters.taskGroups.length === 0 ||
      (project.task?.tasks &&
        project.task.tasks.some((task) =>
          filters.taskGroups!.includes(task.name)
        ))

    // Assigned By filtering
    const matchesAssignedBy =
      !filters.assignedBy ||
      filters.assignedBy.length === 0 ||
      filters.assignedBy.includes(project.assignedBy)

    // Assignees filtering
  // In your filteredProjects computed property:
    const matchesAssignee = !filters.assignees || filters.assignees.length === 0 ||  project.assignee.some(assignee => filters.assignees?.includes(assignee))

    // Estimate filtering
    const matchesEstimate =
      !filters.estimate ||
      (project.task?.tasks &&
        project.task.tasks.some(
          (task) => task.EstimatedTime === filters.estimate
        ))

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

// 📄 Pagination
const currentPage = ref(1)
const itemPerPage = ref(5)

const totalPage = computed(() =>
  Math.ceil(filteredProjects.value.length / itemPerPage.value)
)

const paginatedProjects = computed(() => {
  const start = (currentPage.value - 1) * itemPerPage.value
  const end = start + itemPerPage.value
  return filteredProjects.value.slice(start, end)
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
      <Header />
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
            class="bg-primary hover:bg-blue-100 active:text-blue-500 active:bg-blue-100 text-white hover:bg-primary/90 rounded-xl"
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
                  <span
                    class="w-full flex justify-start cursor-pointer items-center"
                    @click="goBack"
                  >
                    <MoveLeft class="text-primary w-4" />
                    <Button as="a" variant="link" class="text-xs"> Back </Button>
                  </span>
                  <!-- Project Number -->
                  <div class="text-sm text-gray-400">Project Number</div>
                  <div class="flex items-center justify-between">
                    <span class="font-semibold text-gray-800">{{
                      selectedProject?.id
                    }}</span>
                    <Pencil class="w-4 h-4 text-gray-400 cursor-pointer" />
                  </div>

                  <!-- Description -->
                  <div class="mt-4">
                    <div class="font-semibold text-gray-700 mb-1">Description</div>
                    <p class="text-sm text-gray-500">
                      {{ selectedProject?.description }}
                    </p>
                  </div>

                  <!-- Reporter -->
                  <div class="mt-4">
                    <div class="text-sm text-gray-400">Assigned By</div>
                    <div class="flex items-center gap-2 mt-1">
                      <img
                        src="https://i.pravatar.cc/24?img=1"
                        class="w-6 h-6 rounded-full"
                      />
                      <span class="text-sm text-gray-700">{{
                        selectedProject?.assignedBy
                      }}</span>
                    </div>
                  </div>

                  <!-- Assignees -->
                  <div class="mt-4">
                    <div class="text-sm text-gray-400">Assignees</div>
                    <div class="flex items-center mt-1 space-x-1">
                      <img
                        v-for="i in 4"
                        :key="i"
                        :src="`https://i.pravatar.cc/24?img=${i + 1}`"
                        class="w-6 h-6 rounded-full border"
                      />
                      <div
                        class="w-6 h-6 bg-blue-500 text-white text-xs flex items-center justify-center rounded-full"
                      >
                        +2
                      </div>
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
                      Feb 23, 2020
                    </div>
                  </div>

                  <!-- Created -->
                  <div class="mt-4 flex items-center gap-2 text-sm text-gray-400">
                    <Calendar class="w-4 h-4" />
                    <span>{{ selectedProject?.createdAt }}</span>
                  </div>

                  <!-- Action Icons -->
                  <div class="mt-6 flex gap-2">
                    <div
                      class="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center cursor-pointer"
                    >
                      <Edit3 class="w-4 h-4 text-purple-600" />
                    </div>
                    <div
                      class="w-9 h-9 bg-cyan-100 rounded-full flex items-center justify-center cursor-pointer"
                    >
                      <Link2 class="w-4 h-4 text-cyan-600" />
                    </div>
                  </div>
                </div>
              </template>

              <template v-else>
                <div class="max-h-[500px]">
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
                      <div class="w-full h-full px-4 py-2 rounded-xl">
                        <p class="text-xs text-gray-500">{{ project.id }}</p>
                        <p class="font-medium">{{ project.title }}</p>
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

          <!-- lower header -->
          <div
            class="flex flex-col items-center justify-center w-full h-10 rounded-xl bg-[#E6EDF5]"
          >
            <h3 class="font-medium">Active Tasks</h3>
          </div>
        </div>

        <!-- tasks list -->
        <div class="space-y-3 mb-6 px-8">
          <TaskCard v-for="task in selectedProject?.task.tasks?.filter((task)=>task.status !== 'To Do')" :Task="task" />
        </div>

        <div v-if="BacklogTasks?.length"
          class="flex flex-col items-center justify-center w-full h-10 rounded-xl bg-[#E6EDF5] mb-3"
        >
          <h3 class="font-medium">Backlog</h3>
        </div>

        <!-- backlog tasks -->
        <div class="space-y-3 px-8 rounded-3xl">
          <TaskCard v-for="task in BacklogTasks" :Task="task" />
        </div>
      </div>
    </div>
  </div>
</template>
