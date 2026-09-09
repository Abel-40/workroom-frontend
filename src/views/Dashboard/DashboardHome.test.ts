import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import DashboardHome from "@/views/Dashboard/DashboardHome.vue";
import DmDashboard from "@/views/Dashboard/roles/DmDashboard.vue";
import DlDashboard from "@/views/Dashboard/roles/DlDashboard.vue";
import CmDashboard from "@/views/Dashboard/roles/CmDashboard.vue";
import { setSessionRole } from "@/test-utils/mockSession";
import type { Role } from "@/lib/permissions";

// Each role dashboard pulls in its own stores/axios calls on mount;
// stubbing them keeps this test about the role branch in DashboardHome.vue
// itself, not about what each dashboard renders internally (those get their
// own tests -- see ROLES.md "Status").
const stubs = { DmDashboard: true, DlDashboard: true, CmDashboard: true };

function mountAs(role: Role) {
  setActivePinia(createPinia());
  setSessionRole(role);
  return mount(DashboardHome, { global: { stubs } });
}

describe("DashboardHome role branch", () => {
  it("renders DmDashboard ('My Day') for DM only", () => {
    const wrapper = mountAs("DM");
    expect(wrapper.findComponent(DmDashboard).exists()).toBe(true);
    expect(wrapper.findComponent(DlDashboard).exists()).toBe(false);
    expect(wrapper.findComponent(CmDashboard).exists()).toBe(false);
  });

  it("renders DlDashboard (department cockpit) for DL only", () => {
    const wrapper = mountAs("DL");
    expect(wrapper.findComponent(DlDashboard).exists()).toBe(true);
    expect(wrapper.findComponent(DmDashboard).exists()).toBe(false);
    expect(wrapper.findComponent(CmDashboard).exists()).toBe(false);
  });

  it("renders CmDashboard (company overview) for Owner and CM", () => {
    for (const role of ["Owner", "CM"] as const) {
      const wrapper = mountAs(role);
      expect(wrapper.findComponent(CmDashboard).exists()).toBe(true);
      expect(wrapper.findComponent(DmDashboard).exists()).toBe(false);
      expect(wrapper.findComponent(DlDashboard).exists()).toBe(false);
    }
  });
});
