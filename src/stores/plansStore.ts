import { defineStore } from "pinia";
import { ref } from "vue";
import axiosInstance from "@/plugins/axios";

interface Plan {
  id:number;
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
      const {data} = await axiosInstance.get("/plans/get_plans/");
      plans.value = data.data.plans;
    } catch (err: any) {
      error.value = "Failed to load plans.";
      console.error("Error fetching plans:", err);
    } finally {
      loading.value = false;
    }
  };

  return {
    plans,
    loading,
    error,
    fetchPlans,
  };
});
