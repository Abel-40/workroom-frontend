import { defineStore } from "pinia";
import axiosInstance from "@/plugins/axios";
import type { ApiResponse } from "@/types/types";

export type ActivityType =
  | "project_created"
  | "project_completed"
  | "project_reopened"
  | "project_ownership_transferred"
  | "member_invited"
  | "member_joined"
  | "member_removed"
  | "department_created"
  | "team_created";

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  summary: string;
  actorId: string | null;
  actorName: string | null;
  relatedObjectType: string;
  relatedObjectId: string | null;
  createdAt: string;
}

type ActivityApi = {
  id: string;
  type: ActivityType;
  summary: string;
  actor_id: string | null;
  actor_name: string | null;
  related_object_type: string;
  related_object_id: string | null;
  created_at: string;
};

const mapActivity = (a: ActivityApi): ActivityEntry => ({
  id: a.id,
  type: a.type,
  summary: a.summary,
  actorId: a.actor_id,
  actorName: a.actor_name,
  relatedObjectType: a.related_object_type,
  relatedObjectId: a.related_object_id,
  createdAt: a.created_at,
});

export const useActivityStore = defineStore("activityStore", {
  state: () => ({
    activities: [] as ActivityEntry[],
    loading: false,
  }),
  actions: {
    async fetchActivities(limit = 10) {
      this.loading = true;
      try {
        const { data } = await axiosInstance.get<ApiResponse<{ results: ActivityApi[] }>>("/activity/", {
          params: { limit },
        });
        this.activities = data.data.results.map(mapActivity);
      } catch (error) {
        console.error("Failed to fetch company activity:", error);
      } finally {
        this.loading = false;
      }
    },
  },
});
