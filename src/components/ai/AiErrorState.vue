<script setup lang="ts">
// Friendly failure surface for any AI action -- never renders a raw backend/
// provider error string as the headline. The real message (e.g. "Gemini
// request timed out") is tucked behind an optional disclosure instead.
import { ref } from "vue";
import { AlertTriangle, RefreshCw } from "lucide-vue-next";
import { Button } from "@/components/ui/button";

withDefaults(
  defineProps<{
    title?: string;
    message?: string;
    detail?: string;
  }>(),
  {
    title: "Something didn't go as planned",
    message: "The AI service ran into a problem. Please try again.",
  }
);

const emit = defineEmits<{ (e: "retry"): void }>();
const showDetail = ref(false);
</script>

<template>
  <div class="rounded-xl border border-red-100 bg-red-50/60 px-3 py-2">
    <div class="flex items-center gap-2.5">
      <AlertTriangle class="h-3.5 w-3.5 shrink-0 text-red-500" />
      <div class="min-w-0 flex-1">
        <p class="truncate text-xs font-medium text-red-700">{{ title }}</p>
        <button
          type="button"
          class="text-[10.5px] font-medium text-red-500/80 underline-offset-2 hover:underline"
          @click="showDetail = !showDetail"
        >
          {{ showDetail ? "Hide details" : "Show details" }}
        </button>
      </div>
      <Button size="sm" variant="outline" class="h-7 shrink-0 rounded-lg border-red-200 px-2.5 text-xs text-red-700 hover:bg-red-100" @click="emit('retry')">
        <RefreshCw class="h-3 w-3" /> Try Again
      </Button>
    </div>
    <div v-if="showDetail" class="mt-1.5 space-y-1">
      <p class="text-[11px] text-red-600/90">{{ message }}</p>
      <p v-if="detail" class="break-words rounded-lg bg-card/60 p-2 font-mono text-[10.5px] text-red-500">{{ detail }}</p>
    </div>
  </div>
</template>
