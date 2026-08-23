import { defineStore } from "pinia";
import axiosInstance from "@/plugins/axios";
import type { ApiResponse } from "@/types/types";

export type NotificationCategory = "critical" | "optional";

export interface NotificationEntry {
  id: string;
  type: string;
  category: NotificationCategory;
  title: string;
  message: string;
  relatedObjectType: string;
  relatedObjectId: string | null;
  isRead: boolean;
  createdAt: string;
}

type NotificationApi = {
  id: string;
  type: string;
  category: NotificationCategory;
  title: string;
  message: string;
  related_object_type: string;
  related_object_id: string | null;
  is_read: boolean;
  created_at: string;
};

type PaginationMeta = { count: number; page: number; page_size: number; has_next: boolean };

const mapNotification = (n: NotificationApi): NotificationEntry => ({
  id: n.id,
  type: n.type,
  category: n.category,
  title: n.title,
  message: n.message,
  relatedObjectType: n.related_object_type,
  relatedObjectId: n.related_object_id,
  isRead: n.is_read,
  createdAt: n.created_at,
});

export interface NotificationFilters {
  isRead?: boolean;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  relatedObjectType?: string;
  relatedObjectId?: string;
  page?: number;
  pageSize?: number;
}

export const useNotificationStore = defineStore("notificationStore", {
  state: () => ({
    notifications: [] as NotificationEntry[],
    unreadCount: 0,
    meta: null as PaginationMeta | null,
    loading: false,
  }),
  actions: {
    async fetchNotifications(filters: NotificationFilters = {}) {
      this.loading = true;
      try {
        const { data } = await axiosInstance.get<
          ApiResponse<{ results: NotificationApi[]; meta: PaginationMeta; unread_count: number }>
        >("/notifications/", {
          params: {
            is_read: filters.isRead,
            type: filters.type,
            date_from: filters.dateFrom,
            date_to: filters.dateTo,
            related_object_type: filters.relatedObjectType,
            related_object_id: filters.relatedObjectId,
            page: filters.page,
            page_size: filters.pageSize,
          },
        });
        this.notifications = data.data.results.map(mapNotification);
        this.unreadCount = data.data.unread_count;
        this.meta = data.data.meta;
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        this.loading = false;
      }
    },

    async markRead(id: string) {
      try {
        await axiosInstance.post(`/notifications/${id}/read/`);
        const notification = this.notifications.find((n) => n.id === id);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
      } catch (error) {
        console.error("Failed to mark notification read:", error);
      }
    },

    async markAllRead() {
      try {
        await axiosInstance.post("/notifications/mark-all-read/");
        this.notifications.forEach((n) => (n.isRead = true));
        this.unreadCount = 0;
      } catch (error) {
        console.error("Failed to mark all notifications read:", error);
      }
    },
  },
});
