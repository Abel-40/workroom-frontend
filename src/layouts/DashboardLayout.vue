<script setup lang="ts">
import AppShell from '@/components/layout/AppShell.vue';
import Dashboard from '@/views/Dashboard/DashboardHome.vue';
import EventContainer from '@/views/Dashboard/EventsView.vue'
import EventDetailView from '@/views/Dashboard/EventDetailView.vue';
import ProjectsTask from '@/views/Dashboard/ProjectsView.vue'
import EmployeesView from '@/views/Dashboard/EmployeesView.vue'
import PeopleView from '@/views/Dashboard/roles/PeopleView.vue'
import ColleaguesView from '@/views/Dashboard/roles/ColleaguesView.vue'
import EmployeeDetailView from '@/views/Dashboard/EmployeeDetailView.vue'
import DepartmentsView from '@/views/Dashboard/DepartmentsView.vue'
import MyDepartmentDl from '@/views/Dashboard/roles/MyDepartmentDl.vue'
import MyDepartmentDm from '@/views/Dashboard/roles/MyDepartmentDm.vue'
import DepartmentDetailView from '@/views/Dashboard/DepartmentDetailView.vue'
import TeamDetailView from '@/views/Dashboard/TeamDetailView.vue'
import AnalyticsView from '@/views/Dashboard/AnalyticsView.vue'
import MyActivityDl from '@/views/Dashboard/roles/MyActivityDl.vue'
import MyActivityDm from '@/views/Dashboard/roles/MyActivityDm.vue'
import NotificationsView from '@/views/Dashboard/NotificationsView.vue'
import InfoPortalView from '@/views/Dashboard/InfoPortalView.vue'
import TodoView from '@/views/Dashboard/TodoView.vue'
import ActivityView from '@/views/Dashboard/ActivityView.vue'
import MessengerView from '@/views/Dashboard/MessengerView.vue'
import MyProfileView from '@/views/Dashboard/MyProfileView.vue'
import SettingsView from '@/views/Dashboard/SettingsView.vue'
import AiWorkspaceView from '@/views/Dashboard/AiWorkspaceView.vue'
import AiFloatingButton from '@/components/ai/AiFloatingButton.vue'
import {useRoute} from "vue-router"
import {computed} from "vue"
import { usePermissions } from '@/composables/usePermissions'
const route = useRoute()
const { isDL, isDM } = usePermissions()
const showSection = computed(() => {
  const section = route.query.section
  if (section === 'dashboard') return Dashboard
  if (section === 'events') return EventContainer
  if (section === 'event-detail') return EventDetailView
  if(section === 'projects') return ProjectsTask
  if(section === 'employees') return isDM.value ? ColleaguesView : isDL.value ? PeopleView : EmployeesView
  if(section === 'employee-detail') return EmployeeDetailView
  if(section === 'departments') return isDM.value ? MyDepartmentDm : isDL.value ? MyDepartmentDl : DepartmentsView
  if(section === 'department-detail') return DepartmentDetailView
  if(section === 'team-detail') return TeamDetailView
  if(section === 'analytics') return isDM.value ? MyActivityDm : isDL.value ? MyActivityDl : AnalyticsView
  if(section === 'notifications') return NotificationsView
  if(section === 'info-portal') return InfoPortalView
  if(section === 'todos') return TodoView
  if(section === 'activity') return ActivityView
  if(section === 'messenger') return MessengerView
  if(section === 'profile') return MyProfileView
  if(section === 'settings') return SettingsView
  if(section === 'ai-workspace') return AiWorkspaceView
  return null
})
</script>
<template>
  <AppShell>
    <component :is="showSection" v-if="showSection" />
    <router-view v-else />

    <template #floating>
      <AiFloatingButton />
    </template>
  </AppShell>
</template>