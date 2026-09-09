// Empty-state illustrations, served from public/illusteration/. Filenames
// contain spaces (and the odd typo) so every reference is centralized here
// rather than re-encoding ad-hoc URI strings at each call site.
const base = (name: string) => `/illusteration/${encodeURIComponent(name)}`;

export const ILLUSTRATIONS = {
  // Page-level empty states.
  emptyProjects: base("empty project page.svg"),
  emptyEmployees: base("empty employees page.svg"),
  emptyDepartmentsAndTeams: base("empty department and team page.svg"),
  emptyDepartment: base("empty deparemtement page.svg"),
  emptyEvents: base("events page.svg"),
  emptyFolder: base("empty folder page.svg"),
  emptyAnalytics: base("empty analytic page analytics page.svg"),
  emptyColleaguesDm: base("for colleagues page of department member role.svg"),
  emptyTasks: base("empty tasks board.svg"),
  emptyNotifications: base("empty notifications page.svg"),
  emptyActivity: base("empty activity page.svg"),
  emptyAiPlan: base("empty ai plan page.svg"),
  emptyCalendar: base("empty calendar page.svg"),
  emptyMessages: base("empty messages page.svg"),

  // Cross-cutting states -- reused wherever a filter, a search or a failed
  // fetch leaves a surface with nothing to show.
  noResults: base("empty search results.svg"),
  error: base("error state.svg"),

  // Dashboard widgets.
  dashboardEmptyProjects: base("dashboard empty project section.svg"),
  dashboardEmptyWorkload: base("dashboard empty workload page.svg"),
  dashboardEmptyEvents: base("dashboard for empty event in the dashboard.svg"),

  // Non-empty-state art.
  support: base("support modal picture.svg"),
} as const;
