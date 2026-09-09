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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast/use-toast";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useEmployeeStore } from "@/stores/employeeStore";

const open = defineModel<boolean>("open", { required: true });
const { toast } = useToast();

const directoryStore = useDirectoryStore();
const employeeStore = useEmployeeStore();

onMounted(() => {
  if (!employeeStore.employees.length) employeeStore.fetchEmployees();
});

// Radix's Select reserves the empty string internally, so "no leader" uses
// this sentinel instead and is mapped back to null on save.
const NO_LEADER = "none";

const emptyForm = () => ({
  name: "",
  description: "",
  leaderId: NO_LEADER as string,
});

const form = reactive(emptyForm());
const saving = ref(false);
const canSave = computed(() => form.name.trim().length > 0);

const save = async () => {
  if (!canSave.value) return;
  saving.value = true;
  try {
    const { errors } = await directoryStore.createDepartment({
      name: form.name,
      description: form.description,
      leaderId: form.leaderId === NO_LEADER ? null : form.leaderId,
    });
    if (errors) {
      for (const [field, messages] of Object.entries(errors)) {
        toast({ title: `Error in ${field}`, description: messages.join(", "), variant: "destructive" });
      }
      return;
    }
    Object.assign(form, emptyForm());
    open.value = false;
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>New Department</DialogTitle>
      </DialogHeader>

      <div class="space-y-4">
        <div class="space-y-1.5">
          <Label class="text-xs text-subtle">Name</Label>
          <Input v-model="form.name" placeholder="e.g. Engineering" class="rounded-xl" />
        </div>

        <div class="space-y-1.5">
          <Label class="text-xs text-subtle">Description</Label>
          <Textarea v-model="form.description" placeholder="What does this department do?" class="rounded-xl" rows="3" />
        </div>

        <div class="space-y-1.5">
          <Label class="text-xs text-subtle">Leader</Label>
          <Select v-model="form.leaderId">
            <SelectTrigger class="rounded-xl">
              <SelectValue placeholder="No leader" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem :value="NO_LEADER">No leader</SelectItem>
                <SelectItem v-for="person in employeeStore.employees" :key="person.id" :value="person.id">
                  {{ person.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div class="flex justify-end pt-1">
          <Button class="rounded-xl" :disabled="!canSave || saving" @click="save">
            {{ saving ? "Creating…" : "Create Department" }}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
