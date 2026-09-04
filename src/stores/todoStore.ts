// Personal to-do lists. Private to the signed-in user by construction: the
// backend scopes every one of these endpoints to the caller and offers no way
// to read anyone else's (see todos/services.py), so there is no "whose todos"
// parameter anywhere in this store, and there is no sharing action -- unlike
// pagesStore, which has one because folders ARE shareable.
import { defineStore } from "pinia";
import type { ApiResponse } from "@/types/types";
import axiosInstance from "@/plugins/axios";

export type TodoSource = "manual" | "ai_generated";
export type TodoScope = "all" | "due" | "today" | "overdue" | "upcoming";
export type GenerationStatus = "pending" | "processing" | "completed" | "failed";

export interface Todo {
  id: string;
  title: string;
  notes: string;
  dueDate: string;
  position: number;
  isDone: boolean;
  completedAt: string | null;
  source: TodoSource;
  // Present whenever the todo was built from a task. taskId goes null if the
  // task is later reassigned away from this user -- the backend revokes the
  // live link but keeps the title, so the note still makes sense.
  taskId: string | null;
  taskTitle: string;
  taskStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TodoSummary {
  overdue: number;
  dueToday: number;
  upcoming: number;
  open: number;
  today: string;
}

export interface AssignedTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  deadline: string;
  projectTitle: string | null;
}

export interface TodoGeneration {
  id: string;
  mode: "today" | "task";
  status: GenerationStatus;
  taskId: string | null;
  windowStart: string;
  windowEnd: string;
  todoCount: number;
  errorMessage: string;
}

type TodoApi = {
  id: string; title: string; notes: string; due_date: string; position: number;
  is_done: boolean; completed_at: string | null; source: TodoSource;
  task_id: string | null; task_title: string; task_status?: string;
  created_at: string; updated_at: string;
};

type GenerationApi = {
  id: string; mode: "today" | "task"; status: GenerationStatus; task_id: string | null;
  window_start: string; window_end: string; todo_count: number; error_message: string;
};

type AssignedTaskApi = {
  id: string; title: string; status: string; priority: string; deadline: string; project_title: string | null;
};

const mapTodo = (api: TodoApi): Todo => ({
  id: api.id,
  title: api.title,
  notes: api.notes,
  dueDate: api.due_date,
  position: api.position,
  isDone: api.is_done,
  completedAt: api.completed_at,
  source: api.source,
  taskId: api.task_id,
  taskTitle: api.task_title,
  taskStatus: api.task_status,
  createdAt: api.created_at,
  updatedAt: api.updated_at,
});

const mapGeneration = (api: GenerationApi): TodoGeneration => ({
  id: api.id,
  mode: api.mode,
  status: api.status,
  taskId: api.task_id,
  windowStart: api.window_start,
  windowEnd: api.window_end,
  todoCount: api.todo_count,
  errorMessage: api.error_message,
});

const mapAssignedTask = (api: AssignedTaskApi): AssignedTask => ({
  id: api.id,
  title: api.title,
  status: api.status,
  priority: api.priority,
  deadline: api.deadline,
  projectTitle: api.project_title,
});

const errorOf = (error: any, fallback: string) => error?.response?.data?.message || fallback;

