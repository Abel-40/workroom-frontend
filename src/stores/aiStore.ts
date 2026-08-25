import { defineStore } from "pinia";
import type { ApiResponse } from "@/types/types";
import axiosInstance from "@/plugins/axios";
import { createPollSignal, pollUntilTerminal, type PollSignal } from "@/lib/pollUntilTerminal";
import { useProjectStore, type TaskApi } from "@/stores/projectStore";

export type AiJobStatus = "pending" | "processing" | "completed" | "failed";

export interface AiGeneratedTask {
  id: string;
  temporaryId: string;
  sequence: number;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  estimatedEffort: string;
  dependencyTempIds: string[];
  suggestedDepartmentId: string | null;
  suggestedTaskTypeId: string | null;
  suggestedAssigneeId: string | null;
  assignedToId: string | null;
  reviewerComment: string;
  commentResolved: boolean;
  createdTaskId: string | null;
}

export interface AiGeneration {
  id: string;
  projectId: string;
  status: AiJobStatus;
  taskCount: number;
  maxTasks: number | null;
  requestedAssigneeIds: string[];
  requestedAt: string;
  completedAt: string | null;
  savedAt: string | null;
  errorMessage: string;
  prompt: string;
  generatedTasks: AiGeneratedTask[];
}

export type EligibleAssigneeRole = "Owner" | "CM" | "DL" | "DM";

export const ROLE_LABELS: Record<EligibleAssigneeRole, string> = {
  Owner: "Owner",
  CM: "Company Manager",
  DL: "Department Leader",
  DM: "Department Member",
};

export interface EligibleAssignee {
  id: string;
  name: string;
  email: string;
  role: EligibleAssigneeRole | null;
  roleLabel: string | null;
  department: string | null;
  // Open (not-Done, not-deleted) task count on the project being planned --
  // see api/routers/projects.py::list_eligible_assignees.
  openTaskCount: number;
}

export interface AiTaskRegeneration {
  id: string;
  taskId: string;
  status: AiJobStatus;
  errorMessage: string;
}

export interface AiAssistantQueryPage {
  id: string;
  title: string;
  folderName: string;
}

export interface AiAssistantQuery {
  id: string;
  projectId: string;
  question: string;
  referenceUrl: string | null;
  status: AiJobStatus;
  answer: string;
  refused: boolean;
  requestedAt: string;
  errorMessage: string;
  pages: AiAssistantQueryPage[];
}

export interface AiHealthSummary {
  id: string;
  projectId: string;
  status: AiJobStatus;
  summary: string;
  riskLevel: "low" | "medium" | "high" | "";
  requestedAt: string;
  errorMessage: string;
}

type GeneratedTaskApi = {
  id: string; temporary_id: string; sequence: number; title: string; description: string;
  priority: "low" | "medium" | "high"; estimated_effort: string; dependency_temp_ids: string[];
  suggested_department_id: string | null; suggested_task_type_id: string | null;
  suggested_assignee_id: string | null;
  assigned_to_id: string | null; reviewer_comment: string; comment_resolved: boolean;
  created_task_id: string | null;
};
type GenerationApi = {
  id: string; project_id: string; status: AiJobStatus; requested_at: string;
  completed_at: string | null; saved_at: string | null; task_count: number;
  max_tasks: number | null; requested_assignee_ids: string[]; error_message: string;
  prompt: string; generated_tasks?: GeneratedTaskApi[];
};
type EligibleAssigneeApi = {
  id: string; first_name: string; last_name: string; username: string; email: string;
  role: EligibleAssigneeRole | null; department: string | null; open_task_count: number;
};
type TaskRegenerationApi = { id: string; task_id: string; status: AiJobStatus; error_message: string; task: TaskApi | null };
type AssistantQueryPageApi = { id: string; title: string; folder_name: string };
type AssistantQueryApi = {
  id: string; project_id: string; question: string; reference_url: string | null; status: AiJobStatus;
  answer: string; refused: boolean; requested_at: string; error_message: string;
  pages: AssistantQueryPageApi[];
};
type HealthSummaryApi = {
  id: string; project_id: string; status: AiJobStatus; summary: string;
  risk_level: "low" | "medium" | "high" | ""; requested_at: string; error_message: string;
};

