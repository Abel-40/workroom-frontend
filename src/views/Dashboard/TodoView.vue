<script setup lang="ts">
// The personal to-do screen. Available to every role -- a to-do list is
// individual, not managerial, so there is deliberately no role branching
// anywhere in this file (contrast EmployeesView/DepartmentsView, which do
// branch). Nothing here can ever show another person's items: the backend
// scopes every endpoint to the caller.
import { computed, onMounted, onUnmounted, ref } from "vue";
import { CalendarDays, Check, Loader2, Plus, Sparkles, Trash2, Undo2 } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast/use-toast";
import { useTodoStore, type TodoScope } from "@/stores/todoStore";

const todoStore = useTodoStore();
const { toast } = useToast();

const NO_TASK = "__none__";

const newTitle = ref("");
const newNotes = ref("");
const newDueDate = ref("");
const newTaskId = ref(NO_TASK);
const saving = ref(false);
const showComposer = ref(false);

const generateMode = ref<"today" | "task">("today");
const generateTaskId = ref(NO_TASK);
const generateInstructions = ref("");
const showGenerator = ref(false);

const SCOPES: Array<{ value: TodoScope; label: string }> = [
  { value: "all", label: "All" },
  { value: "due", label: "Due now" },
  { value: "today", label: "Today" },
  { value: "overdue", label: "Overdue" },
  { value: "upcoming", label: "Upcoming" },
];

// Polls the async generation. Cleared on unmount so navigating away can't
// leave a timer running against a store the view no longer owns.
let pollTimer: ReturnType<typeof setInterval> | null = null;
const stopPolling = () => {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = null;
};

onMounted(async () => {
  await Promise.all([todoStore.fetchTodos(), todoStore.fetchSummary(), todoStore.fetchAssignedTasks()]);
  // Default a new to-do to today. The day is still an explicit, editable
  // field -- it is required, and the user can move it -- this only spares
  // them typing the most common answer.
  newDueDate.value = todoStore.today;
});

onUnmounted(stopPolling);

const dayLabel = (date: string) => {
  if (date === todoStore.today) return "Today";
  const today = new Date(`${todoStore.today}T00:00:00`);
  const target = new Date(`${date}T00:00:00`);
  const days = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  const formatted = target.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  return days < 0 ? `${formatted} · overdue` : formatted;
};

const isOverdue = (date: string) => !!todoStore.today && date < todoStore.today;

const canSubmit = computed(() => newTitle.value.trim().length > 0 && !!newDueDate.value);

const resetComposer = () => {
  newTitle.value = "";
  newNotes.value = "";
  newTaskId.value = NO_TASK;
  newDueDate.value = todoStore.today;
};

const addTodo = async () => {
  if (!canSubmit.value) return;
  saving.value = true;
  const { error } = await todoStore.createTodo({
    title: newTitle.value,
    notes: newNotes.value,
    dueDate: newDueDate.value,
    taskId: newTaskId.value === NO_TASK ? null : newTaskId.value,
  });
  saving.value = false;
  if (error) {
    toast({ title: "Couldn't add that", description: error, variant: "destructive" });
    return;
  }
  resetComposer();
  showComposer.value = false;
};

const toggleDone = async (id: string, value: boolean | "indeterminate") => {
  // Checkbox can emit "indeterminate"; a to-do is only ever done or not.
  const isDone = value === true;
  const { error } = await todoStore.updateTodo(id, { isDone });
  if (error) toast({ title: "Couldn't update that", description: error, variant: "destructive" });
};

const moveToDay = async (id: string, value: string | number) => {
  const dueDate = String(value ?? '');
  if (!dueDate) return;
  const { error } = await todoStore.updateTodo(id, { dueDate });
  if (error) toast({ title: "Couldn't move that", description: error, variant: "destructive" });
};

const removeTodo = async (id: string) => {
  const { error } = await todoStore.deleteTodo(id);
  if (error) toast({ title: "Couldn't delete that", description: error, variant: "destructive" });
};

const changeScope = async (scope: TodoScope) => {
  todoStore.scope = scope;
  await todoStore.fetchTodos();
};

const toggleShowDone = async () => {
  todoStore.includeDone = !todoStore.includeDone;
  await todoStore.fetchTodos();
};

const startGeneration = async () => {
  const { error } = await todoStore.generateTodos({
    mode: generateMode.value,
    taskId: generateMode.value === "task" && generateTaskId.value !== NO_TASK ? generateTaskId.value : null,
    instructions: generateInstructions.value,
  });
  if (error) {
    toast({ title: "Couldn't start", description: error, variant: "destructive" });
    return;
  }
  showGenerator.value = false;
  generateInstructions.value = "";
  stopPolling();
  pollTimer = setInterval(async () => {
    const { done, error: pollError } = await todoStore.pollGeneration();
    if (!done) return;
    stopPolling();
    if (pollError) {
      toast({ title: "Generation failed", description: pollError, variant: "destructive" });
      return;
    }
    const count = todoStore.generation?.todoCount ?? 0;
    toast({ title: `${count} to-${count === 1 ? "do" : "dos"} added`, description: "Review them below." });
  }, 2000);
};

