import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";
import Sidebar from "@/components/layout/Sidebar.vue";
import { setSessionRole } from "@/test-utils/mockSession";
import type { Role } from "@/lib/permissions";

async function mountSidebarAs(role: Role) {
  setActivePinia(createPinia());
  setSessionRole(role);

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/admin/dashboard/", name: "admin-dashboard", component: { template: "<div/>" } }],
  });
  router.push("/admin/dashboard/");
  await router.isReady();

  return mount(Sidebar, {
    global: { plugins: [router], stubs: { SupportModal: true } },
  });
}

// The desktop rail's <ul> is the one place nav labels render as text;
// scoping to it avoids false matches against the footer scope-note, which
// legitimately contains words like "Employees" in its explanatory sentence.
const navText = (wrapper: Awaited<ReturnType<typeof mountSidebarAs>>) => wrapper.find("ul").text();

describe("Sidebar nav (role-driven, single config -- see navConfig.ts)", () => {
  it("DM: permitted labels present, Owner/CM-only labels absent from the nav list", async () => {
    const wrapper = await mountSidebarAs("DM");
    const text = navText(wrapper);
    expect(text).toContain("My Day");
    expect(text).toContain("My Projects");
    expect(text).toContain("Colleagues");
    expect(text).toContain("My Department");
    expect(text).not.toContain("Dashboard");
    expect(text).not.toContain("Employees");
    expect(text).not.toContain("Departments");

    // the department-scope note is real UI, just outside the <ul>
    expect(wrapper.text()).toContain("Employees appears as Colleagues");
  });

  it("DL: People/My Department present, Employees/Departments absent; scope note shown", async () => {
    const wrapper = await mountSidebarAs("DL");
    const text = navText(wrapper);
    expect(text).toContain("People");
    expect(text).toContain("My Department");
    expect(text).not.toContain("Employees");
    expect(text).not.toContain("Departments");
    expect(wrapper.text()).toContain("Everything defaults to your department");
  });

  it("CM: baseline labels present, DL/DM relabels absent, no scope note", async () => {
    const wrapper = await mountSidebarAs("CM");
    const text = navText(wrapper);
    expect(text).toContain("Dashboard");
    expect(text).toContain("Employees");
    expect(text).toContain("Departments");
    expect(text).not.toContain("Colleagues");
    expect(text).not.toContain("My Department");
    expect(text).not.toContain("My Day");
  });

  it("Owner: baseline labels present, no scope note rendered", async () => {
    const wrapper = await mountSidebarAs("Owner");
    const text = navText(wrapper);
    expect(text).toContain("Employees");
    expect(text).toContain("Departments");
    // no wr-well scope-note block for Owner (getScopeNote returns null)
    expect(wrapper.find(".wr-well").exists()).toBe(false);
  });

  it("marks the active section with aria-current for keyboard/AT users", async () => {
    const wrapper = await mountSidebarAs("DM");
    const active = wrapper.find('[aria-current="page"]');
    expect(active.exists()).toBe(true);
    expect(active.text()).toContain("My Day");
  });
});
