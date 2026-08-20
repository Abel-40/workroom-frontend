<script setup lang="ts">
import Sidebar from '@/components/layout/Sidebar.vue';
import Dashboard from '@/views/Dashboard/DashboardHome.vue';
import EventContainer from '@/views/Dashboard/EventsView.vue';
import ProjectsTask from '@/views/Dashboard/ProjectsView.vue'
import CalendarView from '@/views/Dashboard/CalendarView.vue'
import EmployeesView from '@/views/Dashboard/EmployeesView.vue'
import DepartmentsView from '@/views/Dashboard/DepartmentsView.vue'
import InfoPortalView from '@/views/Dashboard/InfoPortalView.vue'
import MessengerView from '@/views/Dashboard/MessengerView.vue'
import MyProfileView from '@/views/Dashboard/MyProfileView.vue'
import SettingsView from '@/views/Dashboard/SettingsView.vue'
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
  if(section === 'departments') return DepartmentsView
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