<script setup lang="ts">
import { ref, computed } from "vue";
import { CalendarDays, CheckSquare, Funnel, LayoutGrid, MoveLeft, Plus, Trash2, X } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import EventCard from "@/components/cards/EventCard.vue";
import EventFilterModal from "@/components/calendar/EventFilterModal.vue";
import CalendarView from "./CalendarView.vue";
import Header from "@/components/layout/Header.vue";
import AddEventModal from "@/components/calendar/AddEventModal.vue";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog.vue";
import { useToast } from "@/components/ui/toast/use-toast";
import { useRouter } from "vue-router";
import filterComposables from "@/composables/filterComposables";
import { useEventStore, type EventFilters } from "@/stores/eventStore";
import { usePermissions } from "@/composables/usePermissions";

const router = useRouter();
const eventStore = useEventStore();
const { toast } = useToast();
const { onOpen, isOpen } = filterComposables();
const { isDL, isDM, userId: myUserId, departmentId: myDepartmentId } = usePermissions();
const isAddEventOpen = ref(false);
const layout = ref<"cards" | "calendar">("cards");

const activeFilters = ref<EventFilters>({});
const page = ref(1);

const load = () => {
  // DM's "My Events" is scoped server-side to events they're actually
  // involved in; DL/CM/Owner get the broader company set (no visibility
  // enum on events like projects have, so grouping into department/
  // company-wide happens client-side below, not via a restrictive fetch).
  const roleFilter: EventFilters = isDM.value ? { mine: true } : {};
  eventStore.fetchEvents({ ...roleFilter, ...activeFilters.value, page: page.value });
};

// DL: department events first, everything else the backend returned shown
// muted below.
const departmentEvents = computed(() => eventStore.events.filter((e) => e.departmentId === myDepartmentId.value));
const otherEvents = computed(() => eventStore.events.filter((e) => e.departmentId !== myDepartmentId.value));

// DM: organizing (manage) / attending a department-or-team event (RSVP
// only) / attending a company-wide event (RSVP only, muted) -- all three
// derived from the same `mine: true` fetch above.
const organizingEvents = computed(() => eventStore.events.filter((e) => e.organizerId === myUserId.value));
const attendingScopedEvents = computed(() =>
  eventStore.events.filter((e) => e.organizerId !== myUserId.value && (e.departmentId || e.teamId))
);
const attendingCompanyEvents = computed(() =>
  eventStore.events.filter((e) => e.organizerId !== myUserId.value && !e.departmentId && !e.teamId)
);

const onFiltersChange = (filters: EventFilters) => {
  activeFilters.value = filters;
  page.value = 1;
  load();
};

load();

// Bulk select/delete -- one at a time via the per-card menu was the only
// way to clean up a batch of stale events (e.g. a whole recurring series
// created by mistake); selecting several and deleting together is the
// point of this mode.
const selectMode = ref(false);
const selectedIds = ref<string[]>([]);
const isBulkDeleteOpen = ref(false);
const bulkDeleting = ref(false);

const exitSelectMode = () => {
  selectMode.value = false;
  selectedIds.value = [];
};

const toggleSelect = (id: string) => {
  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter((existing) => existing !== id)
    : [...selectedIds.value, id];
};

const confirmBulkDelete = async () => {
  bulkDeleting.value = true;
  const results = await Promise.all(selectedIds.value.map((id) => eventStore.deleteEvent(id)));
  bulkDeleting.value = false;
  isBulkDeleteOpen.value = false;
  const failedCount = results.filter((r) => r.error).length;
  if (failedCount) {
    toast({
      title: "Some events weren't deleted",
      description: `${failedCount} of ${selectedIds.value.length} couldn't be deleted.`,
      variant: "destructive",
    });
  }
  exitSelectMode();
};
</script>

