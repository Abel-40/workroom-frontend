<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  isToday,
  startOfMonth,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header.vue";
import AddEventModal from "@/components/calendar/AddEventModal.vue";
import { useEventStore } from "@/stores/eventStore";
import { formatTime } from "@/lib/dates";
import { EVENT_BORDER_CLASS, eventColorFor } from "@/lib/eventColor";

const eventStore = useEventStore();
const viewMonth = ref(startOfMonth(new Date()));
const isAddEventOpen = ref(false);
const addEventDate = ref<string | undefined>(undefined);

onMounted(() => {
  if (!eventStore.events.length) eventStore.fetchEvents({ pageSize: 200 });
});

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const monthLabel = computed(() => format(viewMonth.value, "MMMM, yyyy"));

// Monday-first leading blanks before the 1st of the month.
const leadingBlanks = computed(() => {
  const firstWeekday = getDay(startOfMonth(viewMonth.value)); // 0 = Sun
  return (firstWeekday + 6) % 7;
});

const daysInMonth = computed(() =>
  eachDayOfInterval({ start: startOfMonth(viewMonth.value), end: endOfMonth(viewMonth.value) })
);

const eventsFor = (day: Date) =>
  eventStore.events.filter((e) => isSameDay(new Date(e.startAt), day));

const goPrev = () => (viewMonth.value = addMonths(viewMonth.value, -1));
const goNext = () => (viewMonth.value = addMonths(viewMonth.value, 1));

const openAddEvent = (day?: Date) => {
  addEventDate.value = day ? format(day, "yyyy-MM-dd") : undefined;
  isAddEventOpen.value = true;
};
</script>

<template>
  <AddEventModal v-model:open="isAddEventOpen" :default-date="addEventDate" />
  <div class="flex-1 p-4">
    <div class="mb-6">
      <Header />
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 class="text-xl font-semibold">Calendar</h1>
        <Button class="rounded-xl" @click="openAddEvent()">
          <Plus class="w-4 h-4" /> Add Event
        </Button>
      </div>
    </div>

    <div class="rounded-2xl border border-gray-100 bg-white p-4">
      <div class="mb-4 flex items-center justify-center gap-4">
        <button type="button" class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:border-primary/40" @click="goPrev">
          <ChevronLeft class="h-4 w-4" />
        </button>
        <h3 class="text-sm font-semibold text-ink">{{ monthLabel }}</h3>
        <button type="button" class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:border-primary/40" @click="goNext">
          <ChevronRight class="h-4 w-4" />
        </button>
      </div>

      <div class="grid grid-cols-7 border-b border-gray-100 pb-2">
        <div v-for="day in WEEKDAYS" :key="day" class="text-center text-xs font-medium text-subtle">
          {{ day }}
        </div>
      </div>

      <div class="grid grid-cols-7">
        <div v-for="n in leadingBlanks" :key="`blank-${n}`" class="min-h-[110px] border-b border-r border-gray-50" />
        <div
          v-for="day in daysInMonth"
          :key="day.toISOString()"
          class="min-h-[110px] cursor-pointer border-b border-r border-gray-50 p-2 transition hover:bg-page/50"
          @click="openAddEvent(day)"
        >
          <span
            class="flex h-6 w-6 items-center justify-center rounded-full text-xs"
            :class="isToday(day) ? 'bg-primary text-white font-semibold' : 'text-ink'"
          >
            {{ format(day, "d") }}
          </span>
          <div class="mt-1 space-y-1">
            <div
              v-for="event in eventsFor(day).slice(0, 2)"
              :key="event.id"
              class="truncate rounded border-l-2 bg-page px-1.5 py-1 text-[11px] text-ink"
              :class="EVENT_BORDER_CLASS[eventColorFor(event.eventTypeName || event.title)]"
              :title="event.title"
            >
              <p class="truncate font-medium">{{ event.title }}</p>
              <span class="text-subtle">{{ formatTime(event.startAt) }}</span>
            </div>
            <p v-if="eventsFor(day).length > 2" class="text-[10px] text-subtle">
              +{{ eventsFor(day).length - 2 }} more
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
