<script setup lang="ts">
// Slide-over filter drawer for the Events page -- same CustomModal +
// filterComposables pattern as components/projects/FilterModal.vue (a
// small icon button opens it, filters are staged locally and only take
// effect on "Save Filters"), so Events and Projects share one filter UX
// instead of two different ones.
import { onMounted, reactive, ref } from "vue";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DateRangePicker from "@/components/ui/DateRangePicker/DateRangePicker.vue";
import { Switch } from "@/components/ui/switch";
import Button from "@/components/ui/button/Button.vue";
import CustomModal from "@/components/common/CustomModal.vue";
import filterComposables from "@/composables/filterComposables";
import { useDirectoryStore } from "@/stores/directoryStore";
import type { EventFilters } from "@/stores/eventStore";

const { isOpen, onClose } = filterComposables();

const directoryStore = useDirectoryStore();
onMounted(() => {
  if (!directoryStore.loaded) directoryStore.fetchAll();
});

const props = defineProps<{ initialFilters: EventFilters }>();
const emit = defineEmits<{
  (e: "apply", filters: EventFilters): void;
}>();

const ALL = "__all__";
const state = reactive({
  eventTypeId: props.initialFilters.eventTypeId ?? ALL,
  departmentId: props.initialFilters.departmentId ?? ALL,
  teamId: props.initialFilters.teamId ?? ALL,
  mine: props.initialFilters.mine ?? false,
});

// DateRangePicker defaults maxDate to "today" -- events legitimately include
// future dates, so a far-future ceiling is passed explicitly.
const farFuture = new Date();
farFuture.setFullYear(farFuture.getFullYear() + 5);
const dateRange = ref<{ start: Date | null; end: Date }>({
  start: props.initialFilters.startDate ? new Date(props.initialFilters.startDate) : null,
  end: props.initialFilters.endDate ? new Date(props.initialFilters.endDate) : farFuture,
});

const toApiDate = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : undefined);

const apply = () => {
  emit("apply", {
    eventTypeId: state.eventTypeId === ALL ? undefined : state.eventTypeId,
    departmentId: state.departmentId === ALL ? undefined : state.departmentId,
    teamId: state.teamId === ALL ? undefined : state.teamId,
    startDate: toApiDate(dateRange.value.start),
    endDate: dateRange.value.end.getTime() === farFuture.getTime() ? undefined : toApiDate(dateRange.value.end),
    mine: state.mine || undefined,
  });
  document.body.classList.remove("overflow-hidden");
  onClose();
};

const reset = () => {
  state.eventTypeId = ALL;
  state.departmentId = ALL;
  state.teamId = ALL;
  state.mine = false;
  dateRange.value = { start: null, end: farFuture };
};
</script>

<template>
  <CustomModal v-model:open="isOpen" title="Filter Events">
    <div class="h-full">
      <div class="w-full border-t-gray-200 border-t-[1px] px-3 py-4">
        <Label class="text-xs font-normal">Period</Label>
        <DateRangePicker v-model="dateRange" :max-date="farFuture" class="w-full rounded-xl" />
      </div>

      <div class="border-t-gray-200 border-t-[1px] px-3 py-4 space-y-1.5">
        <Label class="text-xs font-normal">Event Type</Label>
        <Select v-model="state.eventTypeId">
          <SelectTrigger class="w-full rounded-xl"><SelectValue placeholder="Event type" /></SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem :value="ALL">All types</SelectItem>
              <SelectItem v-for="t in directoryStore.eventTypes" :key="t.id" :value="t.id">{{ t.name }}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div class="border-t-gray-200 border-t-[1px] px-3 py-4 space-y-1.5">
        <Label class="text-xs font-normal">Department</Label>
        <Select v-model="state.departmentId">
          <SelectTrigger class="w-full rounded-xl"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem :value="ALL">All departments</SelectItem>
              <SelectItem v-for="d in directoryStore.departments" :key="d.id" :value="d.id">{{ d.name }}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div class="border-t-gray-200 border-t-[1px] px-3 py-4 space-y-1.5">
        <Label class="text-xs font-normal">Team</Label>
        <Select v-model="state.teamId">
          <SelectTrigger class="w-full rounded-xl"><SelectValue placeholder="Team" /></SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem :value="ALL">All teams</SelectItem>
              <SelectItem v-for="t in directoryStore.teams" :key="t.id" :value="t.id">{{ t.name }}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div class="flex items-center justify-between border-t-gray-200 border-y-[1px] px-3 py-4">
        <Label class="text-xs font-normal">My events only</Label>
        <Switch :model-value="state.mine" @update:model-value="(v: boolean) => (state.mine = v)" />
      </div>

      <div class="w-full flex justify-between items-center gap-3 px-3 py-4">
        <Button variant="ghost" class="h-8 text-xs text-subtle" @click="reset">Clear all</Button>
        <Button class="h-8 px-4" @click="apply">Save Filters</Button>
      </div>
    </div>
  </CustomModal>
</template>
