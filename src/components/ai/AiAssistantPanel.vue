<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { format } from "date-fns";
import { Sparkles } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast/use-toast";
import { useAiStore } from "@/stores/aiStore";
import { createPollSignal, type PollSignal } from "@/lib/pollUntilTerminal";
import AiStatusIndicator from "@/components/projects/AiStatusIndicator.vue";

const props = defineProps<{
  projectId: string | null;
}>();

const emit = defineEmits<{
  (e: "generate-plan", prefillPrompt: string): void;
}>();

const aiStore = useAiStore();
const { toast } = useToast();

const form = reactive({ question: "", referenceUrl: "" });
let signal: PollSignal | null = null;

const queries = computed(() => (props.projectId ? aiStore.assistantQueriesFor(props.projectId) : []));

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
  <div v-if="!projectId" class="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-subtle">
    Select a project above to ask the assistant about it.
  </div>
  <div v-else class="space-y-3">
    <Textarea v-model="form.question" rows="3" placeholder="Ask something about this project…" class="rounded-xl" />
    <Input v-model="form.referenceUrl" type="url" placeholder="Reference URL (optional)" class="rounded-xl" />
    <Button class="w-full rounded-xl" :disabled="aiStore.askingAssistant || !form.question.trim()" @click="ask">
      Ask
    </Button>

    <AiStatusIndicator v-if="aiStore.askingAssistant" status="processing" label="Thinking…" />

    <div v-if="queries.length" class="space-y-3 border-t border-gray-100 pt-3">
      <div v-for="q in queries" :key="q.id" class="rounded-xl bg-page p-3">
        <p class="text-xs font-medium text-subtle">{{ formatWhen(q.requestedAt) }}</p>
        <p class="mt-1 text-sm font-medium text-ink">{{ q.question }}</p>
        <p v-if="q.status === 'completed' && q.refused" class="mt-1.5 text-sm italic text-subtle">
          Out of scope for this assistant.
        </p>
        <template v-else-if="q.status === 'completed'">
          <p class="mt-1.5 whitespace-pre-line text-sm text-ink">{{ q.answer }}</p>
          <button
            type="button"
            class="mt-2 flex items-center gap-1 text-xs font-medium text-primary"
            @click="generatePlanFor(q.question, q.answer)"
          >
            <Sparkles class="h-3 w-3" /> Generate a plan for this
          </button>
        </template>
        <p v-else-if="q.status === 'failed'" class="mt-1.5 text-sm text-red-500">{{ q.errorMessage || "Failed to answer." }}</p>
        <AiStatusIndicator v-else :status="q.status" class="mt-1.5" />
      </div>
    </div>
  </div>
</template>