const mapGeneratedTask = (api: GeneratedTaskApi): AiGeneratedTask => ({
  id: api.id,
  temporaryId: api.temporary_id,
  sequence: api.sequence,
  title: api.title,
  description: api.description,
  priority: api.priority,
  estimatedEffort: api.estimated_effort,
  dependencyTempIds: api.dependency_temp_ids,
  suggestedDepartmentId: api.suggested_department_id,
  suggestedTaskTypeId: api.suggested_task_type_id,
  suggestedAssigneeId: api.suggested_assignee_id,
  assignedToId: api.assigned_to_id,
  reviewerComment: api.reviewer_comment,
  commentResolved: api.comment_resolved,
  createdTaskId: api.created_task_id,
});

const mapGeneration = (api: GenerationApi): AiGeneration => ({
  id: api.id,
  projectId: api.project_id,
  status: api.status,
  taskCount: api.task_count,
  maxTasks: api.max_tasks,
  requestedAssigneeIds: api.requested_assignee_ids,
  requestedAt: api.requested_at,
  completedAt: api.completed_at,
  savedAt: api.saved_at,
  errorMessage: api.error_message,
  prompt: api.prompt,
  generatedTasks: (api.generated_tasks ?? []).map(mapGeneratedTask).sort((a, b) => a.sequence - b.sequence),
});

const mapEligibleAssignee = (api: EligibleAssigneeApi): EligibleAssignee => ({
  id: api.id,
  name: `${api.first_name} ${api.last_name}`.trim() || api.username,
  email: api.email,
  role: api.role,
  roleLabel: api.role ? ROLE_LABELS[api.role] : null,
  department: api.department,
  openTaskCount: api.open_task_count,
});

const mapAssistantQuery = (api: AssistantQueryApi): AiAssistantQuery => ({
  id: api.id,
  projectId: api.project_id,
  question: api.question,
  referenceUrl: api.reference_url || null,
  status: api.status,
  answer: api.answer,
  refused: api.refused,
  requestedAt: api.requested_at,
  errorMessage: api.error_message,
  pages: (api.pages ?? []).map((p) => ({ id: p.id, title: p.title, folderName: p.folder_name })),
});

const mapHealthSummary = (api: HealthSummaryApi): AiHealthSummary => ({
  id: api.id,
  projectId: api.project_id,
  status: api.status,
  summary: api.summary,
  riskLevel: api.risk_level,
  requestedAt: api.requested_at,
  errorMessage: api.error_message,
});

function upsertById<T extends { id: string }>(list: T[], item: T): T[] {
  const index = list.findIndex((existing) => existing.id === item.id);
  if (index >= 0) {
    const next = list.slice();
    next[index] = item;
    return next;
  }
  return [item, ...list];
}

