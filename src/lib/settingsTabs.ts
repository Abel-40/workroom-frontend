// Single source of truth for the Settings page's tabs -- shared by
// SettingsView.vue (renders them) and Header.vue (global search needs to
// list/link to them individually, not just the page as a whole).
import type { Component } from "vue";
import {
  Blocks,
  Building2,
  CreditCard,
  Lock,
  ShieldCheck,
  User,
} from "lucide-vue-next";
import { hasPermission, type Role } from "@/lib/permissions";

export type SettingsTabKey =
  | "account"
  | "notifications"
  | "company"
  | "apps"
  | "payments"
  | "confidentiality"
  | "safety";

export interface SettingsTabItem {
  key: SettingsTabKey;
  label: string;
  icon: Component;
}

export const SETTINGS_TABS: SettingsTabItem[] = [
  { key: "account", label: "Account", icon: User },
  { key: "notifications", label: "Notifications", icon: Blocks },
  { key: "company", label: "My Company", icon: Building2 },
  { key: "apps", label: "Connected Apps", icon: Blocks },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "confidentiality", label: "Confidentiality", icon: Lock },
  { key: "safety", label: "Safety", icon: ShieldCheck },
];

// "My Company" only makes sense for a role that can actually enable
// defaults there (departments/task-types/event-types:manage all require the
// same tier -- Owner/CM/DL); "Payments" is subscription:manage, Owner-only.
export function getVisibleSettingsTabs(role: Role | null | undefined): SettingsTabItem[] {
  return SETTINGS_TABS.filter((tab) => {
    if (tab.key === "company") return hasPermission(role, "departments:manage");
    if (tab.key === "payments") return hasPermission(role, "subscription:manage");
    return true;
  });
}
