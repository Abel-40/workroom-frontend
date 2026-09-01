<script setup lang="ts">
// The AI Plan Creator's top-level flow: pick a project + an eligible-
// assignee pool + a max-task cap through the shared modals (spec: project
// and assignees "lock" the composer once both are set), then generate,
// review and save. Project can also still be set via the composer's
// @project mention (kept working, per spec, as a shortcut to the same
// selection) -- both paths set the same projectId.
import { computed, reactive, ref, watch } from "vue";
import { ArrowRight, ChevronDown, Lock, Minus, Plus, PlusCircle, RefreshCw, Send, Sparkles } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast/use-toast";
import { useAiStore } from "@/stores/aiStore";
import { useProjectStore } from "@/stores/projectStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import { createPollSignal, type PollSignal } from "@/lib/pollUntilTerminal";
import MentionTextarea, { type MentionItem } from "@/components/ai/MentionTextarea.vue";
import type { AiMode } from "@/types/aiWorkspace";
import AiStatusIndicator from "@/components/projects/AiStatusIndicator.vue";
import AiErrorState from "@/components/ai/AiErrorState.vue";
import AiPlanSequence from "@/components/ai/AiPlanSequence.vue";
import AiPlanInspectorPanel from "@/components/ai/AiPlanInspectorPanel.vue";
import AssigneeSelectionModal from "@/components/ai/shared/AssigneeSelectionModal.vue";
import ProjectSelectionModal from "@/components/ai/shared/ProjectSelectionModal.vue";
import ConfirmDiscardDialog from "@/components/ai/shared/ConfirmDiscardDialog.vue";
import AiSlideOverPanel from "@/components/ai/shared/AiSlideOverPanel.vue";
import AiToolModeDropdown from "@/components/ai/shared/AiToolModeDropdown.vue";
import AvatarStack from "@/components/ai/shared/AvatarStack.vue";

const props = defineProps<{
  projectId: string | null;
  prefillPrompt?: string;
  mode: AiMode;
}>();

const emit = defineEmits<{
  (e: "view-in-backlog"): void;
  (e: "request-project-change", projectId: string | null): void;
  (e: "update:mode", mode: AiMode): void;
}>();

const aiStore = useAiStore();
const projectStore = useProjectStore();
const directoryStore = useDirectoryStore();
const { toast } = useToast();

const prompt = ref(props.prefillPrompt || "");
const assigneeIds = ref<string[]>([]);
const maxTasks = ref(10);
const assigneeModalOpen = ref(false);
const projectModalOpen = ref(false);
const confirmDiscardOpen = ref(false);
const pendingProjectChange = ref<string | null>(null);
let planSignal: PollSignal | null = null;
let regenSignal: PollSignal | null = null;

watch(
  () => props.prefillPrompt,
  (value) => {
    if (value) prompt.value = value;
  }
);

const selectedProject = computed(() => {
  const project = props.projectId ? projectStore.projects.find((p) => p.id === props.projectId) : null;
  return project ? { id: project.id, title: project.title, icon: project.icon } : null;
});

const projectItems = computed<MentionItem[]>(() =>
  projectStore.projects.map((p) => {
    const department = p.departmentId ? directoryStore.departments.find((d) => d.id === p.departmentId)?.name : null;
    return {
      id: p.id,
      label: p.title,
      icon: p.icon,
      sublabel: [department, p.status].filter(Boolean).join(" · "),
    };
  })
);
const memberItems = computed<MentionItem[]>(() =>
  props.projectId
    ? aiStore.eligibleAssigneesFor(props.projectId).map((m) => ({
        id: m.id,
        label: m.name,
        sublabel: [m.roleLabel, m.department].filter(Boolean).join(" · "),
      }))
    : []
);