export const useAiStore = defineStore("aiStore", {
  state: () => ({
    generationsByProject: {} as Record<string, AiGeneration[]>,
    assistantQueriesByProject: {} as Record<string, AiAssistantQuery[]>,
    healthSummariesByProject: {} as Record<string, AiHealthSummary[]>,
    eligibleAssigneesByProject: {} as Record<string, EligibleAssignee[]>,
    taskRegenerationsByTask: {} as Record<string, AiTaskRegeneration>,
    requestingPlan: false,
    askingAssistant: false,
    requestingHealthSummary: false,
    regeneratingPlan: false,
  }),
  getters: {
    generationsFor: (state) => (projectId: string) => state.generationsByProject[projectId] || [],
    assistantQueriesFor: (state) => (projectId: string) => state.assistantQueriesByProject[projectId] || [],
    healthSummariesFor: (state) => (projectId: string) => state.healthSummariesByProject[projectId] || [],
    eligibleAssigneesFor: (state) => (projectId: string) => state.eligibleAssigneesByProject[projectId] || [],
    latestGenerationFor: (state) => (projectId: string) => state.generationsByProject[projectId]?.[0] ?? null,
    hasSavedPlan: (state) => (projectId: string) =>
      (state.generationsByProject[projectId] || []).some((g) => g.savedAt),
    taskRegenerationFor: (state) => (taskId: string) => state.taskRegenerationsByTask[taskId] ?? null,
  },
  actions: {
    async fetchGenerations(projectId: string) {
      try {
        const { data } = await axiosInstance.get<ApiResponse<{ results: GenerationApi[] }>>(
          `/projects/${projectId}/ai-generations/`
        );
        this.generationsByProject[projectId] = data.data.results.map(mapGeneration);
      } catch (error) {
        console.error("Failed to fetch AI generations:", error);
      }
    },

    async requestPlan(
      projectId: string,
      input: { prompt: string; mentionedUserIds?: string[]; assigneeIds?: string[]; maxTasks?: number },
      signal?: PollSignal
    ): Promise<{ generation?: AiGeneration; error?: string }> {
      this.requestingPlan = true;
      try {
        const { data } = await axiosInstance.post<ApiResponse<{ generation: GenerationApi }>>(
          `/projects/${projectId}/ai-plan/`,
          {
            prompt: input.prompt, mentioned_user_ids: input.mentionedUserIds || [],
            assignee_ids: input.assigneeIds || [], max_tasks: input.maxTasks ?? 10,
          }
        );
        let generation = mapGeneration(data.data.generation);
        this.generationsByProject[projectId] = upsertById(this.generationsFor(projectId), generation);

        generation = await pollUntilTerminal(async () => {
          const { data } = await axiosInstance.get<ApiResponse<{ generation: GenerationApi }>>(
            `/ai/generations/${generation.id}/`
          );
          const updated = mapGeneration(data.data.generation);
          this.generationsByProject[projectId] = upsertById(this.generationsFor(projectId), updated);
          return updated;
        }, { signal });

        return { generation };
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to request an AI plan" };
      } finally {
        this.requestingPlan = false;
      }
    },

    // For a generation that's still pending/processing on mount (e.g. the
    // user reloaded mid-generation) -- requestPlan/regeneratePlan only start
    // a poll loop for a generation THEY just created, so without this an
    // already-in-flight generation fetched via fetchGenerations would sit
    // there with no active poll and never reach the frontend as terminal.
    async resumePollingGeneration(generationId: string, projectId: string, signal?: PollSignal) {
      await pollUntilTerminal(async () => {
        const { data } = await axiosInstance.get<ApiResponse<{ generation: GenerationApi }>>(
          `/ai/generations/${generationId}/`
        );
        const updated = mapGeneration(data.data.generation);
        this.generationsByProject[projectId] = upsertById(this.generationsFor(projectId), updated);
        return updated;
      }, { signal });
    },

    // fetchGenerations() (the history list) deliberately omits each row's
    // generated_tasks to avoid an N+1 fetch -- so a generation loaded that
    // way (rather than just-created via requestPlan/regeneratePlan, whose
    // poll loop already fetches full detail) needs this one-off full fetch
    // before its tasks can be reviewed.
    async fetchGeneration(generationId: string, projectId: string) {
      try {
        const { data } = await axiosInstance.get<ApiResponse<{ generation: GenerationApi }>>(
          `/ai/generations/${generationId}/`
        );
        const updated = mapGeneration(data.data.generation);
        this.generationsByProject[projectId] = upsertById(this.generationsFor(projectId), updated);
      } catch (error) {
        console.error("Failed to fetch generation detail:", error);
      }
    },

    async commentOnGeneratedTask(
      generationId: string, projectId: string, taskId: string, comment: string
    ): Promise<{ error?: string }> {
      try {
        const { data } = await axiosInstance.patch<ApiResponse<{ generated_task: GeneratedTaskApi }>>(
          `/ai/generations/${generationId}/tasks/${taskId}/comment/`,
          { comment }
        );
        this._patchGeneratedTask(projectId, generationId, mapGeneratedTask(data.data.generated_task));
        return {};
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to save the comment" };
      }
    },

    async assignGeneratedTask(
      generationId: string, projectId: string, taskId: string, assignedToId: string | null
    ): Promise<{ error?: string }> {
      try {
        const { data } = await axiosInstance.patch<ApiResponse<{ generated_task: GeneratedTaskApi }>>(
          `/ai/generations/${generationId}/tasks/${taskId}/assign/`,
          { assigned_to_id: assignedToId }
        );
        this._patchGeneratedTask(projectId, generationId, mapGeneratedTask(data.data.generated_task));
        return {};
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to save the assignee" };
      }
    },

    _patchGeneratedTask(projectId: string, generationId: string, updatedTask: AiGeneratedTask) {
      const list = this.generationsFor(projectId);
      const generation = list.find((g) => g.id === generationId);
      if (!generation) return;
      const patched: AiGeneration = {
        ...generation,
        generatedTasks: generation.generatedTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
      };
      this.generationsByProject[projectId] = upsertById(list, patched);
    },

    async regeneratePlan(
      generationId: string, projectId: string, signal?: PollSignal
    ): Promise<{ generation?: AiGeneration; error?: string }> {
      this.regeneratingPlan = true;
      try {
        const { data } = await axiosInstance.post<ApiResponse<{ generation: GenerationApi }>>(
          `/ai/generations/${generationId}/regenerate/`
        );
        let generation = mapGeneration(data.data.generation);
        this.generationsByProject[projectId] = upsertById(this.generationsFor(projectId), generation);

        generation = await pollUntilTerminal(async () => {
          const { data } = await axiosInstance.get<ApiResponse<{ generation: GenerationApi }>>(
            `/ai/generations/${generation.id}/`
          );
          const updated = mapGeneration(data.data.generation);
          this.generationsByProject[projectId] = upsertById(this.generationsFor(projectId), updated);
          return updated;
        }, { signal });

        return { generation };
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to regenerate the plan" };
      } finally {
        this.regeneratingPlan = false;
      }
    },

    async savePlan(
      generationId: string, projectId: string
    ): Promise<{ error?: string; invalidAssigneeTempIds?: string[] }> {
      try {
        const { data } = await axiosInstance.post<
          ApiResponse<{ tasks: TaskApi[]; invalid_assignee_temp_ids: string[] }>
        >(`/ai/generations/${generationId}/save/`);

        const projectStore = useProjectStore();
        projectStore.appendTasks(projectId, data.data.tasks);

        const list = this.generationsFor(projectId);
        const generation = list.find((g) => g.id === generationId);
        if (generation) {
          this.generationsByProject[projectId] = upsertById(list, { ...generation, savedAt: new Date().toISOString() });
        }
        return { invalidAssigneeTempIds: data.data.invalid_assignee_temp_ids };
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to save the plan" };
      }
    },

    // Persists the "New plan" / discard-draft action server-side, so the
    // abandoned draft stops coming back as this project's latest generation
    // after a refresh (it's excluded from /ai-generations/ once discarded).
    async discardGeneration(generationId: string, projectId: string): Promise<{ error?: string }> {
      try {
        await axiosInstance.post(`/ai/generations/${generationId}/discard/`);
        this.generationsByProject[projectId] = this.generationsFor(projectId).filter((g) => g.id !== generationId);
        return {};
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to discard the draft plan" };
      }
    },

    async fetchEligibleAssignees(projectId: string) {
      try {
        const { data } = await axiosInstance.get<ApiResponse<{ results: EligibleAssigneeApi[] }>>(
          `/projects/${projectId}/eligible-assignees/`
        );
        this.eligibleAssigneesByProject[projectId] = data.data.results.map(mapEligibleAssignee);
      } catch (error) {
        console.error("Failed to fetch eligible assignees:", error);
      }
    },

    async regenerateTaskDescription(
      taskId: string, instructions: string, signal?: PollSignal
    ): Promise<{ error?: string }> {
      try {
        const { data } = await axiosInstance.post<ApiResponse<{ task_regeneration: TaskRegenerationApi }>>(
          `/tasks/${taskId}/regenerate-ai-content/`,
          { instructions }
        );
        let regen = data.data.task_regeneration;
        this.taskRegenerationsByTask[taskId] = {
          id: regen.id, taskId, status: regen.status, errorMessage: regen.error_message,
        };

        const projectStore = useProjectStore();
        regen = await pollUntilTerminal(async () => {
          const { data } = await axiosInstance.get<ApiResponse<{ task_regeneration: TaskRegenerationApi }>>(
            `/ai/task-regenerations/${regen.id}/`
          );
          const updated = data.data.task_regeneration;
          this.taskRegenerationsByTask[taskId] = {
            id: updated.id, taskId, status: updated.status, errorMessage: updated.error_message,
          };
          if (updated.status === "completed" && updated.task) {
            projectStore.applyTaskApiUpdate(updated.task);
          }
          return updated;
        }, { signal });

        if (regen.status === "failed") return { error: regen.error_message || "Failed to regenerate task content" };
        return {};
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to regenerate task content" };
      }
    },

    async fetchAssistantQueries(projectId: string) {
      try {
        const { data } = await axiosInstance.get<ApiResponse<{ results: AssistantQueryApi[] }>>(
          `/projects/${projectId}/ai-assistant-queries/`
        );
        this.assistantQueriesByProject[projectId] = data.data.results.map(mapAssistantQuery);
      } catch (error) {
        console.error("Failed to fetch assistant queries:", error);
      }
    },

    async askAssistant(
      projectId: string,
      input: { question: string; referenceUrl?: string; pageIds?: string[] },
      signal?: PollSignal
    ): Promise<{ query?: AiAssistantQuery; error?: string }> {
      this.askingAssistant = true;
      try {
        const { data } = await axiosInstance.post<ApiResponse<{ assistant_query: AssistantQueryApi }>>(
          `/projects/${projectId}/ai-assistant/`,
          { question: input.question, reference_url: input.referenceUrl || undefined, page_ids: input.pageIds || [] }
        );
        let query = mapAssistantQuery(data.data.assistant_query);
        this.assistantQueriesByProject[projectId] = upsertById(this.assistantQueriesFor(projectId), query);

        query = await pollUntilTerminal(async () => {
          const { data } = await axiosInstance.get<ApiResponse<{ assistant_query: AssistantQueryApi }>>(
            `/ai/assistant-queries/${query.id}/`
          );
          const updated = mapAssistantQuery(data.data.assistant_query);
          this.assistantQueriesByProject[projectId] = upsertById(this.assistantQueriesFor(projectId), updated);
          return updated;
        }, { signal });

        return { query };
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to ask the assistant" };
      } finally {
        this.askingAssistant = false;
      }
    },

    async fetchHealthSummaries(projectId: string) {
      try {
        const { data } = await axiosInstance.get<ApiResponse<{ results: HealthSummaryApi[] }>>(
          `/projects/${projectId}/ai-health-summaries/`
        );
        this.healthSummariesByProject[projectId] = data.data.results.map(mapHealthSummary);
      } catch (error) {
        console.error("Failed to fetch health summaries:", error);
      }
    },

    async requestHealthSummary(projectId: string, signal?: PollSignal): Promise<{ summary?: AiHealthSummary; error?: string }> {
      this.requestingHealthSummary = true;
      try {
        const { data } = await axiosInstance.post<ApiResponse<{ health_summary: HealthSummaryApi }>>(
          `/projects/${projectId}/ai-health-summary/`
        );
        let summary = mapHealthSummary(data.data.health_summary);
        this.healthSummariesByProject[projectId] = upsertById(this.healthSummariesFor(projectId), summary);

        summary = await pollUntilTerminal(async () => {
          const { data } = await axiosInstance.get<ApiResponse<{ health_summary: HealthSummaryApi }>>(
            `/ai/health-summaries/${summary.id}/`
          );
          const updated = mapHealthSummary(data.data.health_summary);
          this.healthSummariesByProject[projectId] = upsertById(this.healthSummariesFor(projectId), updated);
          return updated;
        }, { signal });

        return { summary };
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to request a health summary" };
      } finally {
        this.requestingHealthSummary = false;
      }
    },

    async deleteAssistantQuery(queryId: string, projectId: string): Promise<{ error?: string }> {
      try {
        await axiosInstance.delete(`/ai/assistant-queries/${queryId}/`);
        this.assistantQueriesByProject[projectId] = this.assistantQueriesFor(projectId).filter((q) => q.id !== queryId);
        return {};
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to delete this assistant query" };
      }
    },

    async saveAssistantQueryAsPage(
      queryId: string, input: { title: string; folderId?: string; newFolderName?: string }
    ): Promise<{ pageId?: string; error?: string }> {
      try {
        const { data } = await axiosInstance.post<ApiResponse<{ page: { id: string; folder_id: string; title: string } }>>(
          `/ai/assistant-queries/${queryId}/save-as-page/`,
          { title: input.title, folder_id: input.folderId, new_folder_name: input.newFolderName }
        );
        return { pageId: data.data.page.id };
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to save this response as a page" };
      }
    },

    // Downloads the .xlsx workbook and hands the caller a blob URL to open/
    // save -- no full-page navigation (no window.location to the endpoint).
    async exportHealthReport(projectId: string, summaryId: string): Promise<{ url?: string; filename?: string; error?: string }> {
      try {
        const response = await axiosInstance.get(
          `/projects/${projectId}/ai-health-summary/${summaryId}/export/`,
          { responseType: "blob" }
        );
        const disposition: string = response.headers["content-disposition"] || "";
        const match = /filename="?([^"]+)"?/.exec(disposition);
        const filename = match?.[1] || "health-report.xlsx";
        const url = URL.createObjectURL(response.data);
        return { url, filename };
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to export the health report" };
      }
    },
  },
});

export { createPollSignal };
export type { PollSignal };
