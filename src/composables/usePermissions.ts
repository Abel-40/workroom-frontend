// Single source of truth for "can the current user do X" in components.
// Wraps lib/permissions.ts (the flat role->code catalog) plus the
// resource-scoped ownership rules in projectPermissions.ts/eventPermissions.ts
// so nothing outside this file needs to read authStore.logedInUserInfo
// directly or branch on `role === 'DM'`. Route guards and nav config should
// go through this too (see router/index.ts and lib/navConfig.ts).
import { computed } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { hasPermission, isCompanyAdmin, isMemberRowLocked, type PermissionCode, type Role } from "@/lib/permissions";
import { canManageProject, canManageTask } from "@/lib/projectPermissions";
import { canManageEvent } from "@/lib/eventPermissions";
import type { Project, TaskType } from "@/types/types";
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
    canManageProject: (project: Project | null | undefined) =>
      canManageProject(project, userId.value, role.value, departmentId.value),
    canManageTask: (task: TaskType | null | undefined, project: Project | null | undefined) =>
      canManageTask(task, project, userId.value, role.value, departmentId.value),
    canManageEvent: (event: EventEntry | null | undefined) =>
      canManageEvent(event, userId.value, role.value, departmentId.value),
    isMemberRowLocked: (targetRole: Role) => isMemberRowLocked(role.value, targetRole),
  };
}