const generation = computed(() => (props.projectId ? aiStore.latestGenerationFor(props.projectId) : null));
// Once a generation record exists, its own status is authoritative -- never
// fall back to aiStore.requestingPlan here, since that flag can still read
// true for a render or two after the record has already turned terminal
// (failed/completed), which used to flash the "Finalizing…" indicator back
// on right after an error. requestingPlan is only consulted pre-generation,
// to cover the gap between clicking Generate and the initial POST landing.
const planInFlight = computed(() =>
  visibleGeneration.value ? ["pending", "processing"].includes(visibleGeneration.value.status) : aiStore.requestingPlan
);
const alreadySaved = computed(() => (props.projectId ? aiStore.hasSavedPlan(props.projectId) : false));
const hasPendingComments = computed(
  () => visibleGeneration.value?.generatedTasks.some((t) => !t.commentResolved) ?? false
);
const hasUnsavedDraft = computed(() => !!generation.value?.generatedTasks.length && !generation.value?.savedAt);
const contextLocked = computed(() => !!props.projectId && assigneeIds.value.length > 0);
const assigneePeople = computed(() =>
  props.projectId
    ? aiStore.eligibleAssigneesFor(props.projectId).filter((m) => assigneeIds.value.includes(m.id)).map((m) => ({ id: m.id, name: m.name }))
    : []
);

// "New plan": abandon the current unsaved draft's view (the row stays in
// history -- there's no delete-generation endpoint, nor a need for one) and
// show a blank composer again for a fresh brief in the same context.
const startingFresh = ref(false);
const visibleGeneration = computed(() => (startingFresh.value ? null : generation.value));
const pendingAction = ref<"project-change" | "new-plan" | null>(null);

function newPlan() {
  if (hasUnsavedDraft.value) {
    pendingAction.value = "new-plan";
    confirmDiscardOpen.value = true;
    return;
  }
  startingFresh.value = true;
  prompt.value = "";
}

// Assignees are scoped per project -- reset whenever the selection changes
// under us (mention, modal, or "change context"). If a project pick came
// from the modal's "Continue to assignees" button, follow spec §"selection
// flow" by opening the assignee modal next, once the new projectId lands.
const openAssigneesOnNextProject = ref(false);
watch(
  () => props.projectId,
  () => {
    assigneeIds.value = [];
    if (openAssigneesOnNextProject.value && props.projectId) {
      openAssigneesOnNextProject.value = false;
      assigneeModalOpen.value = true;
    }
  }
);

function requestContextChange(newProjectId: string | null, opensFromModal = false) {
  if (hasUnsavedDraft.value) {
    pendingProjectChange.value = newProjectId;
    pendingAction.value = "project-change";
    confirmDiscardOpen.value = true;
    return;
  }
  openAssigneesOnNextProject.value = opensFromModal && !!newProjectId;
  emit("request-project-change", newProjectId);
}
async function confirmDiscard() {
  const draft = generation.value;
  if (draft && props.projectId) {
    const { error } = await aiStore.discardGeneration(draft.id, props.projectId);
    if (error) {
      toast({ title: "Couldn't discard the draft", description: error, variant: "destructive" });
      return;
    }
  }
  if (pendingAction.value === "new-plan") {
    startingFresh.value = true;
    prompt.value = "";
  } else {
    emit("request-project-change", pendingProjectChange.value);
  }
  pendingProjectChange.value = null;
  pendingAction.value = null;
}

async function openAssigneeModal() {
  if (!props.projectId) return;
  assigneeModalOpen.value = true;
  await aiStore.fetchEligibleAssignees(props.projectId);
}
function onAssigneesConfirmed(ids: string[]) {
  assigneeIds.value = ids;
}
function backToProjectStep() {
  assigneeModalOpen.value = false;
  projectModalOpen.value = true;
}

const onMentionProject = (item: MentionItem) => {
  // A @project mention sets the same selection used everywhere else in the
  // workspace -- one selection mechanism, not a separate concept per spec §3.
  requestContextChange(item.id);
};
const mentionedMembers = ref<{ id: string; name: string }[]>([]);
const onMentionMember = (item: MentionItem) => {
  if (!mentionedMembers.value.some((m) => m.id === item.id)) {
    mentionedMembers.value.push({ id: item.id, name: item.label });
  }
};

