<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-red-50 px-4"
  >
    <div
      class="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center max-w-md w-full"
    >
      <svg
        class="w-16 h-16 text-red-400 mb-4"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
      <h1 class="text-2xl font-bold text-red-600 mb-2">Payment Cancelled</h1>
      <p class="text-gray-700 mb-4 text-center">
        Your payment was cancelled or failed.<br />
        No changes have been made to your subscription.
      </p>
      <button
        @click="goToPlans"
        class="mt-2 px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all"
      >
        Back to Plans
      </button>
      <div v-if="sessionId" class="mt-4 text-xs text-gray-400">
        Session ID: {{ sessionId }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { onMounted, ref } from "vue";

const router = useRouter();
const route = useRoute();
const sessionId = ref<string | null>(null);

onMounted(() => {
  sessionId.value = (route.query.session_id as string) || null;
});

function goToPlans() {
  router.push("/plans/");
}
</script>
