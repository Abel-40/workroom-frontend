<script setup lang="ts">
import UserCard from '../../Cards/UserCard.vue';
import { ChevronRight } from "lucide-vue-next";
import { Button } from "@/components/ui/button";

// Sample user data
const users = [
  {
    name: "Shawn Stone",
    role: "UMAX Designer",
    department: "USBES",
    imageSrc: "https://randomuser.me/api/portraits/men/1.jpg"
  },
  {
    name: "Ready Delgado",
    role: "UMAX Designer",
    department: "TABLES",
    imageSrc: "https://randomuser.me/api/portraits/men/2.jpg"
  },
  {
    name: "Emily Tyler",
    role: "Copywriter",
    department: "USBES",
    imageSrc: "https://randomuser.me/api/portraits/women/2.jpg"
  },
  {
    name: "Louis Castro",
    role: "Copywriter",
    department: "SUNC",
    imageSrc: "https://randomuser.me/api/portraits/men/3.jpg"
  },
  {
    name: "Nina Brooks",
    role: "UX Researcher",
    department: "INSIGHTS",
    imageSrc: "https://randomuser.me/api/portraits/women/3.jpg"
  },
  {
    name: "Carlos Evans",
    role: "Frontend Engineer",
    department: "DEV",
    imageSrc: "https://randomuser.me/api/portraits/men/4.jpg"
  },
  {
    name: "Sara Jensen",
    role: "Project Manager",
    department: "OPS",
    imageSrc: "https://randomuser.me/api/portraits/women/4.jpg"
  },
  {
    name: "Michael Lee",
    role: "Backend Engineer",
    department: "DEV",
    imageSrc: "https://randomuser.me/api/portraits/men/5.jpg"
  }
];
defineEmits(["toggle-sidebar"]);
</script>

<template>
  <!-- Workload -->
  <div class="w-full lg:w-2/3 bg-white p-4 rounded-xl shadow-sm">
    <div class="flex justify-between items-center mb-4">
      <h2 class="font-semibold">Workload</h2>
      <Button variant="link" class="text-sm p-0">
        View all <ChevronRight class="w-4 h-4" />
      </Button>
    </div>
    <div class="bg-blue-600 w-3 h-24 rounded-lg fixed -ml-3 mt-64 md:hidden"
     @click="$emit('toggle-sidebar')">
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <UserCard
        v-for="(user, index) in users"
        :key="index"
        :name="user.name"
        :role="user.role"
        :department="user.department"
        :imageSrc="user.imageSrc"
      />
    </div>
  </div>
</template>

