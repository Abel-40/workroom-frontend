import { defineStore } from "pinia";
import type { ApiResponse } from "@/types/types";
import axiosInstance from "@/plugins/axios";
import { createPollSignal, pollUntilTerminal, type PollSignal } from "@/lib/pollUntilTerminal";

export type AiJobStatus = "pending" | "processing" | "completed" | "failed";

export interface AiGeneration {
  id: string;
  projectId: string;
  status: AiJobStatus;
  taskCount: number;
  requestedAt: string;
  completedAt: string | null;
  errorMessage: string;
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

type GenerationApi = {
  id: string; project_id: string; status: AiJobStatus; requested_at: string;
  completed_at: string | null; task_count: number; error_message: string;
};
type AssistantQueryApi = {
  id: string; project_id: string; question: string; reference_url: string | null; status: AiJobStatus;
  answer: string; refused: boolean; requested_at: string; error_message: string;
};
type HealthSummaryApi = {
  id: string; project_id: string; status: AiJobStatus; summary: string;
  risk_level: "low" | "medium" | "high" | ""; requested_at: string; error_message: string;
};

const mapGeneration = (api: GenerationApi): AiGeneration => ({
  id: api.id,
  projectId: api.project_id,
  status: api.status,
  taskCount: api.task_count,
  requestedAt: api.requested_at,
  completedAt: api.completed_at,
  errorMessage: api.error_message,
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
    requestingPlan: false,
    askingAssistant: false,
    requestingHealthSummary: false,
  }),
  getters: {
    generationsFor: (state) => (projectId: string) => state.generationsByProject[projectId] || [],
    assistantQueriesFor: (state) => (projectId: string) => state.assistantQueriesByProject[projectId] || [],
    healthSummariesFor: (state) => (projectId: string) => state.healthSummariesByProject[projectId] || [],
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

    async requestPlan(projectId: string, signal?: PollSignal): Promise<{ generation?: AiGeneration; error?: string }> {
      this.requestingPlan = true;
      try {
        const { data } = await axiosInstance.post<ApiResponse<{ generation: GenerationApi }>>(
          `/projects/${projectId}/ai-plan/`
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
      input: { question: string; referenceUrl?: string },
      signal?: PollSignal
    ): Promise<{ query?: AiAssistantQuery; error?: string }> {
      this.askingAssistant = true;
      try {
        const { data } = await axiosInstance.post<ApiResponse<{ assistant_query: AssistantQueryApi }>>(
          `/projects/${projectId}/ai-assistant/`,
          { question: input.question, reference_url: input.referenceUrl || undefined }
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
  },
});

export { createPollSignal };
export type { PollSignal };
