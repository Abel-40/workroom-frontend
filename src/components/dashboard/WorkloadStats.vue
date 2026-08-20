<script setup lang="ts">
import { onMounted } from 'vue';
import UserCard from '@/components/cards/UserCard.vue';
import { ChevronRight } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { useEmployeeStore } from "@/stores/employeeStore";

const employeeStore = useEmployeeStore();

onMounted(() => {
  employeeStore.fetchEmployees();
});
</script>

<template>
  <!-- Workload -->
  <div class="w-full lg:w-2/3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
    <div class="flex justify-between items-center mb-4">
      <h2 class="font-semibold text-[#0A1629] relative pl-3 before:absolute before:left-0 before:top-0.5 before:h-4 before:w-1 before:rounded-full before:bg-[#3F8CFF]">Workload</h2>
      <Button variant="link" class="text-sm p-0 group text-[#3F8CFF]">
        View all <ChevronRight class="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </Button>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <UserCard
        v-for="user in employeeStore.employees"
        :key="user.id"
        :name="user.name"
        :role="user.roleLabel"
        :department="user.department ?? undefined"
      />
    </div>
  </div>
</template>
