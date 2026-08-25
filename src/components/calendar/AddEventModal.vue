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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEventStore } from "@/stores/eventStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useToast } from "@/components/ui/toast/use-toast";

const props = defineProps<{
  defaultDate?: string;
}>();

const open = defineModel<boolean>("open", { required: true });
const eventStore = useEventStore();
const directoryStore = useDirectoryStore();
const { toast } = useToast();

onMounted(() => {
  if (!directoryStore.loaded) directoryStore.fetchAll();
});

const NONE = "__none__";
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CADENCES = ["daily", "weekly", "monthly"] as const;

const emptyForm = () => ({
  title: "",
  eventTypeId: NONE as string,
  departmentId: NONE as string,
  teamId: NONE as string,
  date: props.defaultDate || new Date().toISOString().slice(0, 10),
  time: "17:00",
  location: "",
  description: "",
  repeatEnabled: false,
  cadence: "weekly" as (typeof CADENCES)[number],
  days: [] as string[],
});

const form = reactive(emptyForm());
const saving = ref(false);

const toggleDay = (day: string) => {
  const idx = form.days.indexOf(day);
  if (idx >= 0) form.days.splice(idx, 1);
  else form.days.push(day);
};

const canSave = computed(() => form.title.trim().length > 0);

const save = async () => {
  if (!canSave.value) return;
  saving.value = true;
  const { error } = await eventStore.createEvent({
    title: form.title,
    description: form.description,
    eventTypeId: form.eventTypeId === NONE ? null : form.eventTypeId,
    departmentId: form.departmentId === NONE ? null : form.departmentId,
    teamId: form.teamId === NONE ? null : form.teamId,
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

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <Label class="text-xs text-subtle">Department</Label>
            <Select v-model="form.departmentId">
              <SelectTrigger class="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem :value="NONE">None</SelectItem>
                  <SelectItem v-for="d in directoryStore.departments" :key="d.id" :value="d.id">{{ d.name }}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-1.5">
            <Label class="text-xs text-subtle">Team</Label>
            <Select v-model="form.teamId">
              <SelectTrigger class="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem :value="NONE">None</SelectItem>
                  <SelectItem v-for="t in directoryStore.teams" :key="t.id" :value="t.id">{{ t.name }}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <Label class="text-xs text-subtle">Date</Label>
            <Input v-model="form.date" type="date" class="rounded-xl" />
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
