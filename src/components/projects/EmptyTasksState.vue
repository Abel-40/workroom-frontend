<script setup lang="ts">
import { ClipboardList, Plus } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { useDeviceClass } from "@/composables/useDeviceClass";

defineEmits<{
  (e: "add-task"): void;
}>();

const { isReadOnly } = useDeviceClass();
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-5 rounded-2xl py-20 text-center">
    <div class="flex h-20 w-20 items-center justify-center rounded-full bg-page">
      <ClipboardList class="h-9 w-9 text-primary" />
    </div>
    <div>
      <p class="font-medium text-ink">There are no tasks in this project yet</p>
      <p class="text-sm text-subtle">Let's add them</p>
    </div>
    <Button v-if="!isReadOnly" class="rounded-xl" @click="$emit('add-task')">
      <Plus class="h-4 w-4" /> Add Task
    </Button>
  </div>
</template>
