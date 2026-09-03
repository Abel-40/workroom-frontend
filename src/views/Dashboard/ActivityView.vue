<script setup lang="ts">
// Dedicated full-history activity feed (Analytics only shows a capped
// preview). The backend endpoint has no category/kind concept, so both
// filters are derived client-side from the small, stable ActivityType enum
// -- see ACTIVITY_KIND / ACTIVITY_CATEGORY below.
import { computed, onMounted, ref, watch } from "vue";
import {
  ArrowLeft, ArrowRight, ArrowRightLeft, Building2, CheckCircle2, FolderPlus, History,
  RotateCcw, UserCheck, UserMinus, UserPlus, Users,
} from "lucide-vue-next";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActivityStore, type ActivityType } from "@/stores/activityStore";
import { usePermissions } from "@/composables/usePermissions";
import { formatRelativeTime, formatShortDate } from "@/lib/dates";

const activityStore = useActivityStore();
const { isAdmin, userId } = usePermissions();

const page = ref(1);
const PAGE_SIZE = 20;
const load = () => activityStore.fetchActivitiesPage(page.value, PAGE_SIZE);
onMounted(load);
watch(page, load);
const totalPages = computed(() =>
  activityStore.meta ? Math.max(1, Math.ceil(activityStore.meta.count / activityStore.meta.page_size)) : 1
);

// A windowed page list, so a company with hundreds of entries doesn't render
// hundreds of buttons: always first/last, plus a couple either side of the
// current page, with gaps collapsed to an ellipsis.
const pageItems = computed<Array<number | "gap">>(() => {
  const total = totalPages.value;
  const current = page.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const items: Array<number | "gap"> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push("gap");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < total - 1) items.push("gap");
  items.push(total);
  return items;
});

const goToPage = (target: number) => {
  if (target >= 1 && target <= totalPages.value && target !== page.value) page.value = target;
};

// Human-readable "showing X-Y of Z" for the current page.
const rangeLabel = computed(() => {
  const meta = activityStore.meta;
  if (!meta || meta.count === 0) return "";
  const from = (meta.page - 1) * meta.page_size + 1;
  const to = Math.min(meta.page * meta.page_size, meta.count);
  return `${from}-${to} of ${meta.count}`;
});

const ICONS: Record<ActivityType, typeof FolderPlus> = {
  project_created: FolderPlus,
  project_completed: CheckCircle2,
  project_reopened: RotateCcw,
  project_ownership_transferred: ArrowRightLeft,
  member_invited: UserPlus,
  member_joined: UserCheck,
  member_removed: UserMinus,
  department_created: Building2,
  team_created: Users,
};
const TYPE_LABEL: Record<ActivityType, string> = {
  project_created: "Project created",
  project_completed: "Project completed",
  project_reopened: "Project reopened",
  project_ownership_transferred: "Ownership transferred",
  member_invited: "Member invited",
  member_joined: "Member joined",
  member_removed: "Member removed",
  department_created: "Department created",
  team_created: "Team created",
};
const ACTIVITY_KIND: Record<ActivityType, "created" | "updated"> = {
  project_created: "created",
  project_completed: "updated",
  project_reopened: "updated",
  project_ownership_transferred: "updated",
  member_invited: "created",
  member_joined: "updated",
  member_removed: "updated",
  department_created: "created",
  team_created: "created",
};
type ActivityCategory = "project" | "member" | "department" | "team";
const ACTIVITY_CATEGORY: Record<ActivityType, ActivityCategory> = {
  project_created: "project",
  project_completed: "project",
  project_reopened: "project",
  project_ownership_transferred: "project",
  member_invited: "member",
  member_joined: "member",
  member_removed: "member",
  department_created: "department",
  team_created: "team",
};
const CATEGORY_LABEL: Record<ActivityCategory, string> = {
  project: "Project",
  member: "Member",
  department: "Department",
  team: "Team",
};

const kindFilter = ref<"all" | "created" | "updated">("all");
const categoryFilter = ref<"all" | ActivityCategory>("all");

