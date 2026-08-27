// Frontend mirror of the backend's RBAC catalog (permissions/catalog.py,
// "permissions and roles/roles_permission.yaml"). Same role codes, same
// permission codes -- when the backend catalog changes, this is the one
// place to update on the frontend, and a reviewer can diff the two
// directly instead of hunting for scattered role checks.
//
// A department boundary (e.g. "Department Leader may manage projects only
// in their own department") isn't expressible as a flat permission code on
// the backend either -- that scoping lives in code there, and on the
// frontend in projectPermissions.ts / eventPermissions.ts and the
// ownership checks inside usePermissions(). This file answers "can this
// role attempt the action at all," not "which specific rows."
export type Role = "Owner" | "CM" | "DL" | "DM";

export type PermissionCode =
  | "subscription:manage"
  | "company:delete"
  | "company:transfer_ownership"
  | "members:view"
  | "members:invite"
  | "members:invite_cm"
  | "members:manage_role"
  | "members:manage_cm_role"
  | "members:remove"
  | "departments:view"
  | "departments:manage"
  | "teams:view"
  | "teams:manage"
  | "task_types:view"
  | "task_types:manage"
  | "event_types:view"
  | "event_types:manage"
  | "projects:create"
  | "projects:manage_any"
  | "tasks:create"
  | "tasks:manage_any"
  | "events:view"
  | "events:create"
  | "events:manage_any"
  | "documents:upload"
  | "documents:delete_any"
  | "ai:request"
  | "analytics:view";

const ROLE_PERMISSIONS: Record<Role, ReadonlySet<PermissionCode>> = {
  Owner: new Set([
    "subscription:manage",
    "company:delete",
    "company:transfer_ownership",
    "members:view",
    "members:invite",
    "members:invite_cm",
    "members:manage_role",
    "members:manage_cm_role",
    "members:remove",
    "departments:view",
    "departments:manage",
    "teams:view",
    "teams:manage",
    "task_types:view",
    "task_types:manage",
    "event_types:view",
    "event_types:manage",
    "projects:create",
    "projects:manage_any",
    "tasks:create",
    "tasks:manage_any",
    "events:view",
    "events:create",
    "events:manage_any",
    "documents:upload",
    "documents:delete_any",
    "ai:request",
    "analytics:view",
  ]),
  CM: new Set([
    "members:view",
    "members:invite",
    "members:manage_role",
    "members:remove",
    "departments:view",
    "departments:manage",
    "teams:view",
    "teams:manage",
    "task_types:view",
    "task_types:manage",
    "event_types:view",
    "event_types:manage",
    "projects:create",
    "projects:manage_any",
    "tasks:create",
    "tasks:manage_any",
    "events:view",
    "events:create",
    "events:manage_any",
    "documents:upload",
    "documents:delete_any",
    "ai:request",
    "analytics:view",
  ]),
  DL: new Set([
    "members:view",
    "members:invite",
    "departments:view",
    "departments:manage",
    "teams:view",
    "teams:manage",
    "task_types:view",
    "task_types:manage",
    "event_types:view",
    "event_types:manage",
    "projects:create",
    "tasks:create",
    "events:view",
    "events:create",
    "documents:upload",
    "ai:request",
    "analytics:view",
  ]),
  DM: new Set([
    "members:view",
    "departments:view",
    "teams:view",
    "task_types:view",
    "event_types:view",
    "projects:create",
    "tasks:create",
    "events:view",
    "events:create",
    "documents:upload",
    "ai:request",
    "analytics:view",
  ]),
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

// Not expressible as a flat permission code either: "members:remove" and
// "members:manage_role" say nothing about *whose* role/removal is allowed
// -- a CM holds both codes but must never be able to touch another CM's row
// (no peer-minting), and nobody edits the Owner row through this table at
// all (ownership moves via company transfer, not a role change). Mirrors
// the same row-level carve-out the backend enforces in company/services.py.
export function isMemberRowLocked(actorRole: Role | null | undefined, targetRole: Role): boolean {
  if (targetRole === "Owner") return true;
  if (targetRole === "CM") return actorRole !== "Owner";
  return false;
}
