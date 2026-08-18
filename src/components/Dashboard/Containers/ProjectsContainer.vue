<script setup lang="ts">
import ProjectCard from '.././Cards/ProjectCard.vue';
import {MoveLeft} from 'lucide-vue-next';
import { Button } from "@/components/ui/button";
import Header from './SubConatiners/Header.vue';
import {Calendar} from "lucide-vue-next";
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
  status?:'Done' | 'In Progress' | 'To Do' | 'In Review';
  EstimatedTime?:'5d 6hr';
  SpentTime?:'1d 2h'

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
  },  {
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
  },  {
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
  }
];

</script>

<template>
  <div class="w-full flex flex-col p-4">
    <div class="mb-6">
      <Header />
      
      <!-- Page Title -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <span class="flex gap-2 items-center">
            <Button as="a" variant="link" href="/admin/dashboard/">
              <MoveLeft class="text-primary" /> Back to Dashboard
            </Button>
          </span>
          <h1 class="text-xl font-semibold pl-12">Projects</h1>
        </div>
        <div
              class="flex items-center gap-2 bg-[#E6EDF5] px-3 py-2 rounded-md"
            >
              <Calendar class="w-4 h-4" />
              <span class="text-sm">feb 16, 2025 - April 16, 2025</span>
            </div>
      </div>
    </div>

    <div class="w-full  2xl:grid grid-cols-2 gap-6 px-2">
      <!-- Project Cards -->
       <div class="col-span-2 w-full flex justify-center itmes">
        <div class="w-full space-y-4 px-[15%]">
          <ProjectCard 
            v-for="project in projects"
            :project="project"
          />
      </div>
       </div>

    </div>
  </div>

    
</template>