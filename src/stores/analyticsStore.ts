import { defineStore } from "pinia";
import axiosInstance from "@/plugins/axios";
import type { ApiResponse } from "@/types/types";

export interface CompanyStats {
  projectCount: number;
  activeProjects: number;
  completedProjects: number;
  memberCount: number;
  taskCount: number;
  completedTasks: number;
}

type CompanyStatsApi = {
  project_count: number;
  active_projects: number;
  completed_projects: number;
  member_count: number;
  task_count: number;
  completed_tasks: number;
};

export interface DepartmentStats {
  id: string;
  name: string;
  projectCount: number;
  taskCount: number;
  completedTaskCount: number;
  memberCount: number;
}

type DepartmentStatsApi = {
  id: string;
  name: string;
  project_count: number;
  task_count: number;
  completed_task_count: number;
  member_count: number;
};

const mapCompanyStats = (api: CompanyStatsApi): CompanyStats => ({
  projectCount: api.project_count,
  activeProjects: api.active_projects,
  completedProjects: api.completed_projects,
  memberCount: api.member_count,
  taskCount: api.task_count,
  completedTasks: api.completed_tasks,
});

const mapDepartmentStats = (api: DepartmentStatsApi): DepartmentStats => ({
  id: api.id,
  name: api.name,
  projectCount: api.project_count,
  taskCount: api.task_count,
  completedTaskCount: api.completed_task_count,
  memberCount: api.member_count,
});

export const useAnalyticsStore = defineStore("analyticsStore", {
  state: () => ({
    companyStats: null as CompanyStats | null,
    departmentStats: [] as DepartmentStats[],
    loading: false,
  }),
  actions: {
    async fetchCompanyStats() {
      try {
        const { data } = await axiosInstance.get<ApiResponse<CompanyStatsApi>>("/analytics/company/");
        this.companyStats = mapCompanyStats(data.data);
      } catch (error) {
        console.error("Failed to fetch company stats:", error);
      }
    },

    async fetchDepartmentStats() {
      try {
        const { data } = await axiosInstance.get<ApiResponse<{ departments: DepartmentStatsApi[] }>>(
          "/analytics/company/departments/"
        );
        this.departmentStats = data.data.departments.map(mapDepartmentStats);
      } catch (error) {
        console.error("Failed to fetch department stats:", error);
      }
    },

    async fetchAll() {
      this.loading = true;
      await Promise.all([this.fetchCompanyStats(), this.fetchDepartmentStats()]);
      this.loading = false;
    },
  },
});
