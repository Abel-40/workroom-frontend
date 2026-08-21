<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { AlertTriangle, ArrowRight, RefreshCw, Sparkles } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast/use-toast";
import { useAiStore, type AiGeneratedTask } from "@/stores/aiStore";
import { useProjectStore } from "@/stores/projectStore";
import { createPollSignal, type PollSignal } from "@/lib/pollUntilTerminal";
import MentionTextarea, { type MentionItem } from "@/components/ai/MentionTextarea.vue";
import AiStatusIndicator from "@/components/projects/AiStatusIndicator.vue";
import AiPlanFlow from "@/components/ai/AiPlanFlow.vue";
import AiGeneratedTaskReviewModal from "@/components/ai/AiGeneratedTaskReviewModal.vue";

const props = defineProps<{
  projectId: string | null;
  prefillPrompt?: string;
}>();

const emit = defineEmits<{
  (e: "view-in-backlog"): void;
  (e: "request-project-change", projectId: string): void;
}>();

const aiStore = useAiStore();
const projectStore = useProjectStore();
const { toast } = useToast();

const prompt = ref(props.prefillPrompt || "");
const mentionedUserIds = ref<string[]>([]);
let planSignal: PollSignal | null = null;
let regenSignal: PollSignal | null = null;

watch(
  () => props.prefillPrompt,
  (value) => {
    if (value) prompt.value = value;
  }
);

const projectItems = computed<MentionItem[]>(() =>
  projectStore.projects.map((p) => ({ id: p.id, label: p.title }))
);
const memberItems = computed<MentionItem[]>(() =>
  props.projectId ? aiStore.eligibleAssigneesFor(props.projectId).map((m) => ({ id: m.id, label: m.name, sublabel: m.email })) : []
);

const generation = computed(() => (props.projectId ? aiStore.latestGenerationFor(props.projectId) : null));
const planInFlight = computed(
  () => aiStore.requestingPlan || (generation.value && ["pending", "processing"].includes(generation.value.status))
);
const alreadySaved = computed(() => (props.projectId ? aiStore.hasSavedPlan(props.projectId) : false));
const hasPendingComments = computed(
  () => generation.value?.generatedTasks.some((t) => !t.commentResolved) ?? false
);

const onMentionProject = (item: MentionItem) => {
  // A @project mention sets the same selection the AiProjectPicker uses --
  // one selection mechanism, not two disconnected concepts.
  emit("request-project-change", item.id);
};
const onMentionMember = (item: MentionItem) => {
  if (!mentionedUserIds.value.includes(item.id)) mentionedUserIds.value.push(item.id);
};

const requestPlan = async () => {
  if (!props.projectId || !prompt.value.trim()) return;
  planSignal = createPollSignal();
  const { error } = await aiStore.requestPlan(
    props.projectId, { prompt: prompt.value.trim(), mentionedUserIds: mentionedUserIds.value }, planSignal
  );
  if (error) toast({ title: "AI plan request failed", description: error, variant: "destructive" });
};

// Tracked by id, not by object reference -- commentOnGeneratedTask/
// assignGeneratedTask replace the task's entry in the store immutably, so a
// captured object reference would go stale the moment either action succeeds.
const selectedTaskId = ref<string | null>(null);
const selectedTask = computed(
  () => generation.value?.generatedTasks.find((t) => t.id === selectedTaskId.value) ?? null
);
const reviewOpen = ref(false);
const openReview = (task: AiGeneratedTask) => {
  selectedTaskId.value = task.id;
  reviewOpen.value = true;
};

const regeneratePlan = async () => {
  if (!generation.value || !props.projectId) return;
  regenSignal = createPollSignal();
  const { error } = await aiStore.regeneratePlan(generation.value.id, props.projectId, regenSignal);
  if (error) toast({ title: "Regeneration failed", description: error, variant: "destructive" });
};

const saving = ref(false);
const savePlan = async () => {
  if (!generation.value || !props.projectId) return;
  saving.value = true;
  const { error, invalidAssigneeTempIds } = await aiStore.savePlan(generation.value.id, props.projectId);
  saving.value = false;
  if (error) {
    toast({ title: "Save failed", description: error, variant: "destructive" });
    return;
  }
  if (invalidAssigneeTempIds?.length) {
    toast({
      title: "Some assignees were dropped",
      description: `${invalidAssigneeTempIds.length} task(s) had an assignee who is no longer eligible for this project.`,
    });
  } else {
    toast({ title: "Plan saved", description: "Tasks were added to the project backlog." });
  }
};