const requestPlan = async () => {
  if (!props.projectId || !prompt.value.trim()) return;
  startingFresh.value = false;
  planSignal = createPollSignal();
  const { error } = await aiStore.requestPlan(
    props.projectId,
    {
      prompt: prompt.value.trim(), mentionedUserIds: mentionedMembers.value.map((m) => m.id),
      assigneeIds: assigneeIds.value, maxTasks: maxTasks.value,
    },
    planSignal
  );
  if (error) toast({ title: "AI plan request failed", description: error, variant: "destructive" });
};

// Tracked by id, not by object reference -- commentOnGeneratedTask/
// assignGeneratedTask replace the task's entry in the store immutably, so a
// captured object reference would go stale the moment either action succeeds.
const selectedTaskId = ref<string | null>(null);
const inspectorOpen = ref(false);
const selectedTask = computed(
  () => visibleGeneration.value?.generatedTasks.find((t) => t.id === selectedTaskId.value) ?? null
);
function selectTask(task: { id: string }) {
  selectedTaskId.value = task.id;
  inspectorOpen.value = true;
}
watch(visibleGeneration, (value) => {
  if (!value) {
    selectedTaskId.value = null;
    inspectorOpen.value = false;
  }
});

const regeneratePlan = async () => {
  if (!visibleGeneration.value || !props.projectId) return;
  regenSignal = createPollSignal();
  const { error } = await aiStore.regeneratePlan(visibleGeneration.value.id, props.projectId, regenSignal);
  if (error) toast({ title: "Regeneration failed", description: error, variant: "destructive" });
};