export const useTodoStore = defineStore("todos", {
  state: () => ({
    todos: [] as Todo[],
    // The signed-in user's own calendar day, as the BACKEND computed it from
    // their timezone. Never derived from the browser clock: the two can
    // disagree, and the backend's answer is the one every due_date was
    // filtered and grouped against.
    today: "" as string,
    summary: null as TodoSummary | null,
    assignedTasks: [] as AssignedTask[],
    generation: null as TodoGeneration | null,
    loading: false,
    generating: false,
    includeDone: false,
    scope: "all" as TodoScope,
  }),

  getters: {
    // The backend already returns nearest-day-first; this only groups the
    // run of items sharing a day, preserving that order.
    groupedByDay(state): Array<{ date: string; todos: Todo[] }> {
      const groups: Array<{ date: string; todos: Todo[] }> = [];
      for (const todo of state.todos) {
        const last = groups[groups.length - 1];
        if (last && last.date === todo.dueDate) last.todos.push(todo);
        else groups.push({ date: todo.dueDate, todos: [todo] });
      }
      return groups;
    },
    overdueCount: (state) => state.todos.filter((t) => !t.isDone && t.dueDate < state.today).length,
    isGenerating: (state) =>
      state.generating || state.generation?.status === "pending" || state.generation?.status === "processing",
  },

  actions: {
    async fetchTodos() {
      this.loading = true;
      try {
        const { data } = await axiosInstance.get<ApiResponse<{ results: TodoApi[]; today: string }>>("/todos/", {
          params: { scope: this.scope, include_done: this.includeDone, page_size: 100 },
        });
        this.todos = data.data.results.map(mapTodo);
        this.today = data.data.today;
      } catch (error) {
        console.error("Failed to load todos:", error);
      } finally {
        this.loading = false;
      }
    },

    async fetchSummary() {
      try {
        const { data } = await axiosInstance.get<ApiResponse<TodoSummary & { due_today: number }>>("/todos/summary/");
        const body = data.data as any;
        this.summary = {
          overdue: body.overdue,
          dueToday: body.due_today,
          upcoming: body.upcoming,
          open: body.open,
          today: body.today,
        };
        if (!this.today) this.today = body.today;
      } catch (error) {
        console.error("Failed to load todo summary:", error);
      }
    },

    // The picker behind "build to-dos from a task" -- only ever the caller's
    // own assigned work, enforced server-side.
    async fetchAssignedTasks() {
      try {
        const { data } = await axiosInstance.get<ApiResponse<{ results: AssignedTaskApi[] }>>(
          "/tasks/assigned-to-me/",
          { params: { page_size: 50 } },
        );
        this.assignedTasks = data.data.results.map(mapAssignedTask);
      } catch (error) {
        console.error("Failed to load assigned tasks:", error);
      }
    },

    async createTodo(payload: { title: string; dueDate: string; notes?: string; taskId?: string | null }) {
      try {
        const { data } = await axiosInstance.post<ApiResponse<{ todo: TodoApi }>>("/todos/", {
          title: payload.title,
          due_date: payload.dueDate,
          notes: payload.notes ?? "",
          task_id: payload.taskId || null,
        });
        this.insertSorted(mapTodo(data.data.todo));
        void this.fetchSummary();
        return {};
      } catch (error: any) {
        return { error: errorOf(error, "Couldn't create the to-do") };
      }
    },

    async updateTodo(id: string, changes: Partial<Pick<Todo, "title" | "notes" | "dueDate" | "position" | "isDone">>) {
      const body: Record<string, unknown> = {};
      if (changes.title !== undefined) body.title = changes.title;
      if (changes.notes !== undefined) body.notes = changes.notes;
      if (changes.dueDate !== undefined) body.due_date = changes.dueDate;
      if (changes.position !== undefined) body.position = changes.position;
      if (changes.isDone !== undefined) body.is_done = changes.isDone;
      try {
        const { data } = await axiosInstance.patch<ApiResponse<{ todo: TodoApi }>>(`/todos/${id}/`, body);
        const updated = mapTodo(data.data.todo);
        this.todos = this.todos.filter((t) => t.id !== id);
        // A completed item drops out of the default list; a moved one has to
        // be re-placed, since its day (and position) may both have changed.
        if (!updated.isDone || this.includeDone) this.insertSorted(updated);
        void this.fetchSummary();
        return {};
      } catch (error: any) {
        return { error: errorOf(error, "Couldn't update the to-do") };
      }
    },

    async deleteTodo(id: string) {
      try {
        await axiosInstance.delete(`/todos/${id}/`);
        this.todos = this.todos.filter((t) => t.id !== id);
        void this.fetchSummary();
        return {};
      } catch (error: any) {
        return { error: errorOf(error, "Couldn't delete the to-do") };
      }
    },

    // Kicks off an async generation; the result arrives via pollGeneration.
    async generateTodos(payload: {
      mode: "today" | "task";
      taskId?: string | null;
      days?: number;
      instructions?: string;
      maxTodos?: number;
    }) {
      this.generating = true;
      try {
        const { data } = await axiosInstance.post<ApiResponse<{ generation: GenerationApi }>>("/todos/generate/", {
          mode: payload.mode,
          task_id: payload.taskId || null,
          days: payload.days ?? 7,
          instructions: payload.instructions ?? "",
          max_todos: payload.maxTodos ?? 10,
        });
        this.generation = mapGeneration(data.data.generation);
        return {};
      } catch (error: any) {
        this.generating = false;
        // A 409 carries the generation already in flight -- adopt it rather
        // than reporting a failure the user can do nothing about.
        const inFlight = error?.response?.data?.data?.generation;
        if (error?.response?.status === 409 && inFlight) {
          this.generation = mapGeneration(inFlight);
          return {};
        }
        return { error: errorOf(error, "Couldn't start generating your to-dos") };
      }
    },

    async pollGeneration(): Promise<{ done: boolean; error?: string }> {
      if (!this.generation) return { done: true };
      try {
        const { data } = await axiosInstance.get<ApiResponse<{ generation: GenerationApi }>>(
          `/todos/generations/${this.generation.id}/`,
        );
        this.generation = mapGeneration(data.data.generation);
        if (this.generation.status === "completed") {
          this.generating = false;
          await this.fetchTodos();
          void this.fetchSummary();
          return { done: true };
        }
        if (this.generation.status === "failed") {
          this.generating = false;
          return { done: true, error: "We couldn't build your to-do list. Please try again in a few minutes." };
        }
        return { done: false };
      } catch (error: any) {
        this.generating = false;
        return { done: true, error: errorOf(error, "Lost track of the generation") };
      }
    },

    async dismissGeneration(generationId: string) {
      try {
        await axiosInstance.post(`/todos/generations/${generationId}/dismiss/`);
        await this.fetchTodos();
        void this.fetchSummary();
        return {};
      } catch (error: any) {
        return { error: errorOf(error, "Couldn't dismiss those to-dos") };
      }
    },

    // Keeps the local list in the same nearest-first order the API returns,
    // so a newly created item lands where a refetch would have put it.
    insertSorted(todo: Todo) {
      const index = this.todos.findIndex(
        (t) => t.dueDate > todo.dueDate || (t.dueDate === todo.dueDate && t.position > todo.position),
      );
      if (index === -1) this.todos.push(todo);
      else this.todos.splice(index, 0, todo);
    },
  },
});
