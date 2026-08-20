<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { format } from "date-fns";
import { AlertTriangle, ArrowUpRight, RefreshCw, Sparkles } from "lucide-vue-next";
import CustomModal from "@/components/common/CustomModal.vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast/use-toast";
import { useAiStore, type AiJobStatus } from "@/stores/aiStore";
import { createPollSignal, type PollSignal } from "@/lib/pollUntilTerminal";
import AiStatusIndicator from "./AiStatusIndicator.vue";

const props = defineProps<{
  projectId: string;
}>();

const emit = defineEmits<{
  (e: "view-generated-tasks"): void;
}>();

const open = defineModel<boolean>("open", { required: true });

const aiStore = useAiStore();
const { toast } = useToast();

type Tab = "plan" | "assistant" | "health";
const tab = ref<Tab>("plan");
const TABS: { value: Tab; label: string }[] = [
  { value: "plan", label: "Plan" },
  { value: "assistant", label: "Assistant" },
  { value: "health", label: "Health" },
];

const formatWhen = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : format(date, "MMM d, h:mm a");
};

const statusLabel = (status: AiJobStatus) =>
  status === "completed" ? "Done" : status === "failed" ? "Failed" : status === "processing" ? "Working…" : "Queued";

// --- Plan tab -----------------------------------------------------------

const generations = computed(() => aiStore.generationsFor(props.projectId));
const latestGeneration = computed(() => generations.value[0] ?? null);
const planInFlight = computed(
  () => aiStore.requestingPlan || (latestGeneration.value && ["pending", "processing"].includes(latestGeneration.value.status))
);
let planSignal: PollSignal | null = null;

const requestPlan = async () => {
  planSignal = createPollSignal();
  const { error } = await aiStore.requestPlan(props.projectId, planSignal);
  if (error) toast({ title: "AI plan request failed", description: error, variant: "destructive" });
};

const viewGeneratedTasks = () => {
  emit("view-generated-tasks");
  open.value = false;
};

// --- Assistant tab --------------------------------------------------------

const assistantQueries = computed(() => aiStore.assistantQueriesFor(props.projectId));
const assistantForm = reactive({ question: "", referenceUrl: "" });
let assistantSignal: PollSignal | null = null;

const askAssistant = async () => {
  if (!assistantForm.question.trim()) return;
  assistantSignal = createPollSignal();
  const { error } = await aiStore.askAssistant(
    props.projectId,
    { question: assistantForm.question.trim(), referenceUrl: assistantForm.referenceUrl.trim() || undefined },
    assistantSignal
  );
  if (error) {
    toast({ title: "The assistant couldn't answer", description: error, variant: "destructive" });
    return;
  }
  assistantForm.question = "";
  assistantForm.referenceUrl = "";
};

// --- Health tab -----------------------------------------------------------

const healthSummaries = computed(() => aiStore.healthSummariesFor(props.projectId));
const latestSummary = computed(() => healthSummaries.value[0] ?? null);
const healthInFlight = computed(
  () => aiStore.requestingHealthSummary || (latestSummary.value && ["pending", "processing"].includes(latestSummary.value.status))
);
let healthSignal: PollSignal | null = null;

const requestHealthSummary = async () => {
  healthSignal = createPollSignal();
  const { error } = await aiStore.requestHealthSummary(props.projectId, healthSignal);
  if (error) toast({ title: "Health summary request failed", description: error, variant: "destructive" });
};

const riskBadgeClass = (level: string) => {
  switch (level) {
    case "high":
      return "bg-red-100 text-red-600";
    case "medium":
      return "bg-amber-100 text-amber-600";
    case "low":
      return "bg-emerald-100 text-emerald-600";
    default:
      return "bg-gray-100 text-gray-500";
  }
};

// Stop polling immediately if the panel is closed mid-request -- CustomModal
// unmounts its slot content on close, but the poll loops live in this
// component's own setup scope, so they need their own cancel signal.
watch(open, (isOpen) => {
  if (isOpen) {
    aiStore.fetchGenerations(props.projectId);
    aiStore.fetchAssistantQueries(props.projectId);
    aiStore.fetchHealthSummaries(props.projectId);
    return;
  }
  if (planSignal) planSignal.cancelled = true;
  if (assistantSignal) assistantSignal.cancelled = true;
  if (healthSignal) healthSignal.cancelled = true;
});
</script>

