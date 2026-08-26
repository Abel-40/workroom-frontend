import { isCompanyAdmin, type Role } from "@/lib/permissions";
import type { Project, TaskType } from "@/types/types";

// Mirrors projects_and_tasks.services.user_can_manage_project: creator,
// current owner, company admin (Owner/CM), or the department leader of the
// project's own department.
export function canManageProject(
  project: Project | null | undefined,
  userId: string | undefined,
  role: Role | null | undefined,
  userDepartmentId: string | null | undefined
): boolean {
  if (!project) return false;
  if (project.createdById === userId || project.currentOwnerId === userId) return true;
  if (isCompanyAdmin(role)) return true;
  return role === "DL" && !!project.departmentId && project.departmentId === userDepartmentId;
}

// Mirrors user_can_manage_task: the task's creator, or whoever can manage
// its parent project.
export function canManageTask(
  task: TaskType | null | undefined,
  project: Project | null | undefined,
  userId: string | undefined,
  role: Role | null | undefined,
  userDepartmentId: string | null | undefined
): boolean {
  if (!task) return false;
  if (task.createdById === userId) return true;
  return canManageProject(project, userId, role, userDepartmentId);
}
