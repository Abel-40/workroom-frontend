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
  <div class="rounded-2xl border border-red-100 bg-red-50/60 p-4">
    <div class="flex items-start gap-3">
      <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
        <AlertTriangle class="h-4 w-4" />
      </span>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold text-red-700">{{ title }}</p>
        <p class="mt-0.5 text-sm text-red-600/90">{{ message }}</p>
        <button
          v-if="detail"
          type="button"
          class="mt-1.5 text-xs font-medium text-red-500/80 underline-offset-2 hover:underline"
          @click="showDetail = !showDetail"
        >
          {{ showDetail ? "Hide details" : "Show details" }}
        </button>
        <p v-if="showDetail && detail" class="mt-1 break-words rounded-lg bg-white/60 p-2 font-mono text-[11px] text-red-500">
          {{ detail }}
        </p>
        <Button size="sm" variant="outline" class="mt-3 rounded-lg border-red-200 text-red-700 hover:bg-red-100" @click="emit('retry')">
          <RefreshCw class="h-3.5 w-3.5" /> Try Again
        </Button>
      </div>
    </div>
  </div>
</template>
