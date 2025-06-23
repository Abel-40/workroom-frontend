<script setup lang="ts">
import { ref, watch, computed } from "vue";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Card, CardHeader, CardTitle } from "../card";
import Button from "@/components/ui/button/Button.vue";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";

interface DateRange {
  start: Date | null;
  end: Date;
}

const props = defineProps<{
  modelValue?: DateRange;
  class?: string;
  maxDate?: Date;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", range: DateRange): void;
}>();

const todayDate = new Date();
const maxDate = computed(() => props.maxDate || todayDate);

const selectedRange = ref<DateRange>(
  props.modelValue || {
    start: null,
    end: todayDate,
  }
);

const open = ref(false);
const tempStart = ref<Date | null>(selectedRange.value.start);
const tempEnd = ref<Date>(selectedRange.value.end);
const currentDate = ref(new Date());
const lastClickTime = ref(0);
const lastClickedDate = ref<Date | null>(null);

// Watch for external changes
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      selectedRange.value = newValue;
      tempStart.value = newValue.start;
      tempEnd.value = newValue.end;
    }
  },
  { deep: true }
);

// Watch for internal changes
watch([tempStart, tempEnd], ([newStart, newEnd]) => {
  if (newStart && newEnd) {
    // Ensure start date is before end date
    if (newStart > newEnd) {
      const temp = newStart;
      tempStart.value = newEnd;
      tempEnd.value = temp;
    }
    selectedRange.value = {
      start: tempStart.value,
      end: tempEnd.value,
    };
    emit("update:modelValue", selectedRange.value);
  }
});

const defaultChoice = () => {
  tempStart.value = null;
  tempEnd.value = new Date();
  selectedRange.value = {
    start: null,
    end: tempEnd.value,
  };
  emit("update:modelValue", selectedRange.value);
  open.value = false;
};

const formatDate = (date: Date) => {
  return date.toISOString().split("T")[0];
};

const handleDateClick = (date: Date) => {
  // Check if date is beyond max date
  if (date > maxDate.value) {
    return;
  }

  const now = Date.now();
  const isDoubleClick =
    lastClickedDate.value?.getTime() === date.getTime() &&
    now - lastClickTime.value < 300; // 300ms threshold for double click

  if (isDoubleClick) {
    // On double click, set both start and end to the same date
    tempStart.value = date;
    tempEnd.value = date;
    selectedRange.value = {
      start: date,
      end: date,
    };
    emit("update:modelValue", selectedRange.value);
  } else {
    // Normal single click behavior
    if (!tempStart.value) {
      tempStart.value = date;
    } else if (!tempEnd.value || tempStart.value <= date) {
      tempEnd.value = date;
    } else {
      tempStart.value = date;
    }
  }

  lastClickTime.value = now;
  lastClickedDate.value = date;
};

const currentMonthYear = computed(() => {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(currentDate.value);
});

const generateCalendarDays = () => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: { date: Date; isCurrentMonth: boolean }[] = [];

  // Add days from previous month
  const firstDayOfWeek = firstDay.getDay();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push({ date, isCurrentMonth: false });
  }

  // Add days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i);
    days.push({ date, isCurrentMonth: true });
  }

  // Add days from next month to complete the grid
  const remainingDays = 42 - days.length; // 6 rows * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    days.push({ date, isCurrentMonth: false });
  }

  return days;
};

const goToPreviousMonth = () => {
  const newDate = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  );
  // Only allow navigation if the first day of the new month isn't after maxDate
  if (newDate <= maxDate.value) {
    currentDate.value = newDate;
  }
};

const goToNextMonth = () => {
  const newDate = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  );
  // Only allow navigation if the first day of the new month isn't after maxDate
  if (newDate <= maxDate.value) {
    currentDate.value = newDate;
  }
};

const isDateSelected = (date: Date) => {
  if (tempStart.value && tempEnd.value) {
    return date >= tempStart.value && date <= tempEnd.value;
  }
  return (
    tempStart.value?.getTime() === date.getTime() ||
    tempEnd.value?.getTime() === date.getTime()
  );
};

const isToday = (date: Date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const isDateDisabled = (date: Date) => {
  return date > maxDate.value;
};
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <button
        :class="[
          'flex items-center gap-2 px-4 py-2 border rounded-md shadow-sm bg-white hover:bg-gray-50 transition text-sm',
          props.class,
        ]"
      >
        <span class="text-gray-700">
          <template v-if="selectedRange.start && selectedRange.end">
            {{ formatDate(selectedRange.start) }} →
            {{ formatDate(selectedRange.end) }}
          </template>
          <template v-else>
            {{ formatDate(todayDate) }}
          </template>
        </span>
      </button>
    </PopoverTrigger>

    <PopoverContent
      class="w-auto p-0 bg-white border rounded-md shadow-lg"
      :side="'right'"
      :align="'center'"
    >
      <Card class="w-full">
        <CardHeader>
          <CardTitle class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                class="w-8 h-8 hover:bg-gray-100"
                @click="goToPreviousMonth"
              >
                <ChevronLeft class="w-4 h-4" />
              </Button>
              <span class="text-sm font-medium min-w-[140px]">{{
                currentMonthYear
              }}</span>
              <Button
                variant="ghost"
                size="icon"
                class="w-8 h-8 hover:bg-gray-100"
                @click="goToNextMonth"
              >
                <ChevronRight class="w-4 h-4" />
              </Button>
            </div>
            <Button
              class="bg-gray-200 h-[20px] hover:bg-gray-300 text-xs text-black transition-all scale-100 duration-100 active:scale-105"
              @click="defaultChoice"
            >
              Default
            </Button>
          </CardTitle>
        </CardHeader>
        <div class="p-4">
          <div class="grid grid-cols-7 gap-1">
            <div
              v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
              :key="day"
              class="text-center text-xs text-gray-500 font-medium"
            >
              {{ day }}
            </div>
            <button
              v-for="{ date, isCurrentMonth } in generateCalendarDays()"
              :key="date.toISOString()"
              @click="handleDateClick(date)"
              :disabled="isDateDisabled(date)"
              class="p-2 text-sm rounded-md hover:bg-gray-100 relative disabled:opacity-50 disabled:cursor-not-allowed"
              :class="{
                'text-gray-400': !isCurrentMonth || isDateDisabled(date),
                'bg-blue-100': isDateSelected(date),
                'font-medium': isCurrentMonth,
                'ring-2 ring-blue-400 ring-offset-2': isToday(date),
              }"
            >
              {{ date.getDate() }}
            </button>
          </div>
        </div>
      </Card>
    </PopoverContent>
  </Popover>
</template>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
}
</style>
