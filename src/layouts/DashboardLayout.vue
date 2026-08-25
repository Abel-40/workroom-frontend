<script setup lang="ts">
import Sidebar from '@/components/layout/Sidebar.vue';
import Dashboard from '@/views/Dashboard/DashboardHome.vue';
import EventContainer from '@/views/Dashboard/EventsView.vue'
import EventDetailView from '@/views/Dashboard/EventDetailView.vue';
import ProjectsTask from '@/views/Dashboard/ProjectsView.vue'
import CalendarView from '@/views/Dashboard/CalendarView.vue'
import EmployeesView from '@/views/Dashboard/EmployeesView.vue'
import EmployeeDetailView from '@/views/Dashboard/EmployeeDetailView.vue'
import DepartmentsView from '@/views/Dashboard/DepartmentsView.vue'
import DepartmentDetailView from '@/views/Dashboard/DepartmentDetailView.vue'
import TeamDetailView from '@/views/Dashboard/TeamDetailView.vue'
import AnalyticsView from '@/views/Dashboard/AnalyticsView.vue'
import NotificationsView from '@/views/Dashboard/NotificationsView.vue'
import InfoPortalView from '@/views/Dashboard/InfoPortalView.vue'
import MessengerView from '@/views/Dashboard/MessengerView.vue'
import MyProfileView from '@/views/Dashboard/MyProfileView.vue'
import SettingsView from '@/views/Dashboard/SettingsView.vue'
import AiWorkspaceView from '@/views/Dashboard/AiWorkspaceView.vue'
import AiFloatingButton from '@/components/ai/AiFloatingButton.vue'
import {useRoute} from "vue-router"
import {computed} from "vue"
const route = useRoute()
const showSection = computed(() => {
  const section = route.query.section
  if (section === 'dashboard') return Dashboard
  if (section === 'events') return EventContainer
  if (section === 'event-detail') return EventDetailView
  if(section === 'projects') return ProjectsTask
  if(section === 'calendar') return CalendarView
  if(section === 'employees') return EmployeesView
  if(section === 'employee-detail') return EmployeeDetailView
  if(section === 'departments') return DepartmentsView
  if(section === 'department-detail') return DepartmentDetailView
  if(section === 'team-detail') return TeamDetailView
  if(section === 'analytics') return AnalyticsView
  if(section === 'notifications') return NotificationsView
  if(section === 'info-portal') return InfoPortalView
  if(section === 'messenger') return MessengerView
  if(section === 'profile') return MyProfileView
  if(section === 'settings') return SettingsView
  if(section === 'ai-workspace') return AiWorkspaceView
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
    <AiFloatingButton />
  </div>
</template>