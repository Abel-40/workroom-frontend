<script setup lang="ts">
import { computed, reactive, watch } from "vue";
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
import type { TaskType } from "@/types/types";
import { useProjectStore } from "@/stores/projectStore";

const props = defineProps<{
  projectId: string;
  task: TaskType;
}>();

const open = defineModel<boolean>("open", { required: true });

const projectsStore = useProjectStore();

const emptyForm = () => ({
  timeSpent: "",
  date: new Date().toISOString().slice(0, 10),
  time: new Date().toTimeString().slice(0, 5),
  description: "",
});

const form = reactive(emptyForm());

watch(open, (isOpen) => {
  if (isOpen) Object.assign(form, emptyForm());
});

const canSave = computed(() => form.timeSpent.trim().length > 0);

const save = () => {
  if (!canSave.value) return;
  projectsStore.logTime(props.projectId, props.task.id, { ...form });
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
        <div class="flex items-center justify-center gap-4 rounded-2xl bg-page px-4 py-4">
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary shadow-sm">
            <Timer class="h-4 w-4" />
          </div>
          <div class="text-center">
            <p class="text-sm font-semibold text-ink">{{ task.SpentTime || "0h" }} logged</p>
            <p class="text-xs text-subtle">Original Estimate {{ task.EstimatedTime || "—" }}</p>
          </div>
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary shadow-sm">
            <CalendarClock class="h-4 w-4" />
          </div>
        </div>

        <div class="space-y-1.5">
          <Label class="text-xs text-subtle">Time spent</Label>
          <Input v-model="form.timeSpent" placeholder="1w 3d 6h 40m" class="rounded-xl" />
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
          <Label class="text-xs text-subtle">Work Description</Label>
          <Textarea
            v-model="form.description"
            placeholder="Add some description of the task"
            class="rounded-xl"
            rows="3"
          />
        </div>

        <div class="flex justify-end pt-1">
          <Button class="rounded-xl" :disabled="!canSave" @click="save">
            <Clock3 class="h-4 w-4" /> Save Task
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
