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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast/use-toast";
import { parseDurationToMinutes } from "@/lib/duration";
import { useProjectStore } from "@/stores/projectStore";
import { useEmployeeStore } from "@/stores/employeeStore";
import { useDirectoryStore } from "@/stores/directoryStore";

const props = defineProps<{
  projectId: string;
}>();

const open = defineModel<boolean>("open", { required: true });

const projectsStore = useProjectStore();
const employeeStore = useEmployeeStore();
const directoryStore = useDirectoryStore();
const saving = ref(false);
const { toast } = useToast();

const UNASSIGNED = "__unassigned__";
const NONE = "__none__";

const emptyForm = () => ({
  title: "",
  departmentId: NONE as string,
  taskTypeId: NONE as string,
  estimatedTime: "",
  deadline: "",
  priority: "medium" as "low" | "medium" | "high",
  assigneeId: UNASSIGNED as string,
  description: "",
});

const form = reactive(emptyForm());

const canSave = computed(() => form.title.trim().length > 0);

const save = async () => {
  if (!canSave.value) return;
  saving.value = true;
  const estimateMinutes = parseDurationToMinutes(form.estimatedTime);
  const { errors } = await projectsStore.createTask(props.projectId, {
    title: form.title,
    description: form.description,
    departmentId: form.departmentId === NONE ? null : form.departmentId,
    taskTypeId: form.taskTypeId === NONE ? null : form.taskTypeId,
    assignedToId: form.assigneeId === UNASSIGNED ? null : form.assigneeId,
    priority: form.priority,
    deadline: form.deadline || null,
    estimatedTimeHours: estimateMinutes > 0 ? estimateMinutes / 60 : null,
  });
  saving.value = false;
  if (errors) {
    toast({ title: "Task not created", description: Object.values(errors)[0]?.[0] || "Please check the form.", variant: "destructive" });
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
        <DialogTitle>Add Task</DialogTitle>
      </DialogHeader>

      <div class="space-y-4">
        <div class="space-y-1.5">
          <Label class="text-xs text-subtle">Task Name</Label>
          <Input v-model="form.title" placeholder="Task Name" class="rounded-xl" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <Label class="text-xs text-subtle">Department</Label>
            <Select v-model="form.departmentId">
              <SelectTrigger class="rounded-xl">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem :value="NONE">None</SelectItem>
                  <SelectItem v-for="d in directoryStore.departments" :key="d.id" :value="d.id">
                    {{ d.name }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-1.5">
            <Label class="text-xs text-subtle">Task Type</Label>
            <Select v-model="form.taskTypeId">
              <SelectTrigger class="rounded-xl">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem :value="NONE">None</SelectItem>
                  <SelectItem v-for="t in directoryStore.taskTypes" :key="t.id" :value="t.id">
                    {{ t.name }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
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
          <Select v-model="form.assigneeId">
            <SelectTrigger class="rounded-xl">
              <SelectValue placeholder="Select Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem :value="UNASSIGNED">Unassigned</SelectItem>
                <SelectItem v-for="person in employeeStore.employees" :key="person.id" :value="person.id">
                  {{ person.name }}
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

        <div class="flex justify-end pt-1">
          <Button class="rounded-xl" :disabled="!canSave || saving" @click="save">Save Task</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