const saving = ref(false);
const savePlan = async () => {
  if (!visibleGeneration.value || !props.projectId) return;
  saving.value = true;
  const { error, invalidAssigneeTempIds } = await aiStore.savePlan(visibleGeneration.value.id, props.projectId);
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
  <div class="mx-auto flex h-full w-full max-w-4xl min-h-[420px] flex-col gap-3 pb-4">
    <div class="flex-1 space-y-4 overflow-y-auto pr-0.5">
      <div v-if="alreadySaved" class="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
        <p class="text-sm font-medium text-emerald-700">This project already has a saved AI-generated plan.</p>
        <p class="mt-1 text-xs text-emerald-600">A project can only get one full AI plan. You can still regenerate an individual task's AI content from its detail view.</p>
        <button type="button" class="mt-2 flex items-center gap-1 text-xs font-medium text-primary" @click="emit('view-in-backlog')">
          View tasks in backlog <ArrowRight class="h-3 w-3" />
        </button>
      </div>

      <template v-else>
        <!-- Empty state: nothing chosen and nothing generated yet -->
        <div v-if="!projectId && !visibleGeneration" class="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-500 text-white">
            <Sparkles class="h-5 w-5" />
          </span>
          <p class="text-base font-semibold text-ink">No plan generated yet</p>
          <p class="max-w-sm text-sm text-subtle">Pick a project and its assignees below, set how many tasks the AI may create, then describe the outcome you want.</p>
          <div class="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-subtle">
            <span class="rounded-full bg-page px-3 py-1 font-medium">1 — Select project</span>
            <span>›</span>
            <span class="rounded-full bg-page px-3 py-1 font-medium">2 — Select assignees</span>
            <span>›</span>
            <span class="rounded-full bg-page px-3 py-1 font-medium">3 — Set task limit</span>
          </div>
        </div>

        <!-- Only shown for the initial generation, before there's any plan to
             look at -- once tasks exist, they stay visible even while a
             regeneration is running (see the inline indicator below instead
             of hiding the whole reviewed plan). -->
        <AiStatusIndicator
          v-if="planInFlight && !visibleGeneration?.generatedTasks.length"
          :status="visibleGeneration?.status ?? 'pending'"
        />

        <AiErrorState
          v-if="visibleGeneration?.status === 'failed'"
          title="We couldn't generate your plan"
          message="The AI service ran into a problem while planning this project. Please try again."
          :detail="visibleGeneration.errorMessage"
          @retry="requestPlan"
        />

        <template v-if="visibleGeneration && visibleGeneration.generatedTasks.length">
          <div class="flex flex-wrap items-center gap-3">
            <p class="text-base font-semibold text-ink">
              Generated plan <span class="font-normal text-subtle">· {{ selectedProject?.title }} · {{ visibleGeneration.generatedTasks.length }} of {{ visibleGeneration.generatedTasks.length }} tasks · {{ visibleGeneration.savedAt ? "saved" : "draft" }}</span>
            </p>
            <div class="flex-1" />
            <span v-if="hasPendingComments" class="rounded-full bg-warning px-2.5 py-1 text-[11px] font-medium text-warning-foreground">
              Some tasks have requested changes
            </span>
            <button
              v-if="hasPendingComments"
              type="button"
              class="flex items-center gap-1.5 rounded-lg bg-page px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-page"
              :disabled="aiStore.regeneratingPlan || visibleGeneration.status === 'processing'"
              @click="regeneratePlan"
            >
              <RefreshCw class="h-3.5 w-3.5 text-primary" /> Regenerate commented tasks
            </button>
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-lg bg-page px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-page"
              @click="newPlan"
            >
              <PlusCircle class="h-3.5 w-3.5 text-primary" /> New plan
            </button>
          </div>

          <AiStatusIndicator v-if="visibleGeneration.status === 'processing'" status="processing" label="Regenerating…" />
          <div v-if="visibleGeneration.status === 'completed' && visibleGeneration.errorMessage" class="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs text-amber-700">
            {{ visibleGeneration.errorMessage }}
          </div>

          <div data-tour="planner-sequence">
            <AiPlanSequence
              :tasks="visibleGeneration.generatedTasks"
              :project-id="projectId!"
              :selected-task-id="selectedTaskId"
              @select="selectTask"
            />
          </div>
        </template>
      </template>
    </div>

    <!-- Footer: row 1 is the context/action cluster, row 2 is the composer
         -- both centered, compact groups of independent pills rather than a
         full-width bar, matching the workspace's wireframe. -->
    <div class="shrink-0 space-y-3">
      <div class="flex flex-wrap items-center justify-center gap-3">
        <div class="flex items-center gap-2">
          <button
            type="button"
            data-tour="planner-project"
            class="inline-flex items-center h-12 gap-1.5 rounded-xl border border-border bg-card py-1.5 pl-3 pr-2.5 text-sm shadow-sm transition hover:border-primary/40"
            @click="projectModalOpen = true"
          >
            <ChevronDown class="h-3.5 w-3.5 text-subtle" />
            <span class="max-w-[10rem] truncate font-medium" :class="selectedProject ? 'text-ink' : 'text-subtle'">
              {{ selectedProject?.title || "Select project" }}
            </span>
          </button>

          <button
            type="button"
            data-tour="planner-assignees"
            class="flex h-12 items-center gap-0.5 rounded-xl border border-border bg-card px-3 py-1 text-sm shadow-sm transition hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!projectId"
            @click="openAssigneeModal"
          >
            <span class="text-[10px] font-medium text-subtle">Assignees</span>
            <span class="flex items-center gap-1.5">
              <AvatarStack v-if="assigneePeople.length" :people="assigneePeople" :max="3" />
              <span v-else class="flex h-4 w-4 items-center justify-center rounded-full border border-dashed border-border text-subtle">
                <Plus class="h-2.5 w-2.5" />
              </span>
              <span class="text-[10px] font-small" :class="assigneePeople.length ? 'text-ink' : 'text-subtle'">
                {{ assigneePeople.length || "none" }}
              </span>
            </span>
          </button>
        </div>

        <Button  class="rounded-xl shadow-sm h-12" :disabled="!visibleGeneration || saving || visibleGeneration.status === 'processing'" @click="savePlan">
          Save to task backlog
        </Button>
      </div>

      <div class="flex items-center justify-center gap-2">
        <AiToolModeDropdown :model-value="mode" @update:model-value="emit('update:mode', $event)" />

        <div data-tour="planner-composer" class="flex min-w-0 flex-1 max-w-lg items-center gap-2 rounded-full border border-border bg-card py-1 pl-3.5 pr-1 shadow-sm">
          <div v-if="visibleGeneration" class="flex min-w-0 flex-1 items-center gap-1.5 py-1.5 text-sm text-subtle">
            <Lock class="h-3.5 w-3.5 shrink-0" />
            <span class="truncate">Context locked to {{ selectedProject?.title }} · {{ assigneeIds.length }} assignees</span>
          </div>
          <MentionTextarea
            v-else
            v-model="prompt"
            bare
            :rows="1"
            placeholder="Type your message here… @project name, #username"
            :project-items="projectItems"
            :member-items="memberItems"
            :members-enabled="!!projectId"
            class="min-w-0 flex-1 py-1.5"
            @mention-project="onMentionProject"
            @mention-member="onMentionMember"
            @submit="requestPlan"
          />

          <Button size="icon" class="h-9 w-9 shrink-0 rounded-full" :disabled="!!visibleGeneration || !prompt.trim() || !contextLocked || planInFlight" @click="requestPlan">
            <span v-if="planInFlight" class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            <Send v-else class="h-4 w-4" />
          </Button>
        </div>

        <div data-tour="planner-max-tasks" title="Maximum tasks the AI may create" class="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1.5 text-sm shadow-sm">
          <button type="button" class="flex h-6 w-6 items-center justify-center rounded-full hover:bg-page disabled:opacity-40" :disabled="maxTasks <= 1 || !!visibleGeneration" @click="maxTasks--">
            <Minus class="h-3 w-3" />
          </button>
          <span class="w-5 text-center font-medium text-ink">{{ maxTasks }}</span>
          <button type="button" class="flex h-6 w-6 items-center justify-center rounded-full hover:bg-page disabled:opacity-40" :disabled="maxTasks >= 50 || !!visibleGeneration" @click="maxTasks++">
            <Plus class="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>

    <AssigneeSelectionModal
      v-if="projectId"
      v-model:open="assigneeModalOpen"
      :project-name="selectedProject?.title || ''"
      :members="aiStore.eligibleAssigneesFor(projectId)"
      :loading="aiStore.eligibleAssigneesLoadingFor(projectId)"
      :load-error="aiStore.eligibleAssigneesErrorFor(projectId)"
      :initial-selected-ids="assigneeIds"
      step-label="STEP 2 OF 3"
      @confirm="onAssigneesConfirmed"
      @back="backToProjectStep"
      @retry="openAssigneeModal"
    />

    <ProjectSelectionModal
      v-model:open="projectModalOpen"
      :projects="projectStore.projects"
      :initial-project-id="projectId"
      step-label="STEP 1 OF 3"
      continue-label="Continue to assignees"
      @confirm="(id) => requestContextChange(id, true)"
    />

    <ConfirmDiscardDialog
      v-model:open="confirmDiscardOpen"
      :description="pendingAction === 'new-plan'
        ? 'Starting a new plan will set aside the draft you haven\'t saved yet.'
        : 'Changing the project now will discard the plan you haven\'t saved yet.'"
      @discard="confirmDiscard"
    />

    <AiSlideOverPanel v-model:open="inspectorOpen">
      <AiPlanInspectorPanel
        v-if="visibleGeneration"
        :task="selectedTask"
        :generation-id="visibleGeneration.id"
        :project-id="projectId!"
        :all-tasks="visibleGeneration.generatedTasks"
        :eligible-assignees="aiStore.eligibleAssigneesFor(projectId!)"
        :read-only="!!visibleGeneration.savedAt"
        :generation-prompt="visibleGeneration.prompt"
      />
    </AiSlideOverPanel>
  </div>
</template>
