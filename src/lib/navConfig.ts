// Single source of truth for sidebar nav. Section keys (and therefore
// routing via ?section=) never change per role -- only the label and icon
// do, per the ROLES.md table. Items hidden from a role are declared here via
// `hiddenFor`, never by scattering `v-if="role === ..."` across Sidebar.vue.
import type { Component } from "vue";
import {
  LayoutDashboard,
  SquareDashedKanban,
  Sparkles,
  ListChecks,
  CalendarDays,
  Users,
  Building2,
  BarChart3,
  MessageSquare,
  FolderKanban,
  History,
} from "lucide-vue-next";
import type { Role } from "@/lib/permissions";

export interface NavItem {
  key: string;
  sectionName: string;
  title: string;
  icon: Component;
}

const BASE_ITEMS: Array<{
  key: string;
  sectionName: string;
  icon: Component;
  labels: Record<Role, string>;
  hiddenFor?: Role[];
}> = [
  {
    key: "dashboard",
    sectionName: "dashboard",
    icon: LayoutDashboard,
    labels: { Owner: "Dashboard", CM: "Dashboard", DL: "Dashboard", DM: "My Day" },
  },
  {
    key: "projects",
    sectionName: "projects",
    icon: SquareDashedKanban,
    labels: { Owner: "Projects", CM: "Projects", DL: "Projects", DM: "My Projects" },
  },
  {
    key: "ai-workspace",
    sectionName: "ai-workspace",
    icon: Sparkles,
    labels: { Owner: "AI Workspace", CM: "AI Workspace", DL: "AI Workspace", DM: "AI Workspace" },
  },
  {
    key: "todos",
    sectionName: "todos",
    icon: ListChecks,
    // Same label for everyone on purpose: a to-do list is personal, not
    // managerial, so it does not change meaning with role the way
    // Employees/Departments do. Note "My Day" is already the DM's dashboard
    // label -- this stays "My To-Do" for all four roles to avoid a collision.
    labels: { Owner: "My To-Do", CM: "My To-Do", DL: "My To-Do", DM: "My To-Do" },
  },
  {
    key: "events",
    sectionName: "events",
    icon: CalendarDays,
    labels: { Owner: "Events", CM: "Events", DL: "Events", DM: "My Events" },
  },
  {
    key: "employees",
    sectionName: "employees",
    icon: Users,
    labels: { Owner: "Employees", CM: "Employees", DL: "People", DM: "Colleagues" },
  },
  {
    key: "departments",
    sectionName: "departments",
    icon: Building2,
    labels: { Owner: "Departments", CM: "Departments", DL: "My Department", DM: "My Department" },
  },
  {
    key: "analytics",
    sectionName: "analytics",
    icon: BarChart3,
    labels: { Owner: "Analytics", CM: "Analytics", DL: "Analytics", DM: "My Activity" },
  },
  {
    key: "messenger",
    sectionName: "messenger",
    icon: MessageSquare,
    labels: { Owner: "Messenger", CM: "Messenger", DL: "Messenger", DM: "Messenger" },
  },
  {
    key: "info-portal",
    sectionName: "info-portal",
    icon: FolderKanban,
    labels: { Owner: "Info Portal", CM: "Info Portal", DL: "Info Portal", DM: "Info Portal" },
  },
  {
    key: "activity",
    sectionName: "activity",
    icon: History,
    labels: { Owner: "Activity", CM: "Activity", DL: "Activity", DM: "Activity" },
    // A DM's own feed is "My Activity" (the analytics section); the
    // company-wide log isn't part of their sidebar.
    hiddenFor: ["DM"],
  },
];

export function getNavItems(role: Role | null | undefined): NavItem[] {
  const effectiveRole: Role = role ?? "DM";
  return BASE_ITEMS.filter((item) => !item.hiddenFor?.includes(effectiveRole)).map((item) => ({
    key: item.key,
    sectionName: item.sectionName,
    icon: item.icon,
    title: item.labels[effectiveRole],
  }));
}

// Rail-footer scope note (prompt spec section 4: "a small glass note
// explaining the role's scope"). Owner/CM get none -- their scope is
// already the whole company, nothing to clarify.
export function getScopeNote(role: Role | null | undefined): string | null {
  switch (role) {
    case "DL":
      return "Everything defaults to your department.";
    case "DM":
      return "Employees appears as Colleagues, read-only.";
    default:
      return null;
  }
}
