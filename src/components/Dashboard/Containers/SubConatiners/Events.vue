<script setup lang="ts">
import {ChevronRight} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import EventCard from "../../Cards/EventCard.vue";
import {ref} from "vue"
const events = ref([
  {
    id: 1,
    title: "Presentation of the new department",
    date: "Today",
    time: "5:00 PM",
    duration: "4h"
  },
  {
    id: 2,
    title: "Anna's Birthday",
    date: "Today",
    time: "6:00 PM",
    duration: "4h"
  },
  {
    id: 3,
    title: "Ray's Birthday",
    date: "Tomorrow",
    time: "2:00 PM",
    duration: "4h"
  }
]);
</script>

<template>
    <!-- Events -->
    <div class="w-full lg:w-1/3 bg-white p-4 rounded-xl shadow-sm">
      <div class="flex justify-between items-center mb-4">
        <h2 class="font-semibold">Nearest Events</h2>
        <Button variant="link" as="a" class="text-sm p-0">
          <RouterLink :to="{ name: 'admin-dashboard', query: { section: 'events' } }">View all</RouterLink> <ChevronRight class="w-4 h-4" />
        </Button>
      </div>

      <div class="space-y-4">
        <!-- Event 1 -->
        <EventCard
          v-for="event in events"
          :title="event.title"
          :key="event.id"
          :date="event.date"
          :time="event.time"
          :duration="event.duration"
        />
      </div>
    </div>
</template>