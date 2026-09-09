import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { ref } from "vue";
import { useProjectAccess } from "@/composables/useProjectAccess";
import { useAuthStore } from "@/stores/authStore";
import type { Project, TaskType } from "@/types/types";

const ME = "user-me";
const SOMEONE_ELSE = "user-other";

function project(accessLevel: Project["accessLevel"]): Project {
  return {
    id: "p1",
    accessLevel,
    title: "Website Revamp",
    icon: "📁",
    createdAt: "2026-01-01",
    status: "Active",
    priority: { level: "medium", icon: "ArrowUp", color: "" },
    task: { tasks: null, total: 0, active: 0 },
    assignee: [],
    assignedBy: "",
    description: "",
    deadline: "2026-12-01",
    // The stale-rule bait: this user created the project and owns it. Under
    // the old TypeScript copy of the rules that alone granted management.
    createdById: ME,
    currentOwnerId: ME,
  } as Project;
}

function task(assignedToId: string | null): TaskType {
  return { id: "t1", assignedToId, createdById: ME } as TaskType;
}

describe("useProjectAccess", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const auth = useAuthStore();
    auth.logedInUserInfo = { user: { id: ME }, role: "DM", departmentId: "d1" } as never;
  });

  it("reads the level the server supplied rather than deriving one", () => {
    // created_by and current_owner both point at this user, and the answer is
    // still 'view' -- because that is what the server said. This is the whole
    // reason the composable exists: lib/projectPermissions.ts derived
    // management from createdById long after the backend stopped.
    const access = useProjectAccess(ref(project("view")));
    expect(access.canView.value).toBe(true);
    expect(access.canContribute.value).toBe(false);
    expect(access.canManage.value).toBe(false);
  });

  it("treats the levels as cumulative", () => {
    const manage = useProjectAccess(ref(project("manage")));
    expect(manage.canView.value).toBe(true);
    expect(manage.canContribute.value).toBe(true);
    expect(manage.canManage.value).toBe(true);

    const contribute = useProjectAccess(ref(project("contribute")));
    expect(contribute.canView.value).toBe(true);
    expect(contribute.canContribute.value).toBe(true);
    expect(contribute.canManage.value).toBe(false);
  });

  it("grants nothing when the server sent no level", () => {
    const access = useProjectAccess(ref(project(null)));
    expect(access.canView.value).toBe(false);
    expect(access.canManage.value).toBe(false);
  });

  it("grants nothing for a missing project", () => {
    const access = useProjectAccess(ref(null));
    expect(access.canView.value).toBe(false);
    expect(access.canManage.value).toBe(false);
  });

  it("lets the assignee edit their own task without managing the project", () => {
    const access = useProjectAccess(ref(project("contribute")));
    expect(access.canEditOwnTask(task(ME))).toBe(true);
    expect(access.canEditOwnTask(task(SOMEONE_ELSE))).toBe(false);
  });

  it("lets a manager edit a task they are not assigned to", () => {
    // Management can edit the assignee-owned fields too; the assignee is the
    // addition, not the exception.
    const access = useProjectAccess(ref(project("manage")));
    expect(access.canEditOwnTask(task(SOMEONE_ELSE))).toBe(true);
  });

  it("keeps managing a task separate from being assigned it", () => {
    const contributor = useProjectAccess(ref(project("contribute")));
    expect(contributor.canManageTask.value).toBe(false);

    const manager = useProjectAccess(ref(project("manage")));
    expect(manager.canManageTask.value).toBe(true);
  });

  it("restricts a status drag to the assignee even for a manager", () => {
    // In Review and Done are reachable only through the approval flow, and a
    // manager moving somebody else's task across the board is not that.
    const access = useProjectAccess(ref(project("manage")));
    expect(access.canMoveTask(task(ME))).toBe(true);
    expect(access.canMoveTask(task(SOMEONE_ELSE))).toBe(false);
  });

  it("tells a contributor to propose rather than create", () => {
    expect(useProjectAccess(ref(project("contribute"))).mustProposeTasks.value).toBe(true);
    // A manager creates directly, and a viewer does neither.
    expect(useProjectAccess(ref(project("manage"))).mustProposeTasks.value).toBe(false);
    expect(useProjectAccess(ref(project("view"))).mustProposeTasks.value).toBe(false);
  });

  it("follows the project it was given when that changes", () => {
    const current = ref(project("view"));
    const access = useProjectAccess(current);
    expect(access.canManage.value).toBe(false);
    current.value = project("manage");
    expect(access.canManage.value).toBe(true);
  });
});
