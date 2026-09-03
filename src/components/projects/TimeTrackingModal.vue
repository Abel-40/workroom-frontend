<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { Clock3, Timer, CalendarClock } from "lucide-vue-next";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TaskType } from "@/types/types";
import { useProjectStore } from "@/stores/projectStore";
import { useToast } from "@/components/ui/toast/use-toast";
import { formatHoursToDuration, parseDurationToMinutes } from "@/lib/duration";

// Either a single known task (opened from the task detail sidebar) or a list
// to choose from (opened from My Day, where the task isn't known yet).
const props = defineProps<{
  task?: TaskType;
  tasks?: TaskType[];
}>();

const open = defineModel<boolean>("open", { required: true });

const projectsStore = useProjectStore();
const { toast } = useToast();
const saving = ref(false);

const emptyForm = () => ({
  taskId: props.task?.id ?? "",
  timeSpent: "",
  date: new Date().toISOString().slice(0, 10),
  description: "",
});

const form = reactive(emptyForm());

watch(open, (isOpen) => {
  if (isOpen) Object.assign(form, emptyForm());
});

const selectedTask = computed(() => props.task ?? props.tasks?.find((t) => t.id === form.taskId) ?? null);
const canSave = computed(() => !!form.taskId && form.timeSpent.trim().length > 0);

const save = async () => {
  if (!canSave.value) return;
  const addedHours = parseDurationToMinutes(form.timeSpent) / 60;
  saving.value = true;
  const { error } = await projectsStore.createTimeLog(form.taskId, {
    hours: addedHours,
    workDate: form.date,
    description: form.description,
  });
  saving.value = false;
  if (error) {
    toast({ title: "Time entry not saved", description: error, variant: "destructive" });
    return;
  }
  open.value = false;
};
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>Time Tracking</DialogTitle>
      </DialogHeader>

      <div class="space-y-4">
        <div v-if="tasks" class="space-y-1.5">
          <Label class="text-xs text-subtle">Task</Label>
          <Select v-model="form.taskId">
            <SelectTrigger class="rounded-xl">
              <SelectValue placeholder="Choose a task" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="t in tasks" :key="t.id" :value="t.id">{{ t.title }}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div v-if="selectedTask" class="flex items-center justify-center gap-4 rounded-2xl bg-page px-4 py-4">
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-card text-primary shadow-sm">
            <Timer class="h-4 w-4" />
          </div>
          <div class="text-center">
            <p class="text-sm font-semibold text-ink">{{ formatHoursToDuration(selectedTask.spentTimeHours) }} logged</p>
            <p class="text-xs text-subtle">Original Estimate {{ selectedTask.estimatedTimeHours ? formatHoursToDuration(selectedTask.estimatedTimeHours) : "—" }}</p>
          </div>
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-card text-primary shadow-sm">
            <CalendarClock class="h-4 w-4" />
          </div>
        </div>

        <div class="space-y-1.5">
          <Label class="text-xs text-subtle">Time spent</Label>
          <Input v-model="form.timeSpent" placeholder="1w 3d 6h 40m" class="rounded-xl" />
        </div>

        <div class="space-y-1.5">
          <Label class="text-xs text-subtle">Date</Label>
          <Input v-model="form.date" type="date" class="rounded-xl" />
        </div>

        <div class="space-y-1.5">
          <Label class="text-xs text-subtle">Work Description</Label>
          <Textarea
            v-model="form.description"
            placeholder="Add some description of the task"
            class="rounded-xl"
            rows="3"
          />
        </div>

        <div class="flex justify-end pt-1">
          <Button class="rounded-xl" :disabled="!canSave || saving" @click="save">
            <Clock3 class="h-4 w-4" /> Save Entry
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
