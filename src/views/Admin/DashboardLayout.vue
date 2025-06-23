<script setup lang="ts">
import Sidebar from '@/components/Dashboard/Containers/Sidebar.vue';
import Dashboard from '@/components/Dashboard/Containers/Dashboard.vue';
import EventContainer from '@/components/Dashboard/Containers/EventsConainer.vue';
import ProjectsContianer from '@/components/Dashboard/Containers/ProjectsContainer.vue'
import ProjectsTask from '@/components/Dashboard/Containers/ProjectsTask.vue'
import {useRoute} from "vue-router"
import {computed} from "vue"
const route = useRoute()
const showSection = computed(() => {
  const section = route.query.section
  if (section === 'dashboard') return Dashboard
  if (section === 'events') return EventContainer
  if(section === 'project') return ProjectsContianer
  if(section === 'projects') return ProjectsTask
  if(section === 'users') return ''
  if(section === 'performance') return ''
  if(section === 'others') return ''
  return null
})
</script>
<template>
  <div class="relative w-full min-h-screen bg-[#F4F9FD]">
    <div class="flex flex-col md:flex-row pl-4 pt-3 ml-64">
      <Sidebar class="w-64 fixed left-4 top-3 h-3/4 z-50"/>
      <component :is="showSection" v-if="showSection"/>
      
      <router-view v-else/>
    </div>
  </div>
</template>