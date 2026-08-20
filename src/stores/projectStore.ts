// stores/projectStore.ts
import { defineStore } from "pinia";
import type { ApiResponse, Project, ProjectVisibility, TaskType } from "@/types/types";
import { computeProgressFromHours } from "@/lib/duration";
import axiosInstance from "@/plugins/axios";
import { useEmployeeStore } from "@/stores/employeeStore";

type ProjectImageApi = { kind: "upload" | "link"; url: string } | null;

type ProjectApi = {
  id: string;
  title: string;
  description: string;
  company_id: string;
  department_id: string | null;
  team_id: string | null;
  visibility: ProjectVisibility;
  status: "Active" | "Inactive" | "Done";
  priority: "low" | "medium" | "high";
  start_date: string;
  deadline: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  total_tasks: number;
  active_tasks: number;
  completion_percent: number;
  collaborator_ids: string[];
  image: ProjectImageApi;
};

const STATUS_FROM_API: Record<ProjectApi["status"], Project["status"]> = {
  Active: "Active",
  Inactive: "In Active",
  Done: "Done",
};
const STATUS_TO_API: Record<Project["status"], ProjectApi["status"]> = {
  Active: "Active",
  "In Active": "Inactive",
  Done: "Done",
};
const PRIORITY_ICON: Record<ProjectApi["priority"], "ArrowUp" | "ArrowDown"> = {
  high: "ArrowUp",
  medium: "ArrowUp",
  low: "ArrowDown",
};
const PRIORITY_COLOR: Record<ProjectApi["priority"], string> = {
  high: "red",
  medium: "orange",
  low: "green",
};

function mapProject(api: ProjectApi): Project {
  const employeeStore = useEmployeeStore();
  const creator = employeeStore.employees.find((e) => e.id === api.created_by);
  const collaboratorNames = api.collaborator_ids
    .map((id) => employeeStore.employees.find((e) => e.id === id)?.name)
    .filter((name): name is string => !!name);
  return {
    id: api.id,
    title: api.title,
    icon: "📁",
    createdAt: api.created_at,
    status: STATUS_FROM_API[api.status] ?? "Active",
    priority: {
      level: api.priority,
      icon: PRIORITY_ICON[api.priority] ?? "ArrowUp",
      color: PRIORITY_COLOR[api.priority] ?? "orange",
    },
    task: { tasks: null, total: api.total_tasks, active: api.active_tasks },
    assignee: collaboratorNames,
    assigneeIds: api.collaborator_ids,
    assignedBy: creator?.name ?? "Unknown",
    description: api.description,
    deadline: api.deadline,
    departmentId: api.department_id,
    visibility: api.visibility,
    startDate: api.start_date,
    createdById: api.created_by,
    image: api.image,
  };
}

export interface CreateProjectInput {
  title: string;
  description: string;
  departmentId: string | null;
  visibility: ProjectVisibility;
  priority: "low" | "medium" | "high";
  startDate: string | null;
  deadline: string | null;
  collaboratorIds: string[];
}

export interface UpdateProjectInput {
  title?: string;
  description?: string;
  departmentId?: string | null;
  visibility?: ProjectVisibility;
  priority?: "low" | "medium" | "high";
  status?: Project["status"];
  startDate?: string | null;
  deadline?: string | null;
  collaboratorIds?: string[];
}

type TaskApi = {
  id: string;
  project_id: string;
  department_id: string | null;
  task_type_id: string | null;
  created_by: string | null;
  assigned_to: string | null;
  title: string;
  description: string;
  status: TaskType["status"];
  priority: TaskType["priority"];
  source: TaskType["source"];
  deadline: string;
  estimated_time_hours: number | null;
  spent_time_hours: number | null;
  created_at: string;
  updated_at: string;
};

function mapTask(api: TaskApi): TaskType {
  const employeeStore = useEmployeeStore();
  const assignee = employeeStore.employees.find((e) => e.id === api.assigned_to);
  return {
    id: api.id,
    projectId: api.project_id,
    title: api.title,
    description: api.description,
    status: api.status,
    priority: api.priority,
    source: api.source,
    createdById: api.created_by,
    assignedToId: api.assigned_to,
    assigneeName: assignee?.name ?? null,
    departmentId: api.department_id,
    taskTypeId: api.task_type_id,
    deadline: api.deadline,
    estimatedTimeHours: api.estimated_time_hours,
    spentTimeHours: api.spent_time_hours,
    progress: computeProgressFromHours(api.spent_time_hours, api.estimated_time_hours),
    createdAt: api.created_at,
    updatedAt: api.updated_at,
  };
}

export interface CreateTaskInput {
  title: string;
  description: string;
  departmentId: string | null;
  taskTypeId: string | null;
  assignedToId: string | null;
  priority: TaskType["priority"];
  deadline: string | null;
  estimatedTimeHours: number | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  departmentId?: string | null;
  taskTypeId?: string | null;
  priority?: TaskType["priority"];
  deadline?: string | null;
  estimatedTimeHours?: number | null;
}