<template>
  <CustomModal v-model:open="open" title="AI Tools">
    <div class="w-[380px] p-3">
      <div class="mb-4 flex gap-1 rounded-xl bg-page p-1">
        <button
          v-for="t in TABS"
          :key="t.value"
          type="button"
          class="flex-1 rounded-lg py-1.5 text-sm font-medium transition"
          :class="tab === t.value ? 'bg-white text-ink shadow-sm' : 'text-subtle'"
          @click="tab = t.value"
        >
          {{ t.label }}
        </button>
      </div>

      <!-- Plan -->
      <div v-if="tab === 'plan'" class="space-y-4">
        <Button class="w-full rounded-xl" :disabled="!!planInFlight" @click="requestPlan">
          <Sparkles class="h-4 w-4" /> Generate AI Plan
        </Button>

        <AiStatusIndicator
          v-if="latestGeneration && ['pending', 'processing'].includes(latestGeneration.status)"
          :status="latestGeneration.status"
        />

        <div v-if="latestGeneration?.status === 'completed'" class="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
          <p class="text-sm font-medium text-ink">{{ latestGeneration.taskCount }} tasks generated</p>
          <button type="button" class="mt-1 flex items-center gap-1 text-xs font-medium text-primary" @click="viewGeneratedTasks">
            View generated tasks <ArrowUpRight class="h-3 w-3" />
          </button>
        </div>

        <div v-if="latestGeneration?.status === 'failed'" class="rounded-xl border border-red-100 bg-red-50 p-3">
          <p class="flex items-center gap-1.5 text-sm font-medium text-red-600">
            <AlertTriangle class="h-3.5 w-3.5" /> Generation failed
          </p>
          <p class="mt-1 text-xs text-red-500">{{ latestGeneration.errorMessage || "Something went wrong." }}</p>
          <button type="button" class="mt-2 flex items-center gap-1 text-xs font-medium text-primary" @click="requestPlan">
            <RefreshCw class="h-3 w-3" /> Retry
          </button>
        </div>

        <div v-if="generations.length" class="space-y-1.5 border-t border-gray-100 pt-3">
          <p class="text-xs font-medium text-subtle">History</p>
          <div v-for="g in generations" :key="g.id" class="flex items-center justify-between text-xs">
            <span class="text-subtle">{{ formatWhen(g.requestedAt) }}</span>
            <span class="font-medium text-ink">{{ statusLabel(g.status) }}<template v-if="g.status === 'completed'"> · {{ g.taskCount }} tasks</template></span>
          </div>
        </div>
      </div>

      <!-- Assistant -->
      <div v-else-if="tab === 'assistant'" class="space-y-3">
        <Textarea
          v-model="assistantForm.question"
          rows="3"
          placeholder="Ask something about this project…"
          class="rounded-xl"
        />
        <Input v-model="assistantForm.referenceUrl" type="url" placeholder="Reference URL (optional)" class="rounded-xl" />
        <Button class="w-full rounded-xl" :disabled="aiStore.askingAssistant || !assistantForm.question.trim()" @click="askAssistant">
          Ask
        </Button>

        <AiStatusIndicator v-if="aiStore.askingAssistant" status="processing" label="Thinking…" />

        <div v-if="assistantQueries.length" class="space-y-3 border-t border-gray-100 pt-3">
          <div v-for="q in assistantQueries" :key="q.id" class="rounded-xl bg-page p-3">
            <p class="text-xs font-medium text-subtle">{{ formatWhen(q.requestedAt) }}</p>
            <p class="mt-1 text-sm font-medium text-ink">{{ q.question }}</p>
            <p v-if="q.status === 'completed' && q.refused" class="mt-1.5 text-sm italic text-subtle">
              Out of scope for this assistant.
            </p>
            <p v-else-if="q.status === 'completed'" class="mt-1.5 whitespace-pre-line text-sm text-ink">{{ q.answer }}</p>
            <p v-else-if="q.status === 'failed'" class="mt-1.5 text-sm text-red-500">{{ q.errorMessage || "Failed to answer." }}</p>
            <AiStatusIndicator v-else :status="q.status" class="mt-1.5" />
          </div>
        </div>
      </div>

      <!-- Health -->
      <div v-else class="space-y-4">
        <Button class="w-full rounded-xl" :disabled="!!healthInFlight" @click="requestHealthSummary">
          <Sparkles class="h-4 w-4" /> Generate Health Summary
        </Button>

        <AiStatusIndicator
          v-if="latestSummary && ['pending', 'processing'].includes(latestSummary.status)"
          :status="latestSummary.status"
        />

        <div v-if="latestSummary?.status === 'completed'" class="rounded-xl border border-gray-100 bg-white p-3">
          <span class="inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize" :class="riskBadgeClass(latestSummary.riskLevel)">
            {{ latestSummary.riskLevel || "unknown" }} risk
          </span>
          <p class="mt-2 whitespace-pre-line text-sm text-ink">{{ latestSummary.summary }}</p>
        </div>

        <div v-if="latestSummary?.status === 'failed'" class="rounded-xl border border-red-100 bg-red-50 p-3">
          <p class="flex items-center gap-1.5 text-sm font-medium text-red-600">
            <AlertTriangle class="h-3.5 w-3.5" /> Summary failed
          </p>
          <p class="mt-1 text-xs text-red-500">{{ latestSummary.errorMessage || "Something went wrong." }}</p>
        </div>

        <div v-if="healthSummaries.length > 1" class="space-y-1.5 border-t border-gray-100 pt-3">
          <p class="text-xs font-medium text-subtle">History</p>
          <div v-for="s in healthSummaries.slice(1)" :key="s.id" class="flex items-center justify-between text-xs">
            <span class="text-subtle">{{ formatWhen(s.requestedAt) }}</span>
            <span class="font-medium capitalize" :class="riskBadgeClass(s.riskLevel).split(' ')[1]">{{ s.riskLevel || statusLabel(s.status) }}</span>
          </div>
        </div>
      </div>
    </div>
  </CustomModal>
</template>
