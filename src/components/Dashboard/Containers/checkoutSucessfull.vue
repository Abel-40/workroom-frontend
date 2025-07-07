<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-green-50 px-4"
  >
    <div
      class="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center max-w-md w-full"
    >
      <svg
        class="w-16 h-16 text-green-500 mb-4"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M5 13l4 4L19 7"
        />
      </svg>
      <h1 class="text-2xl font-bold text-green-700 mb-2">
        Payment Successful!
      </h1>
      <p class="text-gray-700 mb-4 text-center">
        Thank you for your purchase. Your subscription is now active.<br />
        You can now access all premium features.
      </p>
      <button
        @click="goToDashboard"
        class="mt-2 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
      >
        Go to Dashboard
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
  // Optionally: fetch subscription status, update user/company info, etc.
});

function goToDashboard() {
  router.push("/Admin/dashboard/");
}
</script>
