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

type PaginationMeta = { count: number; page: number; page_size: number; has_next: boolean };

export const useActivityStore = defineStore("activityStore", {
  state: () => ({
    activities: [] as ActivityEntry[],
    meta: null as PaginationMeta | null,
    loading: false,
  }),
  actions: {
    // Fixed recent-N preview -- used by the small Analytics/dashboard
    // widgets that just want "the last N", not a real page.
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

    // Real page-through-everything listing, for the dedicated Activity page.
    async fetchActivitiesPage(page = 1, pageSize = 20) {
      this.loading = true;
      try {
        const { data } = await axiosInstance.get<
          ApiResponse<{ results: ActivityApi[]; meta: PaginationMeta }>
        >("/activity/paginated/", { params: { page, page_size: pageSize } });
        this.activities = data.data.results.map(mapActivity);
        this.meta = data.data.meta;
      } catch (error) {
        // /activity/paginated/ only exists on newer backends. Against an older
        // one it 404s, which used to leave the Activity page with an empty
        // feed and no pagination controls at all -- fall back to the capped
        // preview endpoint and page through it client-side instead.
        if ((error as { response?: { status?: number } })?.response?.status === 404) {
          await this.fetchActivitiesPageFallback(page, pageSize);
        } else {
          console.error("Failed to fetch company activity:", error);
        }
      } finally {
        this.loading = false;
      }
    },

    async fetchActivitiesPageFallback(page: number, pageSize: number) {
      const PREVIEW_CAP = 50; // The old endpoint's own MAX_LIMIT.
      try {
        const { data } = await axiosInstance.get<ApiResponse<{ results: ActivityApi[] }>>("/activity/", {
          params: { limit: PREVIEW_CAP },
        });
        const all = data.data.results.map(mapActivity);
        const offset = (page - 1) * pageSize;
        this.activities = all.slice(offset, offset + pageSize);
        this.meta = {
          count: all.length,
          page,
          page_size: pageSize,
          has_next: offset + pageSize < all.length,
        };
      } catch (error) {
        console.error("Failed to fetch company activity:", error);
      }
    },
  },
});
