import { defineStore } from "pinia";
import axiosInstance from "@/plugins/axios";
import type { ApiResponse } from "@/types/types";

export interface DepartmentEntry {
  id: string;
  name: string;
  description: string;
  leaderId: string | null;
  leaderName: string | null;
  memberCount: number;
}

export interface TeamEntry {
  id: string;
  name: string;
  description: string;
  leaderId: string | null;
  leaderName: string | null;
  memberIds: string[];
}

export interface TaskTypeEntry {
  id: string;
  name: string;
  description: string;
}

export interface EventTypeEntry {
  id: string;
  name: string;
  description: string;
}

type DepartmentApi = {
  id: string; name: string; description: string;
  leader_id: string | null; leader_name: string | null; member_count: number;
};
type TeamApi = {
  id: string; name: string; description: string;
  leader_id: string | null; leader_name: string | null; member_ids: string[];
};
type TaskTypeApi = { id: string; name: string; description: string };
type EventTypeApi = { id: string; name: string; description: string };

const mapDepartment = (d: DepartmentApi): DepartmentEntry => ({
  id: d.id,
  name: d.name,
  description: d.description,
  leaderId: d.leader_id,
  leaderName: d.leader_name,
  memberCount: d.member_count,
});

const mapTeam = (t: TeamApi): TeamEntry => ({
  id: t.id,
  name: t.name,
  description: t.description,
  leaderId: t.leader_id,
  leaderName: t.leader_name,
  memberIds: t.member_ids,
});

export interface CreateDepartmentInput {
  name: string;
  description?: string;
  leaderId?: string | null;
}

export interface CreateTeamInput {
  name: string;
  description?: string;
  leaderId?: string | null;
  memberIds?: string[];
}

