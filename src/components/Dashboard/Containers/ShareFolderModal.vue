<script setup lang="ts">
import { ref, watch } from "vue";
import { Plus } from "lucide-vue-next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEmployeeStore } from "@/stores/employeeStore";

const open = defineModel<boolean>("open", { required: true });
const employeeStore = useEmployeeStore();

const selected = ref<string[]>([""]);
const shared = ref(false);

watch(open, (isOpen) => {
  if (isOpen) {
    selected.value = [""];
    shared.value = false;
  }
});

const addAnother = () => selected.value.push("");

const share = () => {
  if (!selected.value.some((v) => v)) return;
  shared.value = true;
};
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>Share the Folder</DialogTitle>
      </DialogHeader>

      <div v-if="!shared" class="space-y-4">
        <div class="space-y-2">
          <label class="text-xs text-subtle">Select Member</label>
          <Select v-for="(_, index) in selected" :key="index" v-model="selected[index]">
            <SelectTrigger class="rounded-xl">
              <SelectValue placeholder="member@email.com" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="emp in employeeStore.employees" :key="emp.id" :value="emp.email">
                  {{ emp.name }} — {{ emp.email }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <button
          type="button"
          class="flex items-center gap-1 text-sm font-medium text-primary"
          @click="addAnother"
        >
          <Plus class="h-4 w-4" /> Add another Member
        </button>

        <div class="flex justify-end">
          <Button class="rounded-xl" @click="share">Share</Button>
        </div>
      </div>

      <div v-else class="flex flex-col items-center gap-3 py-8 text-center">
        <p class="font-medium text-ink">Folder shared!</p>
        <p class="text-sm text-subtle">The selected members now have access.</p>
      </div>
    </DialogContent>
  </Dialog>
</template>
