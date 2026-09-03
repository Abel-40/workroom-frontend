<script setup lang="ts">
import { computed } from "vue";
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
  Paperclip,
  CloudUpload,
} from "lucide-vue-next";

import { Button } from "@/components/ui/button";
import type { ActivityType } from "@/stores/activityStore";

const router = useRouter();

/* ============================================================
   DEMO DATA
   ============================================================
   This widget doesn't hit the real backend/activityStore -- the
   real ActivityEntry type only has flat actorId/actorName strings,
   not a nested actor object with jobTitle/profilePictureUrl, so it
   can't drive this grouped-by-user layout as-is. */
interface DemoActivity {
  id: string;
  type: ActivityType;
  summary: string;
  actor: {
    id: string;
    name: string;
    jobTitle?: string | null;
    profilePictureUrl?: string | null;
  };
}

const DEMO_ACTIVITIES: DemoActivity[] = [
  {
    id: "demo-1",
    type: "project_created",
    summary: 'Created the project "Website Relaunch".',
    actor: { id: "u1", name: "Amara Chen", jobTitle: "Product Manager", profilePictureUrl: null },
  },
  {
    id: "demo-2",
    type: "member_invited",
    summary: "Invited Daniel Osei to the Engineering department.",
    actor: { id: "u1", name: "Amara Chen", jobTitle: "Product Manager", profilePictureUrl: null },
  },
  {
    id: "demo-3",
    type: "project_completed",
    summary: 'Marked "Q3 Marketing Plan" as complete.',
    actor: { id: "u2", name: "Priya Nair", jobTitle: "Marketing Lead", profilePictureUrl: null },
  }
];

/* ============================================================
   NAVIGATION
   ============================================================ */

const viewMore = () => {
  router.push({
    name: "admin-dashboard",
    query: {
      section: "analytics",
    },
  });
};

/* ============================================================
   ICONS
   ============================================================ */

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
  project_created: "text-[hsl(var(--primary-strong))]",
  project_completed: "text-emerald-500",
  project_reopened: "text-amber-500",
  project_ownership_transferred: "text-violet-500",

  member_invited: "text-amber-500",
  member_joined: "text-emerald-500",
  member_removed: "text-red-500",

  department_created: "text-[hsl(var(--primary-strong))]",
  team_created: "text-[hsl(var(--primary-strong))]",
};

const iconFor = (type: ActivityType) => {
  /*
   * These two can be used if you have corresponding activity
   * types in the future.
   */
  if (type === "project_completed") {
    return CheckCircle2;
  }

  return ICONS[type] ?? Sparkles;
};

const colorFor = (type: ActivityType) =>
  COLORS[type] ?? "text-[hsl(var(--primary-strong))]";

/* ============================================================
   ACTIVITY HELPERS
   ============================================================ */

const getInitials = (name?: string) => {
  if (!name) return "?";

  return name.trim().charAt(0).toUpperCase() || "?";
};

/*
 * The reference design has some activities with special icons.
 *
 * You can customize these mappings according to your backend
 * activity types.
 */
const isFileActivity = (type: ActivityType) => {
  return (
    type === "project_created" ||
    type === "member_invited"
  );
};

const isStatusActivity = (type: ActivityType) => {
  return (
    type === "project_completed" ||
    type === "project_reopened"
  );
};

/* ============================================================
   GROUP ACTIVITIES BY USER
   ============================================================ */

const activityGroups = computed(() => {
  const groups = new Map<
    string,
    {
      user: {
        id: string;
        name: string;
        jobTitle?: string | null;
        profilePictureUrl?: string | null;
      };
      activities: DemoActivity[];
    }
  >();

  for (const activity of DEMO_ACTIVITIES) {
    const actor = activity.actor;
    const existing = groups.get(actor.id);

    if (existing) {
      existing.activities.push(activity);
    } else {
      groups.set(actor.id, {
        user: {
          id: actor.id,
          name: actor.name,
          jobTitle: actor.jobTitle,
          profilePictureUrl: actor.profilePictureUrl,
        },
        activities: [activity],
      });
    }
  }

  return Array.from(groups.values());
});
</script>

