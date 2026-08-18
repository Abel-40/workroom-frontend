import { defineStore } from "pinia";

export interface NotificationEntry {
  id: string;
  actor: string;
  message: string;
  taskName?: string;
  createdAt: string;
  read: boolean;
}

export const useNotificationStore = defineStore("notificationStore", {
  state: () => ({
    notifications: [
      {
        id: "notif-1",
        actor: "Emily Tyler",
        message: "sent you a comment in",
        taskName: "Research",
        createdAt: "2025-05-04T09:00:00",
        read: false,
      },
      {
        id: "notif-2",
        actor: "Oscar Holloway",
        message: "updated the status of Mind Map task to In Progress",
        createdAt: "2025-05-04T08:00:00",
        read: false,
      },
      {
        id: "notif-3",
        actor: "Blake Silva",
        message: "assigned the issue to you",
        createdAt: "2025-05-04T06:30:00",
        read: false,
      },
      {
        id: "notif-4",
        actor: "Emily Tyler",
        message: "sent you a comment in",
        taskName: "Research",
        createdAt: "2025-05-03T14:30:00",
        read: true,
      },
      {
        id: "notif-5",
        actor: "Oscar Holloway",
        message: "updated the status of Mind Map task to In Progress",
        createdAt: "2025-05-02T13:45:00",
        read: true,
      },
      {
        id: "notif-6",
        actor: "Blake Silva",
        message: "assigned the issue to you",
        createdAt: "2025-05-01T10:54:00",
        read: true,
      },
    ] as NotificationEntry[],
  }),
  getters: {
    unreadCount(state) {
      return state.notifications.filter((n) => !n.read).length;
    },
  },
  actions: {
    markAllRead() {
      this.notifications.forEach((n) => (n.read = true));
    },
    markRead(id: string) {
      const entry = this.notifications.find((n) => n.id === id);
      if (entry) entry.read = true;
    },
  },
  persist: {
    key: "pinia-notificationStore",
    storage: localStorage,
  },
});
