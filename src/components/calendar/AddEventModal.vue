<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown } from "lucide-vue-next";
import { useEventStore } from "@/stores/eventStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useEmployeeStore } from "@/stores/employeeStore";
import { useToast } from "@/components/ui/toast/use-toast";

const props = defineProps<{
  defaultDate?: string;
}>();

const open = defineModel<boolean>("open", { required: true });
const eventStore = useEventStore();
const directoryStore = useDirectoryStore();
const employeeStore = useEmployeeStore();
const { toast } = useToast();

onMounted(() => {
  if (!directoryStore.loaded) directoryStore.fetchAll();
  if (!employeeStore.employees.length) employeeStore.fetchEmployees();
});

const NONE = "__none__";
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CADENCES = ["daily", "weekly", "monthly"] as const;
// String-compares fine against form.date -- both are "YYYY-MM-DD".
const todayStr = new Date().toISOString().slice(0, 10);

// Who an event is for: not every event has named attendees -- it may just
// be scoped to a department or team, or open to the whole company. These
// are mutually exclusive in the form (picking one clears the others) even
// though the underlying Event model could technically hold more than one
// at once; a single clear audience is what the create form asks for.
type Audience = "company" | "department" | "team" | "members";
const AUDIENCE_OPTIONS: { value: Audience; label: string }[] = [
  { value: "company", label: "Company" },
  { value: "department", label: "Department" },
  { value: "team", label: "Team" },
  { value: "members", label: "Members" },
];
const audience = ref<Audience>("company");

const emptyForm = () => ({
  title: "",
  eventTypeId: NONE as string,
  departmentId: NONE as string,
  teamId: NONE as string,
  attendeeIds: [] as string[],
  date: props.defaultDate || todayStr,
  time: "17:00",
  location: "",
  description: "",
  repeatEnabled: false,
  cadence: "weekly" as (typeof CADENCES)[number],
  days: [] as string[],
});

const form = reactive(emptyForm());
const saving = ref(false);

const setAudience = (value: Audience) => {
  audience.value = value;
  if (value !== "department") form.departmentId = NONE;
  if (value !== "team") form.teamId = NONE;
  if (value !== "members") form.attendeeIds = [];
};

const toggleAttendee = (id: string) => {
  const idx = form.attendeeIds.indexOf(id);
  if (idx >= 0) form.attendeeIds.splice(idx, 1);
  else form.attendeeIds.push(id);
};

const attendeesLabel = computed(() => {
  if (!form.attendeeIds.length) return "Select members";
  if (form.attendeeIds.length === 1) {
    return employeeStore.employees.find((e) => e.id === form.attendeeIds[0])?.name ?? "1 selected";
  }
  return `${form.attendeeIds.length} members selected`;
});

const toggleDay = (day: string) => {
  const idx = form.days.indexOf(day);
  if (idx >= 0) form.days.splice(idx, 1);
  else form.days.push(day);
};

// Events can't be backdated -- the calendar's day cells already block
// opening this modal on a past date, but the date field is still freely
// editable once open, so the same rule has to hold here too.
const canSave = computed(() => form.title.trim().length > 0 && form.date >= todayStr);

