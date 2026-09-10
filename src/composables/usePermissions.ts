// Single source of truth for the *company-role* question -- "does this
// person's role allow X" -- in components. Wraps lib/permissions.ts (the flat
// role->code catalog) so nothing outside this file reads
// authStore.logedInUserInfo directly or branches on `role === 'DM'`. Route
// guards and nav config go through this too (router/index.ts, lib/navConfig.ts).
//
// **Per-resource** questions deliberately do not live here. Both used to, and
// both drifted out of date the moment the backend's rules moved:
//
//   projects/tasks -> useProjectAccess(project), reading project.accessLevel
//   events         -> event.canManage, reported on the event itself
//
// The removed versions granted management on `createdById` (after the backend
// made created_by provenance rather than a claim) and ignored an event's
// `audience` entirely (including that `personal` has no admin override). A
// mirrored rule set is a second source of truth, and the second one is always
// the stale one -- so the mirrors are gone rather than patched.
import { computed } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { hasPermission, isCompanyAdmin, isMemberRowLocked, type PermissionCode, type Role } from "@/lib/permissions";

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
    isMemberRowLocked: (targetRole: Role) => isMemberRowLocked(role.value, targetRole),
  };
}
