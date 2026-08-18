<script setup lang="ts">
import { CheckCircle2 } from "lucide-vue-next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const open = defineModel<boolean>("open", { required: true });

const emit = defineEmits<{
  (e: "approve"): void;
}>();

const approve = () => {
  emit("approve");
  open.value = false;
};
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>Are you sure you are claiming this task?</DialogTitle>
      </DialogHeader>

      <div class="flex flex-col items-center gap-4 py-2 text-center">
        <div class="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 class="h-12 w-12 text-emerald-500" />
        </div>
        <p class="text-sm text-subtle">
          The task will be moved to the Completed section and will be closed.
        </p>
        <Button class="rounded-xl" @click="approve">Approve Task</Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