const save = async () => {
  if (!canSave.value) return;
  saving.value = true;
  const { error } = await eventStore.createEvent({
    title: form.title,
    description: form.description,
    eventTypeId: form.eventTypeId === NONE ? null : form.eventTypeId,
    departmentId: form.departmentId === NONE ? null : form.departmentId,
    teamId: form.teamId === NONE ? null : form.teamId,
    attendeeIds: form.attendeeIds,
    startAt: new Date(`${form.date}T${form.time}`).toISOString(),
    location: form.location,
    isRecurring: form.repeatEnabled,
    recurrenceCadence: form.repeatEnabled ? form.cadence : null,
    recurrenceDays: form.repeatEnabled ? [...form.days] : [],
  });
  saving.value = false;
  if (error) {
    toast({ title: "Event not created", description: error, variant: "destructive" });
    return;
  }
  Object.assign(form, emptyForm());
  audience.value = "company";
  open.value = false;
};
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>Add Event</DialogTitle>
      </DialogHeader>

      <div class="space-y-4">
        <div class="space-y-1.5">
          <Label class="text-xs text-subtle">Event Name</Label>
          <Input v-model="form.title" placeholder="Katy's Birthday" class="rounded-xl" />
        </div>

        <div class="space-y-1.5">
          <Label class="text-xs text-subtle">Event Type</Label>
          <Select v-model="form.eventTypeId">
            <SelectTrigger class="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem :value="NONE">No type</SelectItem>
                <SelectItem v-for="t in directoryStore.eventTypes" :key="t.id" :value="t.id">{{ t.name }}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-1.5">
          <Label class="text-xs text-subtle">Who is this event for?</Label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="opt in AUDIENCE_OPTIONS"
              :key="opt.value"
              type="button"
              class="rounded-xl py-1.5 text-xs font-medium transition"
              :class="audience === opt.value ? 'bg-primary text-white' : 'bg-page text-ink hover:bg-blue-50'"
              @click="setAudience(opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>

          <Select v-if="audience === 'department'" v-model="form.departmentId">
            <SelectTrigger class="mt-1.5 rounded-xl"><SelectValue placeholder="Select a department" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="d in directoryStore.departments" :key="d.id" :value="d.id">{{ d.name }}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select v-else-if="audience === 'team'" v-model="form.teamId">
            <SelectTrigger class="mt-1.5 rounded-xl"><SelectValue placeholder="Select a team" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="t in directoryStore.teams" :key="t.id" :value="t.id">{{ t.name }}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Popover v-else-if="audience === 'members'">
            <PopoverTrigger as-child>
              <button
                type="button"
                class="mt-1.5 flex h-9 w-full items-center justify-between rounded-xl border border-input px-3 text-sm"
              >
                <span :class="form.attendeeIds.length ? 'text-ink' : 'text-muted-foreground'">{{ attendeesLabel }}</span>
                <ChevronDown class="h-4 w-4 shrink-0 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent class="max-h-64 w-72 overflow-y-auto p-2" align="start">
              <p v-if="!employeeStore.employees.length" class="px-2 py-4 text-center text-xs text-subtle">No company members yet.</p>
              <label
                v-for="member in employeeStore.employees"
                :key="member.id"
                class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-page"
              >
                <Checkbox
                  :model-value="form.attendeeIds.includes(member.id)"
                  @update:model-value="() => toggleAttendee(member.id)"
                />
                {{ member.name }}
              </label>
            </PopoverContent>
          </Popover>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <Label class="text-xs text-subtle">Date</Label>
            <Input v-model="form.date" type="date" :min="todayStr" class="rounded-xl" />
            <p v-if="form.date < todayStr" class="text-xs text-destructive">Events can't be scheduled in the past.</p>
          </div>
          <div class="space-y-1.5">
            <Label class="text-xs text-subtle">Time</Label>
            <Input v-model="form.time" type="time" class="rounded-xl" />
          </div>
        </div>

        <div class="space-y-1.5">
          <Label class="text-xs text-subtle">Location or meeting link</Label>
          <Input v-model="form.location" placeholder="Conference Room B, or a video-call link" class="rounded-xl" />
        </div>

        <div class="space-y-1.5">
          <Label class="text-xs text-subtle">Description</Label>
          <Textarea v-model="form.description" placeholder="Add some description of the event" rows="3" class="rounded-xl" />
        </div>

        <div class="flex items-center justify-between rounded-xl bg-page px-4 py-3">
          <span class="text-sm font-medium text-ink">Repeat Event</span>
          <Switch :model-value="form.repeatEnabled" @update:model-value="(v: boolean) => (form.repeatEnabled = v)" />
        </div>

        <template v-if="form.repeatEnabled">
          <div class="space-y-1.5">
            <Label class="text-xs text-subtle">Cadence</Label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="c in CADENCES"
                :key="c"
                type="button"
                class="rounded-xl py-1.5 text-sm font-medium capitalize transition"
                :class="form.cadence === c ? 'bg-primary text-white' : 'bg-page text-ink hover:bg-blue-50'"
                @click="form.cadence = c"
              >
                {{ c }}
              </button>
            </div>
          </div>

          <div v-if="form.cadence === 'weekly'" class="space-y-1.5">
            <Label class="text-xs text-subtle">On these days</Label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="day in WEEKDAYS"
                :key="day"
                type="button"
                class="h-8 w-10 rounded-lg text-xs font-medium transition"
                :class="form.days.includes(day) ? 'bg-primary text-white' : 'bg-page text-ink hover:bg-blue-50'"
                @click="toggleDay(day)"
              >
                {{ day }}
              </button>
            </div>
          </div>
        </template>

        <div class="flex justify-end">
          <Button class="rounded-xl" :disabled="!canSave || saving" @click="save">
            {{ saving ? "Saving…" : "Save Event" }}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