<template>
  <AddEventModal v-model:open="isAddEventOpen" />
  <EventFilterModal v-if="isOpen" :initial-filters="activeFilters" @apply="onFiltersChange" />

  <div class="flex-1 p-4">
    <div class="mb-6">
      <Header />
      <!-- Page Title -->
      <div class="grid grid-cols-1 md:grid-cols-3 items-center gap-4 mb-6">
        <div class="justify-self-start">
          <span class="flex gap-2 items-center cursor-pointer">
            <Button as="a" variant="link" @click="router.back()"><MoveLeft class="text-primary" /> Back to Dashboard</Button>
          </span>
          <h1 class="text-xl font-semibold pl-12">{{ isDM ? "My Events" : "Events" }}</h1>
        </div>

        <div class="flex items-center gap-1 rounded-xl bg-page p-1 justify-self-center">
          <button
            type="button"
            class="flex h-7 w-7 items-center justify-center rounded-lg transition"
            :class="layout === 'cards' ? 'bg-card text-primary shadow-sm' : 'text-subtle hover:text-primary'"
            title="Cards view"
            aria-label="Cards view"
            @click="layout = 'cards'"
          >
            <LayoutGrid class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="flex h-7 w-7 items-center justify-center rounded-lg transition"
            :class="layout === 'calendar' ? 'bg-card text-primary shadow-sm' : 'text-subtle hover:text-primary'"
            title="Calendar view"
            aria-label="Calendar view"
            @click="layout = 'calendar'"
          >
            <CalendarDays class="h-4 w-4" />
          </button>
        </div>

        <div class="flex items-center gap-2 justify-self-end">
          <template v-if="layout === 'cards'">
            <div
              class="flex justify-center items-center bg-card rounded-lg w-7 h-7 border border-border"
              title="Filter events"
              @click="onOpen"
            >
              <Button variant="ghost" size="icon" class="w-7 h-7">
                <Funnel class="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              class="h-9 rounded-xl text-sm"
              @click="selectMode ? exitSelectMode() : (selectMode = true)"
            >
              <component :is="selectMode ? X : CheckSquare" class="h-4 w-4" />
              {{ selectMode ? "Cancel" : "Select" }}
            </Button>
          </template>
          <Button @click="isAddEventOpen = true">
            <Plus /> Add Event
          </Button>
        </div>
      </div>

      <div v-if="selectMode" class="mb-4 flex items-center justify-between rounded-xl bg-primary/10 px-4 py-2.5">
        <span class="text-sm font-medium text-primary">{{ selectedIds.length }} selected</span>
        <Button
          variant="destructive"
          class="h-8 rounded-lg text-xs"
          :disabled="!selectedIds.length"
          @click="isBulkDeleteOpen = true"
        >
          <Trash2 class="h-3.5 w-3.5" /> Delete selected
        </Button>
      </div>
    </div>

    <template v-if="layout === 'cards'">
      <p v-if="eventStore.loading" class="px-2 py-6 text-center text-sm text-subtle">Loading events…</p>
      <p v-else-if="!eventStore.events.length" class="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-subtle">
        No events match these filters.
      </p>

      <!-- DM: organizing / attending (scoped) / attending (company-wide, muted) -->
      <div v-else-if="isDM" class="space-y-6 px-2">
        <div v-if="organizingEvents.length">
          <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-subtle">Organizing</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <EventCard v-for="event in organizingEvents" :key="event.id" :event="event" :selectable="selectMode" :selected="selectedIds.includes(event.id)" @toggle-select="toggleSelect" />
          </div>
        </div>
        <div v-if="attendingScopedEvents.length">
          <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-subtle">Attending</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <EventCard v-for="event in attendingScopedEvents" :key="event.id" :event="event" :selectable="selectMode" :selected="selectedIds.includes(event.id)" @toggle-select="toggleSelect" />
          </div>
        </div>
        <div v-if="attendingCompanyEvents.length">
          <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-subtle">Company-wide</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 opacity-70">
            <EventCard v-for="event in attendingCompanyEvents" :key="event.id" :event="event" :selectable="selectMode" :selected="selectedIds.includes(event.id)" @toggle-select="toggleSelect" />
          </div>
        </div>
      </div>

      <!-- DL: department events first, everything else muted below -->
      <div v-else-if="isDL" class="space-y-6 px-2">
        <div v-if="departmentEvents.length">
          <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-subtle">Department</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <EventCard v-for="event in departmentEvents" :key="event.id" :event="event" :selectable="selectMode" :selected="selectedIds.includes(event.id)" @toggle-select="toggleSelect" />
          </div>
        </div>
        <div v-if="otherEvents.length">
          <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-subtle">Company-wide</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 opacity-70">
            <EventCard v-for="event in otherEvents" :key="event.id" :event="event" :selectable="selectMode" :selected="selectedIds.includes(event.id)" @toggle-select="toggleSelect" />
          </div>
        </div>
      </div>

      <!-- Owner/CM: flat company calendar, unchanged -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 px-2">
        <EventCard
          v-for="event in eventStore.events"
          :key="event.id"
          :event="event"
          :selectable="selectMode"
          :selected="selectedIds.includes(event.id)"
          @toggle-select="toggleSelect"
        />
      </div>

      <div v-if="eventStore.meta && eventStore.meta.count > eventStore.meta.page_size" class="mt-4 flex items-center justify-end gap-3 text-sm text-subtle">
        <button type="button" class="rounded-lg p-1 hover:bg-page disabled:opacity-40" :disabled="page === 1" @click="page--; load()">Prev</button>
        <span>Page {{ page }}</span>
        <button type="button" class="rounded-lg p-1 hover:bg-page disabled:opacity-40" :disabled="!eventStore.meta.has_next" @click="page++; load()">Next</button>
      </div>
    </template>

    <CalendarView v-else />

    <ConfirmDeleteDialog
      v-model:open="isBulkDeleteOpen"
      title="Delete selected events?"
      :description="`This permanently deletes ${selectedIds.length} event${selectedIds.length === 1 ? '' : 's'}. This can't be undone.`"
      :loading="bulkDeleting"
      @confirm="confirmBulkDelete"
    />
  </div>
</template>
