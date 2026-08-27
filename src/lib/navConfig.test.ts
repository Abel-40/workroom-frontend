import { describe, it, expect } from "vitest";
import { getNavItems, getScopeNote } from "@/lib/navConfig";
import type { Role } from "@/lib/permissions";

const labelsFor = (role: Role) => Object.fromEntries(getNavItems(role).map((item) => [item.key, item.title]));

describe("navConfig", () => {
  it("relabels Dashboard/Projects/Employees/Departments/Analytics for DM, per the spec's table", () => {
    const labels = labelsFor("DM");
    expect(labels.dashboard).toBe("My Day");
    expect(labels.projects).toBe("My Projects");
    expect(labels["ai-workspace"]).toBe("AI Workspace");
    expect(labels.events).toBe("My Events");
    expect(labels.employees).toBe("Colleagues");
    expect(labels.departments).toBe("My Department");
    expect(labels.analytics).toBe("My Activity");
    expect(labels.messenger).toBe("Messenger");
    expect(labels["info-portal"]).toBe("Info Portal");
  });

  it("DL gets People/My Department but keeps the Dashboard/Projects/Analytics baseline", () => {
    const labels = labelsFor("DL");
    expect(labels.employees).toBe("People");
    expect(labels.departments).toBe("My Department");
    expect(labels.dashboard).toBe("Dashboard");
    expect(labels.projects).toBe("Projects");
    expect(labels.analytics).toBe("Analytics");
  });

  it("Owner and CM share identical baseline labels (no per-role difference between them in this sidebar)", () => {
    expect(getNavItems("Owner").map((i) => i.title)).toEqual(getNavItems("CM").map((i) => i.title));
  });

  it("section keys (routing identity) never change across roles, only labels do", () => {
    const keysFor = (role: Role) => getNavItems(role).map((i) => i.key);
    const ownerKeys = keysFor("Owner");
    for (const role of ["CM", "DL", "DM"] as const) {
      expect(keysFor(role)).toEqual(ownerKeys);
    }
  });

  it("scope note is absent for Owner/CM (already company-wide) and present for DL/DM", () => {
    expect(getScopeNote("Owner")).toBeNull();
    expect(getScopeNote("CM")).toBeNull();
    expect(getScopeNote("DL")).toMatch(/department/i);
    expect(getScopeNote("DM")).toMatch(/Colleagues/);
  });
});
