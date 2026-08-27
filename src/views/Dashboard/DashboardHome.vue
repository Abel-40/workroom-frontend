<script setup lang="ts">
import DmDashboard from '@/views/Dashboard/roles/DmDashboard.vue';
import DlDashboard from '@/views/Dashboard/roles/DlDashboard.vue';
import CmDashboard from '@/views/Dashboard/roles/CmDashboard.vue';
import { usePermissions } from '@/composables/usePermissions';

// Owner and CM share CmDashboard -- Owner's extra reach (billing, minting
// CMs, company transfer/deletion) lives in the account menu, not a
// different dashboard. See ROLES.md "Dashboard" for the per-role rationale.
const { isDM, isDL } = usePermissions();
</script>

<template>
  <DmDashboard v-if="isDM" />
  <DlDashboard v-else-if="isDL" />
  <CmDashboard v-else />
</template>
