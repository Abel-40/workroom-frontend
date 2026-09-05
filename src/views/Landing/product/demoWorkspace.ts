/**
 * Static demo workspace for the public landing page.
 *
 * This is presentation data, not domain data: it renders for signed-out
 * visitors, so it must never touch a store or the API. Shapes and vocabulary
 * deliberately mirror the real app -- TaskStatus from types/types.ts, the
 * department/task-type names from mock/mockData.ts, the role labels from
 * employeeStore.ROLE_LABELS -- so the landing page shows Workroom rather than
 * a fictional SaaS that merely resembles it.
 */

import type { TaskStatus, TaskPriority } from "@/types/types";

export interface DemoPerson {
  name: string;
  initials: string;
  /** ROLE_LABELS value, not the raw enum. */
  roleLabel: string;
  profession: string;
  department: string;
  /** Percentage of capacity currently committed. */
  load: number;
  activeTasks: number;
  tint: string;
}

export interface DemoTask {
  id: string;
  name: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  taskType: string;
  estimated: string;
  progress: number;
  deadline: string;
}

/** Company shown throughout the walkthrough. */
export const DEMO_COMPANY = {
  name: "Northwind Studio",
  sector: "Technology",
  plan: "Pro",
  memberCount: 24,
  departmentCount: 5,
};

export const DEMO_VIEWER = {
  name: "Dawit Alemu",
  initials: "DA",
  roleLabel: "Company Manager",
};

/** Real department names from the Technology sector defaults. */
export const DEMO_DEPARTMENTS = [
  { name: "Engineering", lead: "Jordan Lee", members: 9, activeProjects: 4, load: 84 },
  { name: "Design", lead: "Maya Chen", members: 5, activeProjects: 3, load: 96 },
  { name: "Product", lead: "Amina Yusuf", members: 4, activeProjects: 5, load: 71 },
  { name: "QA", lead: "Priya Nair", members: 4, activeProjects: 2, load: 63 },
  { name: "DevOps", lead: "Sam Okoro", members: 2, activeProjects: 2, load: 48 },
];

export const DEMO_PEOPLE: DemoPerson[] = [
  { name: "Maya Chen", initials: "MC", roleLabel: "Department Leader", profession: "UI/UX Designer", department: "Design", load: 112, activeTasks: 9, tint: "var(--wr-lp-accent)" },
  { name: "Jordan Lee", initials: "JL", roleLabel: "Department Leader", profession: "Backend Engineer", department: "Engineering", load: 86, activeTasks: 7, tint: "var(--wr-lp-brand)" },
  { name: "Amina Yusuf", initials: "AY", roleLabel: "Department Leader", profession: "Product Manager", department: "Product", load: 74, activeTasks: 6, tint: "var(--wr-lp-brand)" },
  { name: "Priya Nair", initials: "PN", roleLabel: "Department Member", profession: "QA Engineer", department: "QA", load: 68, activeTasks: 5, tint: "var(--wr-lp-brand)" },
  { name: "Sam Okoro", initials: "SO", roleLabel: "Department Member", profession: "Frontend Engineer", department: "Engineering", load: 41, activeTasks: 3, tint: "var(--wr-lp-brand)" },
  { name: "Noah Bekele", initials: "NB", roleLabel: "Department Member", profession: "DevOps Engineer", department: "DevOps", load: 37, activeTasks: 2, tint: "var(--wr-lp-brand)" },
];

/** Project ids follow the app's PNU###### convention. */
export const DEMO_PROJECTS = [
  {
    id: "PNU001223",
    title: "E-Learning Platform",
    icon: "🎓",
    status: "Active",
    priority: "high" as TaskPriority,
    department: "Engineering",
    deadline: "Aug 30",
    totalTasks: 34,
    doneTasks: 21,
    members: ["MC", "JL", "AY"],
  },
  {
    id: "PNU001241",
    title: "Mobile App v2",
    icon: "📱",
    status: "Active",
    priority: "high" as TaskPriority,
    department: "Design",
    deadline: "Sep 18",
    totalTasks: 28,
    doneTasks: 12,
    members: ["MC", "SO"],
  },
  {
    id: "PNU001256",
    title: "Payments Migration",
    icon: "💳",
    status: "Active",
    priority: "medium" as TaskPriority,
    department: "Engineering",
    deadline: "Oct 02",
    totalTasks: 19,
    doneTasks: 4,
    members: ["JL", "NB"],
  },
  {
    id: "PNU001260",
    title: "Design System",
    icon: "🎨",
    status: "Active",
    priority: "low" as TaskPriority,
    department: "Design",
    deadline: "Nov 14",
    totalTasks: 22,
    doneTasks: 18,
    members: ["MC", "AY", "PN"],
  },
];

