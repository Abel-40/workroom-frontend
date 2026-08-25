<script setup lang="ts">
// Inline filter row for the Events page -- not a FilterModal retrofit
// (that component is tightly coupled to Projects-specific filters like
// assignee-tag search and task-group checkboxes; reusing it here would mean
// gutting most of it). A handful of Select dropdowns plus a date range
// don't need a modal.
import { computed, onMounted, reactive, ref, watch } from "vue";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DateRangePicker from "@/components/ui/DateRangePicker/DateRangePicker.vue";
import { Switch } from "@/components/ui/switch";
import { useDirectoryStore } from "@/stores/directoryStore";
import type { EventFilters } from "@/stores/eventStore";

const emit = defineEmits<{
  (e: "change", filters: EventFilters): void;
}>();

const directoryStore = useDirectoryStore();
onMounted(() => {
  if (!directoryStore.loaded) directoryStore.fetchAll();
});

const ALL = "__all__";
const state = reactive({
  eventTypeId: ALL,
  departmentId: ALL,
  teamId: ALL,
  mine: false,
});

// DateRangePicker.vue defaults maxDate to "today" (built for up-to-now
// filters like project/activity date ranges) -- events legitimately include
// future dates, so a far-future ceiling is passed explicitly rather than
// changing the shared component's default for every other consumer.
const farFuture = new Date();
farFuture.setFullYear(farFuture.getFullYear() + 5);
const dateRange = ref<{ start: Date | null; end: Date }>({ start: null, end: farFuture });

const toApiDate = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : undefined);

const filters = computed<EventFilters>(() => ({
  eventTypeId: state.eventTypeId === ALL ? undefined : state.eventTypeId,
  departmentId: state.departmentId === ALL ? undefined : state.departmentId,
  teamId: state.teamId === ALL ? undefined : state.teamId,
  startDate: toApiDate(dateRange.value.start),
  endDate: dateRange.value.end.getTime() === farFuture.getTime() ? undefined : toApiDate(dateRange.value.end),
  mine: state.mine || undefined,
}));

watch(filters, (value) => emit("change", value), { immediate: true, deep: true });
</script>

<template>
  <div class="mb-4 flex flex-wrap items-center gap-3">
    <Select v-model="state.eventTypeId">
      <SelectTrigger class="w-40 rounded-xl"><SelectValue placeholder="Event type" /></SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem :value="ALL">All types</SelectItem>
          <SelectItem v-for="t in directoryStore.eventTypes" :key="t.id" :value="t.id">{{ t.name }}</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>

    <Select v-model="state.departmentId">
      <SelectTrigger class="w-40 rounded-xl"><SelectValue placeholder="Department" /></SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem :value="ALL">All departments</SelectItem>
          <SelectItem v-for="d in directoryStore.departments" :key="d.id" :value="d.id">{{ d.name }}</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>

    <Select v-model="state.teamId">
      <SelectTrigger class="w-40 rounded-xl"><SelectValue placeholder="Team" /></SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem :value="ALL">All teams</SelectItem>
          <SelectItem v-for="t in directoryStore.teams" :key="t.id" :value="t.id">{{ t.name }}</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>

    <DateRangePicker v-model="dateRange" :max-date="farFuture" class="rounded-xl" />

    <label class="flex items-center gap-2 text-sm text-ink">
      <Switch :model-value="state.mine" @update:model-value="(v: boolean) => (state.mine = v)" />
      My events
    </label>
  </div>
</template>
