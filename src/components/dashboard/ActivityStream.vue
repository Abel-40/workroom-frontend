<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  ChevronDown,
  FolderPlus,
  CheckCircle2,
  RotateCcw,
  ArrowRightLeft,
  UserPlus,
  UserCheck,
  UserMinus,
  Building2,
  Users,
  Sparkles,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { useActivityStore, type ActivityType } from "@/stores/activityStore";
import { formatRelativeTime } from "@/lib/dates";

const DASHBOARD_LIMIT = 3;

const activityStore = useActivityStore();
const router = useRouter();

onMounted(() => {
  activityStore.fetchActivities(DASHBOARD_LIMIT);
});

const viewMore = () => router.push({ name: "admin-dashboard", query: { section: "analytics" } });

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
const COLORS: Record<ActivityType, string> = {
  project_created: "text-primary",
  project_completed: "text-green-500",
  project_reopened: "text-amber-500",
  project_ownership_transferred: "text-purple-500",
  member_invited: "text-amber-500",
  member_joined: "text-green-500",
  member_removed: "text-red-500",
  department_created: "text-primary",
  team_created: "text-primary",
};
const iconFor = (type: ActivityType) => ICONS[type] ?? Sparkles;
const colorFor = (type: ActivityType) => COLORS[type] ?? "text-primary";

const items = computed(() => activityStore.activities.slice(0, DASHBOARD_LIMIT));
</script>

<template>
            <!-- Activity Stream -->
      <div class="w-full lg:w-1/3 bg-card px-6 py-4 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow duration-200">
            <h2 class="font-semibold mb-4 text-ink relative pl-3 before:absolute before:left-0 before:top-0.5 before:h-4 before:w-1 before:rounded-full before:bg-primary">Activity Stream</h2>

            <div v-if="!items.length" class="py-6 text-center text-sm text-subtle">
              No company activity yet.
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="activity in items"
                :key="activity.id"
                class="flex items-start gap-2 bg-page p-3 rounded-lg hover:bg-primary/10 transition-colors duration-200"
              >
                <span class="flex items-center justify-center w-8 h-8 rounded-full bg-card shrink-0 shadow-sm">
                  <component :is="iconFor(activity.type)" class="w-4 h-4" :class="colorFor(activity.type)" />
                </span>
                <div class="min-w-0">
                  <p class="text-sm text-ink">{{ activity.summary }}</p>
                  <p class="text-xs text-subtle">{{ formatRelativeTime(activity.createdAt) }}</p>
                </div>
              </div>

              <Button
                variant="link"
                class="text-sm p-0 flex items-center gap-1 group text-primary"
                @click="viewMore"
              >
                View more <ChevronDown class="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
              </Button>
            </div>
  </div>
</template>
