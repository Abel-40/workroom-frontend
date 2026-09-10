// Single source of truth for "can the current user do X" in components.
// Wraps lib/permissions.ts (the flat role->code catalog) plus
// eventPermissions.ts's resource-scoped ownership rule, so nothing outside
// this file needs to read authStore.logedInUserInfo directly or branch on
// `role === 'DM'`. Route guards and nav config should go through this too
// (see router/index.ts and lib/navConfig.ts).
//
// Project/task management questions do NOT live here any more -- use
// useProjectAccess(project) instead, which reads the server-reported
// project.accessLevel rather than re-deriving the rule client-side. This
// composable used to re-export lib/projectPermissions.ts's canManageProject/
// canManageTask, which still granted management on `createdById` after the
// backend stopped doing that (created_by is provenance, not a standing
// claim); they had no remaining callers and were removed rather than fixed
// in place, so nothing can accidentally call the stale version again.
import { computed } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { hasPermission, isCompanyAdmin, isMemberRowLocked, type PermissionCode, type Role } from "@/lib/permissions";
import { canManageEvent } from "@/lib/eventPermissions";
import type { EventEntry } from "@/stores/eventStore";

export function usePermissions() {
  const authStore = useAuthStore();

  const role = computed<Role | null | undefined>(() => authStore.logedInUserInfo?.role);
  const userId = computed(() => authStore.logedInUserInfo?.user?.id);
  const departmentId = computed(() => authStore.logedInUserInfo?.departmentId);

  const can = (code: PermissionCode) => hasPermission(role.value, code);

  const isOwner = computed(() => role.value === "Owner");
  const isCM = computed(() => role.value === "CM");
  const isDL = computed(() => role.value === "DL");
  const isDM = computed(() => role.value === "DM");
  const isAdmin = computed(() => isCompanyAdmin(role.value));

  return {
    role,
    userId,
    departmentId,
    can,
    isOwner,
    isCM,
    isDL,
    isDM,
    isAdmin,
    canManageEvent: (event: EventEntry | null | undefined) =>
      canManageEvent(event, userId.value, role.value, departmentId.value),
    isMemberRowLocked: (targetRole: Role) => isMemberRowLocked(role.value, targetRole),
  };
}
