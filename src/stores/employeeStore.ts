import { defineStore } from "pinia";
import axiosInstance from "@/plugins/axios";
import type { ApiResponse } from "@/types/types";

export type EmployeeRole = "Owner" | "CM" | "DL" | "DM";

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  roleLabel: string;
  department: string | null;
  isActive: boolean;
  activeTaskCount: number;
  todoCount: number;
  inProgressCount: number;
  inReviewCount: number;
}

export interface RemovalBlockers {
  projects: { id: string; title: string }[];
  tasks: { id: string; title: string }[];
}

type MemberApi = {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: EmployeeRole;
  department: string | null;
  is_active: boolean;
  active_task_count: number;
  todo_count: number;
  in_progress_count: number;
  in_review_count: number;
};

type MemberDetailApi = {
  user_id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: EmployeeRole;
  department_name: string | null;
  is_active: boolean;
  workload: { active_task_count: number; todo_count: number; in_progress_count: number; in_review_count: number };
};

export const ROLE_LABELS: Record<EmployeeRole, string> = {
  Owner: "Owner",
  CM: "Company Manager",
  DL: "Department Leader",
  DM: "Department Member",
};

export const useEmployeeStore = defineStore("employeeStore", {
  state: () => ({
    employees: [] as Employee[],
    loading: false,
  }),
  getters: {
    total: (state) => state.employees.length,
  },
  actions: {
    async fetchEmployees() {
      this.loading = true;
      try {
        const { data } = await axiosInstance.get<ApiResponse<{ members: MemberApi[] }>>(
          "/analytics/company/members/"
        );
        this.employees = data.data.members.map((m) => ({
          id: m.id,
          name: `${m.first_name} ${m.last_name}`.trim() || m.username,
          email: m.email,
          role: m.role,
          roleLabel: ROLE_LABELS[m.role] ?? m.role,
          department: m.department,
          isActive: m.is_active,
          activeTaskCount: m.active_task_count,
          todoCount: m.todo_count,
          inProgressCount: m.in_progress_count,
          inReviewCount: m.in_review_count,
        }));
      } catch (error) {
        // A failed read shouldn't block sibling fetches awaited right after
        // this one (e.g. ProjectsView loads employees then projects).
        console.error("Failed to fetch employees:", error);
      } finally {
        this.loading = false;
      }
    },

    // Sends one invitation per email via the real invite endpoint (the
    // backend accepts one address at a time); returns which addresses were
    // sent and which failed so the UI can surface partial failures.
    async invite(emails: string[]): Promise<{ sent: string[]; errors: Record<string, string> }> {
      const sent: string[] = [];
      const errors: Record<string, string> = {};
      for (const raw of emails) {
        const email = raw.trim();
        if (!email) continue;
        try {
          await axiosInstance.post("/auth/send_invite/", { email });
          sent.push(email);
        } catch (error: any) {
          errors[email] = error.response?.data?.message || "Failed to send invitation";
        }
      }
      return { sent, errors };
    },

    async fetchEmployeeById(id: string): Promise<{ employee?: Employee; error?: string }> {
      try {
        const { data } = await axiosInstance.get<ApiResponse<{ member: MemberDetailApi }>>(
          `/company/members/${id}/`
        );
        const m = data.data.member;
        const employee: Employee = {
          id: m.user_id,
          name: `${m.first_name} ${m.last_name}`.trim() || m.username,
          email: m.email,
          role: m.role,
          roleLabel: ROLE_LABELS[m.role] ?? m.role,
          department: m.department_name,
          isActive: m.is_active,
          activeTaskCount: m.workload.active_task_count,
          todoCount: m.workload.todo_count,
          inProgressCount: m.workload.in_progress_count,
          inReviewCount: m.workload.in_review_count,
        };
        const index = this.employees.findIndex((e) => e.id === id);
        if (index !== -1) this.employees[index] = employee;
        else this.employees.push(employee);
        return { employee };
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to load employee" };
      }
    },

    async setActiveStatus(id: string, isActive: boolean): Promise<{ error?: string }> {
      try {
        await axiosInstance.patch(`/company/members/${id}/status/`, { is_active: isActive });
        const employee = this.employees.find((e) => e.id === id);
        if (employee) employee.isActive = isActive;
        return {};
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to update status" };
      }
    },

    async changeDepartment(id: string, departmentId: string | null): Promise<{ error?: string }> {
      try {
        await axiosInstance.patch(`/company/members/${id}/department/`, { department_id: departmentId });
        // Refetch this one member since the department *name* (not just id)
        // is what the store/UI displays, and only the detail endpoint
        // returns that resolved name.
        await this.fetchEmployeeById(id);
        return {};
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to change department" };
      }
    },

    async changeRole(id: string, role: EmployeeRole): Promise<{ error?: string }> {
      try {
        await axiosInstance.patch(`/company/members/${id}/role/`, { role });
        await this.fetchEmployeeById(id);
        return {};
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to change role" };
      }
    },

    async remove(
      id: string,
      reassignToUserId?: string
    ): Promise<{ ok?: true; reassignmentRequired?: RemovalBlockers; error?: string }> {
      try {
        await axiosInstance.post(`/company/members/${id}/remove/`, {
          reassign_to_user_id: reassignToUserId ?? null,
        });
        this.employees = this.employees.filter((e) => e.id !== id);
        return { ok: true };
      } catch (error: any) {
        if (error.response?.status === 409) {
          return { reassignmentRequired: error.response.data.data as RemovalBlockers };
        }
        return { error: error.response?.data?.message || "Failed to remove member" };
      }
    },
  },
});
