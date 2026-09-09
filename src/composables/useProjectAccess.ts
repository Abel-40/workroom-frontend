// What the current user may do with one project.
//
// The level is **read from the server**, not re-derived here. `project.accessLevel`
// comes straight from projects_and_tasks.access.resolve_project_access, which is
// the single function the backend uses for every project-scoped decision.
//
// That is the whole point of this composable. The previous approach --
// lib/projectPermissions.ts reimplementing the rules in TypeScript -- drifted
// out of date twice without anyone noticing: it still grants management on
// `createdById`, which the server stopped doing when `created_by` became
// provenance rather than a claim. A mirrored rule set is a second source of
// truth, and the second one is always the stale one.
//
// The three levels are ordered and cumulative:
//
//   view        discovery. You can find it and read it. Nothing else.
//   contribute  work on what you were given: move your tasks, submit
//               evidence, log time, upload, propose.
//   manage      shape the work: edit the project, create and assign tasks,
//               move deadlines, transfer ownership, change visibility.
import { computed, unref, type MaybeRef } from "vue";
import type { Project, TaskType } from "@/types/types";
import { useAuthStore } from "@/stores/authStore";

export type AccessLevel = "view" | "contribute" | "manage";

// Ordered so `>=` is the check. Kept private: callers ask `canManage`, not
// "is my number bigger", because the numbers are an implementation detail and
// comparing them at a call site is how a fourth level would break things.
const RANK: Record<AccessLevel, number> = {
  view: 1,
  contribute: 2,
  manage: 3,
};

function atLeast(level: AccessLevel | null, required: AccessLevel): boolean {
  return level !== null && RANK[level] >= RANK[required];
}

export function useProjectAccess(project: MaybeRef<Project | null | undefined>) {
  const authStore = useAuthStore();
  const userId = computed(() => authStore.logedInUserInfo?.user?.id);

  const level = computed<AccessLevel | null>(() => {
    const value = unref(project);
    return (value?.accessLevel as AccessLevel | undefined) ?? null;
  });

  const canView = computed(() => atLeast(level.value, "view"));
  const canContribute = computed(() => atLeast(level.value, "contribute"));
  const canManage = computed(() => atLeast(level.value, "manage"));

  /**
   * Whether this user may edit a task's *management* fields -- title,
   * priority, type, department, assignee, deadline, archive.
   *
   * Mirrors the server's split exactly. `created_by` grants nothing here:
   * raising a task is provenance, not a standing claim on it.
   */
  const canManageTask = computed(() => canManage.value);

  /**
   * Whether this user may edit a task's *assignee-owned* fields -- the
   * running description and their own estimate.
   *
   * Management can edit these too; the assignee is the addition, not the
   * exception. Takes the task because the answer is per-task, unlike every
   * other level here.
   */
  const canEditOwnTask = (task: TaskType | null | undefined) =>
    !!task && (canManage.value || task.assignedToId === userId.value);

  /** Whether a status drag (To Do <-> In Progress) is allowed. Assignee only:
   *  In Review and Done are reachable through the approval flow alone. */
  const canMoveTask = (task: TaskType | null | undefined) =>
    !!task && task.assignedToId === userId.value;

  /**
   * Contributors propose tasks instead of creating them. The UI should show
   * "Propose task" here rather than hiding the action, so somebody who cannot
   * create still has a route to raise work.
   */
  const mustProposeTasks = computed(() => canContribute.value && !canManage.value);

  return {
    level,
    canView,
    canContribute,
    canManage,
    canManageTask,
    canEditOwnTask,
    canMoveTask,
    mustProposeTasks,
  };
}
