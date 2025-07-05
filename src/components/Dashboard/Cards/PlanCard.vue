<script setup lang="ts">
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

interface Props {
  plan: Plan;
  billingPeriod?: "monthly" | "yearly";
  periodLabel?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(["selected_plan"]);
const getBorderGradient = (planName: string) => {
  switch (planName) {
    case "enterprise":
      return "from-purple-400 via-pink-400 to-purple-600";
    case "Business":
      return "from-blue-400 via-cyan-400 to-blue-600";
    case "Team":
      return "from-green-400 via-emerald-400 to-green-600";
    case "Starter":
      return "from-orange-400 via-amber-400 to-orange-600";
    case "Free":
      return "from-gray-400 via-slate-400 to-gray-600";
    default:
      return "from-blue-400 via-cyan-400 to-blue-600";
  }
};

const getBgColor = (planName: string) => {
  switch (planName) {
    case "Enterprise":
      return "bg-purple-50";
    case "Business":
      return "bg-blue-50";
    case "Team":
      return "bg-green-50";
    case "Starter":
      return "bg-orange-50";
    case "Free":
      return "bg-gray-50";
    default:
      return "bg-blue-50";
  }
};

const getHeaderColor = (planName: string) => {
  switch (planName) {
    case "Enterprise":
      return "text-purple-700";
    case "Business":
      return "text-blue-700";
    case "Team":
      return "text-green-700";
    case "Starter":
      return "text-orange-700";
    case "Free":
      return "text-gray-700";
    default:
      return "text-blue-700";
  }
};

const plan_selected = () => {
  emit("selected_plan", props.plan.id);
};
</script>

<template>
  <div
    :class="`relative ${getBgColor(plan.name)} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent bg-gradient-to-r ${getBorderGradient(plan.name)} bg-clip-border`"
  >
    <!-- Popular Badge -->
    <div
      v-if="plan.isPopular"
      class="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 px-3 py-1 text-xs font-semibold rounded-full shadow-md"
    >
      Most Popular
    </div>

    <!-- Content Container -->
    <div class="bg-white m-1 rounded-lg p-6">
      <!-- Header -->
      <div class="text-center mb-6">
        <h3 :class="`text-2xl font-bold mb-2 ${getHeaderColor(plan.name)}`">
          {{ plan.name }}
        </h3>
        <div class="flex items-baseline justify-center mb-4">
          <span
            v-if="plan.price === '0'"
            class="text-3xl font-bold text-gray-900"
            >Free</span
          >
          <span
            v-else-if="plan.price === 'Contact'"
            class="text-2xl font-bold text-gray-900"
            >Contact Us</span
          >
          <span v-else class="text-3xl font-bold text-gray-900"
            >${{ plan.price }}</span
          >
          <span
            v-if="plan.price !== '0' && plan.price !== 'Contact'"
            class="text-lg ml-1 text-gray-600"
            >{{ periodLabel || "/month" }}</span
          >
        </div>
        <p class="text-gray-600 text-sm">{{ plan.description }}</p>
      </div>

      <!-- Plan Features -->
      <div class="space-y-3 mb-6">
        <p class="text-sm text-gray-700">
          <span class="font-semibold">Departments:</span>
          {{
            plan.max_departments === -1
              ? "Unlimited max_departments"
              : `Up to ${plan.max_departments} departments`
          }}
        </p>
        <p class="text-sm text-gray-700">
          <span class="font-semibold">Users:</span>
          {{
            plan.max_users === -1
              ? "Unlimited max_users"
              : `Up to ${plan.max_users} users`
          }}
        </p>
        <p class="text-sm text-gray-700">
          <span class="font-semibold">Projects:</span>
          {{
            plan.max_projects === -1
              ? "Unlimited max_projects"
              : `Up to ${plan.max_projects} projects`
          }}
        </p>
        <p class="text-sm text-gray-700">
          <span class="font-semibold">Tasks:</span>
          {{
            plan.max_tasks === -1
              ? "Unlimited max_tasks per project"
              : `Up to ${plan.max_tasks} tasks per project`
          }}
        </p>
        <p class="text-sm text-gray-700">
          <span class="font-semibold">Trial:</span>
          {{
            plan.trial_days === 0
              ? "No trial period"
              : `${plan.trial_days}-day free trial`
          }}
        </p>
      </div>

      <!-- CTA Button -->
      <button
        :class="`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
          plan.isPopular
            ? 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-yellow-900 shadow-lg hover:shadow-xl'
            : `bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg`
        }`"
        @click="plan_selected"
      >
        {{
          plan.price === "0"
            ? "Get Started"
            : plan.price === "Contact"
              ? "Contact Sales"
              : "Choose Plan"
        }}
      </button>
    </div>
  </div>
</template>