// Elevated roles (Owner/CM) don't see their own actions in their own feed --
// they still see every other elevated user's actions. Non-admins are
// unaffected (they only ever see what the company-scoped API already
// returned them).
const visibleActivities = computed(() =>
  activityStore.activities.filter((activity) => {
    if (isAdmin.value && activity.actorId && activity.actorId === userId.value) return false;
    if (kindFilter.value !== "all" && ACTIVITY_KIND[activity.type] !== kindFilter.value) return false;
    if (categoryFilter.value !== "all" && ACTIVITY_CATEGORY[activity.type] !== categoryFilter.value) return false;
    return true;
  })
);
</script>

<template>
  <div class="flex-1 p-4">
    <div class="mb-6">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-xl font-semibold">Activity</h1>
          <p class="mt-1 text-sm text-subtle">A running log of what's happened across your company.</p>
        </div>
        <div class="flex items-center gap-2">
          <Select v-model="kindFilter">
            <SelectTrigger class="h-9 w-[150px] rounded-lg text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All kinds</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="updated">Updated</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select v-model="categoryFilter">
            <SelectTrigger class="h-9 w-[170px] rounded-lg text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem v-for="(label, key) in CATEGORY_LABEL" :key="key" :value="key">{{ label }}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <div class="rounded-2xl border border-border bg-card">
      <p v-if="activityStore.loading" class="px-4 py-10 text-center text-sm text-subtle">Loading activity…</p>
      <div v-else-if="!visibleActivities.length" class="flex flex-col items-center gap-3 px-4 py-16 text-center">
        <span class="flex h-12 w-12 items-center justify-center rounded-full bg-page text-subtle"><History class="h-5 w-5" /></span>
        <p class="text-sm font-medium text-ink">No activity to show</p>
        <p class="max-w-sm text-xs text-subtle">Nothing matches these filters yet, or nothing's happened here recently.</p>
      </div>
      <div v-else>
        <div
          v-for="activity in visibleActivities"
          :key="activity.id"
          class="flex items-start gap-3 border-b border-border px-4 py-3 last:border-b-0"
        >
          <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <component :is="ICONS[activity.type] ?? History" class="h-4 w-4" />
          </span>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <p class="text-sm font-medium text-ink">{{ TYPE_LABEL[activity.type] ?? activity.type }}</p>
              <p class="text-xs text-subtle" :title="formatShortDate(activity.createdAt)">{{ formatRelativeTime(activity.createdAt) }}</p>
            </div>
            <p class="mt-0.5 text-sm text-subtle">{{ activity.summary }}</p>
            <p v-if="activity.actorName" class="mt-1 text-xs text-subtle">by <span class="font-medium text-ink">{{ activity.actorName }}</span></p>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="activityStore.meta && activityStore.meta.count > 0"
      class="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row"
    >
      <p class="text-xs text-subtle">Showing {{ rangeLabel }}</p>

      <nav class="flex items-center gap-1" aria-label="Activity pagination">
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-page hover:text-ink disabled:pointer-events-none disabled:opacity-40"
          :disabled="page === 1"
          aria-label="Previous page"
          @click="goToPage(page - 1)"
        >
          <ArrowLeft class="h-4 w-4" />
        </button>

        <template v-for="(item, index) in pageItems" :key="`${item}-${index}`">
          <span v-if="item === 'gap'" class="px-1 text-xs text-subtle">…</span>
          <button
            v-else
            type="button"
            class="h-8 min-w-8 rounded-lg px-2 text-xs font-medium transition-colors"
            :class="
              item === page
                ? 'bg-primary text-primary-foreground'
                : 'text-subtle hover:bg-page hover:text-ink'
            "
            :aria-current="item === page ? 'page' : undefined"
            @click="goToPage(item)"
          >
            {{ item }}
          </button>
        </template>

        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-page hover:text-ink disabled:pointer-events-none disabled:opacity-40"
          :disabled="!activityStore.meta.has_next"
          aria-label="Next page"
          @click="goToPage(page + 1)"
        >
          <ArrowRight class="h-4 w-4" />
        </button>
      </nav>
    </div>
  </div>
</template>
