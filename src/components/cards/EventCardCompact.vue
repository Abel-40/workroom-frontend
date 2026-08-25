<script setup lang="ts">
// Minimized event row for tight spaces (the Dashboard "Nearest Events"
// widget) -- EventCard.vue's full badge/pill/attendee-avatar layout was
// designed for a grid of cards and became oversized stacked three-deep in a
// narrow sidebar column. Same click-through to the detail page, no menu.
import { computed } from "vue";
import { useRouter } from "vue-router";
import { ChevronRight } from "lucide-vue-next";
import { formatDayNumber, formatMonthShort, formatTime } from "@/lib/dates";
import { EVENT_BADGE_CLASS, EVENT_CARD_BG_CLASS, eventColorFor } from "@/lib/eventColor";
import type { EventEntry } from "@/stores/eventStore";

const props = defineProps<{ event: EventEntry }>();

const router = useRouter();
const goToDetail = () =>
  router.push({ name: "admin-dashboard", query: { section: "event-detail", eventId: props.event.id } });

const color = computed(() => eventColorFor(props.event.eventTypeName || props.event.title));
const badgeClass = computed(() => EVENT_BADGE_CLASS[color.value]);
const cardBgClass = computed(() => EVENT_CARD_BG_CLASS[color.value]);
</script>

<template>
  <div
    class="group flex items-center gap-3.5 rounded-xl border px-4 py-4 cursor-pointer shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    :class="cardBgClass"
    role="button"
    tabindex="0"
    @click="goToDetail"
    @keydown.enter="goToDetail"
  >
    <div class="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg leading-none" :class="badgeClass">
      <span class="text-[10px] font-semibold tracking-wide">{{ formatMonthShort(event.startAt) }}</span>
      <span class="text-base font-bold">{{ formatDayNumber(event.startAt) }}</span>
    </div>
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-medium text-[#0A1629]" :title="event.title">{{ event.title }}</p>
      <p class="truncate text-xs text-[#91929E]">
        {{ formatTime(event.startAt) }}<template v-if="event.location"> · {{ event.location }}</template>
      </p>
    </div>
    <ChevronRight class="h-4 w-4 shrink-0 text-gray-300 transition-colors duration-200 group-hover:text-[#3F8CFF]" />
  </div>
</template>
