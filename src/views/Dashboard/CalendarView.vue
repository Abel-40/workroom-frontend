<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isBefore,
  isSameDay,
  startOfMonth,
} from "date-fns";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddEventModal from "@/components/calendar/AddEventModal.vue";
import { useEventStore, type EventEntry } from "@/stores/eventStore";
import { formatTime, toZonedCalendarDate } from "@/lib/dates";
import { EVENT_BORDER_CLASS, eventColorFor } from "@/lib/eventColor";

const router = useRouter();
const eventStore = useEventStore();
const viewMonth = ref(startOfMonth(new Date()));
const isAddEventOpen = ref(false);
const addEventDate = ref<string | undefined>(undefined);
const today = toZonedCalendarDate(new Date()) ?? new Date();

// Fetch exactly the visible month, and refetch on every month change.
// The previous version fetched one capped page (bounded by the backend's
// MAX_PAGE_SIZE) ordered from the oldest event ever created and never
// refetched when navigating months, so a company with any real event
// history would silently show an empty/incomplete grid for most months.
const loadMonth = () => {
  eventStore.fetchEvents({
    startDate: format(startOfMonth(viewMonth.value), "yyyy-MM-dd"),
    endDate: format(endOfMonth(viewMonth.value), "yyyy-MM-dd"),
    pageSize: 100,
  });
};

onMounted(loadMonth);
watch(viewMonth, loadMonth);

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const monthLabel = () => format(viewMonth.value, "MMMM, yyyy");

// Monday-first leading blanks before the 1st of the month.
const leadingBlanks = () => {
  const firstWeekday = getDay(startOfMonth(viewMonth.value)); // 0 = Sun
  return (firstWeekday + 6) % 7;
};

const daysInMonth = () =>
  eachDayOfInterval({ start: startOfMonth(viewMonth.value), end: endOfMonth(viewMonth.value) });

const eventsFor = (day: Date) =>
  eventStore.events.filter((e) => {
    const eventDay = toZonedCalendarDate(e.startAt);
    return eventDay ? isSameDay(eventDay, day) : false;
  });

const isPastDay = (day: Date) => isBefore(day, today);

const goPrev = () => (viewMonth.value = addMonths(viewMonth.value, -1));
const goNext = () => (viewMonth.value = addMonths(viewMonth.value, 1));

// Past days are view-only history -- browsing them for context is fine,
// backdating a new event is not, so the guard lives here (not just in the
// template's click binding) as the one place that decides it.
const openAddEvent = (day?: Date) => {
  if (day && isPastDay(day)) return;
  addEventDate.value = day ? format(day, "yyyy-MM-dd") : undefined;
  isAddEventOpen.value = true;
};

const goToEvent = (event: EventEntry) =>
  router.push({ name: "admin-dashboard", query: { section: "event-detail", eventId: event.id } });

// Month/year jump -- flipping through goPrev/goNext one month at a time to
// reach, say, six months back is tedious. Clicking the month label opens a
// picker that jumps straight to any month (past or future) for browsing;
// it only ever changes which month is displayed, so the per-day past-date
// guard above still applies once you're looking at it.
const isPickerOpen = ref(false);
const pickerMonthIndex = ref(String(viewMonth.value.getMonth()));
const pickerYear = ref(String(viewMonth.value.getFullYear()));
const MONTH_NAMES = Array.from({ length: 12 }, (_, i) => format(new Date(2000, i, 1), "MMMM"));
const YEAR_OPTIONS = (() => {
  const current = new Date().getFullYear();
  return Array.from({ length: 16 }, (_, i) => String(current - 10 + i));
})();

watch(isPickerOpen, (open) => {
  if (!open) return;
  pickerMonthIndex.value = String(viewMonth.value.getMonth());
  pickerYear.value = String(viewMonth.value.getFullYear());
});

const jumpToMonth = () => {
  viewMonth.value = startOfMonth(new Date(Number(pickerYear.value), Number(pickerMonthIndex.value), 1));
  isPickerOpen.value = false;
};

const jumpToToday = () => {
  viewMonth.value = startOfMonth(new Date());
  isPickerOpen.value = false;
};
</script>

<template>
  <AddEventModal v-model:open="isAddEventOpen" :default-date="addEventDate" />
  <div class="rounded-2xl border border-gray-100 bg-white p-4">
    <div class="mb-4 flex items-center justify-center gap-4">
      <button type="button" class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:border-primary/40" @click="goPrev">
        <ChevronLeft class="h-4 w-4" />
      </button>

      <Popover v-model:open="isPickerOpen">
        <PopoverTrigger as-child>
          <button
            type="button"
            class="flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-ink transition hover:bg-page"
          >
            {{ monthLabel() }}
            <ChevronDown class="h-3.5 w-3.5 text-subtle" />
          </button>
        </PopoverTrigger>
        <PopoverContent class="w-64 rounded-2xl p-3" align="center">
          <div class="grid grid-cols-2 gap-2">
            <Select v-model="pickerMonthIndex">
              <SelectTrigger class="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="(name, index) in MONTH_NAMES" :key="name" :value="String(index)">{{ name }}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select v-model="pickerYear">
              <SelectTrigger class="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="year in YEAR_OPTIONS" :key="year" :value="year">{{ year }}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div class="mt-3 flex items-center justify-between">
            <Button variant="ghost" class="h-8 px-2 text-xs text-subtle" @click="jumpToToday">Jump to today</Button>
            <Button class="h-8 px-4 text-xs" @click="jumpToMonth">Go</Button>
          </div>
        </PopoverContent>
      </Popover>

      <button type="button" class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:border-primary/40" @click="goNext">
        <ChevronRight class="h-4 w-4" />
      </button>
    </div>

    <div class="grid grid-cols-7 border-b border-gray-100 pb-2">
      <div v-for="day in WEEKDAYS" :key="day" class="text-center text-xs font-medium text-subtle">
        {{ day }}
      </div>
    </div>

    <p v-if="eventStore.loading" class="py-10 text-center text-sm text-subtle">Loading events…</p>
    <div v-else class="grid grid-cols-7">
      <div v-for="n in leadingBlanks()" :key="`blank-${n}`" class="min-h-[110px] border-b border-r border-gray-50" />
      <div
        v-for="day in daysInMonth()"
        :key="day.toISOString()"
        class="min-h-[110px] border-b border-r border-gray-50 p-2 transition"
        :class="isPastDay(day) ? 'bg-gray-50/50' : 'cursor-pointer hover:bg-page/50'"
        :title="isPastDay(day) ? 'Past date — view only' : 'Click to add an event'"
        @click="openAddEvent(day)"
      >
        <span
          class="flex h-6 w-6 items-center justify-center rounded-full text-xs"
          :class="isSameDay(day, today) ? 'bg-primary text-white font-semibold' : isPastDay(day) ? 'text-gray-300' : 'text-ink'"
        >
          {{ format(day, "d") }}
        </span>
        <div class="mt-1 space-y-1">
          <div
            v-for="event in eventsFor(day).slice(0, 2)"
            :key="event.id"
            class="truncate rounded border-l-2 bg-page px-1.5 py-1 text-[11px] text-ink cursor-pointer transition hover:brightness-95 hover:shadow-sm"
            :class="EVENT_BORDER_CLASS[eventColorFor(event.eventTypeName || event.title)]"
            :title="`${event.title} — view details`"
            @click.stop="goToEvent(event)"
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
</template>
