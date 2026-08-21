<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { format } from "date-fns";
import { Link2, Send, Sparkles } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast/use-toast";
import { useAiStore } from "@/stores/aiStore";
import { useProjectStore } from "@/stores/projectStore";
import { createPollSignal, type PollSignal } from "@/lib/pollUntilTerminal";
import AiStatusIndicator from "@/components/projects/AiStatusIndicator.vue";
import AiErrorState from "@/components/ai/AiErrorState.vue";

const props = defineProps<{
  projectId: string | null;
}>();

const emit = defineEmits<{
  (e: "generate-plan", prefillPrompt: string): void;
}>();

const aiStore = useAiStore();
const projectStore = useProjectStore();
const { toast } = useToast();

const form = reactive({ question: "", referenceUrl: "" });
const showReferenceInput = ref(false);
let signal: PollSignal | null = null;

const project = computed(() => (props.projectId ? projectStore.projects.find((p) => p.id === props.projectId) : null));
const queries = computed(() => (props.projectId ? aiStore.assistantQueriesFor(props.projectId) : []));
// Oldest first for a natural top-to-bottom chat reading order (the store
// keeps newest-first, matching every other AI list in this app).
const messages = computed(() => [...queries.value].reverse());

const formatWhen = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : format(date, "MMM d, h:mm a");
};

const ask = async () => {
  if (!props.projectId || !form.question.trim()) return;
  signal = createPollSignal();
  const { error } = await aiStore.askAssistant(
    props.projectId,
    { question: form.question.trim(), referenceUrl: form.referenceUrl.trim() || undefined },
    signal
  );
  if (error) {
    toast({ title: "The assistant couldn't answer", description: error, variant: "destructive" });
    return;
  }
  form.question = "";
  form.referenceUrl = "";
  showReferenceInput.value = false;
};

const generatePlanFor = (question: string, answer: string) => {
  emit("generate-plan", `${question}\n\n${answer}`.trim());
};

watch(
  () => props.projectId,
  (projectId) => {
    if (projectId) aiStore.fetchAssistantQueries(projectId);
  },
  { immediate: true }
);
</script>

<template>
  <div class="flex h-[32rem] flex-col rounded-2xl border border-gray-100 bg-white shadow-sm">
    <div class="flex items-center gap-2 border-b border-gray-50 px-4 py-3">
      <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-indigo-500 text-white">
        <Sparkles class="h-3.5 w-3.5" />
      </span>
      <p class="text-sm font-medium text-ink">
        Assisting with <span class="font-semibold">{{ project?.title || "…" }}</span>
      </p>
    </div>

    <div class="flex-1 space-y-4 overflow-y-auto px-4 py-4">
      <p v-if="!messages.length" class="mt-8 text-center text-sm text-subtle">
        Ask anything about this project -- scope, risks, next steps, or how to break down a piece of work.
      </p>

      <div v-for="q in messages" :key="q.id" class="space-y-2">
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
              <div class="whitespace-pre-line rounded-2xl rounded-tl-sm bg-page px-3.5 py-2 text-sm text-ink">
                {{ q.answer }}
              </div>
              <button
                type="button"
                class="flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/10"
                @click="generatePlanFor(q.question, q.answer)"
              >
                <Sparkles class="h-3 w-3" /> Generate a plan for this
              </button>
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

    <div class="border-t border-gray-50 p-3">
      <div v-if="showReferenceInput" class="mb-2 flex items-center gap-1.5">
        <Link2 class="h-3.5 w-3.5 shrink-0 text-subtle" />
        <Input v-model="form.referenceUrl" type="url" placeholder="Reference URL (optional)" class="h-8 rounded-lg text-xs" />
      </div>
      <div class="flex items-end gap-2">
        <Textarea
          v-model="form.question"
          rows="1"
          placeholder="Ask something about this project…"
          class="min-h-[2.5rem] resize-none rounded-xl"
          @keydown.enter.exact.prevent="ask"
        />
        <button
          v-if="!showReferenceInput"
          type="button"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-subtle hover:bg-page"
          title="Add a reference URL"
          @click="showReferenceInput = true"
        >
          <Link2 class="h-4 w-4" />
        </button>
        <Button size="icon" class="h-9 w-9 shrink-0 rounded-lg" :disabled="aiStore.askingAssistant || !form.question.trim()" @click="ask">
          <Send class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
