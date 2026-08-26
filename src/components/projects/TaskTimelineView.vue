<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  endOfMonth,
  format,
  getDate,
  getDaysInMonth,
  isAfter,
  isBefore,
  isSameDay,
  isValid,
  isWeekend,
  parseISO,
  startOfMonth,
} from "date-fns";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Clock3, UserRound } from "lucide-vue-next";
import type { TaskStatus, TaskType } from "@/types/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatHoursToDuration } from "@/lib/duration";
import { toZonedCalendarDate } from "@/lib/dates";

const props = defineProps<{
  tasks: TaskType[];
  companyCreatedAt?: string | Date | null;
}>();
const emit = defineEmits<{ (e: "select", task: TaskType): void }>();

type TaskSchedule = { start: Date; end: Date };
type TimelineBar = { startDay: number; span: number };

const statusMeta: Record<TaskStatus, { bar: string; dot: string; badge: string }> = {
  "To Do": { bar: "bg-blue-500 hover:bg-blue-600", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700" },
  "In Progress": { bar: "bg-violet-500 hover:bg-violet-600", dot: "bg-violet-500", badge: "bg-violet-50 text-violet-700" },
  "In Review": { bar: "bg-slate-500 hover:bg-slate-600", dot: "bg-slate-500", badge: "bg-slate-100 text-slate-700" },
  Done: { bar: "bg-emerald-500 hover:bg-emerald-600", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700" },
};
const priorityDot: Record<TaskType["priority"], string> = {
  high: "bg-rose-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
};
const monthOptions = Array.from({ length: 12 }, (_, month) => ({
  value: String(month),
  label: format(new Date(2024, month, 1), "MMMM"),
}));

const parseDate = (value: string | Date | null | undefined) => {
  if (!value) return null;
  const date = value instanceof Date ? value : parseISO(value);
  return isValid(date) ? toZonedCalendarDate(date) : null;
};
const today = toZonedCalendarDate(new Date()) ?? new Date();
const currentMonth = startOfMonth(today);

const displayedTasks = computed(() => [...props.tasks].sort((a, b) => {
  const aCreated = parseDate(a.createdAt)?.getTime() ?? 0;
  const bCreated = parseDate(b.createdAt)?.getTime() ?? 0;
  return aCreated - bCreated || a.title.localeCompare(b.title);
}));
const earliestTaskMonth = computed(() => {
  const dates = props.tasks.map((task) => parseDate(task.createdAt)).filter((date): date is Date => !!date);
  return dates.length ? startOfMonth(new Date(Math.min(...dates.map((date) => date.getTime())))) : currentMonth;
});

// Company creation is the lower edge of selectable timeline history. Legacy
// sessions without this value fall back to the first task's creation month.
const minimumMonth = computed(() => startOfMonth(parseDate(props.companyCreatedAt) ?? earliestTaskMonth.value));
const clampMonth = (date: Date) => {
  const month = startOfMonth(date);
  if (isBefore(month, minimumMonth.value)) return minimumMonth.value;
  if (isAfter(month, currentMonth)) return currentMonth;
  return month;
};
const viewMonth = ref<Date>(clampMonth(earliestTaskMonth.value));
const hasSetInitialTaskMonth = ref(false);
watch(
  () => [props.tasks, props.companyCreatedAt] as const,
  () => {
    if (!hasSetInitialTaskMonth.value && props.tasks.length) {
      viewMonth.value = clampMonth(earliestTaskMonth.value);
      hasSetInitialTaskMonth.value = true;
    } else {
      viewMonth.value = clampMonth(viewMonth.value);
    }
  },
  { immediate: true },
);

const daysInMonth = computed(() => getDaysInMonth(viewMonth.value));
const dayNumbers = computed(() => Array.from({ length: daysInMonth.value }, (_, index) => index + 1));
const gridColumns = computed(() => `repeat(${daysInMonth.value}, minmax(0, 1fr))`);
const monthLabel = computed(() => format(viewMonth.value, "MMMM yyyy"));
const years = computed(() => {
  const firstYear = minimumMonth.value.getFullYear();
  const lastYear = currentMonth.getFullYear();
  return Array.from({ length: Math.max(1, lastYear - firstYear + 1) }, (_, index) => String(firstYear + index));
});
const availableMonths = computed(() => monthOptions.filter(({ value }) => {
  const candidate = new Date(viewMonth.value.getFullYear(), Number(value), 1);
  return !isBefore(candidate, minimumMonth.value) && !isAfter(candidate, currentMonth);
}));
const selectedYear = computed({
  get: () => String(viewMonth.value.getFullYear()),
  set: (value: string) => (viewMonth.value = clampMonth(new Date(Number(value), viewMonth.value.getMonth(), 1))),
});
const selectedMonth = computed({
  get: () => String(viewMonth.value.getMonth()),
  set: (value: string) => (viewMonth.value = clampMonth(new Date(viewMonth.value.getFullYear(), Number(value), 1))),
});
const canGoPrev = computed(() => isAfter(viewMonth.value, minimumMonth.value));
const canGoNext = computed(() => isBefore(viewMonth.value, currentMonth));
const goPrevMonth = () => {
  if (canGoPrev.value) viewMonth.value = clampMonth(addMonths(viewMonth.value, -1));
};
const goNextMonth = () => {
  if (canGoNext.value) viewMonth.value = clampMonth(addMonths(viewMonth.value, 1));
};
const jumpToToday = () => (viewMonth.value = currentMonth);

const dateForDay = (day: number) => new Date(viewMonth.value.getFullYear(), viewMonth.value.getMonth(), day);
const isToday = (day: number) => isSameDay(dateForDay(day), today);
const isWeekendDay = (day: number) => isWeekend(dateForDay(day));
const isCurrentMonth = computed(() => isSameDay(viewMonth.value, currentMonth));
const todayLineStyle = computed(() => ({ left: `${((today.getDate() - 0.5) / daysInMonth.value) * 100}%` }));

const scheduleFor = (task: TaskType): TaskSchedule | null => {
  const start = parseDate(task.createdAt);
  if (!start) return null;
  const deadline = parseDate(task.deadline);
  const estimateDays = Math.max(1, Math.ceil((task.estimatedTimeHours ?? 0) / 8));
  const end = deadline && !isBefore(deadline, start) ? deadline : addDays(start, estimateDays - 1);
  return { start, end };
};
const barFor = (schedule: TaskSchedule | null): TimelineBar | null => {
  if (!schedule) return null;
  const monthStart = startOfMonth(viewMonth.value);
  const monthEnd = endOfMonth(viewMonth.value);
  if (isBefore(schedule.end, monthStart) || isAfter(schedule.start, monthEnd)) return null;
  const visibleStart = isBefore(schedule.start, monthStart) ? monthStart : schedule.start;
  const visibleEnd = isAfter(schedule.end, monthEnd) ? monthEnd : schedule.end;
  return { startDay: getDate(visibleStart), span: differenceInCalendarDays(visibleEnd, visibleStart) + 1 };
};
const taskRows = computed(() => displayedTasks.value.map((task, index) => {
  const schedule = scheduleFor(task);
  return { task, index, schedule, bar: barFor(schedule) };
}));
const scheduleLabel = (schedule: TaskSchedule | null) => {
  if (!schedule) return "Unscheduled";
  if (isSameDay(schedule.start, schedule.end)) return format(schedule.start, "MMM d");
  return `${format(schedule.start, "MMM d")} – ${format(schedule.end, "MMM d")}`;
};
const durationLabel = (task: TaskType) => task.estimatedTimeHours ? formatHoursToDuration(task.estimatedTimeHours) : "No estimate";
</script>

<template>
  <section class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
    <div class="flex flex-col gap-4 border-b border-gray-100 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex items-center gap-2">
        <span class="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary"><CalendarDays class="h-4 w-4" /></span>
        <div><h3 class="text-sm font-semibold text-ink">Project timeline</h3><p class="text-xs text-subtle">Every task stays aligned with its schedule.</p></div>
      </div>

      <div class="flex items-center justify-between gap-2 sm:justify-end">
        <button type="button" class="grid h-9 w-9 place-items-center rounded-lg border border-gray-200 bg-white text-ink transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" :disabled="!canGoPrev" aria-label="Previous month" @click="goPrevMonth"><ChevronLeft class="h-4 w-4" /></button>
        <Popover>
          <PopoverTrigger as-child>
            <button type="button" class="flex h-9 min-w-40 items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-ink shadow-sm transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Choose timeline month and year"><span>{{ monthLabel }}</span><ChevronDown class="h-4 w-4 text-subtle" /></button>
          </PopoverTrigger>
          <PopoverContent align="end" class="w-72 rounded-xl p-3">
            <div class="mb-3 flex items-start justify-between gap-3"><div><p class="text-sm font-semibold text-ink">Choose a period</p><p class="mt-0.5 text-[11px] text-subtle">From company creation through today</p></div><CalendarDays class="h-4 w-4 text-primary" /></div>
            <div class="grid grid-cols-2 gap-2">
              <label class="space-y-1"><span class="text-[11px] font-medium text-subtle">Month</span><Select v-model="selectedMonth"><SelectTrigger class="h-9 bg-white text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectGroup><SelectItem v-for="month in availableMonths" :key="month.value" :value="month.value">{{ month.label }}</SelectItem></SelectGroup></SelectContent></Select></label>
              <label class="space-y-1"><span class="text-[11px] font-medium text-subtle">Year</span><Select v-model="selectedYear"><SelectTrigger class="h-9 bg-white text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectGroup><SelectItem v-for="year in years" :key="year" :value="year">{{ year }}</SelectItem></SelectGroup></SelectContent></Select></label>
            </div>
            <button type="button" class="mt-3 w-full rounded-lg bg-page px-3 py-2 text-xs font-semibold text-ink transition hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" @click="jumpToToday">Go to current month</button>
          </PopoverContent>
        </Popover>
        <button type="button" class="grid h-9 w-9 place-items-center rounded-lg border border-gray-200 bg-white text-ink transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" :disabled="!canGoNext" aria-label="Next month" @click="goNextMonth"><ChevronRight class="h-4 w-4" /></button>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-gray-100 bg-surface/60 px-4 py-2.5 text-[11px] font-medium text-subtle sm:px-5" aria-label="Task status colour legend">
      <span class="mr-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink">Status</span>
      <span v-for="(meta, status) in statusMeta" :key="status" class="flex items-center gap-1.5"><span class="h-2 w-2 rounded-full" :class="meta.dot" />{{ status }}</span>
      <span class="ml-auto hidden items-center gap-1 text-[10px] sm:flex"><span class="h-px w-4 bg-rose-400" /> Today</span>
    </div>

    <div class="overflow-hidden">
      <div class="min-w-0">
        <div class="grid grid-cols-[minmax(8.75rem,0.48fr)_minmax(0,2.52fr)] border-b border-gray-100 bg-white">
          <div class="sticky left-0 z-20 flex min-h-14 min-w-0 items-center border-r border-gray-100 bg-white px-3 shadow-[5px_0_12px_-12px_rgba(15,23,42,0.45)]"><div class="min-w-0"><p class="text-[10px] font-semibold uppercase tracking-[0.1em] text-subtle">Task</p><p class="mt-0.5 truncate text-[11px] font-semibold text-ink">Name &amp; schedule</p></div></div>
          <div class="relative"><div class="grid" :style="{ gridTemplateColumns: gridColumns }"><div v-for="day in dayNumbers" :key="`header-${day}`" class="flex min-h-14 flex-col items-center justify-center border-l border-gray-100" :class="isWeekendDay(day) ? 'bg-page/45' : ''"><span class="text-[9px] font-medium uppercase tracking-wide text-subtle">{{ format(dateForDay(day), 'EEEEE') }}</span><span class="mt-0.5 grid h-5 w-5 place-items-center rounded-full text-[11px]" :class="isToday(day) ? 'bg-primary font-semibold text-white shadow-sm' : 'font-medium text-ink'">{{ day }}</span></div></div></div>
        </div>

        <div v-for="row in taskRows" :key="row.task.id" class="grid grid-cols-[minmax(8.75rem,0.48fr)_minmax(0,2.52fr)] border-b border-gray-100 last:border-b-0">
          <button type="button" class="sticky left-0 z-10 flex min-h-[72px] min-w-0 items-center gap-2 border-r border-gray-100 bg-white px-3 text-left shadow-[5px_0_12px_-12px_rgba(15,23,42,0.45)] transition hover:bg-primary/[0.035] focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring" @click="emit('select', row.task)">
            <span class="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-page text-[10px] font-semibold text-subtle">{{ row.index + 1 }}</span>
            <span class="min-w-0 flex-1"><span class="flex items-center gap-1.5"><span class="h-2 w-2 shrink-0 rounded-full" :class="priorityDot[row.task.priority]" :title="`${row.task.priority} priority`" /><span class="truncate text-[13px] font-semibold text-ink">{{ row.task.title }}</span></span><span class="mt-1 flex items-center gap-1.5 overflow-hidden text-[10px] text-subtle"><span class="flex shrink-0 items-center gap-1"><UserRound class="h-3 w-3" />{{ row.task.assigneeName || 'Unassigned' }}</span><span class="truncate">{{ scheduleLabel(row.schedule) }}</span></span></span>
          </button>
          <div class="relative min-h-[72px] overflow-hidden" :class="row.bar ? 'bg-white' : 'bg-slate-50/35'">
            <div class="pointer-events-none absolute inset-0 grid" :style="{ gridTemplateColumns: gridColumns }"><div v-for="day in dayNumbers" :key="`cell-${row.task.id}-${day}`" class="border-l border-gray-100" :class="isWeekendDay(day) ? 'bg-page/45' : ''" /></div>
            <div v-if="isCurrentMonth" class="pointer-events-none absolute inset-y-0 z-[1] w-px bg-rose-400/70" :style="todayLineStyle" />
            <div class="relative z-[2] grid h-full items-center px-1.5" :style="{ gridTemplateColumns: gridColumns }">
              <button v-if="row.bar" type="button" class="group/bar relative flex h-8 min-w-0 items-center rounded-lg px-2.5 text-left text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" :class="statusMeta[row.task.status].bar" :style="{ gridColumnStart: row.bar.startDay, gridColumnEnd: `span ${row.bar.span}` }" :aria-label="`Open ${row.task.title}`" @click="emit('select', row.task)"><span class="truncate text-[11px] font-semibold">{{ row.task.title }}</span><span class="ml-auto hidden shrink-0 items-center gap-1 pl-2 text-[10px] font-medium text-white/85 xl:flex"><Clock3 class="h-3 w-3" />{{ durationLabel(row.task) }}</span><span class="pointer-events-none absolute -bottom-5 left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 text-[10px] text-white shadow-lg group-hover/bar:block">{{ row.task.status }} · {{ scheduleLabel(row.schedule) }}</span></button>
              <span v-else class="col-span-full px-2 text-[11px] italic text-subtle">No work scheduled in {{ format(viewMonth, 'MMMM') }}</span>
            </div>
          </div>
        </div>

        <div v-if="!taskRows.length" class="grid min-h-40 place-items-center bg-slate-50/50 px-6 text-center"><div><CalendarDays class="mx-auto h-6 w-6 text-primary/50" /><p class="mt-2 text-sm font-medium text-ink">No tasks to place on the timeline</p><p class="mt-1 text-xs text-subtle">Add a task to start building this project schedule.</p></div></div>
      </div>
    </div>
  </section>
</template>
