<script setup lang="ts">
// Sequence + inspector layout (spec 2b): the always-visible right-hand
// inspector for whichever task is selected in AiPlanSequence.vue. Same
// store calls/logic as the former AiGeneratedTaskReviewModal, just as an
// inline panel instead of a right-drawer popup -- this layout keeps the
// inspector visible alongside the list rather than covering it.
import { computed, ref, watch } from "vue";
import { AlertCircle, Sparkles } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast/use-toast";
import { useAiStore, type AiGeneratedTask, type EligibleAssignee } from "@/stores/aiStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import { priorityBadgeClass } from "@/lib/aiBadges";
import AiAvatar from "@/components/ai/AiAvatar.vue";

const props = defineProps<{
  task: AiGeneratedTask | null;
  generationId: string;
  projectId: string;
  allTasks: AiGeneratedTask[];
  eligibleAssignees: EligibleAssignee[];
  readOnly: boolean;
  generationPrompt: string;
}>();

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

const stepLabel = computed(() => {
  if (!props.task) return "";
  const index = props.allTasks.findIndex((t) => t.id === props.task!.id);
  return index >= 0 ? `TASK ${String(index + 1).padStart(2, "0")}` : "";
});
const promptExcerpt = computed(() => {
  const prompt = props.generationPrompt?.trim();
  if (!prompt) return "";
  return prompt.length > 160 ? `${prompt.slice(0, 160)}…` : prompt;
});

const selectedAssignee = computed(() => props.eligibleAssignees.find((a) => a.id === props.task?.assignedToId) ?? null);
const suggestedAssignee = computed(() => props.eligibleAssignees.find((a) => a.id === props.task?.suggestedAssigneeId) ?? null);

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
</script>

<template>
  <div class="flex h-full flex-col gap-4 overflow-y-auto rounded-3xl border border-primary/40 bg-white p-5 shadow-[0_8px_44px_rgba(63,140,255,0.14)]">
    <div v-if="!task" class="flex flex-1 flex-col items-center justify-center gap-2 text-center">
      <Sparkles class="h-6 w-6 text-subtle" />
      <p class="text-sm text-subtle">Select a task from the sequence to inspect it.</p>
    </div>

    <template v-else>
      <div class="flex items-start justify-between gap-2">
        <span class="rounded-md bg-info px-2 py-1 text-[10.5px] font-semibold tracking-wide text-info-foreground">{{ stepLabel }}</span>
      </div>

      <h4 class="text-lg font-bold leading-snug text-ink">{{ task.title }}</h4>

      <div class="flex flex-wrap gap-2">
        <span v-if="task.estimatedEffort" class="rounded-lg bg-page px-2.5 py-1 text-[11px] font-medium text-subtle">Est. {{ task.estimatedEffort }}</span>
        <span class="rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize" :class="priorityBadgeClass(task.priority)">{{ task.priority }}</span>
        <span v-if="selectedAssignee" class="rounded-lg bg-info px-2.5 py-1 text-[11px] font-medium text-info-foreground">{{ selectedAssignee.name }}</span>
      </div>

      <div class="flex flex-col gap-1.5">
        <span class="text-[10.5px] font-semibold uppercase tracking-wide text-subtle">AI description</span>
        <p class="whitespace-pre-line text-sm leading-relaxed text-subtle">{{ task.description || "No description generated." }}</p>
      </div>

      <div v-if="promptExcerpt" class="rounded-xl border border-primary/10 bg-primary/5 p-3 text-xs">
        <p class="mb-0.5 font-medium text-primary">Generated from your request</p>
        <p class="italic text-ink/70">"{{ promptExcerpt }}"</p>
      </div>

      <div class="grid grid-cols-2 gap-3 text-sm">
        <div v-if="departmentName">
          <p class="text-xs text-subtle">Suggested department</p>
          <p class="font-medium text-ink">{{ departmentName }}</p>
        </div>
        <div v-if="taskTypeName">
          <p class="text-xs text-subtle">Suggested task type</p>
          <p class="font-medium text-ink">{{ taskTypeName }}</p>
        </div>
        <div v-if="suggestedAssignee && !selectedAssignee">
          <p class="text-xs text-subtle">AI suggested assignee</p>
          <p class="font-medium text-ink">{{ suggestedAssignee.name }}</p>
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
          <SelectTrigger class="rounded-xl">
            <span v-if="selectedAssignee" class="flex items-center gap-2">
              <AiAvatar :name="selectedAssignee.name" :seed="selectedAssignee.id" />
              {{ selectedAssignee.name }}
            </span>
            <SelectValue v-else placeholder="Unassigned" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem :value="NONE">Unassigned</SelectItem>
              <SelectItem v-for="person in eligibleAssignees" :key="person.id" :value="person.id">
                <span class="flex items-center gap-2">
                  <AiAvatar :name="person.name" :seed="person.id" />
                  <span>
                    {{ person.name }}
                    <span v-if="person.roleLabel || person.department" class="text-xs text-subtle">
                      · {{ [person.roleLabel, person.department].filter(Boolean).join(" · ") }}
                    </span>
                  </span>
                </span>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div class="mt-auto space-y-2 border-t border-gray-100 pt-4">
        <p class="flex items-center gap-1.5 text-xs font-medium text-subtle">
          <AlertCircle class="h-3.5 w-3.5" /> Request changes
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
    </template>
  </div>
</template>
