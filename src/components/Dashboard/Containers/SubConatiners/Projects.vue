<script setup lang="ts">
import ProjectCard from '../../Cards/ProjectCard.vue';
import {
  ArrowDown,
  Calendar,
  ChevronRight,
  ArrowUp
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
interface Project {
  id: string;
  title: string;
  icon: string;
  createdAt: string;
  priority: {
    level: 'low' | 'medium' | 'high';
    icon: 'ArrowDown' | 'ArrowUp'; // Assuming these are your icon components
    color: string; // Tailwind color class
  };
  tasks: {
    total: number;
    active: number;
  };
  assignee: string; // URL to assignee avatar
}

const projects: Project[] = [
  {
    id: 'PNU001205',
    title: 'Medical App (iOS native)',
    icon: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=1335&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    createdAt: 'Sep 12, 2020',
    priority: {
      level: 'medium',
      icon: 'ArrowUp',
      color: 'text-yellow-500'
    },
    tasks: {
      total: 34,
      active: 13
    },
    assignee: 'https://randomuser.me/api/portraits/men/3.jpg'
  },
  {
    id: 'PNU001221',
    title: 'Food Delivery Service',
    icon: 'https://images.unsplash.com/photo-1530669244764-0909211cd8e8?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    createdAt: 'Sep 10, 2020',
    priority: {
      level: 'medium',
      icon: 'ArrowUp',
      color: 'text-yellow-500'
    },
    tasks: {
      total: 50,
      active: 24
    },
    assignee: 'https://randomuser.me/api/portraits/women/3.jpg'
  },
  {
    id: 'PNU001230',
    title: 'Food Delivery Service',
    icon: 'https://images.unsplash.com/photo-1609349239791-53cf7964978f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    createdAt: 'May 28, 2020',
    priority: {
      level: 'low',
      icon: 'ArrowDown',
      color: 'text-green-500'
    },
    tasks: {
      total: 23,
      active: 20
    },
    assignee: 'https://randomuser.me/api/portraits/men/4.jpg'
  }
];
</script>

<template>
          <div class="w-full lg:w-2/3 space-y-4">
            <div class="flex justify-between items-center">
              <h2 class="font-semibold">Projects</h2>
              <Button as="a" variant="link" class="text-sm p-0">
                <RouterLink :to="{name:'admin-dashboard',query:{section:'projects'}}">View all </RouterLink>
                 <ChevronRight class="w-4 h-4" />
              </Button>
            </div>

            <!-- Project Cards -->
            <div class="space-y-4">
              <!-- Project 1 -->
              <ProjectCard 
                v-for="project in projects"
                :project="project"
              />
            </div>
          </div>
</template>