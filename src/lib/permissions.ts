// Frontend mirror of the backend's RBAC catalog (permissions/catalog.py,
// permissions and roles/roles_permission.yaml). Same role codes, same
// permission codes -- when the backend catalog changes, this is the one
// place to update on the frontend, and a reviewer can diff the two
// directly instead of hunting for scattered role checks.
export type Role = "Owner" | "CM" | "DL" | "DM";

export type PermissionCode =
  | "departments:manage"
  | "task_types:manage"
  | "event_types:manage"
  | "members:invite"
  | "members:invite_cm"
  | "members:manage_role"
  | "members:remove"
  | "subscription:manage";

const ROLE_PERMISSIONS: Record<Role, ReadonlySet<PermissionCode>> = {
  Owner: new Set([
    "departments:manage",
    "task_types:manage",
    "event_types:manage",
    "members:invite",
    "members:invite_cm",
    "members:manage_role",
    "members:remove",
    "subscription:manage",
  ]),
  CM: new Set([
    "departments:manage",
    "task_types:manage",
    "event_types:manage",
    "members:invite",
    "members:manage_role",
    "members:remove",
  ]),
  DL: new Set([
    "departments:manage",
    "task_types:manage",
    "event_types:manage",
    "members:invite",
  ]),
  DM: new Set(),
};

export function hasPermission(role: Role | null | undefined, code: PermissionCode): boolean {
  return !!role && ROLE_PERMISSIONS[role].has(code);
}

// Owner and CM hold every *:manage_any permission identically today (see
// roles_permission.yaml) -- the shared check resource-scoped helpers use for
// "may manage any project/task/event/document company-wide, not just its
// own". Kept separate from hasPermission since manage_any isn't a single
// catalog code but a role tier that several resource-specific codes share.
export function isCompanyAdmin(role: Role | null | undefined): boolean {
  return role === "Owner" || role === "CM";
}