const dismissGenerated = async () => {
  if (!todoStore.generation) return;
  const { error } = await todoStore.dismissGeneration(todoStore.generation.id);
  if (error) {
    toast({ title: "Couldn't dismiss", description: error, variant: "destructive" });
    return;
  }
  todoStore.generation = null;
};

const canGenerate = computed(
  () => generateMode.value === "today" || generateTaskId.value !== NO_TASK,
);

const lastGenerationIsReviewable = computed(
  () => todoStore.generation?.status === "completed" && todoStore.generation.todoCount > 0,
);
</script>

<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold text-ink">My To-Do</h1>
        <p class="text-sm text-muted-foreground">
          Private to you. Nobody else in your company can see this list.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <Button variant="outline" class="rounded-xl" @click="showGenerator = !showGenerator">
          <Sparkles class="mr-2 h-4 w-4" /> Generate with AI
        </Button>
        <Button class="rounded-xl" @click="showComposer = !showComposer">
          <Plus class="mr-2 h-4 w-4" /> Add to-do
        </Button>
      </div>
    </header>

    <!-- Counts double as the fastest way to jump to what's actually urgent. -->
    <div v-if="todoStore.summary" class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <button
        type="button"
        class="wr-well rounded-xl px-3 py-2 text-left transition hover:bg-accent"
        :class="todoStore.scope === 'overdue' ? 'ring-2 ring-primary' : ''"
        @click="changeScope('overdue')"
      >
        <span class="block text-lg font-semibold text-destructive">{{ todoStore.summary.overdue }}</span>
        <span class="block text-xs text-muted-foreground">Overdue</span>
      </button>
      <button
        type="button"
        class="wr-well rounded-xl px-3 py-2 text-left transition hover:bg-accent"
        :class="todoStore.scope === 'today' ? 'ring-2 ring-primary' : ''"
        @click="changeScope('today')"
      >
        <span class="block text-lg font-semibold text-ink">{{ todoStore.summary.dueToday }}</span>
        <span class="block text-xs text-muted-foreground">Today</span>
      </button>
      <button
        type="button"
        class="wr-well rounded-xl px-3 py-2 text-left transition hover:bg-accent"
        :class="todoStore.scope === 'upcoming' ? 'ring-2 ring-primary' : ''"
        @click="changeScope('upcoming')"
      >
        <span class="block text-lg font-semibold text-ink">{{ todoStore.summary.upcoming }}</span>
        <span class="block text-xs text-muted-foreground">Upcoming</span>
      </button>
      <button
        type="button"
        class="wr-well rounded-xl px-3 py-2 text-left transition hover:bg-accent"
        :class="todoStore.scope === 'all' ? 'ring-2 ring-primary' : ''"
        @click="changeScope('all')"
      >
        <span class="block text-lg font-semibold text-ink">{{ todoStore.summary.open }}</span>
        <span class="block text-xs text-muted-foreground">All open</span>
      </button>
    </div>

    <!-- AI generator -->
    <div v-if="showGenerator" class="wr-well space-y-3 rounded-2xl p-4">
      <p class="text-sm font-medium text-ink">Build a checklist from your assigned work</p>
      <p class="text-xs text-muted-foreground">
        Only tasks assigned to you can be used. The result lands straight in your private list — you can dismiss
        the whole batch if it isn't useful.
      </p>
      <div class="grid gap-3 sm:grid-cols-2">
        <Select v-model="generateMode">
          <SelectTrigger class="rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="today">Everything due today</SelectItem>
              <SelectItem value="task">One specific task</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select v-if="generateMode === 'task'" v-model="generateTaskId">
          <SelectTrigger class="rounded-xl"><SelectValue placeholder="Choose one of your tasks" /></SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem v-for="task in todoStore.assignedTasks" :key="task.id" :value="task.id">
                {{ task.title }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Input v-model="generateInstructions" class="rounded-xl" placeholder="Anything to focus on? (optional)" />
      <div class="flex items-center gap-2">
        <Button class="rounded-xl" :disabled="!canGenerate || todoStore.isGenerating" @click="startGeneration">
          <Loader2 v-if="todoStore.isGenerating" class="mr-2 h-4 w-4 animate-spin" />
          <Sparkles v-else class="mr-2 h-4 w-4" />
          {{ todoStore.isGenerating ? "Generating…" : "Generate" }}
        </Button>
        <Button variant="ghost" class="rounded-xl" @click="showGenerator = false">Cancel</Button>
      </div>
      <p v-if="generateMode === 'task' && !todoStore.assignedTasks.length" class="text-xs text-muted-foreground">
        You have no open tasks assigned to you right now.
      </p>
    </div>

    <div
      v-if="todoStore.isGenerating"
      class="flex items-center gap-2 rounded-xl border border-dashed px-3 py-2 text-sm text-muted-foreground"
    >
      <Loader2 class="h-4 w-4 animate-spin" />
      Building your checklist — this usually takes a few seconds.
    </div>

    <div
      v-else-if="lastGenerationIsReviewable"
      class="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-primary-soft px-3 py-2 text-sm"
    >
      <span class="text-primary">
        {{ todoStore.generation?.todoCount }} AI to-dos added. Not useful?
      </span>
      <Button variant="ghost" size="sm" class="rounded-lg" @click="dismissGenerated">
        <Undo2 class="mr-2 h-4 w-4" /> Dismiss the batch
      </Button>
    </div>

    <!-- Composer -->
    <div v-if="showComposer" class="wr-well space-y-3 rounded-2xl p-4">
      <Input v-model="newTitle" class="rounded-xl" placeholder="What needs doing?" @keyup.enter="addTodo" />
      <Textarea v-model="newNotes" class="rounded-xl" rows="2" placeholder="Notes (optional)" />
      <div class="grid gap-3 sm:grid-cols-2">
        <label class="space-y-1">
          <span class="text-xs text-subtle">Day <span class="text-destructive">*</span></span>
          <Input v-model="newDueDate" type="date" class="rounded-xl" />
        </label>
        <label class="space-y-1">
          <span class="text-xs text-subtle">Link to one of your tasks (optional)</span>
          <Select v-model="newTaskId">
            <SelectTrigger class="rounded-xl"><SelectValue placeholder="No task" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem :value="NO_TASK">No task</SelectItem>
                <SelectItem v-for="task in todoStore.assignedTasks" :key="task.id" :value="task.id">
                  {{ task.title }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </label>
      </div>
      <div class="flex items-center gap-2">
        <Button class="rounded-xl" :disabled="!canSubmit || saving" @click="addTodo">
          <Check class="mr-2 h-4 w-4" /> Add
        </Button>
        <Button variant="ghost" class="rounded-xl" @click="showComposer = false">Cancel</Button>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-2">
      <Button
        v-for="option in SCOPES"
        :key="option.value"
        size="sm"
        :variant="todoStore.scope === option.value ? 'default' : 'outline'"
        class="rounded-full"
        @click="changeScope(option.value)"
      >
        {{ option.label }}
      </Button>
      <Button size="sm" variant="ghost" class="rounded-full" @click="toggleShowDone">
        {{ todoStore.includeDone ? "Hide completed" : "Show completed" }}
      </Button>
    </div>

    <!-- The list. Nearest day first, overdue at the top -- the backend
         returns it in that order and groupedByDay preserves it. -->
    <div v-if="todoStore.loading" class="flex items-center gap-2 py-8 text-sm text-muted-foreground">
      <Loader2 class="h-4 w-4 animate-spin" /> Loading your list…
    </div>

    <div
      v-else-if="!todoStore.groupedByDay.length"
      class="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-12 text-center"
    >
      <CalendarDays class="h-8 w-8 text-muted-foreground" />
      <p class="text-sm font-medium text-ink">Nothing on your list</p>
      <p class="max-w-xs text-xs text-muted-foreground">
        Add something yourself, or let AI build a checklist from the work assigned to you.
      </p>
    </div>

    <div v-else class="space-y-5">
      <section v-for="group in todoStore.groupedByDay" :key="group.date" class="space-y-2">
        <h2
          class="text-xs font-semibold uppercase tracking-wide"
          :class="isOverdue(group.date) ? 'text-destructive' : 'text-muted-foreground'"
        >
          {{ dayLabel(group.date) }}
        </h2>
        <ul class="space-y-2">
          <li
            v-for="todo in group.todos"
            :key="todo.id"
            class="wr-well flex items-start gap-3 rounded-xl px-3 py-2.5"
          >
            <Checkbox
              class="mt-0.5"
              :model-value="todo.isDone"
              :aria-label="`Mark ${todo.title} as done`"
              @update:model-value="(value) => toggleDone(todo.id, value)"
            />
            <div class="min-w-0 flex-1">
              <p class="text-sm text-ink" :class="todo.isDone ? 'line-through text-muted-foreground' : ''">
                {{ todo.title }}
              </p>
              <p v-if="todo.notes" class="mt-0.5 text-xs text-muted-foreground">{{ todo.notes }}</p>
              <div class="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-subtle">
                <span v-if="todo.source === 'ai_generated'" class="inline-flex items-center gap-1 text-primary">
                  <Sparkles class="h-3 w-3" /> AI
                </span>
                <!-- taskTitle survives even when the live link is revoked
                     (the task was reassigned), so the note still makes sense. -->
                <span v-if="todo.taskTitle" class="truncate">{{ todo.taskTitle }}</span>
              </div>
            </div>
            <div class="flex shrink-0 items-center gap-1">
              <Input
                type="date"
                class="h-8 w-[9.5rem] rounded-lg text-xs"
                :model-value="todo.dueDate"
                :aria-label="`Move ${todo.title} to another day`"
                @update:model-value="(value) => moveToDay(todo.id, value)"
              />
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                :aria-label="`Delete ${todo.title}`"
                @click="removeTodo(todo.id)"
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </section>
</template>
