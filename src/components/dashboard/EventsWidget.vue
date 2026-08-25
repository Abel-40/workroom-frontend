<script setup lang="ts">
import { onMounted } from "vue";
import { ChevronRight } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import EventCardCompact from "@/components/cards/EventCardCompact.vue";
import { useEventStore } from "@/stores/eventStore";
const eventStore = useEventStore();

onMounted(() => {
  // Scope to "from today onward" and always refetch: this store is shared
  // with the Events page, so relying on `events.length` as a cache guard
  // meant this widget could silently render whatever page another view had
  // last fetched (e.g. an unrelated month, or the oldest historical page).
  eventStore.fetchEvents({ startDate: new Date().toISOString().slice(0, 10), pageSize: 50 });
});
</script>

<template>
    <!-- Events -->
    <div class="w-full lg:w-1/3 bg-white px-6 py-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div class="flex justify-between items-center mb-4">
        <h2 class="font-semibold text-[#0A1629] relative pl-3 before:absolute before:left-0 before:top-0.5 before:h-4 before:w-1 before:rounded-full before:bg-[#3F8CFF]">Nearest Events</h2>
        <Button variant="link" as="a" class="text-sm p-0 group text-[#3F8CFF]">
          <RouterLink :to="{ name: 'admin-dashboard', query: { section: 'events' } }">View all</RouterLink> <ChevronRight class="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>

      <div v-if="eventStore.nearest.length" class="space-y-3">
        <EventCardCompact v-for="event in eventStore.nearest" :key="event.id" :event="event" />
      </div>
      <div v-else class="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-subtle">
        No upcoming events.
      </div>
    </div>
</template>
