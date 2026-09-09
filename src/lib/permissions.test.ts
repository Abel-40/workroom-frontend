import { describe, it, expect } from "vitest";
import { hasPermission, isCompanyAdmin } from "@/lib/permissions";

describe("permission catalog (mirrors backend roles_permission.yaml)", () => {
  it("Owner alone holds billing/company-destructive/CM-minting permissions", () => {
    expect(hasPermission("Owner", "subscription:manage")).toBe(true);
    expect(hasPermission("Owner", "company:delete")).toBe(true);
    expect(hasPermission("Owner", "members:invite_cm")).toBe(true);
    expect(hasPermission("Owner", "members:manage_cm_role")).toBe(true);

    for (const role of ["CM", "DL", "DM"] as const) {
      expect(hasPermission(role, "subscription:manage")).toBe(false);
      expect(hasPermission(role, "company:delete")).toBe(false);
      expect(hasPermission(role, "members:invite_cm")).toBe(false);
      expect(hasPermission(role, "members:manage_cm_role")).toBe(false);
    }
  });

  it("Owner and CM both get *:manage_any company-wide reach; DL/DM do not", () => {
    for (const role of ["Owner", "CM"] as const) {
      expect(hasPermission(role, "projects:manage_any")).toBe(true);
      expect(hasPermission(role, "tasks:manage_any")).toBe(true);
      expect(hasPermission(role, "events:manage_any")).toBe(true);
      expect(hasPermission(role, "documents:delete_any")).toBe(true);
      expect(isCompanyAdmin(role)).toBe(true);
    }
    for (const role of ["DL", "DM"] as const) {
      expect(hasPermission(role, "projects:manage_any")).toBe(false);
      expect(hasPermission(role, "tasks:manage_any")).toBe(false);
      expect(hasPermission(role, "events:manage_any")).toBe(false);
      expect(isCompanyAdmin(role)).toBe(false);
    }
  });

  it("DL can manage departments/teams/task types/event types; DM cannot", () => {
    for (const code of ["departments:manage", "teams:manage", "task_types:manage", "event_types:manage"] as const) {
      expect(hasPermission("DL", code)).toBe(true);
      expect(hasPermission("DM", code)).toBe(false);
    }
  });

  it("only Owner/CM/DL can invite members; DM cannot", () => {
    expect(hasPermission("Owner", "members:invite")).toBe(true);
    expect(hasPermission("CM", "members:invite")).toBe(true);
    expect(hasPermission("DL", "members:invite")).toBe(true);
    expect(hasPermission("DM", "members:invite")).toBe(false);
  });

  it("every role gets baseline operational access (view + create + AI request)", () => {
    for (const role of ["Owner", "CM", "DL", "DM"] as const) {
      expect(hasPermission(role, "members:view")).toBe(true);
      expect(hasPermission(role, "ai:request")).toBe(true);
      expect(hasPermission(role, "projects:create")).toBe(true);
      expect(hasPermission(role, "tasks:create")).toBe(true);
      expect(hasPermission(role, "events:create")).toBe(true);
      expect(hasPermission(role, "analytics:view")).toBe(true);
    }
  });

  it("an unknown/missing role has no permissions", () => {
    expect(hasPermission(null, "projects:create")).toBe(false);
    expect(hasPermission(undefined, "ai:request")).toBe(false);
    expect(isCompanyAdmin(null)).toBe(false);
  });
});
