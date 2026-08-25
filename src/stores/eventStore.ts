import { defineStore } from "pinia";
import axiosInstance from "@/plugins/axios";
import type { ApiResponse } from "@/types/types";

export interface EventAttendee {
  id: string;
  name: string;
}

export interface EventEntry {
  id: string;
  title: string;
  description: string;
  eventTypeId: string | null;
  eventTypeName: string | null;
  departmentId: string | null;
  departmentName: string | null;
  teamId: string | null;
  teamName: string | null;
  organizerId: string | null;
  organizerName: string | null;
  attendees: EventAttendee[];
  startAt: string;
  endAt: string | null;
  location: string;
  isRecurring: boolean;
  recurrenceCadence: "daily" | "weekly" | "monthly" | null;
  recurrenceDays: string[];
}

type EventApi = {
  id: string;
  title: string;
  description: string;
  company_id: string;
  event_type_id: string | null;
  event_type_name: string | null;
  department_id: string | null;
  department_name: string | null;
  team_id: string | null;
  team_name: string | null;
  organizer_id: string | null;
  organizer_name: string | null;
  attendees: EventAttendee[];
  start_at: string;
  end_at: string | null;
  location: string;
  is_recurring: boolean;
  recurrence_cadence: "daily" | "weekly" | "monthly" | null;
  recurrence_days: string[];
};

type PaginationMeta = { count: number; page: number; page_size: number; has_next: boolean };

const mapEvent = (e: EventApi): EventEntry => ({
  id: e.id,
  title: e.title,
  description: e.description,
  eventTypeId: e.event_type_id,
  eventTypeName: e.event_type_name,
  departmentId: e.department_id,
  departmentName: e.department_name,
  teamId: e.team_id,
  teamName: e.team_name,
  organizerId: e.organizer_id,
  organizerName: e.organizer_name,
  attendees: e.attendees,
  startAt: e.start_at,
  endAt: e.end_at,
  location: e.location,
  isRecurring: e.is_recurring,
  recurrenceCadence: e.recurrence_cadence,
  recurrenceDays: e.recurrence_days,
});

export interface EventFilters {
  eventTypeId?: string;
  departmentId?: string;
  teamId?: string;
  startDate?: string;
  endDate?: string;
  mine?: boolean;
  page?: number;
  pageSize?: number;
}

export interface EventInput {
  title: string;
  description?: string;
  eventTypeId?: string | null;
  departmentId?: string | null;
  teamId?: string | null;
  startAt: string;
  endAt?: string | null;
  location?: string;
  attendeeIds?: string[];
  isRecurring?: boolean;
  recurrenceCadence?: "daily" | "weekly" | "monthly" | null;
  recurrenceDays?: string[];
}

const toApiBody = (input: Partial<EventInput>) => ({
  title: input.title,
  description: input.description,
  event_type_id: input.eventTypeId,
  department_id: input.departmentId,
  team_id: input.teamId,
  start_at: input.startAt,
  end_at: input.endAt,
  location: input.location,
  attendee_ids: input.attendeeIds,
  is_recurring: input.isRecurring,
  recurrence_cadence: input.recurrenceCadence,
  recurrence_days: input.recurrenceDays,
});

// Real, tenant-scoped, backend-driven event data (replaces the earlier
// local-mock/localStorage version). No `persist` block -- this is server
// data, caching it client-side risks showing stale/cross-account data on a
// shared machine.
export const useEventStore = defineStore("eventStore", {
  state: () => ({
    events: [] as EventEntry[],
    meta: null as PaginationMeta | null,
    loading: false,
  }),
  getters: {
    // Day-boundary, not exact-timestamp: a meeting scheduled for 9am today
    // is still "today's event" at 5pm, not something to drop off the
    // dashboard the moment its start time ticks past. Comparing against the
    // precise current timestamp meant the widget could go blank all
    // afternoon on a day that still has events on it.
    nearest(state) {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const cutoff = startOfToday.getTime();
      return [...state.events]
        .filter((e) => new Date(e.startAt).getTime() >= cutoff)
        .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
        .slice(0, 3);
    },
  },
  actions: {
    async fetchEvents(filters: EventFilters = {}) {
      this.loading = true;
      try {
        const { data } = await axiosInstance.get<ApiResponse<{ results: EventApi[]; meta: PaginationMeta }>>(
          "/events/",
          {
            params: {
              event_type_id: filters.eventTypeId,
              department_id: filters.departmentId,
              team_id: filters.teamId,
              start_date: filters.startDate,
              end_date: filters.endDate,
              mine: filters.mine,
              page: filters.page,
              page_size: filters.pageSize,
            },
          }
        );
        this.events = data.data.results.map(mapEvent);
        this.meta = data.data.meta;
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        this.loading = false;
      }
    },

    async fetchEvent(id: string): Promise<EventEntry | null> {
      try {
        const { data } = await axiosInstance.get<ApiResponse<{ event: EventApi }>>(`/events/${id}/`);
        return mapEvent(data.data.event);
      } catch (error) {
        console.error("Failed to fetch event:", error);
        return null;
      }
    },

    async createEvent(input: EventInput): Promise<{ event?: EventEntry; error?: string }> {
      try {
        const { data } = await axiosInstance.post<ApiResponse<{ event: EventApi }>>("/events/", toApiBody(input));
        const event = mapEvent(data.data.event);
        this.events.push(event);
        return { event };
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to create event" };
      }
    },

    async updateEvent(id: string, input: Partial<EventInput>): Promise<{ event?: EventEntry; error?: string }> {
      try {
        const { data } = await axiosInstance.patch<ApiResponse<{ event: EventApi }>>(
          `/events/${id}/`,
          toApiBody(input)
        );
        const event = mapEvent(data.data.event);
        const index = this.events.findIndex((e) => e.id === id);
        if (index !== -1) this.events[index] = event;
        return { event };
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to update event" };
      }
    },

    async deleteEvent(id: string): Promise<{ error?: string }> {
      try {
        await axiosInstance.delete(`/events/${id}/`);
        this.events = this.events.filter((e) => e.id !== id);
        return {};
      } catch (error: any) {
        return { error: error.response?.data?.message || "Failed to delete event" };
      }
    },
  },
});
