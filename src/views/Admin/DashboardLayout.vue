<script setup lang="ts">
import Sidebar from '@/components/Dashboard/Containers/Sidebar.vue';
import Dashboard from '@/components/Dashboard/Containers/Dashboard.vue';
import EventContainer from '@/components/Dashboard/Containers/EventsContainer.vue';
import ProjectsTask from '@/components/Dashboard/Containers/ProjectsTask.vue'
import CalendarView from '@/components/Dashboard/Containers/CalendarView.vue'
import EmployeesView from '@/components/Dashboard/Containers/EmployeesView.vue'
import InfoPortalView from '@/components/Dashboard/Containers/InfoPortalView.vue'
import MessengerView from '@/components/Dashboard/Containers/MessengerView.vue'
import MyProfileView from '@/components/Dashboard/Containers/MyProfileView.vue'
import SettingsView from '@/components/Dashboard/Containers/SettingsView.vue'
import {useRoute} from "vue-router"
import {computed} from "vue"
const route = useRoute()
const showSection = computed(() => {
  const section = route.query.section
  if (section === 'dashboard') return Dashboard
  if (section === 'events') return EventContainer
  if(section === 'projects') return ProjectsTask
  if(section === 'calendar') return CalendarView
  if(section === 'employees') return EmployeesView
  if(section === 'info-portal') return InfoPortalView
  if(section === 'messenger') return MessengerView
  if(section === 'profile') return MyProfileView
  if(section === 'settings') return SettingsView
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