# Role-scoped dashboard decisions

Records, per section and role, which permission or backend fact shaped the
decision -- so nobody undoes it without knowing why. Append to this as later
sections/roles land; don't rewrite history above the current line.

## Status

Done: shell + tokens + glass foundation, permission catalog, nav config, all
three Dashboard variants (DM "My Day", DL department cockpit, CM/Owner
company overview), a Vitest + @vue/test-utils suite.

All nine sidebar sections now have their per-role treatment. Section by
section detail is below; nothing is left unstarted.

## Foundation

- **Design tokens / glass layer** -- `src/assets/glass.css`, wired into
  `src/assets/main.css` via `@import` (must precede `@tailwind` or PostCSS
  warns and some tooling drops it). New Tailwind color tokens
  (`primary-strong`, `primary-soft`, `accent-2`) added in
  `tailwind.config.js` alongside the pre-existing `ink`/`subtle`/`page`
  tokens; `--wr-text-muted` from the original spec was **not** added as a
  named token since `text-[#7D8592]` is already the established convention
  across Sidebar/Header/dashboard widgets -- adding a second name for the
  same value would just create two ways to write one thing.
- **Permission catalog** -- `src/lib/permissions.ts` extended to mirror the
  backend's full `permissions and roles/roles_permission.yaml` catalog
  (previously only had the subset needed for the admin-table work that
  shipped before this pass). `usePermissions()` composable
  (`src/composables/usePermissions.ts`) is the single import components
  should use instead of reading `authStore.logedInUserInfo` directly or
  branching on `role === 'DM'` -- wraps the flat catalog plus the existing
  resource-scoped ownership rules in `projectPermissions.ts`/
  `eventPermissions.ts`.
- **Nav** -- `src/lib/navConfig.ts` is the single source of the nine-item
  sidebar; `Sidebar.vue` renders from it, never hardcodes per-role copies.
  No item is hidden for any role today (this sidebar has no billing entry to
  hide from CM in the first place); only the label changes per the spec's
  table. Adding a hidden-per-role item later belongs in `navConfig.ts`, not
  as a `v-if` in `Sidebar.vue`.
- **AppShell** -- `src/components/layout/AppShell.vue` replaces
  `DashboardLayout.vue`'s old `fixed`-positioned sidebar + manually
  matched `ml-64` content margin with a plain flex row (`Sidebar` as a
  `sticky` flex child, content as the other). Simpler and removes a whole
  class of "collapse width and content margin drift out of sync" bugs,
  since collapse only changes the sidebar's own width class now.
  Deliberately does **not** absorb the per-view `Header.vue` top bar into
  itself -- all 16 existing dashboard views render their own `Header`
  today, migrating that to shared shell chrome is a separate, larger,
  mechanical refactor outside this vertical slice's scope.
- **Sidebar collapse** -- persisted via `useSidebarCollapsed()`
  (module-level ref + `localStorage`, not a Pinia store -- it's a UI
  preference, not domain data). Below `md` the rail becomes a fixed bottom
  icon bar instead of Radix/shadcn `Sheet` machinery this project doesn't
  have installed -- adding that primitive set just for this one mobile nav
  would be a real new-dependency-shaped addition for a corner case.

## Dashboard

- **DM -- "My Day"** (`src/views/Dashboard/roles/DmDashboard.vue`). No
  company counters, no roster: `members:view`/`analytics:view` are granted
  to DM, but a DM manages nothing, so there is nothing company-wide for
  those grants to usefully summarize on a *personal* work surface. "Today"
  aggregates tasks client-side across the user's own projects
  (`createdById === me || assigneeIds.includes(me)`) because **no flat
  "my tasks" endpoint exists on the backend** -- only per-project task
  lists (`GET /projects/{id}/tasks/`). Bounded to the user's own projects
  (typically a handful for a DM), not a company-wide sweep, so this stays
  cheap. "My projects" shows joined projects as `Open` and created-by-me
  projects as `Manage` -- ownership is the permission boundary per
  `projectPermissions.ts::canManageProject`, so the affordance follows it
  exactly. "New task" opens a project picker rather than a bare create
  form because `TaskType.projectId` is non-nullable on the backend --
  there is no "task with no project" to create.
