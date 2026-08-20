import { defineStore } from "pinia";
import axiosInstance from "@/plugins/axios";
import type { ApiResponse } from "@/types/types";

export type EmployeeRole = "Owner" | "DL" | "DM";

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  roleLabel: string;
  department: string | null;
  activeTaskCount: number;
  todoCount: number;
  inProgressCount: number;
  inReviewCount: number;
}

type MemberApi = {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: EmployeeRole;
  department: string | null;
  active_task_count: number;
  todo_count: number;
  in_progress_count: number;
  in_review_count: number;
};

const ROLE_LABELS: Record<EmployeeRole, string> = {
  Owner: "Owner",
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
  },
});