watch(
  () => props.projectId,
  async (projectId) => {
    if (!projectId) return;
    await aiStore.fetchGenerations(projectId);
    aiStore.fetchEligibleAssignees(projectId);
    const latest = aiStore.latestGenerationFor(projectId);
    if (latest && ["pending", "processing"].includes(latest.status)) {
      planSignal = createPollSignal();
      aiStore.resumePollingGeneration(latest.id, projectId, planSignal);
    } else if (latest && latest.status === "completed" && !latest.savedAt && latest.generatedTasks.length === 0 && latest.taskCount > 0) {
      // Loaded from the history list, which omits generated_tasks -- fetch
      // the full record once so the review UI has something to render.
      aiStore.fetchGeneration(latest.id, projectId);
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="space-y-4">
    <div v-if="!projectId" class="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-subtle">
      Select a project above to start planning.
    </div>

    <template v-else>
      <div v-if="alreadySaved" class="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
        <p class="text-sm font-medium text-emerald-700">This project already has a saved AI-generated plan.</p>
        <p class="mt-1 text-xs text-emerald-600">A project can only get one full AI plan. You can still regenerate an individual task's AI content from its detail view.</p>
        <button type="button" class="mt-2 flex items-center gap-1 text-xs font-medium text-primary" @click="emit('view-in-backlog')">
          View tasks in backlog <ArrowRight class="h-3 w-3" />
        </button>
      </div>

      <template v-else>
        <MentionTextarea
          v-model="prompt"
          :rows="4"
          placeholder="Describe what you want to build… type @ to reference a project or @@ to mention a team member"
          :project-items="projectItems"
          :member-items="memberItems"
          :members-enabled="!!projectId"
          @mention-project="onMentionProject"
          @mention-member="onMentionMember"
        />
        <Button class="w-full rounded-xl" :disabled="!!planInFlight || !prompt.trim()" @click="requestPlan">
          <Sparkles class="h-4 w-4" /> Generate AI Plan
        </Button>

        <!-- Only shown for the initial generation, before there's any plan to
             look at -- once tasks exist, they stay visible even while a
             regeneration is running (see the inline indicator below instead
             of hiding the whole reviewed plan). -->
        <AiStatusIndicator
          v-if="planInFlight && !generation?.generatedTasks.length"
          :status="generation?.status ?? 'pending'"
        />

        <div v-if="generation?.status === 'failed'" class="rounded-xl border border-red-100 bg-red-50 p-3">
          <p class="flex items-center gap-1.5 text-sm font-medium text-red-600">
            <AlertTriangle class="h-3.5 w-3.5" /> Generation failed
          </p>
          <p class="mt-1 text-xs text-red-500">{{ generation.errorMessage || "Something went wrong." }}</p>
        </div>

        <template v-if="generation && generation.generatedTasks.length">
          <AiStatusIndicator v-if="generation.status === 'processing'" status="processing" label="Regenerating…" />
          <div v-if="generation.status === 'completed' && generation.errorMessage" class="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs text-amber-700">
            {{ generation.errorMessage }}
          </div>
          <AiPlanFlow :tasks="generation.generatedTasks" @select="openReview" />

          <div class="flex gap-2">
            <Button class="flex-1 rounded-xl" :disabled="saving || generation.status === 'processing'" @click="savePlan">
              Save Tasks to Backlog
            </Button>
            <Button
              v-if="hasPendingComments"
              variant="outline"
              class="flex-1 rounded-xl"
              :disabled="aiStore.regeneratingPlan || generation.status === 'processing'"
              @click="regeneratePlan"
            >
              <RefreshCw class="h-4 w-4" /> Regenerate Plan
            </Button>
          </div>
        </template>
      </template>
    </template>

    <AiGeneratedTaskReviewModal
      v-if="projectId && generation"
      v-model:open="reviewOpen"
      :task="selectedTask"
      :generation-id="generation.id"
      :project-id="projectId"
      :all-tasks="generation.generatedTasks"
      :eligible-assignees="aiStore.eligibleAssigneesFor(projectId)"
      :read-only="!!generation.savedAt"
    />
  </div>
</template>
