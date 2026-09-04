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
    for (const role of ["CM", "DL"] as const) {
      expect(keysFor(role)).toEqual(ownerKeys);
    }
    // DM is the one exception: same keys, minus the ones hidden from them.
    expect(keysFor("DM")).toEqual(ownerKeys.filter((key) => key !== "activity"));
  });

  it("gives every role the same personal To-Do item -- it is individual, not managerial", () => {
    for (const role of ["Owner", "CM", "DL", "DM"] as const) {
      const item = getNavItems(role).find((i) => i.key === "todos");
      expect(item).toBeDefined();
      expect(item?.title).toBe("My To-Do");
      expect(item?.sectionName).toBe("todos");
    }
  });

  it("hides the company-wide Activity log from DM only", () => {
    const hasActivity = (role: Role) => getNavItems(role).some((i) => i.key === "activity");
    expect(hasActivity("DM")).toBe(false);
    for (const role of ["Owner", "CM", "DL"] as const) {
      expect(hasActivity(role)).toBe(true);
    }
  });

  it("scope note is absent for Owner/CM (already company-wide) and present for DL/DM", () => {
    expect(getScopeNote("Owner")).toBeNull();
    expect(getScopeNote("CM")).toBeNull();
    expect(getScopeNote("DL")).toMatch(/department/i);
    expect(getScopeNote("DM")).toMatch(/Colleagues/);
  });
});