// Company directory data (real departments/teams/task types, not the sector
// onboarding defaults) -- shared by any view that needs to populate a
// department/team/task-type picker, so each doesn't fetch it independently.
export const useDirectoryStore = defineStore("directoryStore", {
  state: () => ({
    departments: [] as DepartmentEntry[],
    teams: [] as TeamEntry[],
    taskTypes: [] as TaskTypeEntry[],
    eventTypes: [] as EventTypeEntry[],
    loaded: false,
  }),
  actions: {
    async fetchAll() {
      try {
        const [departmentsRes, teamsRes, taskTypesRes, eventTypesRes] = await Promise.all([
          axiosInstance.get<ApiResponse<{ results: DepartmentApi[] }>>("/departments/"),
          axiosInstance.get<ApiResponse<{ results: TeamApi[] }>>("/teams/"),
          axiosInstance.get<ApiResponse<{ results: TaskTypeApi[] }>>("/task-types/"),
          axiosInstance.get<ApiResponse<{ results: EventTypeApi[] }>>("/event-types/"),
        ]);
        this.departments = departmentsRes.data.data.results.map(mapDepartment);
        this.teams = teamsRes.data.data.results.map(mapTeam);
        this.taskTypes = taskTypesRes.data.data.results.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
        }));
        this.eventTypes = eventTypesRes.data.data.results.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
        }));
        this.loaded = true;
      } catch (error) {
        console.error("Failed to fetch departments/teams/task types/event types:", error);
      }
    },

    async createDepartment(input: CreateDepartmentInput): Promise<{ department?: DepartmentEntry; errors?: Record<string, string[]> }> {
      try {
        const { data } = await axiosInstance.post<ApiResponse<{ department: DepartmentApi }>>("/departments/", {
          name: input.name,
          description: input.description ?? "",
          leader_id: input.leaderId ?? null,
        });
        const department = mapDepartment(data.data.department);
        this.departments.push(department);
        return { department };
      } catch (error: any) {
        return { errors: error.response?.data?.errors || { name: [error.response?.data?.message || "Failed to create department"] } };
      }
    },

    async createTeam(input: CreateTeamInput): Promise<{ team?: TeamEntry; errors?: Record<string, string[]> }> {
      try {
        const { data } = await axiosInstance.post<ApiResponse<{ team: TeamApi }>>("/teams/", {
          name: input.name,
          description: input.description ?? "",
          leader_id: input.leaderId ?? null,
          member_ids: input.memberIds ?? [],
        });
        const team = mapTeam(data.data.team);
        this.teams.push(team);
        return { team };
      } catch (error: any) {
        return { errors: error.response?.data?.errors || { name: [error.response?.data?.message || "Failed to create team"] } };
      }
    },

    async updateDepartment(
      id: string,
      input: { name?: string; description?: string }
    ): Promise<{ department?: DepartmentEntry; errors?: Record<string, string[]> }> {
      try {
        const body: Record<string, unknown> = {};
        if (input.name !== undefined) body.name = input.name;
        if (input.description !== undefined) body.description = input.description;
        const { data } = await axiosInstance.patch<ApiResponse<{ department: DepartmentApi }>>(
          `/departments/${id}/`,
          body
        );
        const department = mapDepartment(data.data.department);
        const index = this.departments.findIndex((d) => d.id === id);
        if (index !== -1) this.departments[index] = department;
        return { department };
      } catch (error: any) {
        return { errors: error.response?.data?.errors || { name: [error.response?.data?.message || "Failed to update department"] } };
      }
    },

    async setDepartmentLeader(id: string, userId: string): Promise<{ department?: DepartmentEntry; error?: string }> {
      try {
        const { data } = await axiosInstance.post<ApiResponse<{ department: DepartmentApi }>>(
          `/departments/${id}/leader/`,
          { user_id: userId }
        );
        const department = mapDepartment(data.data.department);
        const index = this.departments.findIndex((d) => d.id === id);
        if (index !== -1) this.departments[index] = department;
        return { department };
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to assign department leader" };
      }
    },

    async revokeDepartmentLeader(id: string): Promise<{ department?: DepartmentEntry; error?: string }> {
      try {
        const { data } = await axiosInstance.delete<ApiResponse<{ department: DepartmentApi }>>(
          `/departments/${id}/leader/`
        );
        const department = mapDepartment(data.data.department);
        const index = this.departments.findIndex((d) => d.id === id);
        if (index !== -1) this.departments[index] = department;
        return { department };
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to revoke department leader" };
      }
    },

    async updateTeam(
      id: string,
      input: { name?: string; description?: string; memberIds?: string[] }
    ): Promise<{ team?: TeamEntry; errors?: Record<string, string[]> }> {
      try {
        const body: Record<string, unknown> = {};
        if (input.name !== undefined) body.name = input.name;
        if (input.description !== undefined) body.description = input.description;
        if (input.memberIds !== undefined) body.member_ids = input.memberIds;
        const { data } = await axiosInstance.patch<ApiResponse<{ team: TeamApi }>>(`/teams/${id}/`, body);
        const team = mapTeam(data.data.team);
        const index = this.teams.findIndex((t) => t.id === id);
        if (index !== -1) this.teams[index] = team;
        return { team };
      } catch (error: any) {
        return { errors: error.response?.data?.errors || { name: [error.response?.data?.message || "Failed to update team"] } };
      }
    },

    async setTeamLeader(id: string, userId: string): Promise<{ team?: TeamEntry; error?: string }> {
      try {
        const { data } = await axiosInstance.post<ApiResponse<{ team: TeamApi }>>(`/teams/${id}/leader/`, {
          user_id: userId,
        });
        const team = mapTeam(data.data.team);
        const index = this.teams.findIndex((t) => t.id === id);
        if (index !== -1) this.teams[index] = team;
        return { team };
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to assign team leader" };
      }
    },

    async revokeTeamLeader(id: string): Promise<{ team?: TeamEntry; error?: string }> {
      try {
        const { data } = await axiosInstance.delete<ApiResponse<{ team: TeamApi }>>(`/teams/${id}/leader/`);
        const team = mapTeam(data.data.team);
        const index = this.teams.findIndex((t) => t.id === id);
        if (index !== -1) this.teams[index] = team;
        return { team };
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to revoke team leader" };
      }
    },
  },
});
