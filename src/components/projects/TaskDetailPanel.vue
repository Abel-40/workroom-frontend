<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { Check, Pencil, Sparkles, Trash2, X } from "lucide-vue-next";
import TaskStatusPill from "@/components/cards/TaskStatusPill.vue";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog.vue";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/stores/authStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useProjectStore } from "@/stores/projectStore";
import { useAiStore } from "@/stores/aiStore";
import { useToast } from "@/components/ui/toast/use-toast";
import { formatHoursToDuration, parseDurationToMinutes } from "@/lib/duration";
import { formatDateTime } from "@/lib/dates";
import { createPollSignal, type PollSignal } from "@/lib/pollUntilTerminal";
import { canManageTask } from "@/lib/projectPermissions";
import type { Project, TaskType } from "@/types/types";

const props = defineProps<{
  task: TaskType;
  project: Project | null | undefined;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const authStore = useAuthStore();
const directoryStore = useDirectoryStore();
const projectsStore = useProjectStore();
const aiStore = useAiStore();
const { toast } = useToast();
const archiving = ref(false);

// Editing/archiving a task follows the backend's manage-task rule: the
// task's creator, or whoever can manage its parent project (current owner,
// company admin, or the department leader of the project's own department).
const canEdit = computed(() =>
  canManageTask(
    props.task,
    props.project,
    authStore.logedInUserInfo.user?.id,
    authStore.logedInUserInfo.role,
    authStore.logedInUserInfo.departmentId
  )
);

const NONE = "__none__";
const isEditing = ref(false);
const saving = ref(false);
const form = reactive({
  title: "",
  description: "",
  priority: "medium" as TaskType["priority"],
  deadline: "",
  estimatedTime: "",
  departmentId: NONE as string,
  taskTypeId: NONE as string,
});

const startEditing = () => {
  form.title = props.task.title;
  form.description = props.task.description;
  form.priority = props.task.priority;
  form.deadline = props.task.deadline ? props.task.deadline.slice(0, 10) : "";
  form.estimatedTime = props.task.estimatedTimeHours ? formatHoursToDuration(props.task.estimatedTimeHours) : "";
  form.departmentId = props.task.departmentId ?? NONE;
  form.taskTypeId = props.task.taskTypeId ?? NONE;
  isEditing.value = true;
};

const saveEditing = async () => {
  saving.value = true;
  const estimateMinutes = parseDurationToMinutes(form.estimatedTime);
  const { error } = await projectsStore.updateTask(props.task.id, {
    title: form.title,
    description: form.description,
    priority: form.priority,
    deadline: form.deadline || null,
    estimatedTimeHours: estimateMinutes > 0 ? estimateMinutes / 60 : null,
    departmentId: form.departmentId === NONE ? null : form.departmentId,
    taskTypeId: form.taskTypeId === NONE ? null : form.taskTypeId,
  });
  saving.value = false;
  if (error) {
    toast({ title: "Task not updated", description: error, variant: "destructive" });
    return;
  }
  isEditing.value = false;
};

const toggleEdit = () => {
  if (isEditing.value) saveEditing();
  else startEditing();
};

const formatTimestamp = formatDateTime;

const isDeleteDialogOpen = ref(false);
const archiveTask = async () => {
  archiving.value = true;
  const ok = await projectsStore.archiveTask(props.task.id);
  archiving.value = false;
  isDeleteDialogOpen.value = false;
  if (!ok) {
    toast({ title: "Task not archived", description: "Something went wrong. Please try again.", variant: "destructive" });
    return;
  }
  emit("close");
};

// Regenerating a saved AI-generated task's description never changes
// creator/assignee/project -- the API contract for this call simply doesn't
// accept those fields, so there's nothing here that could touch them.
let regenSignal: PollSignal | null = null;
const regeneration = computed(() => aiStore.taskRegenerationFor(props.task.id));
const regenerating = computed(() => {
  const status = regeneration.value?.status;
  return status === "pending" || status === "processing";
});
const regenerateAiContent = async () => {
  regenSignal = createPollSignal();
  const { error } = await aiStore.regenerateTaskDescription(props.task.id, "", regenSignal);
  if (error) toast({ title: "Regeneration failed", description: error, variant: "destructive" });
};
</script>

<template>
  <div class="w-full rounded-2xl border border-border bg-card p-4">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-sm font-semibold text-ink">Task Details</h3>
      <div class="flex items-center gap-2">
        <button
          v-if="canEdit && task.source === 'ai_generated'"
          type="button"
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border text-subtle hover:border-primary/40 disabled:opacity-50"
          title="Regenerate AI content"
          :disabled="regenerating"
          @click="regenerateAiContent"
        >
          <Sparkles class="h-3.5 w-3.5" :class="{ 'animate-pulse text-primary': regenerating }" />
        </button>
        <button
          v-if="canEdit"
          type="button"
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border disabled:opacity-50"
          :class="isEditing ? 'border-primary bg-primary/10 text-primary' : 'border-border text-subtle hover:border-primary/40'"
          :title="isEditing ? 'Save changes' : 'Edit task'"
          :disabled="saving"
          @click="toggleEdit"
        >
          <Check v-if="isEditing" class="h-3.5 w-3.5" />
          <Pencil v-else class="h-3.5 w-3.5" />
        </button>
        <button
          v-if="canEdit"
          type="button"
          class="text-subtle hover:text-red-500 disabled:opacity-50"
          title="Archive task"
          :disabled="archiving"
          @click="isDeleteDialogOpen = true"
        >
          <Trash2 class="h-4 w-4" />
        </button>
        <button type="button" class="text-subtle hover:text-ink" @click="$emit('close')">
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div class="mb-3 flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <p class="text-xs font-mono text-subtle">{{ task.id.slice(0, 8) }}</p>
        <input
          v-if="isEditing"
          v-model="form.title"
          class="mt-1 w-full rounded-lg border border-border px-2 py-1 text-lg font-semibold text-ink focus:border-primary focus:outline-none"
        />
        <h4 v-else class="text-lg font-semibold text-ink">{{ task.title }}</h4>
      </div>
      <TaskStatusPill :task="task" />
    </div>

    <Textarea
      v-if="isEditing"
      v-model="form.description"
      rows="3"
      placeholder="Description"
      class="mb-4 rounded-xl text-sm"
    />
    <p v-else class="mb-4 whitespace-pre-line text-sm leading-relaxed text-subtle">
      {{ task.description || "No description provided." }}
    </p>

    <div v-if="isEditing" class="mb-4 grid grid-cols-2 gap-3">
      <div class="space-y-1">
        <p class="text-xs text-subtle">Priority</p>
        <Select v-model="form.priority">
          <SelectTrigger class="rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div class="space-y-1">
        <p class="text-xs text-subtle">Dead Line</p>
        <Input v-model="form.deadline" type="date" class="rounded-xl" />
      </div>
      <div class="space-y-1">
        <p class="text-xs text-subtle">Estimate</p>
        <Input v-model="form.estimatedTime" placeholder="e.g. 2d 4h" class="rounded-xl" />
      </div>
      <div class="space-y-1">
        <p class="text-xs text-subtle">Department</p>
        <Select v-model="form.departmentId">
          <SelectTrigger class="rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem :value="NONE">None</SelectItem>
              <SelectItem v-for="d in directoryStore.departments" :key="d.id" :value="d.id">{{ d.name }}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div class="col-span-2 space-y-1">
        <p class="text-xs text-subtle">Task Type</p>
        <Select v-model="form.taskTypeId">
          <SelectTrigger class="rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem :value="NONE">None</SelectItem>
              <SelectItem v-for="t in directoryStore.taskTypes" :key="t.id" :value="t.id">{{ t.name }}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div class="border-t border-border pt-4 text-sm text-subtle">
      Last updated {{ formatTimestamp(task.updatedAt) }}
    </div>

    <ConfirmDeleteDialog
      v-model:open="isDeleteDialogOpen"
      title="Delete this task?"
      :description="`This permanently deletes “${task.title}”. This can't be undone.`"
      :loading="archiving"
      @confirm="archiveTask"
    />
  </div>
</template>
