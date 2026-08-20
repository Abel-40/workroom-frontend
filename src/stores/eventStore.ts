import { defineStore } from "pinia";

export type EventColor = "purple" | "pink" | "amber" | "blue" | "green";

export interface EventEntry {
  id: string;
  title: string;
  icon: string;
  date: string; // ISO date, e.g. "2025-09-08"
  time: string; // e.g. "5:00 PM"
  duration: string; // e.g. "4h"
  priority: "up" | "down";
  color: EventColor;
  category: string;
  description?: string;
  repeat?: {
    enabled: boolean;
    cadence: "Daily" | "Weekly" | "Monthly";
    days: string[];
    time: string;
  };
}

export const useEventStore = defineStore("eventStore", {
  state: () => ({
    events: [
      {
        id: "evt-1",
        title: "Presentation of the new department",
        icon: "💼",
        date: "2025-09-08",
        time: "5:00 PM",
        duration: "4h",
        priority: "up",
        color: "purple",
        category: "Corporate Event",
      },
      {
        id: "evt-2",
        title: "Anna's Birthday",
        icon: "🎂",
        date: "2025-09-08",
        time: "6:00 PM",
        duration: "4h",
        priority: "down",
        color: "pink",
        category: "Birthday",
      },
      {
        id: "evt-3",
        title: "Meeting with Development Team",
        icon: "👥",
        date: "2025-09-09",
        time: "5:00 PM",
        duration: "4h",
        priority: "up",
        color: "amber",
        category: "Meeting",
      },
      {
        id: "evt-4",
        title: "Ray's Birthday",
        icon: "🎂",
        date: "2025-09-09",
        time: "2:00 PM",
        duration: "1h 30m",
        priority: "down",
        color: "pink",
        category: "Birthday",
      },
      {
        id: "evt-5",
        title: "Meeting with CEO",
        icon: "💼",
        date: "2025-09-14",
        time: "5:00 PM",
        duration: "1h",
        priority: "up",
        color: "amber",
        category: "Meeting",
      },
      {
        id: "evt-6",
        title: "Movie night (Tenet)",
        icon: "🎬",
        date: "2025-09-16",
        time: "8:00 PM",
        duration: "3h",
        priority: "down",
        color: "purple",
        category: "Social",
      },
      {
        id: "evt-7",
        title: "Lucas's Birthday",
        icon: "🎂",
        date: "2025-09-28",
        time: "5:30 PM",
        duration: "2h",
        priority: "up",
        color: "pink",
        category: "Birthday",
      },
      {
        id: "evt-8",
        title: "Meeting with CTO",
        icon: "💼",
        date: "2025-09-30",
        time: "12:00 PM",
        duration: "1h",
        priority: "up",
        color: "blue",
        category: "Meeting",
      },
    ] as EventEntry[],
  }),
  getters: {
    nearest(state) {
      return [...state.events]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);
    },
    byDate(state) {
      const map: Record<string, EventEntry[]> = {};
      state.events.forEach((event) => {
        if (!map[event.date]) map[event.date] = [];
        map[event.date].push(event);
      });
      return map;
    },
  },
  actions: {
    addEvent(input: Omit<EventEntry, "id">) {
      const event: EventEntry = { id: `evt-${Date.now()}`, ...input };
      this.events.push(event);
      return event;
    },
  },
  persist: {
    key: "pinia-eventStore",
    storage: localStorage,
  },
});
