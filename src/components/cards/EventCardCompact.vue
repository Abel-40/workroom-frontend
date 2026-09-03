```vue
<script setup lang="ts">
import { computed, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import {
  ChevronRight,
  Clock3,
  MapPin,
  Users,
} from "lucide-vue-next";

import {
  formatDayNumber,
  formatMonthShort,
  formatTime,
} from "@/lib/dates";

import {
  EVENT_BADGE_CLASS,
  EVENT_CARD_BG_CLASS,
  eventColorFor,
} from "@/lib/eventColor";

import type { EventEntry } from "@/stores/eventStore";
import { useEmployeeStore } from "@/stores/employeeStore";

const props = defineProps<{ event: EventEntry }>();

const router = useRouter();
const employeeStore = useEmployeeStore();

onMounted(() => {
  if (!employeeStore.employees.length) employeeStore.fetchEmployees();
});

const goToDetail = () => {
  router.push({
    name: "admin-dashboard",
    query: {
      section: "event-detail",
      eventId: props.event.id,
    },
  });
};

const color = computed(() =>
  eventColorFor(props.event.eventTypeName || props.event.title)
);

const badgeClass = computed(() => EVENT_BADGE_CLASS[color.value]);

const cardBgClass = computed(() => EVENT_CARD_BG_CLASS[color.value]);

// The event's real attendee list is the only source of truth for who's
// assigned (matches EventDetailView's "Attendees (event.attendees.length)")
// -- department/team on the event are just categorization, not an implicit
// "everyone in that department is assigned" list, so they're not used here.
const assignedMembers = computed(() =>
  props.event.attendees.map((attendee) => {
    const employee = employeeStore.employees.find((e) => e.id === attendee.id);
    return { id: attendee.id, name: attendee.name, profileImage: employee?.profilePictureUrl ?? null };
  })
);

const visibleMembers = computed(() => assignedMembers.value.slice(0, 4));

const remainingMembers = computed(() => Math.max(assignedMembers.value.length - 4, 0));

const getInitials = (name?: string) => {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase() || "?";
};

// profileImage being set only means a URL was on record -- the actual file
// can 404 (deleted, broken link). Track load failures per member id so a
// broken image falls back to the initial instead of a broken <img>.
const failedImageIds = reactive<Record<string, boolean>>({});
</script>

<template>
  <article
    class="group relative flex min-h-[115px] w-full cursor-pointer items-center overflow-hidden rounded-2xl border border-border bg-card px-5 py-3.5 transition-all duration-200 hover:-translate-y-[1px] hover:border-[hsl(var(--primary-strong)/0.25)] hover:shadow-[0_8px_28px_rgba(15,23,42,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary-strong)/0.35)] focus-visible:ring-offset-2"
    :class="cardBgClass"
    role="button"
    tabindex="0"
    :aria-label="`Open event: ${event.title}`"
    @click="goToDetail"
    @keydown.enter="goToDetail"
    @keydown.space.prevent="goToDetail"
  >
    <!-- Primary accent -->
    <div
      class="absolute inset-y-4 left-0 w-1 rounded-r-full bg-[hsl(var(--primary-strong))] opacity-80"
    />

    <!-- ========================================================= -->
    <!-- DATE -->
    <!-- ========================================================= -->

    <div
      class="flex h-[62px] w-[62px] shrink-0 flex-col items-center justify-center rounded-xl border border-[hsl(var(--primary-soft))] bg-[hsl(var(--primary-soft))] text-[hsl(var(--primary-strong))]"
    >
      <span
        class="text-[9px] font-bold uppercase tracking-[0.1em] opacity-75"
      >
        {{ formatMonthShort(event.startAt) }}
      </span>

      <span class="mt-0.5 text-[19px] font-bold leading-none">
        {{ formatDayNumber(event.startAt) }}
      </span>
    </div>

    <!-- ========================================================= -->
    <!-- MAIN EVENT INFORMATION -->
    <!-- ========================================================= -->

    <div class="ml-5 min-w-0 flex-1">
      <!-- Title + event type -->
      <div class="flex min-w-0 items-center gap-2.5">
        <h3
          class="min-w-0 truncate text-[14px] font-semibold text-ink transition-colors group-hover:text-[hsl(var(--primary-strong))]"
          :title="event.title"
        >
          {{ event.title }}
        </h3>

      </div>

      <!-- Metadata -->
      <div
        class="mt-2 flex min-w-0 items-center gap-4 text-[11px] font-medium text-subtle"
      >
        <!-- Time -->
        <span class="flex shrink-0 items-center gap-1.5">
          <Clock3 class="h-3.5 w-3.5 text-[hsl(var(--primary-strong))]" />
          {{ formatTime(event.startAt) }}
        </span>

      </div>
    </div>

    <!-- ========================================================= -->
    <!-- INVITED / ASSIGNED MEMBERS -->
    <!-- ========================================================= -->

    <div
      v-if="assignedMembers.length"
      class="ml-auto mr-6 hidden shrink-0 items-start md:flex"
    >
      <div class="flex items-center">
        <!-- Avatar stack -->
        <div class="flex items-center pl-1">
          <template
            v-for="(member, index) in visibleMembers"
            :key="member.id"
          >
            <div
              class="relative h-6 w-6 shrink-0 overflow-hidden rounded-full border-2 border-card bg-[hsl(var(--primary-soft))] shadow-sm transition-transform duration-200 hover:z-20 hover:scale-110"
              :class="index > 0 ? '-ml-4' : ''"
              :title="member.name"
              :style="{ zIndex: visibleMembers.length - index }"
            >
              <!-- Profile picture -->
              <img
                v-if="member.profileImage && !failedImageIds[member.id]"
                :src="member.profileImage"
                :alt="member.name"
                class="h-full w-full object-cover"
                @error="failedImageIds[member.id] = true"
              />

              <!-- First letter fallback -->
              <span
                v-else
                class="flex h-full w-full items-center justify-center bg-[hsl(var(--primary-soft))] text-[10px] font-bold uppercase text-[hsl(var(--primary-strong))]"
              >
                {{ getInitials(member.name) }}
              </span>
            </div>
          </template>

          <!-- Remaining members -->
          <div
            v-if="remainingMembers > 0"
            class="-ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-card bg-muted text-[9px] font-bold text-muted-foreground shadow-sm"
            :title="`${remainingMembers} more members`"
          >
            +{{ remainingMembers }}
          </div>
        </div>

        <!-- Member count -->
        <span
          class="ml-3 text-[10px] font-medium whitespace-nowrap text-subtle"
        >
          {{ assignedMembers.length }}
          {{ assignedMembers.length === 1 ? "member" : "members" }}
        </span>
      </div>
    </div>


    <!-- ========================================================= -->
    <!-- RIGHT SIDE -->
    <!-- ========================================================= -->

    <div class="ml-auto flex shrink-0 items-center gap-3">
      <!-- Event type indicator for smaller screens -->
        <!-- Event type -->
        <span
          v-if="event.eventTypeName"
          class="hidden shrink-0 rounded-full bg-[hsl(var(--primary-soft))] px-2.5 py-1 text-[9px] font-semibold text-[hsl(var(--primary-strong))] sm:inline-flex"
        >
          {{ event.eventTypeName }}
        </span>

      <!-- Arrow -->
      <div
        class="flex h-9 w-9 items-center justify-center rounded-full text-subtle transition-all duration-200 group-hover:bg-[hsl(var(--primary-soft))] group-hover:text-[hsl(var(--primary-strong))] group-hover:shadow-sm"
      >
        <ChevronRight
          class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </div>
    </div>
  </article>
</template>
```