export const useProjectStore = defineStore("projectStore", {
  state: () => ({
    projects: [] as Project[],
    loading: false,
    selectedProject: null as Project | null,
    showDetial: false as boolean,
    selectedTask: null as TaskType | null,
  }),
  getters: {
    getSelectedState(state) {
      return state.projects[0];
    },
  },
  actions: {
    async fetchProjects() {
      this.loading = true;
      try {
        const { data } = await axiosInstance.get<ApiResponse<{ results: ProjectApi[] }>>("/projects/");
        this.projects = data.data.results.map(mapProject);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        this.loading = false;
      }
    },

    async createProject(input: CreateProjectInput): Promise<{ project?: Project; errors?: Record<string, string[]> }> {
      try {
        const { data } = await axiosInstance.post<ApiResponse<{ project: ProjectApi }>>("/projects/", {
          title: input.title,
          description: input.description,
          department_id: input.departmentId,
          visibility: input.visibility,
          priority: input.priority,
          start_date: input.startDate,
          deadline: input.deadline,
          collaborator_ids: input.collaboratorIds,
        });
        const project = mapProject(data.data.project);
        this.projects.unshift(project);
        return { project };
      } catch (error: any) {
        return { errors: error.response?.data?.errors || { title: [error.response?.data?.message || "Failed to create project"] } };
      }
    },

    async updateProject(projectId: string, patch: UpdateProjectInput): Promise<{ project?: Project; error?: string }> {
      const body: Record<string, unknown> = {};
      if (patch.title !== undefined) body.title = patch.title;
      if (patch.description !== undefined) body.description = patch.description;
      if (patch.departmentId !== undefined) body.department_id = patch.departmentId;
      if (patch.visibility !== undefined) body.visibility = patch.visibility;
      if (patch.priority !== undefined) body.priority = patch.priority;
      if (patch.status !== undefined) body.status = STATUS_TO_API[patch.status];
      if (patch.startDate !== undefined) body.start_date = patch.startDate;
      if (patch.deadline !== undefined) body.deadline = patch.deadline;
      if (patch.collaboratorIds !== undefined) body.collaborator_ids = patch.collaboratorIds;

      try {
        const { data } = await axiosInstance.patch<ApiResponse<{ project: ProjectApi }>>(`/projects/${projectId}/`, body);
        const updated = mapProject(data.data.project);
        const index = this.projects.findIndex((p) => p.id === projectId);
        if (index !== -1) this.projects[index] = updated;
        if (this.selectedProject?.id === projectId) this.selectedProject = updated;
        return { project: updated };
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to update project" };
      }
    },

    async archiveProject(projectId: string): Promise<boolean> {
      try {
        await axiosInstance.delete(`/projects/${projectId}/`);
        this.projects = this.projects.filter((p) => p.id !== projectId);
        if (this.selectedProject?.id === projectId) this.selectedProject = null;
        return true;
      } catch {
        return false;
      }
    },

    _applyUpdatedProject(updated: Project) {
      const index = this.projects.findIndex((p) => p.id === updated.id);
      if (index !== -1) this.projects[index] = updated;
      if (this.selectedProject?.id === updated.id) this.selectedProject = updated;
    },

    async setProjectImageLink(projectId: string, imageUrl: string): Promise<{ error?: string }> {
      try {
        const { data } = await axiosInstance.put<ApiResponse<{ project: ProjectApi }>>(
          `/projects/${projectId}/image/`,
          { image_url: imageUrl }
        );
        this._applyUpdatedProject(mapProject(data.data.project));
        return {};
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to set the project image link" };
      }
    },

    async uploadProjectImage(projectId: string, file: File): Promise<{ error?: string }> {
      try {
        const form = new FormData();
        form.append("image", file);
        const { data } = await axiosInstance.post<ApiResponse<{ project: ProjectApi }>>(
          `/projects/${projectId}/image/`,
          form
        );
        this._applyUpdatedProject(mapProject(data.data.project));
        return {};
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to upload the project image" };
      }
    },

    async removeProjectImage(projectId: string): Promise<{ error?: string }> {
      try {
        await axiosInstance.delete(`/projects/${projectId}/image/`);
        const project = this.projects.find((p) => p.id === projectId);
        if (project) project.image = null;
        if (this.selectedProject?.id === projectId) this.selectedProject.image = null;
        return {};
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to remove the project image" };
      }
    },

    selectTask(task: TaskType | null) {
      this.selectedTask = task;
    },

    findProject(projectId: string) {
      return this.projects.find((project) => project.id === projectId) ?? null;
    },

    findTask(taskId: string): TaskType | null {
      for (const project of this.projects) {
        const task = project.task.tasks?.find((t) => t.id === taskId);
        if (task) return task;
      }
      return null;
    },

    _syncTaskCounts(project: Project) {
      const tasks = project.task.tasks || [];
      project.task.total = tasks.length;
      project.task.active = tasks.filter((t) => t.status !== "Done").length;
    },

    _applyUpdatedTask(updated: TaskType) {
      const project = this.findProject(updated.projectId);
      const task = project?.task.tasks?.find((t) => t.id === updated.id);
      if (project && task) {
        Object.assign(task, updated);
        this._syncTaskCounts(project);
      }
      if (this.selectedTask?.id === updated.id) this.selectedTask = updated;
    },

    async fetchTasks(projectId: string) {
      try {
        const { data } = await axiosInstance.get<ApiResponse<{ results: TaskApi[] }>>(
          `/projects/${projectId}/tasks/`,
          { params: { page_size: 100 } }
        );
        const project = this.findProject(projectId);
        if (project) {
          project.task.tasks = data.data.results.map(mapTask);
          this._syncTaskCounts(project);
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      }
    },

    async createTask(
      projectId: string,
      input: CreateTaskInput
    ): Promise<{ task?: TaskType; errors?: Record<string, string[]> }> {
      try {
        const { data } = await axiosInstance.post<ApiResponse<{ task: TaskApi }>>(`/projects/${projectId}/tasks/`, {
          title: input.title,
          description: input.description,
          department_id: input.departmentId,
          task_type_id: input.taskTypeId,
          assigned_to_id: input.assignedToId,
          priority: input.priority,
          deadline: input.deadline,
          estimated_time_hours: input.estimatedTimeHours,
        });
        const task = mapTask(data.data.task);
        const project = this.findProject(projectId);
        if (project) {
          if (!project.task.tasks) project.task.tasks = [];
          project.task.tasks.push(task);
          this._syncTaskCounts(project);
        }
        return { task };
      } catch (error: any) {
        return {
          errors: error.response?.data?.errors || { title: [error.response?.data?.message || "Failed to create task"] },
        };
      }
    },

    async updateTask(taskId: string, patch: UpdateTaskInput): Promise<{ task?: TaskType; error?: string }> {
      const body: Record<string, unknown> = {};
      if (patch.title !== undefined) body.title = patch.title;
      if (patch.description !== undefined) body.description = patch.description;
      if (patch.departmentId !== undefined) body.department_id = patch.departmentId;
      if (patch.taskTypeId !== undefined) body.task_type_id = patch.taskTypeId;
      if (patch.priority !== undefined) body.priority = patch.priority;
      if (patch.deadline !== undefined) body.deadline = patch.deadline;
      if (patch.estimatedTimeHours !== undefined) body.estimated_time_hours = patch.estimatedTimeHours;

      try {
        const { data } = await axiosInstance.patch<ApiResponse<{ task: TaskApi }>>(`/tasks/${taskId}/`, body);
        const task = mapTask(data.data.task);
        this._applyUpdatedTask(task);
        return { task };
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to update task" };
      }
    },

    async updateTaskStatus(taskId: string, status: TaskType["status"]): Promise<{ error?: string }> {
      try {
        const { data } = await axiosInstance.patch<ApiResponse<{ task: TaskApi }>>(`/tasks/${taskId}/status/`, {
          status,
        });
        this._applyUpdatedTask(mapTask(data.data.task));
        return {};
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to update task status" };
      }
    },

    async assignTask(taskId: string, assignedToId: string | null): Promise<{ error?: string }> {
      try {
        const { data } = await axiosInstance.post<ApiResponse<{ task: TaskApi }>>(`/tasks/${taskId}/assign/`, {
          assigned_to_id: assignedToId,
        });
        this._applyUpdatedTask(mapTask(data.data.task));
        return {};
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to assign task" };
      }
    },

    async archiveTask(taskId: string): Promise<boolean> {
      try {
        await axiosInstance.delete(`/tasks/${taskId}/`);
        for (const project of this.projects) {
          if (project.task.tasks?.some((t) => t.id === taskId)) {
            project.task.tasks = project.task.tasks.filter((t) => t.id !== taskId);
            this._syncTaskCounts(project);
            break;
          }
        }
        if (this.selectedTask?.id === taskId) this.selectedTask = null;
        return true;
      } catch {
        return false;
      }
    },

    // addedHours: parsed from the free-text "time spent" input by the caller
    // (lib/duration.ts's parseDurationToMinutes) -- the backend field itself
    // is a plain hours float.
    async logTime(taskId: string, addedHours: number): Promise<{ error?: string }> {
      const task = this.findTask(taskId);
      if (!task) return { error: "Task not found" };
      try {
        const newTotal = (task.spentTimeHours || 0) + addedHours;
        const { data } = await axiosInstance.patch<ApiResponse<{ task: TaskApi }>>(`/tasks/${taskId}/`, {
          spent_time_hours: newTotal,
        });
        this._applyUpdatedTask(mapTask(data.data.task));
        return {};
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to log time" };
      }
    },
  },
});
