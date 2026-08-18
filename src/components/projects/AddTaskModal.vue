<script setup lang="ts">
import { computed, reactive } from "vue";
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
import { TASK_GROUPS } from "@/lib/taskGroups";
import { useProjectStore } from "@/stores/projectStore";

const props = defineProps<{
  projectId: string;
}>();

const open = defineModel<boolean>("open", { required: true });

const projectsStore = useProjectStore();
const assigneeOptions = computed(() => projectsStore.allAssignees as string[]);

const LABEL_COLORS = [
  { value: "purple", class: "bg-violet-500" },
  { value: "cyan", class: "bg-cyan-400" },
];

const emptyForm = () => ({
  name: "",
  taskGroup: TASK_GROUPS[0] as string,
  estimatedTime: "",
  deadline: "",
  priority: "medium" as "low" | "medium" | "high",
  assignee: "",
  description: "",
  labelColors: [] as string[],
});

const form = reactive(emptyForm());

const toggleLabel = (value: string) => {
  const idx = form.labelColors.indexOf(value);
  if (idx >= 0) form.labelColors.splice(idx, 1);
  else form.labelColors.push(value);
};

const canSave = computed(() => form.name.trim().length > 0);

const save = () => {
  if (!canSave.value) return;
  projectsStore.addTask(props.projectId, { ...form });
  Object.assign(form, emptyForm());
  open.value = false;
};
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>Add Task</DialogTitle>
      </DialogHeader>

      <div class="space-y-4">
        <div class="space-y-1.5">
          <Label class="text-xs text-subtle">Task Name</Label>
          <Input v-model="form.name" placeholder="Task Name" class="rounded-xl" />
        </div>

        <div class="space-y-1.5">
          <Label class="text-xs text-subtle">Task Group</Label>
          <Select v-model="form.taskGroup">
            <SelectTrigger class="rounded-xl">
              <SelectValue placeholder="Design" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="group in TASK_GROUPS" :key="group" :value="group">
                  {{ group }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <Label class="text-xs text-subtle">Estimate</Label>
            <Input v-model="form.estimatedTime" placeholder="e.g. 2d 4h" class="rounded-xl" />
          </div>
          <div class="space-y-1.5">
            <Label class="text-xs text-subtle">Dead Line</Label>
            <Input v-model="form.deadline" type="date" class="rounded-xl" />
          </div>
        </div>

        <div class="space-y-1.5">
          <Label class="text-xs text-subtle">Priority</Label>
          <Select v-model="form.priority">
            <SelectTrigger class="rounded-xl">
              <SelectValue placeholder="Medium" />
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

        <div class="space-y-1.5">
          <Label class="text-xs text-subtle">Assignee</Label>
          <Select v-model="form.assignee">
            <SelectTrigger class="rounded-xl">
              <SelectValue placeholder="Select Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="name in assigneeOptions" :key="name" :value="name">
                  {{ name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-1.5">
          <Label class="text-xs text-subtle">Description</Label>
          <Textarea
            v-model="form.description"
            placeholder="Add some description of the task"
            class="rounded-xl"
            rows="3"
          />
        </div>

        <div class="flex items-center justify-between pt-1">
          <div class="flex gap-2">
            <button
              v-for="color in LABEL_COLORS"
              :key="color.value"
              type="button"
              class="h-6 w-6 rounded-full ring-offset-2 transition"
              :class="[color.class, form.labelColors.includes(color.value) ? 'ring-2 ring-ink' : '']"
              @click="toggleLabel(color.value)"
            />
          </div>
          <Button class="rounded-xl" :disabled="!canSave" @click="save">Save Task</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
