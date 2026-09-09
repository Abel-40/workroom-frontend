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
import { useProjectAccess } from "@/composables/useProjectAccess";
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

// The server decides, and says so on the project (see useProjectAccess).
// This used to call lib/projectPermissions.canManageTask, which granted on
// `task.createdById` -- a rule the backend dropped when created_by became
// provenance rather than a claim, and which nothing here noticed.
const access = useProjectAccess(computed(() => props.project));

// Two different rights, because the server splits them. Management owns what
// the work *is*; the assignee owns how it gets done.
const canEdit = computed(() => access.canManage.value || access.canEditOwnTask(props.task));
const canManage = access.canManage;

// A deadline only needs a reason when it actually moves. Comparing the date
// part matches what the form edits.
const deadlineChanged = computed(() => {
  const current = props.task.deadline ? props.task.deadline.slice(0, 10) : "";
  return !!form.deadline && form.deadline !== current;
});

const canSave = computed(() => !deadlineChanged.value || form.deadlineReason.trim().length > 0);

const NONE = "__none__";
const isEditing = ref(false);
const saving = ref(false);
const form = reactive({
  title: "",
  description: "",
  priority: "medium" as TaskType["priority"],
  deadline: "",
  // Required by the server whenever the deadline actually moves. A date
  // changing under the people doing the work is exactly the change that needs
  // to carry an explanation with it, so the form collects one rather than
  // discovering the requirement as a 400.
  deadlineReason: "",
  estimatedTime: "",
  departmentId: NONE as string,
  taskTypeId: NONE as string,
});

const startEditing = () => {
  form.title = props.task.title;
  form.description = props.task.description;
  form.priority = props.task.priority;
  form.deadline = props.task.deadline ? props.task.deadline.slice(0, 10) : "";
  form.deadlineReason = "";
  form.estimatedTime = props.task.estimatedTimeHours ? formatHoursToDuration(props.task.estimatedTimeHours) : "";
  form.departmentId = props.task.departmentId ?? NONE;
  form.taskTypeId = props.task.taskTypeId ?? NONE;
  isEditing.value = true;
};

// A task's fields answer to two different people, and the server refuses a
// body that mixes them rather than half-applying it. So the save is split the
// same way: whichever group this user owns is what gets sent.
const saveEditing = async () => {
  saving.value = true;
  const estimateMinutes = parseDurationToMinutes(form.estimatedTime);

  let error: string | undefined;

  if (access.canManage.value) {
    ({ error } = await projectsStore.updateTask(props.task.id, {
      title: form.title,
      priority: form.priority,
      departmentId: form.departmentId === NONE ? null : form.departmentId,
      taskTypeId: form.taskTypeId === NONE ? null : form.taskTypeId,
    }));
    if (!error) {
      // Assignee-owned fields go in their own request, because the server
      // will not take them in the same body as the ones above.
      ({ error } = await projectsStore.updateTask(props.task.id, {
        description: form.description,
        estimatedTimeHours: estimateMinutes > 0 ? estimateMinutes / 60 : null,
      }));
    }
    if (!error && deadlineChanged.value) {
      ({ error } = await projectsStore.changeTaskDeadline(
        props.task.id,
        new Date(form.deadline).toISOString(),
        form.deadlineReason.trim(),
      ));
    }
  } else {
    // The assignee's half. Title, priority, type, department and the deadline
    // are not theirs to change, so they are not sent -- and the form does not
    // offer them (see the template).
    ({ error } = await projectsStore.updateTask(props.task.id, {
      description: form.description,
      estimatedTimeHours: estimateMinutes > 0 ? estimateMinutes / 60 : null,
    }));
  }
  saving.value = false;
  if (error) {
    toast({ title: "Task not updated", description: error, variant: "destructive" });
    return;
  }
  isEditing.value = false;
};

const toggleEdit = () => {
  if (isEditing.value) {
    if (!canSave.value) return;
    saveEditing();
  }
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
          v-if="canEdit"
          type="button"
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border text-subtle hover:border-primary/40 disabled:opacity-50"
          :title="task.source === 'ai_generated' ? 'Regenerate AI content' : 'Generate description with AI'"
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
          :disabled="!canManage"
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
      <!-- What the work *is* belongs to whoever manages the project. Hidden
           rather than disabled for an assignee: a greyed-out control they can
           never use is a worse answer than not offering it. -->
      <div v-if="canManage" class="space-y-1">
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
      <div v-if="canManage" class="space-y-1">
        <p class="text-xs text-subtle">Dead Line</p>
        <Input v-model="form.deadline" type="date" class="rounded-xl" />
      </div>
      <!-- Only when the date actually moves. The server requires it, records
           it on the audit row, and puts it in the notification the assignee
           gets -- a date changing with no explanation is what makes a deadline
           feel arbitrary. -->
      <div v-if="canManage && deadlineChanged" class="col-span-2 space-y-1">
        <p class="text-xs text-subtle">Why is the deadline moving?</p>
        <Input
          v-model="form.deadlineReason"
          placeholder="e.g. scope grew after the design review"
          class="rounded-xl"
        />
        <p v-if="!canSave" class="text-xs text-destructive">
          A reason is required before the new date can be saved.
        </p>
      </div>
      <div class="space-y-1">
        <p class="text-xs text-subtle">Estimate</p>
        <Input v-model="form.estimatedTime" placeholder="e.g. 2d 4h" class="rounded-xl" />
      </div>
      <div v-if="canManage" class="space-y-1">
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
      <div v-if="canManage" class="col-span-2 space-y-1">
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
