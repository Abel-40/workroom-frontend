<script setup lang="ts">
import { Plus } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { useDeviceClass } from "@/composables/useDeviceClass";
import { ILLUSTRATIONS } from "@/lib/illustrations";
import EmptyState from "@/components/shared/EmptyState.vue";

defineEmits<{
  (e: "add-task"): void;
}>();

const { isReadOnly } = useDeviceClass();
</script>

<template>
  <!-- "plain": this sits inside the project panel, which already draws the
       surface -- a card here would nest one border inside another. -->
  <EmptyState
    size="lg"
    variant="plain"
    :image="ILLUSTRATIONS.emptyTasks"
    title="No tasks in this project yet"
    :message="
      isReadOnly
        ? 'Tasks added to this project will show up on the board here.'
        : 'Add the first task, or let the AI break the project down into a plan you can review.'
    "
  >
    <Button v-if="!isReadOnly" class="rounded-xl" @click="$emit('add-task')">
      <Plus class="h-4 w-4" /> Add Task
    </Button>
  </EmptyState>
</template>
