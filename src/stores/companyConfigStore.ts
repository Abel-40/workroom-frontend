import { defineStore } from "pinia";
import axiosInstance from "@/plugins/axios";
import type { ApiResponse } from "@/types/types";

export interface DefaultConfigEntry {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

type DefaultConfigApi = { id: string; name: string; description: string; enabled: boolean };

const mapEntry = (d: DefaultConfigApi): DefaultConfigEntry => ({
  id: d.id,
  name: d.name,
  description: d.description,
  enabled: d.enabled,
});

export const useCompanyConfigStore = defineStore("companyConfigStore", {
  state: () => ({
    departments: [] as DefaultConfigEntry[],
    taskTypes: [] as DefaultConfigEntry[],
    loading: false,
  }),
  actions: {
    async fetchDefaults() {
      this.loading = true;
      try {
        const { data } = await axiosInstance.get<
          ApiResponse<{ departments: DefaultConfigApi[]; task_types: DefaultConfigApi[] }>
        >("/company/default-config/");
        this.departments = data.data.departments.map(mapEntry);
        this.taskTypes = data.data.task_types.map(mapEntry);
      } catch (error) {
        console.error("Failed to fetch company default configuration:", error);
      } finally {
        this.loading = false;
      }
    },

    async enableDepartment(id: string): Promise<{ error?: string }> {
      try {
        await axiosInstance.post("/company/default-config/departments/", { selected_ids: [id] });
        const entry = this.departments.find((d) => d.id === id);
        if (entry) entry.enabled = true;
        return {};
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to enable department default" };
      }
    },

    async enableTaskType(id: string): Promise<{ error?: string }> {
      try {
        await axiosInstance.post("/company/default-config/task-types/", { selected_ids: [id] });
        const entry = this.taskTypes.find((t) => t.id === id);
        if (entry) entry.enabled = true;
        return {};
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to enable task type default" };
      }
    },
  },
});
