<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { usePlansStore } from "@/stores/plansStore";
import PlanCard from "../Cards/PlanCard.vue";

const plansStore = usePlansStore();
const billingPeriod = ref<"monthly" | "yearly">("monthly");
const selectedPlanId = ref<number | null>(null);

onMounted(() => {
  plansStore.fetchPlans();
});

const getDisplayPrice = (plan: any) => {
  // If price is not a number (e.g., 'Contact' or '0'), just return as is
  if (isNaN(Number(plan.price)) || plan.price === "0") return plan.price;
  const monthly = Number(plan.price);
  if (billingPeriod.value === "monthly") return monthly.toFixed(2);
  // Yearly: pay for 9 months (12 - 3)
  return (monthly * 9).toFixed(2);
};

const getPeriodLabel = () =>
  billingPeriod.value === "monthly" ? "/month" : "/year";

const handleSelectedPlan = async (planId: number) => {
  selectedPlanId.value = planId;
  const response = await plansStore.startCheckout(planId);
  if (response.success && response.data && response.data.checkout_url) {
    window.location.href = response.data.checkout_url;
  } else {
    // Optionally handle error (e.g., show a toast)
    console.error(response.message || "Checkout failed");
  }
};
</script>

<template>
  <div class="bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-4">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Select the perfect plan for your team. All plans include a free trial
          period to help you get started.
        </p>
      </div>

      <!-- Billing Toggle -->
      <div class="flex justify-center mb-5">
        <button
          class="px-6 py-2 rounded-l-lg border border-blue-600 font-semibold focus:outline-none transition-colors duration-200"
          :class="
            billingPeriod === 'monthly'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-blue-600'
          "
          @click="billingPeriod = 'monthly'"
        >
          Monthly
        </button>
        <button
          class="px-6 py-2 rounded-r-lg border-t border-b border-r border-blue-600 font-semibold focus:outline-none transition-colors duration-200"
          :class="
            billingPeriod === 'yearly'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-blue-600'
          "
          @click="billingPeriod = 'yearly'"
        >
          Yearly
          <span
            class="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded"
            >3 months free</span
          >
        </button>
      </div>

      <!-- Loading State -->
      <div
        v-if="plansStore.loading"
        class="flex justify-center items-center py-16"
      >
        <span class="text-lg text-gray-500">Loading plans...</span>
      </div>

      <!-- Error State -->
      <div
        v-else-if="plansStore.error"
        class="flex justify-center items-center py-16"
      >
        <span class="text-lg text-red-500">{{ plansStore.error }}</span>
      </div>

      <!-- Plans Grid -->
      <div v-else>
        <div
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
        >
          <PlanCard
            v-for="plan in plansStore.plans"
            :key="plan.id"
            :plan="{
              ...plan,
              price: getDisplayPrice(plan),
            }"
            :periodLabel="getPeriodLabel()"
            @selected_plan="handleSelectedPlan"
          />
        </div>

        <!-- Additional Info -->
        <div class="mt-12 text-center">
          <p class="text-gray-600 mb-4">
            All plans include 24/7 support, regular updates, and secure cloud
            hosting.
          </p>
          <p class="text-sm text-gray-500">
            Need a custom plan?
            <a href="#" class="text-blue-600 hover:text-blue-800 font-medium"
              >Contact our sales team</a
            >
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
