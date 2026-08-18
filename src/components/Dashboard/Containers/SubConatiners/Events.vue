<script setup lang="ts">
import {ChevronRight} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import EventCard from "../../Cards/EventCard.vue";
import { useEventStore } from "@/stores/eventStore";
const eventStore = useEventStore();
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

      <div class="space-y-4">
        <EventCard
          v-for="event in eventStore.nearest"
          :title="event.title"
          :key="event.id"
          :date="event.date"
          :time="event.time"
          :duration="event.duration"
          :icon="event.icon"
          :priority="event.priority"
          :color="event.color"
        />
      </div>
    </div>
</template>