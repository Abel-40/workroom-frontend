<script setup lang="ts">
import { computed, reactive, ref } from "vue";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEventStore, type EventColor } from "@/stores/eventStore";

const props = defineProps<{
  defaultDate?: string;
}>();

const open = defineModel<boolean>("open", { required: true });
const eventStore = useEventStore();

const CATEGORIES: { value: string; color: EventColor; icon: string }[] = [
  { value: "Corporate Event", color: "purple", icon: "💼" },
  { value: "Birthday", color: "pink", icon: "🎂" },
  { value: "Meeting", color: "amber", icon: "👥" },
  { value: "Social", color: "blue", icon: "🎬" },
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CADENCES = ["Daily", "Weekly", "Monthly"] as const;

const emptyForm = () => ({
  title: "",
  category: CATEGORIES[0].value,
  priority: "medium" as "low" | "medium" | "high",
  date: props.defaultDate || new Date().toISOString().slice(0, 10),
  time: "17:00",
  description: "",
  repeatEnabled: false,
  cadence: "Daily" as (typeof CADENCES)[number],
  days: [] as string[],
  everyDay: false,
  repeatTime: "17:00",
});

const form = reactive(emptyForm());

const toggleDay = (day: string) => {
  const idx = form.days.indexOf(day);
  if (idx >= 0) form.days.splice(idx, 1);
  else form.days.push(day);
};

const canSave = computed(() => form.title.trim().length > 0);

const save = () => {
  if (!canSave.value) return;
  const category = CATEGORIES.find((c) => c.value === form.category) || CATEGORIES[0];
  eventStore.addEvent({
    title: form.title,
    icon: category.icon,
    color: category.color,
    category: form.category,
    date: form.date,
    time: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(
      new Date(`${form.date}T${form.time}`)
    ),
    duration: "1h",
    priority: form.priority === "low" ? "down" : "up",
    description: form.description,
    repeat: form.repeatEnabled
      ? { enabled: true, cadence: form.cadence, days: [...form.days], time: form.repeatTime }
      : undefined,
  });
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
          <Label class="text-xs text-subtle">Event Category</Label>
          <Select v-model="form.category">
            <SelectTrigger class="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="cat in CATEGORIES" :key="cat.value" :value="cat.value">
                  {{ cat.icon }} {{ cat.value }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-1.5">
          <Label class="text-xs text-subtle">Priority</Label>
          <Select v-model="form.priority">
            <SelectTrigger class="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
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
          <Label class="text-xs text-subtle">Description</Label>
          <Textarea v-model="form.description" placeholder="Add some description of the event" rows="3" class="rounded-xl" />
        </div>

        <div class="flex items-center justify-between rounded-xl bg-page px-4 py-3">
          <span class="text-sm font-medium text-ink">Repeat Event</span>
          <Switch v-model:checked="form.repeatEnabled" />
        </div>

        <template v-if="form.repeatEnabled">
          <div class="space-y-1.5">
            <Label class="text-xs text-subtle">Complete this task</Label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="c in CADENCES"
                :key="c"
                type="button"
                class="rounded-xl py-1.5 text-sm font-medium transition"
                :class="form.cadence === c ? 'bg-primary text-white' : 'bg-page text-ink hover:bg-blue-50'"
                @click="form.cadence = c"
              >
                {{ c }}
              </button>
            </div>
          </div>

          <div class="space-y-1.5">
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

          <label class="flex items-center gap-2 text-sm text-ink">
            <Checkbox v-model:checked="form.everyDay" />
            Repeat every day
          </label>

          <div class="space-y-1.5">
            <Label class="text-xs text-subtle">Time</Label>
            <Input v-model="form.repeatTime" type="time" class="rounded-xl" />
          </div>
        </template>

        <div class="flex justify-end">
          <Button class="rounded-xl" :disabled="!canSave" @click="save">Save Event</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
