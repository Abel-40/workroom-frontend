<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { Clock10, MapPin, Users } from "lucide-vue-next";
import { formatShortDate, formatTime } from "@/lib/dates";
import { EVENT_BORDER_CLASS, eventColorFor } from "@/lib/eventColor";
import type { EventEntry } from "@/stores/eventStore";

const props = defineProps<{ event: EventEntry }>();

const router = useRouter();
const goToDetail = () =>
  router.push({ name: "admin-dashboard", query: { section: "event-detail", eventId: props.event.id } });

const color = computed(() => eventColorFor(props.event.eventTypeName || props.event.title));
</script>

<template>
  <div
    class="group relative bg-background rounded-lg border border-gray-100 shadow-sm h-full p-3 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 ease-out"
    role="button"
    tabindex="0"
    @click="goToDetail"
    @keydown.enter="goToDetail"
  >
    <span class="pointer-events-none absolute -top-10 -right-10 w-28 h-28 rounded-full bg-blue-400/15 blur-2xl transition-all duration-300 group-hover:bg-blue-400/25 group-hover:scale-125"></span>
    <div class="relative z-10 border-l-4 rounded-sm" :class="EVENT_BORDER_CLASS[color]">
      <div class="flex justify-between items-start p-3">
        <div class="min-w-0">
          <h3 class="font-medium text-[#0A1629] truncate">{{ event.title }}</h3>
          <p v-if="event.eventTypeName" class="text-xs text-[#91929E]">{{ event.eventTypeName }}</p>
        </div>
      </div>
      <div class="flex justify-between items-center mt-1 p-3">
        <p class="text-sm text-[#91929E]">
          {{ formatShortDate(event.startAt) }} <span class="text-gray-300 mx-0.5">|</span> {{ formatTime(event.startAt) }}
        </p>
        <div class="flex items-center gap-2">
          <div v-if="event.attendees.length" class="flex items-center gap-1 bg-[#F4F9FD] px-2 py-1 rounded-full" :title="`${event.attendees.length} attending`">
            <Users class="w-3 h-3 text-[#3F8CFF]" />
            <span class="text-xs font-medium text-[#3F8CFF]">{{ event.attendees.length }}</span>
          </div>
          <div v-else class="flex items-center gap-1 bg-[#F4F9FD] px-2 py-1 rounded-full">
            <Clock10 class="w-3 h-3 rounded-sm text-[#3F8CFF]" />
          </div>
        </div>
      </div>
      <div v-if="event.location" class="flex items-center gap-1 px-3 pb-2 text-xs text-[#91929E]">
        <MapPin class="h-3 w-3 shrink-0" />
        <span class="truncate">{{ event.location }}</span>
      </div>
    </div>
  </div>
</template>
