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

type DepartmentApi = {
  id: string; name: string; description: string;
  leader_id: string | null; leader_name: string | null; member_count: number;
};
type TeamApi = {
  id: string; name: string; description: string;
  leader_id: string | null; leader_name: string | null; member_ids: string[];
};
type TaskTypeApi = { id: string; name: string; description: string };

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
    loaded: false,
  }),
  actions: {
    async fetchAll() {
      try {
        const [departmentsRes, teamsRes, taskTypesRes] = await Promise.all([
          axiosInstance.get<ApiResponse<{ results: DepartmentApi[] }>>("/departments/"),
          axiosInstance.get<ApiResponse<{ results: TeamApi[] }>>("/teams/"),
          axiosInstance.get<ApiResponse<{ results: TaskTypeApi[] }>>("/task-types/"),
        ]);
        this.departments = departmentsRes.data.data.results.map(mapDepartment);
        this.teams = teamsRes.data.data.results.map(mapTeam);
        this.taskTypes = taskTypesRes.data.data.results.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
        }));
        this.loaded = true;
      } catch (error) {
        console.error("Failed to fetch departments/teams/task types:", error);
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
  },
});
