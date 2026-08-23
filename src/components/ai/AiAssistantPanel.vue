<script setup lang="ts">
// AI Assistant: scoped Q&A over a project, optionally grounded in explicitly
// selected Workroom pages (never local files) and/or a reference URL.
// Multi-turn view (question/answer pairs top-to-bottom), a right-hand
// history sidebar scoped to the current user (via the existing
// ai-assistant-queries history endpoint), and "save this answer as a page"
// (real Workroom page, via pagesStore/pages API).
import { computed, reactive, ref, watch, type ComponentPublicInstance } from "vue";
import { format } from "date-fns";
import { ChevronDown, Copy, FileText, Link2, Save, Send, Sparkles } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast/use-toast";
import { useAiStore, type AiAssistantQuery } from "@/stores/aiStore";
import { useProjectStore } from "@/stores/projectStore";
import { createPollSignal, type PollSignal } from "@/lib/pollUntilTerminal";
import type { AiMode } from "@/types/aiWorkspace";
import MentionTextarea from "@/components/ai/MentionTextarea.vue";
import AiStatusIndicator from "@/components/projects/AiStatusIndicator.vue";
import AiErrorState from "@/components/ai/AiErrorState.vue";
import FolderPagePickerModal from "@/components/ai/shared/FolderPagePickerModal.vue";
import SaveResponseAsPageModal from "@/components/ai/shared/SaveResponseAsPageModal.vue";
import ProjectSelectionModal from "@/components/ai/shared/ProjectSelectionModal.vue";
import AiToolModeDropdown from "@/components/ai/shared/AiToolModeDropdown.vue";
import AvatarStack from "@/components/ai/shared/AvatarStack.vue";
import type { WorkroomPage } from "@/stores/pagesStore";

const props = defineProps<{
  projectId: string | null;
  mode: AiMode;
}>();

const emit = defineEmits<{
  (e: "generate-plan", prefillPrompt: string): void;
  (e: "update:project-id", projectId: string | null): void;
  (e: "update:mode", mode: AiMode): void;
}>();

const aiStore = useAiStore();
const projectStore = useProjectStore();
const { toast } = useToast();

const form = reactive({ question: "", referenceUrl: "" });
const showReferenceInput = ref(false);
const pagePickerOpen = ref(false);
const projectModalOpen = ref(false);
const selectedPages = ref<WorkroomPage[]>([]);
const saveModalQuery = ref<AiAssistantQuery | null>(null);
let signal: PollSignal | null = null;

const project = computed(() => (props.projectId ? projectStore.projects.find((p) => p.id === props.projectId) : null));
const queries = computed(() => (props.projectId ? aiStore.assistantQueriesFor(props.projectId) : []));
// Oldest first for a natural top-to-bottom chat reading order (the store
// keeps newest-first, matching every other AI list in this app).
const messages = computed(() => [...queries.value].reverse());
const latestAnswered = computed(() => queries.value.find((q) => q.status === "completed" && !q.refused) ?? null);
// History only ever shows exchanges that actually produced an answer -- a
// failed attempt (or one abandoned via "Try Again") is never "history",
// it's just noise, so it's excluded rather than shown as a dead entry.
const answeredQueries = computed(() => queries.value.filter((q) => q.status === "completed"));
const teamPeople = computed(() =>
  props.projectId ? aiStore.eligibleAssigneesFor(props.projectId).map((m) => ({ id: m.id, name: m.name })) : []
);

const formatWhen = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : format(date, "MMM d, h:mm a");
};

const messageRefs = ref<Record<string, HTMLElement | null>>({});
const highlightedId = ref<string | null>(null);
function setMessageRef(id: string, el: Element | ComponentPublicInstance | null) {
  messageRefs.value[id] = el as HTMLElement | null;
}
function jumpToMessage(id: string) {
  highlightedId.value = id;
  messageRefs.value[id]?.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => {
    if (highlightedId.value === id) highlightedId.value = null;
  }, 1600);
}

