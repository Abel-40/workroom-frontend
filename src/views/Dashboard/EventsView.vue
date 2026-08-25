<script setup lang="ts">
import { ref } from "vue";
import { CalendarDays, Funnel, LayoutGrid, MoveLeft, Plus } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import EventCard from "@/components/cards/EventCard.vue";
import EventFilterModal from "@/components/calendar/EventFilterModal.vue";
import CalendarView from "./CalendarView.vue";
import Header from "@/components/layout/Header.vue";
import AddEventModal from "@/components/calendar/AddEventModal.vue";
import { useRouter } from "vue-router";
import filterComposables from "@/composables/filterComposables";
import { useEventStore, type EventFilters } from "@/stores/eventStore";

const router = useRouter();
const eventStore = useEventStore();
const { onOpen, isOpen } = filterComposables();
const isAddEventOpen = ref(false);
const layout = ref<"cards" | "calendar">("cards");

const activeFilters = ref<EventFilters>({});
const page = ref(1);

const load = () => {
  eventStore.fetchEvents({ ...activeFilters.value, page: page.value });
};

const onFiltersChange = (filters: EventFilters) => {
  activeFilters.value = filters;
  page.value = 1;
  load();
};

load();
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
          <h1 class="text-xl font-semibold pl-12">Events</h1>
        </div>

        <div class="flex items-center gap-1 rounded-xl bg-[#F4F9FD] p-1 justify-self-center">
          <button
            type="button"
            class="flex h-7 w-7 items-center justify-center rounded-lg transition"
            :class="layout === 'cards' ? 'bg-white text-[#3F8CFF] shadow-sm' : 'text-[#7D8592] hover:text-[#3F8CFF]'"
            title="Cards view"
            aria-label="Cards view"
            @click="layout = 'cards'"
          >
            <LayoutGrid class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="flex h-7 w-7 items-center justify-center rounded-lg transition"
            :class="layout === 'calendar' ? 'bg-white text-[#3F8CFF] shadow-sm' : 'text-[#7D8592] hover:text-[#3F8CFF]'"
            title="Calendar view"
            aria-label="Calendar view"
            @click="layout = 'calendar'"
          >
            <CalendarDays class="h-4 w-4" />
          </button>
        </div>

        <div class="flex items-center gap-2 justify-self-end">
          <div
            v-if="layout === 'cards'"
            class="flex justify-center items-center bg-white rounded-lg w-7 h-7 border border-gray-100"
            title="Filter events"
            @click="onOpen"
          >
            <Button variant="ghost" size="icon" class="w-7 h-7">
              <Funnel class="w-4 h-4" />
            </Button>
          </div>
          <Button @click="isAddEventOpen = true">
            <Plus /> Add Event
          </Button>
        </div>
      </div>
    </div>

    <template v-if="layout === 'cards'">
      <p v-if="eventStore.loading" class="px-2 py-6 text-center text-sm text-subtle">Loading events…</p>
      <p v-else-if="!eventStore.events.length" class="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-subtle">
        No events match these filters.
      </p>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 px-2">
        <EventCard v-for="event in eventStore.events" :key="event.id" :event="event" />
      </div>

      <div v-if="eventStore.meta && eventStore.meta.count > eventStore.meta.page_size" class="mt-4 flex items-center justify-end gap-3 text-sm text-subtle">
        <button type="button" class="rounded-lg p-1 hover:bg-page disabled:opacity-40" :disabled="page === 1" @click="page--; load()">Prev</button>
        <span>Page {{ page }}</span>
        <button type="button" class="rounded-lg p-1 hover:bg-page disabled:opacity-40" :disabled="!eventStore.meta.has_next" @click="page++; load()">Next</button>
      </div>
    </template>

    <CalendarView v-else />
  </div>
</template>
