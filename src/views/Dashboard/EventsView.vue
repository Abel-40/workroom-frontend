<script setup lang="ts">
import { onMounted, ref } from "vue";
import { MoveLeft, Plus } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import EventCard from "@/components/cards/EventCard.vue";
import EventFilterBar from "@/components/calendar/EventFilterBar.vue";
import Header from "@/components/layout/Header.vue";
import AddEventModal from "@/components/calendar/AddEventModal.vue";
import { useRouter } from "vue-router";
import { useEventStore, type EventFilters } from "@/stores/eventStore";

const router = useRouter();
const eventStore = useEventStore();
const isAddEventOpen = ref(false);

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

onMounted(load);
</script>

<template>
  <AddEventModal v-model:open="isAddEventOpen" />
  <div class="flex-1 p-4">
        <div class="mb-6">
        <Header/>
            <!-- Page Title -->
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <span class="flex gap-2 items-center cursor-pointer">
                    <Button as="a" variant="link"   @click="router.back()"><MoveLeft class="text-primary"/> Back to Dashboard</Button>
                  </span>
                  <h1 class="text-xl font-semibold pl-12">Events</h1>
                </div>
              <div  class="flex items-center gap-2  px-3 py-2 rounded-md">
                <Button @click="isAddEventOpen = true">
                  <Plus/>
                    Add Event
                </Button>
              </div>
            </div>
      </div>

    <EventFilterBar @change="onFiltersChange" />

    <p v-if="eventStore.loading" class="px-2 py-6 text-center text-sm text-subtle">Loading events…</p>
    <p v-else-if="!eventStore.events.length" class="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-subtle">
      No events match these filters.
    </p>
    <div v-else class="w-full 2xl:w-  2xl: grid grid-cols-2 gap-6   px-2">
      <EventCard v-for="event in eventStore.events" :key="event.id" :event="event" />
    </div>

    <div v-if="eventStore.meta && eventStore.meta.count > eventStore.meta.page_size" class="mt-4 flex items-center justify-end gap-3 text-sm text-subtle">
      <button type="button" class="rounded-lg p-1 hover:bg-page disabled:opacity-40" :disabled="page === 1" @click="page--; load()">Prev</button>
      <span>Page {{ page }}</span>
      <button type="button" class="rounded-lg p-1 hover:bg-page disabled:opacity-40" :disabled="!eventStore.meta.has_next" @click="page++; load()">Next</button>
    </div>
  </div>
</template>
