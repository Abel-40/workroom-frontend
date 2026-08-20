<script setup lang="ts">
import { computed, ref } from "vue";
import { addMonths, format, getDaysInMonth, isSameDay, isWeekend, startOfMonth, setDate } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import type { TaskType } from "@/types/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatHoursToDuration } from "@/lib/duration";

const props = defineProps<{
  tasks: TaskType[];
}>();

const emit = defineEmits<{
  (e: "select", task: TaskType): void;
}>();

const filterMode = ref<"all" | "active" | "backlog">("all");

const filteredTasks = computed(() => {
  if (filterMode.value === "active") return props.tasks.filter((t) => t.status !== "To Do");
  if (filterMode.value === "backlog") return props.tasks.filter((t) => t.status === "To Do");
  return props.tasks;
});

// Default to the month of the earliest task so demo bars are visible on load.
const earliestDate = computed(() => {
  const dates = props.tasks
    .map((t) => new Date(t.createdAt))
    .filter((d) => !Number.isNaN(d.getTime()));
  if (!dates.length) return new Date();
  return new Date(Math.min(...dates.map((d) => d.getTime())));
});

const viewMonth = ref<Date>(startOfMonth(earliestDate.value));
let initialized = false;
const ensureInitialized = () => {
  if (!initialized) {
    viewMonth.value = startOfMonth(earliestDate.value);
    initialized = true;
  }
};
ensureInitialized();

const daysInMonth = computed(() => getDaysInMonth(viewMonth.value));
const dayNumbers = computed(() => Array.from({ length: daysInMonth.value }, (_, i) => i + 1));
const monthLabel = computed(() => format(viewMonth.value, "MMMM yyyy"));
const gridColumns = computed(() => `repeat(${daysInMonth.value}, minmax(0, 1fr))`);

const today = new Date();
const isToday = (day: number) => isSameDay(setDate(viewMonth.value, day), today);
const isWeekendDay = (day: number) => isWeekend(setDate(viewMonth.value, day));
const isCurrentMonth = computed(
  () => viewMonth.value.getFullYear() === today.getFullYear() && viewMonth.value.getMonth() === today.getMonth()
);
const todayLineStyle = computed(() => ({
  left: `${((today.getDate() - 0.5) / daysInMonth.value) * 100}%`,
}));

const goPrevMonth = () => (viewMonth.value = addMonths(viewMonth.value, -1));
const goNextMonth = () => (viewMonth.value = addMonths(viewMonth.value, 1));

const barFor = (task: TaskType) => {
  const created = new Date(task.createdAt);
  if (Number.isNaN(created.getTime())) return null;
  if (
    created.getFullYear() !== viewMonth.value.getFullYear() ||
    created.getMonth() !== viewMonth.value.getMonth()
  ) {
    return null;
  }
  const startDay = created.getDate();
  const durationDays = Math.max(1, Math.round((task.estimatedTimeHours || 0) / 8) || 1);
  const span = Math.min(durationDays, daysInMonth.value - startDay + 1);
  return { startDay, span };
};

const barColor = (task: TaskType) => {
  switch (task.status) {
    case "Done":
      return "bg-emerald-400/70";
    case "In Progress":
      return "bg-violet-400/70";
    case "In Review":
      return "bg-slate-400/70";
    default:
      return "bg-blue-300/70";
  }
};
</script>

<template>
  <div class="flex flex-col gap-4 lg:flex-row">
    <!-- Task list -->
    <div class="w-full shrink-0 rounded-2xl border border-gray-100 bg-white lg:w-64">
      <div class="border-b border-gray-100 p-3">
        <Select v-model="filterMode">
          <SelectTrigger class="!border-none !ring-0 !shadow-none font-semibold">
            <SelectValue placeholder="All Tasks" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Tasks — {{ tasks.length }}</SelectItem>
              <SelectItem value="active">Active Tasks</SelectItem>
              <SelectItem value="backlog">Backlog</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div class="max-h-[420px] overflow-y-auto">
        <button
          v-for="task in filteredTasks"
          :key="task.id"
          type="button"
          class="flex h-11 w-full items-center border-b border-gray-50 px-3 text-left text-sm text-ink hover:bg-page"
          @click="emit('select', task)"
        >
          <span class="truncate">{{ task.title }}</span>
        </button>
        <p v-if="!filteredTasks.length" class="p-4 text-center text-sm text-subtle">No tasks.</p>
      </div>
    </div>

    <!-- Gantt grid -->
    <div class="flex-1 rounded-2xl border border-gray-100 bg-white p-4">
      <div class="mb-3 flex items-center justify-center">
        <h3 class="text-sm font-semibold text-ink">{{ monthLabel }}</h3>
      </div>

      <div class="relative overflow-hidden rounded-xl">
        <!-- weekend shading + today marker, spans full height behind the rows -->
        <div class="pointer-events-none absolute inset-0 z-0 grid" :style="{ gridTemplateColumns: gridColumns }">
          <div v-for="day in dayNumbers" :key="`bg-${day}`" :class="isWeekendDay(day) ? 'bg-page/50' : ''" />
        </div>
        <div
          v-if="isCurrentMonth"
          class="pointer-events-none absolute inset-y-0 z-10 w-px bg-rose-400/60"
          :style="todayLineStyle"
        />

        <div class="relative z-10">
          <!-- day header -->
          <div class="grid" :style="{ gridTemplateColumns: gridColumns }">
            <div
              v-for="day in dayNumbers"
              :key="`h-${day}`"
              class="flex items-center justify-center border-b border-gray-100 py-1 text-[9px] text-subtle"
            >
              <span
                class="flex h-4 w-4 items-center justify-center rounded-full leading-none"
                :class="isToday(day) ? 'bg-primary font-semibold text-white' : ''"
              >{{ day }}</span>
            </div>
          </div>

          <!-- task rows -->
          <div
            v-for="task in filteredTasks"
            :key="task.id"
            class="grid h-8 cursor-pointer items-center hover:bg-page/40"
            :style="{ gridTemplateColumns: gridColumns }"
            @click="emit('select', task)"
          >
            <template v-if="barFor(task)">
              <div
                class="col-span-1 h-4 rounded-full shadow-sm"
                :class="barColor(task)"
                :style="{
                  gridColumnStart: barFor(task)!.startDay,
                  gridColumnEnd: `span ${barFor(task)!.span}`,
                }"
                :title="`${task.title} — ${task.estimatedTimeHours ? formatHoursToDuration(task.estimatedTimeHours) : 'no estimate'}`"
              />
            </template>
          </div>
          <p v-if="!filteredTasks.length" class="py-6 text-center text-sm text-subtle">Nothing to show.</p>
        </div>
      </div>

      <div class="mt-3 flex items-center justify-end gap-1">
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:border-primary/40"
          @click="goPrevMonth"
        >
          <ChevronLeft class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:border-primary/40"
          @click="goNextMonth"
        >
          <ChevronRight class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>
