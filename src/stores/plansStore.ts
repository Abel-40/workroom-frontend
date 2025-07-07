import { defineStore } from "pinia";
import { ref } from "vue";
import axiosInstance from "@/plugins/axios";
import type { ApiResponse } from "@/types/types";

interface Plan {
  id: number;
  name: string;
  price: string;
  description: string;
  max_departments: number;
  max_users: number;
  max_projects: number;
  max_tasks: number;
  trial_days: number;
  color: string;
  bgColor: string;
  isPopular?: boolean;
}

export const usePlansStore = defineStore("plans", () => {
  const plans = ref<Plan[]>([]);
  const loading = ref(false);
  const error = ref("");

  const fetchPlans = async () => {
    loading.value = true;
    error.value = "";

    try {
      const { data } = await axiosInstance.get("/plans/get_plans/");
      plans.value = data.data.plans;
    } catch (err: any) {
      error.value = "Failed to load plans.";
      console.error("Error fetching plans:", err);
    } finally {
      loading.value = false;
    }
  };

  const startCheckout = async (
    planId: number
  ): Promise<ApiResponse<{ checkout_url: string }>> => {
    try {
      const { data } = await axiosInstance.post<
        ApiResponse<{ checkout_url: string }>
      >("/subscriptions/start-checkout/", {
        plan_id: planId,
      });
      return data;
    } catch (err: any) {
      // If error response exists, return it in ApiResponse shape
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: "Checkout failed.",
        statusCode: 500,
        data: { checkout_url: "" },
        errors: err.message || "Unknown error",
      };
    }
  };

  return {
    plans,
    loading,
    error,
    fetchPlans,
    startCheckout,
  };
});