/** Board for PNU001241, using the app's four real statuses. */
export const DEMO_TASKS: DemoTask[] = [
  { id: "WR-412", name: "Define checkout empty states", status: "To Do", priority: "low", assignee: "MC", taskType: "Design Sprint", estimated: "2d", progress: 0, deadline: "Sep 09" },
  { id: "WR-418", name: "Audit task-type defaults per sector", status: "To Do", priority: "medium", assignee: "AY", taskType: "Documentation", estimated: "1d", progress: 0, deadline: "Sep 11" },
  { id: "WR-401", name: "Fix checkout validation on retry", status: "In Progress", priority: "high", assignee: "JL", taskType: "Bug Fix", estimated: "3d", progress: 65, deadline: "Sep 05" },
  { id: "WR-407", name: "Search filter chips", status: "In Progress", priority: "medium", assignee: "SO", taskType: "Feature Development", estimated: "5h", progress: 40, deadline: "Sep 08" },
  { id: "WR-396", name: "Onboarding flow revision", status: "In Review", priority: "medium", assignee: "MC", taskType: "Design Sprint", estimated: "4d", progress: 90, deadline: "Sep 06" },
  { id: "WR-388", name: "Saved-card selection UI", status: "In Review", priority: "high", assignee: "SO", taskType: "Feature Development", estimated: "2d", progress: 85, deadline: "Sep 04" },
  { id: "WR-421", name: "Promo code entry field", status: "To Do", priority: "medium", assignee: "SO", taskType: "Feature Development", estimated: "1d", progress: 0, deadline: "Sep 12" },
  { id: "WR-425", name: "Refund edge cases", status: "To Do", priority: "low", assignee: "PN", taskType: "QA Testing", estimated: "2d", progress: 0, deadline: "Sep 15" },
  { id: "WR-409", name: "Payment retry telemetry", status: "In Progress", priority: "medium", assignee: "NB", taskType: "Feature Development", estimated: "1d", progress: 25, deadline: "Sep 10" },
  { id: "WR-392", name: "Card vault migration script", status: "In Review", priority: "high", assignee: "JL", taskType: "Code Review", estimated: "3d", progress: 95, deadline: "Sep 03" },
  { id: "WR-365", name: "Checkout copy pass", status: "Done", priority: "low", assignee: "AY", taskType: "Documentation", estimated: "4h", progress: 100, deadline: "Aug 29" },
  { id: "WR-358", name: "Stripe webhook idempotency", status: "Done", priority: "high", assignee: "NB", taskType: "Bug Fix", estimated: "2d", progress: 100, deadline: "Aug 27" },
  { id: "WR-371", name: "Regression pass on payments", status: "Done", priority: "high", assignee: "PN", taskType: "QA Testing", estimated: "2d", progress: 100, deadline: "Sep 01" },
];

export const DEMO_ACTIVITY = [
  { who: "MC", name: "Maya Chen", action: "moved", target: "Onboarding flow revision", detail: "to In Review", when: "12m" },
  { who: "JL", name: "Jordan Lee", action: "completed", target: "Task API pagination", detail: "Engineering", when: "1h" },
  { who: "AY", name: "Amina Yusuf", action: "created", target: "Payments Migration", detail: "4 tasks assigned", when: "3h" },
  { who: "PN", name: "Priya Nair", action: "flagged", target: "Checkout validation", detail: "2 days overdue", when: "5h" },
];

export const DEMO_EVENTS = [
  { title: "Sprint planning", day: "08", month: "SEP", time: "10:00 AM", who: "Engineering" },
  { title: "Design review", day: "09", month: "SEP", time: "2:00 PM", who: "Design" },
];

/** AI Plan Creator output, matching the real generation lifecycle. */
export const DEMO_AI_PLAN = {
  generationId: "gen_8f2c41",
  project: "Payments Migration",
  status: "completed" as const,
  brief:
    "Rebuild checkout so customers can save a card, apply a promo code, and complete payment in two taps.",
  taskLimit: 6,
  durationSeconds: 11.4,
  tasks: [
    { seq: 1, name: "Design saved-card selection UI", department: "Design", type: "Design Sprint", effort: "2d", assignee: "MC" },
    { seq: 2, name: "Add payment-method endpoints", department: "Engineering", type: "Feature Development", effort: "3d", assignee: "JL" },
    { seq: 3, name: "Promo-code validation service", department: "Engineering", type: "Feature Development", effort: "2d", assignee: "JL", dependsOn: 2 },
    { seq: 4, name: "Two-tap checkout flow", department: "Engineering", type: "Feature Development", effort: "4d", assignee: "SO", dependsOn: 1 },
    { seq: 5, name: "Regression suite for payments", department: "QA", type: "QA Testing", effort: "2d", assignee: "PN", dependsOn: 4 },
    { seq: 6, name: "Rollout + monitoring runbook", department: "DevOps", type: "Documentation", effort: "1d", assignee: "NB", dependsOn: 5 },
  ],
};

/** AI Assistant exchange, using the panel's real vocabulary. */
export const DEMO_AI_THREAD = {
  project: "Payments Migration",
  question: "Which tasks are blocking the September rollout, and who owns them?",
  pagesUsed: ["Payments Migration · Board", "Rollout runbook", "Engineering workload"],
  answer:
    "Three tasks block the rollout. WR-401 (checkout validation) is 2 days overdue with Jordan Lee — it gates the two-tap flow. WR-388 is in review and needs one approval. The regression suite cannot start until both close.",
  suggestion: "Maya Chen is at 112% capacity. Moving WR-412 to Sam Okoro (41%) recovers about two days.",
};

/** AI Health Check report for the same project. */
export const DEMO_AI_HEALTH = {
  score: 72,
  label: "Needs attention",
  completed: 21,
  inProgress: 9,
  overdue: 2,
  insight:
    "Delivery risk is concentrated in Engineering. Two overdue tasks share one assignee while DevOps sits at 37% capacity.",
};

export const STATUS_COLUMNS: TaskStatus[] = ["To Do", "In Progress", "In Review", "Done"];