const ask = async () => {
  if (!props.projectId || !form.question.trim()) return;
  signal = createPollSignal();
  const { error } = await aiStore.askAssistant(
    props.projectId,
    {
      question: form.question.trim(), referenceUrl: form.referenceUrl.trim() || undefined,
      pageIds: selectedPages.value.map((p) => p.id),
    },
    signal
  );
  if (error) {
    toast({ title: "The assistant couldn't answer", description: error, variant: "destructive" });
    return;
  }
  form.question = "";
  form.referenceUrl = "";
  showReferenceInput.value = false;
  selectedPages.value = [];
};

const generatePlanFor = (question: string, answer: string) => {
  emit("generate-plan", `${question}\n\n${answer}`.trim());
};

function onPagesPicked(pages: WorkroomPage[]) {
  selectedPages.value = pages;
}
function removeSelectedPage(id: string) {
  selectedPages.value = selectedPages.value.filter((p) => p.id !== id);
}

async function copyAnswer(answer: string) {
  try {
    await navigator.clipboard.writeText(answer);
    toast({ title: "Copied to clipboard" });
  } catch {
    toast({ title: "Couldn't copy", variant: "destructive" });
  }
}

async function saveAsPage(input: { title: string; folderId?: string; newFolderName?: string }) {
  if (!saveModalQuery.value) return;
  const { pageId, error } = await aiStore.saveAssistantQueryAsPage(saveModalQuery.value.id, input);
  if (error) {
    toast({ title: "Couldn't save as a page", description: error, variant: "destructive" });
    return;
  }
  toast({ title: "Saved as a page", description: pageId ? "Open it from Info Portal." : undefined });
}

watch(
  () => props.projectId,
  (projectId) => {
    if (projectId) aiStore.fetchAssistantQueries(projectId);
  },
  { immediate: true }
);
</script>

