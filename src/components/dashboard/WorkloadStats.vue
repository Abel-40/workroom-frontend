<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import UserCard from '@/components/cards/UserCard.vue';
import { ChevronRight } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { useEmployeeStore } from "@/stores/employeeStore";

const employeeStore = useEmployeeStore();
const router = useRouter();

onMounted(() => {
  employeeStore.fetchEmployees();
});

const openEmployee = (employeeId: string) =>
  router.push({ name: 'admin-dashboard', query: { section: 'employee-detail', employeeId } });
const openInsights = () =>
  router.push({ name: 'admin-dashboard', query: { section: 'analytics' } });
</script>

<template>
  <!-- Workload -->
  <div class="w-full lg:w-2/3 min-h-[480px] flex flex-col bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
    <div class="flex justify-between items-center mb-4">
      <h2 class="font-semibold text-[#0A1629] relative pl-3 before:absolute before:left-0 before:top-0.5 before:h-4 before:w-1 before:rounded-full before:bg-[#3F8CFF]">Workload</h2>
      <Button variant="link" class="text-sm p-0 group text-[#3F8CFF]" @click="openInsights">
        View Company Insights <ChevronRight class="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </Button>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-min content-start flex-1">
      <UserCard
        v-for="user in employeeStore.employees"
        :key="user.id"
        :name="user.name"
        :role="user.roleLabel"
        :department="user.department ?? undefined"
        :profile-picture-url="user.profilePictureUrl"
        @click="openEmployee(user.id)"
      />
    </div>
  </div>
</template>
