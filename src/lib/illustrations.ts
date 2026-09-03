// Empty-state illustrations, served from public/illusteration/. Filenames
// contain spaces (and the odd typo) so every reference is centralized here
// rather than re-encoding ad-hoc URI strings at each call site.
const base = (name: string) => `/illusteration/${encodeURIComponent(name)}`;

export const ILLUSTRATIONS = {
  emptyProjects: base("empty project page.svg"),
  emptyEmployees: base("empty employees page.svg"),
  emptyDepartmentsAndTeams: base("empty department and team page.svg"),
  emptyDepartment: base("empty deparemtement page.svg"),
  emptyEvents: base("events page.svg"),
  emptyFolder: base("empty folder page.svg"),
  emptyAnalytics: base("empty analytic page analytics page.svg"),
  emptyColleaguesDm: base("for colleagues page of department member role.svg"),
  dashboardEmptyProjects: base("dashboard empty project section.svg"),
  dashboardEmptyWorkload: base("dashboard empty workload page.svg"),
  dashboardEmptyEvents: base("dashboard for empty event in the dashboard.svg"),
} as const;