<template>
  <div class="mx-auto flex h-full w-full max-w-6xl min-h-[420px] gap-4 pb-4">
    <div class="flex min-w-0 flex-1 flex-col gap-3">
      <div data-tour="assistant-response-area" class="flex flex-1 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div class="flex items-center gap-2 border-b border-gray-50 px-4 py-3">
          <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-indigo-500 text-white">
            <Sparkles class="h-3.5 w-3.5" />
          </span>
          <p class="text-sm font-medium text-ink">
            Assisting with <span class="font-semibold">{{ project?.title || "…" }}</span>
          </p>
        </div>

        <div class="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <div v-if="!projectId" class="mt-8 flex flex-col items-center gap-2 text-center">
            <Sparkles class="h-6 w-6 text-subtle" />
            <p class="text-sm font-medium text-ink">Select a project to get started</p>
            <p class="max-w-xs text-xs text-subtle">Pick a project below and the assistant will answer questions using its real Workroom content.</p>
          </div>
          <p v-else-if="!messages.length" class="mt-8 text-center text-sm text-subtle">
            Ask anything about this project -- scope, risks, next steps, or how to break down a piece of work. Select pages below to ground the answer in specific Workroom content.
          </p>

          <div
            v-for="q in messages" :key="q.id" :ref="(el) => setMessageRef(q.id, el)"
            class="space-y-2 rounded-2xl transition"
            :class="highlightedId === q.id ? 'ring-2 ring-primary/40' : ''"
          >
            <div class="flex justify-end">
              <div class="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2 text-sm text-white">
                {{ q.question }}
                <p class="mt-1 text-[10px] text-white/70">{{ formatWhen(q.requestedAt) }}</p>
              </div>
            </div>

            <div class="flex items-start gap-2">
              <span class="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-page text-primary">
                <Sparkles class="h-3 w-3" />
              </span>
              <div class="max-w-[85%] space-y-2">
                <div v-if="q.status === 'completed' && q.refused" class="rounded-2xl rounded-tl-sm bg-page px-3.5 py-2 text-sm italic text-subtle">
                  Out of scope for this assistant.
                </div>
                <template v-else-if="q.status === 'completed'">
                  <div class="rounded-2xl rounded-tl-sm bg-page px-3.5 py-2.5 text-sm text-ink">
                    <div class="mb-1.5 flex items-center gap-2">
                      <span class="rounded-md bg-white px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-primary">AI response</span>
                      <span v-if="q.pages.length" class="text-[11px] text-subtle">Generated from {{ q.pages.length }} selected page{{ q.pages.length === 1 ? "" : "s" }}</span>
                    </div>
                    <p class="whitespace-pre-line">{{ q.answer }}</p>

                    <div v-if="q.pages.length || q.referenceUrl" class="mt-2.5 flex flex-col gap-1 border-t border-gray-200/70 pt-2">
                      <span class="text-[10px] font-semibold uppercase tracking-wide text-subtle">Sources &amp; links</span>
                      <span v-for="page in q.pages" :key="page.id" class="flex items-center gap-1.5 text-xs text-subtle">
                        <Link2 class="h-3 w-3" /> {{ page.title }} <span class="text-subtle/70">· {{ page.folderName }}</span>
                      </span>
                      <a v-if="q.referenceUrl" :href="q.referenceUrl" target="_blank" rel="noopener" class="flex items-center gap-1.5 text-xs text-primary">
                        <Link2 class="h-3 w-3" /> {{ q.referenceUrl }}
                      </a>
                    </div>
                  </div>

                  <div class="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      class="flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/10"
                      @click="generatePlanFor(q.question, q.answer)"
                    >
                      <Sparkles class="h-3 w-3" /> Generate a plan for this
                    </button>
                    <button type="button" class="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-subtle hover:border-primary/40" @click="copyAnswer(q.answer)">
                      <Copy class="h-3 w-3" /> Copy
                    </button>
                    <button type="button" class="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-subtle hover:border-primary/40" @click="saveModalQuery = q">
                      <Save class="h-3 w-3" /> Save to folder as a page
                    </button>
                  </div>
                </template>
                <AiErrorState
                  v-else-if="q.status === 'failed'"
                  title="The assistant couldn't answer"
                  message="Something went wrong while thinking this through."
                  :detail="q.errorMessage"
                  @retry="() => { form.question = q.question; form.referenceUrl = q.referenceUrl || ''; ask(); }"
                />
                <AiStatusIndicator v-else :status="q.status" label="Thinking…" />
              </div>
            </div>
          </div>

          <AiStatusIndicator v-if="aiStore.askingAssistant" status="processing" label="Thinking…" />
        </div>
      </div>

      <!-- Footer: row 1 is the context/action cluster, row 2 is the
           composer -- both centered, compact groups of independent pills,
           matching the workspace's shared layout across all three tools. -->
      <div class="shrink-0 space-y-3">
        <div class="flex flex-wrap items-center justify-center gap-3">
          <div class="flex items-center gap-2">
            <button
              type="button"
              data-tour="assistant-project"
              class="inline-flex h-12 items-center gap-1.5 rounded-xl border border-gray-200 bg-white py-1.5 pl-3 pr-2.5 text-sm shadow-sm transition hover:border-primary/40"
              @click="projectModalOpen = true"
            >
              <ChevronDown class="h-3.5 w-3.5 text-subtle" />
              <span class="max-w-[10rem] truncate font-medium" :class="project ? 'text-ink' : 'text-subtle'">
                {{ project?.title || "Select project" }}
              </span>
            </button>

            <span v-if="teamPeople.length" class="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1.5 pl-3 pr-2.5 text-sm shadow-sm">
              <span class="text-[10px] font-medium text-subtle">Shared with</span>
              <AvatarStack :people="teamPeople" :max="3" />
            </span>
          </div>

          <Button variant="outline" class="h-12 rounded-xl shadow-sm" :disabled="!latestAnswered" @click="latestAnswered && (saveModalQuery = latestAnswered)">
            <Save class="h-3.5 w-3.5" /> Save to folder as a page
          </Button>
        </div>

        <div v-if="showReferenceInput" class="mx-auto flex w-full max-w-lg items-center gap-1.5 rounded-2xl border border-gray-100 bg-white px-3.5 py-2 shadow-sm">
          <Link2 class="h-3.5 w-3.5 shrink-0 text-subtle" />
          <Input v-model="form.referenceUrl" type="url" placeholder="Reference URL (optional)" class="h-7 rounded-lg border-0 px-0 text-xs shadow-none focus-visible:ring-0" />
        </div>

        <div class="flex items-center justify-center gap-2">
          <AiToolModeDropdown :model-value="mode" @update:model-value="emit('update:mode', $event)" />

          <div data-tour="assistant-composer" class="flex min-w-0 flex-1 max-w-lg items-center gap-2 rounded-full border border-gray-100 bg-white py-1 pl-3.5 pr-1 shadow-sm">
            <div v-if="selectedPages.length" class="flex shrink-0 flex-wrap gap-1.5">
              <span
                v-for="page in selectedPages" :key="page.id"
                class="flex items-center gap-1.5 rounded-full bg-page py-1 pl-2.5 pr-1.5 text-xs font-medium text-ink"
              >
                {{ page.title }}
                <button type="button" class="rounded-full p-0.5 hover:bg-gray-200" @click="removeSelectedPage(page.id)">×</button>
              </span>
            </div>

            <MentionTextarea
              v-model="form.question"
              bare
              :rows="1"
              placeholder="Ask about these pages…"
              class="min-w-0 flex-1 py-1.5"
              @submit="ask"
            />

            <Button size="icon" class="h-9 w-9 shrink-0 rounded-full" :disabled="aiStore.askingAssistant || !projectId || !form.question.trim()" @click="ask">
              <Send class="h-4 w-4" />
            </Button>
          </div>

          <button
            type="button"
            title="Add a reference URL"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-100 bg-white text-subtle shadow-sm hover:bg-page hover:text-primary"
            @click="showReferenceInput = !showReferenceInput"
          >
            <Link2 class="h-4 w-4" />
          </button>

          <button
            type="button"
            data-tour="assistant-pages"
            class="flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 text-xs font-medium text-subtle shadow-sm hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!projectId"
            @click="pagePickerOpen = true"
          >
            <FileText class="h-3.5 w-3.5" /> Select page from folder
          </button>
        </div>
      </div>
    </div>

    <!-- History sidebar: every completed exchange on this project (a
         failed/retried attempt never shows here -- only once it actually
         has an answer). Each entry reads as a Q&A pair, not just the
         question, so the sidebar works as a session log. Selecting one
         scrolls it into view in place -- no page reload, no separate detail
         fetch. -->
    <div data-tour="assistant-history" class="hidden w-64 shrink-0 flex-col rounded-2xl border border-gray-100 bg-white p-3 shadow-sm lg:flex">
      <p class="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-subtle">History</p>
      <div class="flex-1 space-y-1 overflow-y-auto">
        <p v-if="!answeredQueries.length" class="px-1 py-4 text-center text-xs text-subtle">No answers yet.</p>
        <button
          v-for="q in answeredQueries" :key="q.id"
          type="button"
          class="block w-full rounded-xl px-2.5 py-2 text-left transition"
          :class="highlightedId === q.id ? 'bg-primary/10' : 'hover:bg-page'"
          @click="jumpToMessage(q.id)"
        >
          <p class="line-clamp-2 text-xs font-medium text-ink">{{ q.question }}</p>
          <p class="mt-0.5 line-clamp-2 text-[10.5px] text-subtle">{{ q.refused ? "Out of scope for this assistant." : q.answer }}</p>
          <p class="mt-1 text-[10px] text-subtle/70">{{ formatWhen(q.requestedAt) }}</p>
        </button>
      </div>
    </div>

    <FolderPagePickerModal
      v-model:open="pagePickerOpen"
      :initial-selected-ids="selectedPages.map((p) => p.id)"
      @confirm="onPagesPicked"
    />
    <SaveResponseAsPageModal
      v-if="saveModalQuery"
      :open="!!saveModalQuery"
      :default-title="saveModalQuery.question.slice(0, 80)"
      :content-preview="saveModalQuery.answer"
      :project-name="project?.title || ''"
      @update:open="(v) => { if (!v) saveModalQuery = null; }"
      @confirm="saveAsPage"
    />
    <ProjectSelectionModal
      v-model:open="projectModalOpen"
      :projects="projectStore.projects"
      :initial-project-id="projectId"
      continue-label="Select project"
      @confirm="(id) => emit('update:project-id', id)"
    />
  </div>
</template>
