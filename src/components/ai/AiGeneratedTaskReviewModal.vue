<script setup lang="ts">
// Per-task review detail for a still-draft AI-generated task (spec §9-10):
// shows what the AI produced, lets the reviewer pick an eligible assignee,
// and leave a comment requesting a rewrite. Built on the existing
// CustomModal shell (plain right-drawer, no blurred backdrop) -- explicitly
// a modal per spec, unlike the main workspace entry point.
import { computed, ref, watch } from "vue";
import { AlertCircle, Sparkles } from "lucide-vue-next";
import CustomModal from "@/components/common/CustomModal.vue";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast/use-toast";
import { useAiStore, type AiGeneratedTask, type EligibleAssignee } from "@/stores/aiStore";
import { useDirectoryStore } from "@/stores/directoryStore";

const props = defineProps<{
  task: AiGeneratedTask | null;
  generationId: string;
  projectId: string;
  allTasks: AiGeneratedTask[];
  eligibleAssignees: EligibleAssignee[];
  readOnly: boolean;
}>();

const open = defineModel<boolean>("open", { required: true });

const aiStore = useAiStore();
const directoryStore = useDirectoryStore();
const { toast } = useToast();

const NONE = "__none__";
const commentDraft = ref("");
const savingComment = ref(false);
const savingAssignee = ref(false);

watch(
  () => props.task?.id,
  () => {
    commentDraft.value = props.task?.reviewerComment || "";
  },
  { immediate: true }
);

const dependencyTitles = computed(() => {
  if (!props.task) return [];
  return props.task.dependencyTempIds
    .map((tempId) => props.allTasks.find((t) => t.temporaryId === tempId)?.title)
    .filter((title): title is string => !!title);
});

const departmentName = computed(
  () => directoryStore.departments.find((d) => d.id === props.task?.suggestedDepartmentId)?.name ?? null
);
const taskTypeName = computed(
  () => directoryStore.taskTypes.find((t) => t.id === props.task?.suggestedTaskTypeId)?.name ?? null
);

const assigneeValue = computed({
  get: () => props.task?.assignedToId ?? NONE,
  set: async (value: string) => {
    if (!props.task) return;
    savingAssignee.value = true;
    const { error } = await aiStore.assignGeneratedTask(
      props.generationId, props.projectId, props.task.id, value === NONE ? null : value
    );
    savingAssignee.value = false;
    if (error) toast({ title: "Assignee not saved", description: error, variant: "destructive" });
  },
});

const saveComment = async () => {
  if (!props.task || !commentDraft.value.trim()) return;
  savingComment.value = true;
  const { error } = await aiStore.commentOnGeneratedTask(
    props.generationId, props.projectId, props.task.id, commentDraft.value.trim()
  );
  savingComment.value = false;
  if (error) toast({ title: "Comment not saved", description: error, variant: "destructive" });
};

const priorityBadge = (priority: string) => {
  switch (priority) {
    case "high": return "bg-red-100 text-red-600";
    case "low": return "bg-emerald-100 text-emerald-600";
    default: return "bg-amber-100 text-amber-600";
  }
};
</script>

<template>
  <CustomModal v-model:open="open" title="Review Generated Task">
    <div v-if="task" class="w-[380px] space-y-4 p-3">
      <div class="flex items-start justify-between gap-2">
        <h4 class="text-base font-semibold text-ink">{{ task.title }}</h4>
        <span class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize" :class="priorityBadge(task.priority)">
          {{ task.priority }}
        </span>
      </div>

      <p class="whitespace-pre-line text-sm leading-relaxed text-subtle">
        {{ task.description || "No description generated." }}
      </p>

      <div class="grid grid-cols-2 gap-3 text-sm">
        <div v-if="task.estimatedEffort">
          <p class="text-xs text-subtle">Estimated effort</p>
          <p class="font-medium text-ink">{{ task.estimatedEffort }}</p>
        </div>
        <div v-if="departmentName">
          <p class="text-xs text-subtle">Suggested department</p>
          <p class="font-medium text-ink">{{ departmentName }}</p>
        </div>
        <div v-if="taskTypeName">
          <p class="text-xs text-subtle">Suggested task type</p>
          <p class="font-medium text-ink">{{ taskTypeName }}</p>
        </div>
      </div>

      <div v-if="dependencyTitles.length" class="rounded-xl bg-page p-3 text-sm">
        <p class="mb-1 text-xs font-medium text-subtle">Depends on</p>
        <ul class="list-inside list-disc text-ink">
          <li v-for="title in dependencyTitles" :key="title">{{ title }}</li>
        </ul>
      </div>

      <div class="space-y-1">
        <p class="text-xs font-medium text-subtle">Assignee</p>
        <Select v-model="assigneeValue" :disabled="readOnly || savingAssignee">
          <SelectTrigger class="rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem :value="NONE">Unassigned</SelectItem>
              <SelectItem v-for="person in eligibleAssignees" :key="person.id" :value="person.id">
                {{ person.name }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-2 border-t border-gray-100 pt-4">
        <p class="flex items-center gap-1.5 text-xs font-medium text-subtle">
          <AlertCircle class="h-3.5 w-3.5" /> Request a change
        </p>
        <Textarea
          v-model="commentDraft"
          rows="3"
          placeholder="e.g. Add more technical detail about the database schema…"
          class="rounded-xl text-sm"
          :disabled="readOnly"
        />
        <div v-if="!task.commentResolved" class="flex items-center gap-1.5 text-xs text-amber-600">
          <Sparkles class="h-3.5 w-3.5" /> Pending regeneration
        </div>
        <Button
          v-if="!readOnly"
          class="w-full rounded-xl"
          variant="outline"
          :disabled="savingComment || !commentDraft.trim()"
          @click="saveComment"
        >
          Save Comment
        </Button>
      </div>
    </div>
  </CustomModal>
</template>