<template>
  <!-- ========================================================= -->
  <!-- ACTIVITY STREAM -->
  <!-- ========================================================= -->

  <section
    class="w-full rounded-2xl border border-border bg-card px-5 py-5 shadow-sm transition-shadow duration-200 hover:shadow-md"
  >
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <h2
        class="text-[15px] font-semibold tracking-[-0.01em] text-ink"
      >
        Activity Stream
      </h2>
    </div>

    <!-- Empty state -->
    <div
      v-if="!activityGroups.length"
      class="flex min-h-[220px] items-center justify-center text-center"
    >
      <div>
        <div
          class="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--primary-soft))]"
        >
          <Sparkles
            class="h-5 w-5 text-[hsl(var(--primary-strong))]"
          />
        </div>

        <p class="text-sm font-medium text-ink">
          No company activity yet
        </p>

        <p class="mt-1 text-xs text-subtle">
          Activity from your company will appear here.
        </p>
      </div>
    </div>

    <!-- Activity groups -->
    <div v-else class="space-y-6">
      <div
        v-for="group in activityGroups"
        :key="group.user.id"
        class="min-w-0"
      >
        <!-- =================================================== -->
        <!-- USER -->
        <!-- =================================================== -->

        <div class="bg-red mb-3 flex items-center gap-3">
          <!-- Avatar -->
          <div
            class="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[hsl(var(--primary-soft))] ring-2 ring-white"
          >
            <img
              v-if="group.user.profilePictureUrl"
              :src="group.user.profilePictureUrl"
              :alt="group.user.name"
              class="h-full w-full object-cover"
            />

            <span
              v-else
              class="flex h-full w-full items-center justify-center text-[12px] font-bold text-[hsl(var(--primary-strong))]"
            >
              {{ getInitials(group.user.name) }}
            </span>
          </div>

          <!-- User information -->
          <div class="min-w-0">
            <p
              class="truncate text-[13px] font-semibold leading-5 text-ink"
            >
              {{ group.user.name }}
            </p>

            <p
              v-if="group.user.jobTitle"
              class="truncate text-[11px] leading-4 text-subtle"
            >
              {{ group.user.jobTitle }}
            </p>
          </div>
        </div>

        <!-- =================================================== -->
        <!-- USER ACTIVITIES -->
        <!-- =================================================== -->

        <div class="space-y-2.5 pl-0">
          <div
            v-for="activity in group.activities"
            :key="activity.id"
            class="group/activity flex min-h-[54px] items-center gap-3 rounded-xl bg-[hsl(var(--primary-soft)/0.38)] px-3.5 py-3 transition-all duration-200 hover:bg-[hsl(var(--primary-soft)/0.65)]"
          >
            <!-- Activity icon -->
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card shadow-sm"
            >
              <!-- Special file icon -->
              <Paperclip
                v-if="isFileActivity(activity.type)"
                class="h-[17px] w-[17px] text-violet-500"
              />

              <!-- Special status icon -->
              <CloudUpload
                v-else-if="isStatusActivity(activity.type)"
                class="h-[17px] w-[17px] text-[hsl(var(--primary-strong))]"
              />

              <!-- Default icon -->
              <component
                v-else
                :is="iconFor(activity.type)"
                class="h-[17px] w-[17px]"
                :class="colorFor(activity.type)"
              />
            </div>

            <!-- Activity text -->
            <div class="min-w-0 flex-1">
              <p
                class="text-[12px] font-medium leading-[18px] text-ink"
              >
                {{ activity.summary }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ===================================================== -->
      <!-- VIEW MORE -->
      <!-- ===================================================== -->

      <div class="flex justify-center pt-0.5">
        <Button
          variant="link"
          class="h-auto gap-1.5 p-0 text-[12px] font-medium text-[hsl(var(--primary-strong))] hover:no-underline"
          @click="viewMore"
        >
          View more

          <ChevronDown
            class="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-y-0.5"
          />
        </Button>
      </div>
    </div>
  </section>
</template>