- **CM/Owner -- company overview** (`src/views/Dashboard/roles/CmDashboard.vue`).
  Owner and CM share this component; Owner's extra reach (billing,
  minting/revoking CMs, company transfer/deletion) lives in the account
  menu per the spec, not a different dashboard. Three widgets couldn't be
  built exactly as specified because the backing data doesn't exist yet:
  - **KPI row** -- `analyticsStore.CompanyStats` has no overdue-task
    aggregate and no capacity/utilization figure at all (nowhere in the
    backend). Swapped "overdue tasks"/"avg. utilization" for "Open tasks"
    (`taskCount - completedTasks`, a real subtraction) and "Completion
    rate" (`completedTasks / taskCount`, a real ratio) -- both honestly
    derived from numbers the backend actually returns. No delta line
    either: there's no prior-period figure to diff against, and a
    fabricated delta would be worse than none.
  - **Load by department** -- `DepartmentStats` has task/project/member
    counts but no capacity number, so "load" became "share of this
    department's own tasks still open" (`(taskCount - completedTaskCount)
    / taskCount`) instead of utilization-against-capacity. Same red
    >90% / amber 75-90% / primary thresholds from `MetricBar` still apply,
    just to a different (real) number.
  - **Pending invitations** -- there is no list-pending-invitations
    endpoint anywhere in this app (`employeeStore` can only *send* an
    invite, never list outstanding ones; grepped the whole frontend to
    confirm). Replaced with **Recent activity** via the already-real
    `activityStore.fetchActivities()` (note: `member_invited` activity
    entries mean an invite becoming an activity-feed line is the closest
    real substitute for "an invite happened").
  - **Projects needing attention** -- built from `projectStore.projects`
    already in memory (`deadline` in the past, `status !== 'Done'`), not a
    per-project-stats fetch fan-out. `ProjectStats.overdueTasks` exists via
    `GET /analytics/projects/{id}/` but only per project -- calling that
    once per company project on every dashboard load is an N+1 pattern
    that doesn't scale and there's no bulk endpoint for it, so this uses
    the project's own deadline instead of its task-level overdue count.
    Real signal, zero extra requests.
- **DL -- department cockpit** (`src/views/Dashboard/roles/DlDashboard.vue`).
  Two widgets adapted for the same reason (no backing data):
  - **"Capacity %"** -- became a relative measure: each person's
    `activeTaskCount` as a share of the department's current busiest
    person (`employee.activeTaskCount / max(...)`), sublabelled with the
    raw count rather than a fabricated absolute percentage. Still answers
    the real question ("who's got the most on their plate right now, so I
    know who to reassign work away from") without inventing a capacity
    threshold that doesn't exist.
  - **"Blocked in `<Department>`"** -- `TaskType` has no blocked-status or
    dependency/wait-reason field at all (not even for AI-generated tasks --
    "dependency references" per CLAUDE.md's AI section describes sequencing
    within one AI-generated plan, not a general blocking relation on every
    task). Replaced with **"Overdue in `<Department>`"**: tasks past
    `deadline` and not Done, across the department's own projects (task
    fetches bounded to just those projects -- unlike the CM per-project-stats
    concern above, a single department's project count is small enough that
    this fan-out is reasonable). Equally actionable for a DL deciding where
    to intervene.
  - Everything else (department projects with a real derived progress bar
    from `task.total`/`task.active`, department events via
    `eventStore.fetchEvents({ departmentId })`, "mine outside my
    department" via `createdById`/`currentOwnerId`) is real, unmodified
    data.

## Projects

`src/views/Dashboard/ProjectsView.vue` is a large, pre-existing master-detail
screen (project list + task board/list/timeline, edit-in-place, cover image,
ownership transfer, archive) that already gated its manage controls
(edit/archive/owner-transfer) per-record via `canManageProject` before this
pass. Rebuilding it three times per role would have duplicated ~1000 lines
of working, already-permission-aware code -- instead:

- Extracted the repeated project-list-row markup into
  `src/components/projects/ProjectListRow.vue` (props: `project`, `active`;
  emits `select`/`view-detail`), used by every role's list rendering so
  there's one row implementation, not three.
- **Owner/CM** -- unchanged: the existing flat, paginated, status-filtered
  list.
- **DL** -- `showCompanyWide` toggle (default off) filters the same list to
  `departmentId === myDepartmentId`; flipping it removes that filter. Label
  reflects state (`"<Department> only"` / `"Company-visible projects"`).
  Verified in a real browser with `page.route()`-injected fixture data
  (mock mode can't be intercepted this way -- see "Dev-only role preview"
  below): off shows 2 of 3 fixture projects (same department), on shows all
  3.
- **DM** -- the list splits into two headed, unpaginated groups instead of
  one flat paginated one: "Created by me" (`createdById === myUserId`) and
  "I'm a member of" (everything else the backend returned). The `else`
  bucket is deliberately not a strict `assigneeIds.includes(myUserId)`
  check -- if the backend ever returns a project to a DM they're not a
  named collaborator on (e.g. a `company`-visibility project), this still
  surfaces it under "member of" rather than silently dropping it from the
  list entirely. Verified in the browser: created-by-me and member-of
  buckets populated correctly from fixture data.
- No changes needed to the detail panel's manage-control gating --
  `canManageProject`/`canManageSelectedProject` already did the "View only
  on projects you don't manage" part correctly before this pass.
- Removed `setActive`/`activeBorder` from the script block -- they were
  the row-highlight helpers `ProjectListRow` now handles internally as
  props, and became dead code once their only call site (the block just
  replaced) was gone.

## Events

`src/views/Dashboard/EventsView.vue` already gated per-event manage
controls (edit/delete) via `canManageEvent` on `EventCard.vue` before this
pass -- same story as Projects. Events don't carry a visibility enum like
projects do, so role scoping happens differently:

- **CM/Owner** -- unchanged flat grid, all events the backend returns.
- **DL** -- fetch stays unrestricted (same broad set CM/Owner get -- there's
  no per-role fetch filter), but the grid splits into two client-side
  groups: "Department" (`departmentId === myDepartmentId`) shown normally,
  "Company-wide" (everything else the backend returned, whether truly
  company-wide or another department's event) shown at `opacity-70`. Real
  distinction, not a fabricated one -- verified in browser with routed
  fixture data: own-department events grouped correctly, a different
  department's event and a no-department event both landed in the muted
  group.
- **DM** -- fetch *is* restricted, to `mine: true` (unlike DL, a DM
  shouldn't see events they have no connection to at all). Splits into
  three: "Organizing" (`organizerId === myUserId`, manage), "Attending"
  (has a department or team, RSVP only, normal), "Company-wide" (no
  department/team, RSVP only, muted). Verified the same way: organizer's
  own event in Organizing, a department-scoped invite in Attending, a
  no-department invite in Company-wide.
- Page title reads "My Events" for DM, "Events" for everyone else, matching
  the nav label table (`navConfig.ts` already only relabels DM's Events
  entry, not DL's).
- Left the "Select"/bulk-delete affordance visible for every role --
  per-card checkboxes are already individually disabled (with a tooltip)
  for events the current user can't manage, so it's never a dead button,
  just sometimes only partially useful. Hiding it entirely for DM felt like
  removing a working feature (bulk-deleting their own organized events)
  to make the empty-scenario tidier.

## Employees / People / Colleagues

`members:view` reaching every role is exactly why a DM used to land on the
company admin table -- this section splits into three real components
routed by role in `DashboardLayout.vue`'s `showSection` (same pattern as
Dashboard), not three copies of one table:

- **CM/Owner -- `EmployeesView.vue`** (existing file, extended, not
  replaced). Added: a new `isMemberRowLocked(actorRole, targetRole)` rule
  in `lib/permissions.ts` -- not a flat catalog code, same reasoning as the
  department-boundary comment already there: `members:remove`/
  `members:manage_role` say nothing about *whose* row, so "a CM can't
  touch an Owner or another CM row" (no peer-minting, no touching the
  Owner) is enforced here, mirroring the backend's own row-level carve-out.
  Locked rows render the role as plain text with no row menu at all (not
  disabled) -- verified in browser: Owner/CM rows show plain badges, no
  ⋮ icon; DL/DM rows show a live `Select` wired to
  `employeeStore.changeRole`. Also added a Status column (Active/Inactive
  badge from `Employee.isActive`, already fetched but never displayed) and
  made the name/avatar clickable through to the profile (previously only
  reachable via the now-conditionally-hidden row menu).
- **DL -- `PeopleView.vue`** (new). Cards instead of a table, scoped to
  `employee.department === myDepartment.name`. Two spec details don't map
  onto real data: "Team Lead" isn't a company `Role` (only Owner/CM/DL/DM
  exist -- team leadership is `Team.leaderId`, separate from company role),
  so the card tag is computed from real team-leadership data instead of a
  fabricated role value; "Invited" status has no backing list anywhere
  (same gap as CM's Pending Invitations, see "Dashboard" above), so the tag
  is just Team Lead / Member. "Invite to `<Department>`" reuses
  `EmployeeInviteModal.vue` with a new `lockedDepartmentId` prop (department
  picker becomes read-only, preset) -- Company Manager already couldn't
  appear in that modal's role options before this pass (gated by
  `members:invite_cm`, Owner-only), so no change was needed there.
  "Removal is a team-level action" -> a "Remove from team" button on cards
  that are actually on a team, calling `directoryStore.updateTeam` to drop
  them from `memberIds` -- never a company removal.
- **DM -- `ColleaguesView.vue`** (new). Read-only, no role/status/menu/
  invite -- the only action is Message, which (like PeopleView's Message
  button) just routes to the Messenger section rather than deep-linking a
  specific thread, since Messenger itself is mock/local-only and V1-excluded
  (no real "open a DM with user X" primitive exists to call). Roster is
  computed client-side: union of everyone sharing a team
  (`team.memberIds`) or a project (`createdById`/`assigneeIds`) with the
  current user -- not the company member list filtered, an actually
  different, smaller set. Verified in browser with fixture data: a
  teammate on a shared team appeared; people with no shared team or
  project didn't.

## Departments / My Department

Three components routed by role, same pattern as Employees:

- **CM/Owner -- `DepartmentsView.vue`/`DepartmentDetailView.vue`** (existing,
  unchanged behavior). Only cleanup: both files hardcoded
  `["Owner","CM","DL"].includes(role)` for `canManage` instead of calling
  the catalog -- replaced with `usePermissions().can("departments:manage")`
  so there's one source of truth instead of two lists that could drift.
- **DL -- `MyDepartmentDl.vue`** (new). Spotlight card for their own
  department (headcount, active projects, leader, Manage) plus other
  departments as compact "Open" rows. Dropped "teams" from the spotlight's
  metrics despite the spec listing it -- `TeamEntry` has no department
  field at all (a team can mix members from multiple departments, per
  `DepartmentsView.vue`'s own empty-state copy), so "teams in this
  department" isn't a real, computable number. "Manage" and "Open" both
  route to the existing `DepartmentDetailView.vue`, unchanged -- the
  backend's `departments:manage` grant isn't department-scoped, so a DL
  editing another department through this link already worked before this
  pass; this view only changes what's emphasized on landing, not what's
  reachable.
- **DM -- `MyDepartmentDm.vue`** (new). Fully read-only -- no call in this
  file mutates anything. "Team list with their own team marked": same
  no-department-field-on-Team problem as above, so "teams in this
  department" is computed as "teams with at least one member from this
  department" (the closest real proxy), with the DM's own team tagged
  "Your team". Leader row gets a "Message leader" button (routes to
  Messenger generally, same caveat as Colleagues' Message button above).

## Analytics / My Activity

Three components, same routing pattern as Dashboard/Employees/Departments:

- **CM/Owner -- `AnalyticsView.vue`** (existing, unchanged).
- **DL -- `MyActivityDl.vue`** (new). KPI row from
  `analyticsStore.departmentStats` filtered to their own department, plus a
  "Team load" list reusing the relative-load pattern from `DlDashboard.vue`
  (`PersonRow` + `MetricBar`, same file-header rationale: no real capacity
  figure exists, so it's active-tasks-relative-to-the-busiest-person, not
  an absolute percentage). No "cycle time" metric -- `DepartmentStats` is
  current totals only, no time-series, so there's no trend to compute.
- **DM -- `MyActivityDm.vue`** (new). Fully personal, built from the same
  client-side task aggregation as `DmDashboard.vue`'s "Today" (no flat "my
  tasks" endpoint -- see "Dashboard" above), just broadened to *all* of a
  DM's assigned tasks, not only today's. "Tasks completed" / "completed
  this week" / "on-time rate" all derived from a task's real `updatedAt`
  as a completion-time proxy (the backend has no dedicated
  `completed_at` field, but `updatedAt` reflects the last status
  transition, which for a Done task is exactly when it was completed).
  "Time by project" sums real `spentTimeHours` per project. Verified
  against hand-computed expected values with fixture tasks (one on-time
  completion, one late, one still open): completed=2, this-week=2,
  on-time=50%, time-by-project=6h -- all matched exactly.
- Nav label: DL's stays "Analytics" (only DM's is "My Activity") per
  `navConfig.ts`'s existing table -- unchanged by this section.

## AI Workspace

**No code changes.** Verified, didn't guess: `ai:request` was already
granted to all four roles in `lib/permissions.ts` before this pass, and
`navConfig.ts` (built in this pass) never conditionally hides the
`ai-workspace` entry -- it's present for every role.

The three spec requirements for this section turned out to already be true
in the existing code:

- **Project picker scoped to what the role can access** --
  `AiPlanCreator.vue`/`AiAssistantPanel.vue`/`AiHealthCheckPanel.vue` all
  pass `:projects="projectStore.projects"` into the shared
  `ProjectSelectionModal.vue`, and that store array is exactly the same
  backend-scoped list `ProjectsView.vue` groups into Created-by-me/
  Member-of for a DM (see "Projects" above) -- the backend already decides
  what a role can see at `GET /projects/`, so passing the store straight
  through was already correct.
- **Assignee picker limited to the selected project's members** --
  `AssigneeSelectionModal.vue`'s own header comment already says this is
  server-scoped via `projects_and_tasks.services.list_eligible_assignees`.
  Nothing to add.
- **Save-to-backlog disabled only when task-create rights are genuinely
  missing** -- moot: `tasks:create` is a baseline permission every role
  holds (see the catalog), and a project only reaches the picker if the
  backend already decided to return it, so there's no reachable state
  where a listed project can't have tasks added to it.

Verified in browser for DM/DL/CM: AI Workspace loads, the three modes and
the guided tour render, no console errors.

## Dev-only role preview

`src/views/Auth/login.vue` has a `v-if="isDevPreview"` block (gated on
`import.meta.env.DEV`, compiled out of production builds) with one button
per role that calls `authStore.loginAsDummy(role)` -- extended from the
pre-existing Owner-only `loginAsDummy()` -- and jumps straight to the
dashboard. Added because there was previously no way to exercise a
non-Owner role without a live backend and seeded company data, and every
later phase of this work (CM/DL dashboards, per-role Projects/Employees/
etc.) needs the same capability repeatedly. `DUMMY_LOGGED_IN_BY_ROLE` in
`src/mock/mockData.ts` holds the four variants (same mock user/company,
role + `departmentId` swapped).

Note while testing this: `src/mock/mockService.ts` only covers
auth/onboarding routes (`/auth/*`, `/sectors/*`, task-type/department
defaults). `/projects/`, `/events/`, `/analytics/company/members/`,
`/departments/`, `/teams/`, `/activity/` etc. have no mock coverage, so
`VITE_MOCK_API=true` shows every dashboard in its empty state, not
populated. That's a pre-existing gap, not something introduced here --
worth closing before this work goes much further, since every remaining
per-role screen needs real-ish data to review meaningfully.

## Testing

The spec (section 5) calls for automated tests: one per role x section
asserting forbidden controls are absent, permitted controls are present,
and route guards redirect. That requires a test runner and a Vue component
test utility, and this project had neither before this pass -- which
conflicts with the same spec's "do not add dependencies." Flagged to the
user directly rather than resolved silently; they chose to add the
toolchain. Added: `vitest` + `@vue/test-utils` + `jsdom` as devDependencies
only (nothing ships in the production bundle -- `vite build` never reaches
`*.test.ts` or `src/test-utils/` from the `main.ts` module graph), a `test`
block in `vite.config.ts` (via `vitest/config`'s `defineConfig`, a superset
of Vite's own so `vite build`/`vite dev` are unaffected), and `npm test` /
`npx vitest run` to run them. `src/test-utils/mockSession.ts` is the shared
helper for seeding a logged-in `authStore` as a given role in tests.

Coverage added so far (18 tests, 4 files):

- `src/lib/permissions.test.ts` -- the flat catalog against every code in
  the backend YAML: Owner-only billing/company-destructive/CM-minting
  grants, the Owner/CM `*:manage_any` company-wide tier vs DL/DM's absence
  of it, DL's department-admin grants that DM lacks, and the baseline
  operational grants (`ai:request`, `*:create`, `analytics:view`) every
  role shares.
- `src/lib/navConfig.test.ts` -- per-role label output against the spec's
  table, and that section *keys* (routing identity) never change across
  roles, only labels.
- `src/components/layout/Sidebar.test.ts` -- mounts the real `Sidebar.vue`
  per role and asserts the actual rendered DOM: permitted labels present,
  other roles' labels absent from the nav `<ul>`, the scope note shown only
  for DL/DM, `aria-current="page"` on the active item. This is the closest
  thing to the spec's literal "(a) forbidden controls absent, (b) permitted
  controls present" ask that's meaningful today, since nothing is actually
  *hidden* per role yet -- only relabeled (see "Nav" above).
- `src/views/Dashboard/DashboardHome.test.ts` -- the `isDM` branch renders
  `DmDashboard` for DM and the untouched company-wide widgets for
  Owner/CM/DL, nothing else.

Not covered yet, and why:

- **Route-guard redirects** -- `router/index.ts`'s guard only checks
  `is_authenticated` and onboarding-step completeness today; no route is
  actually forbidden to any role yet (every role can navigate to all nine
  sections, just sees different content/labels inside them). There's
  nothing to assert a redirect *from* until a CM/DL/DM-only route exists --
  Owner's billing surface, if it becomes a real route instead of an
  account-menu item, would be the first candidate.
- **Per-section forbidden/permitted controls beyond the nav** -- e.g. "CM
  cannot promote another CM" on the Employees table, "DL's invite dialog
  never offers Company Manager" -- because those screens haven't been
  built yet (see "Status" above). Add the test alongside the screen that
  makes the assertion meaningful, not before.

## Known follow-ups (not blocking, not forgotten)

- `src/components/dashboard/{ProjectsWidget,EventsWidget,WorkloadStats,
  ActivityStream}.vue` are now dead code -- nothing imports them since
  `DashboardHome.vue` moved to the three role dashboards above (grepped to
  confirm zero remaining references). Deleting them was blocked by the
  session's permission classifier; someone with delete access should remove
  them (`git rm src/components/dashboard/{ProjectsWidget,EventsWidget,
  WorkloadStats,ActivityStream}.vue`).

- Mobile bottom nav bar (9 icons) overflows a 390px-wide viewport and
  scrolls horizontally with no visible scroll affordance (no edge fade/
  hint). Functional, not broken, but worth a follow-up pass.
- `AiFloatingButton.vue`'s fixed position was bumped to `bottom-24
  md:bottom-6` so it clears the new mobile bottom nav bar -- a direct
  regression from adding that bar, fixed in the same pass, but worth
  double-checking against any other fixed-position mobile chrome added
  later.
