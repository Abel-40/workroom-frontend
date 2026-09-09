<script setup lang="ts">
import { ILLUSTRATIONS } from "@/lib/illustrations";
import EmptyState from "@/components/shared/EmptyState.vue";
</script>

<template>
  <div class="flex-1 p-4">
    <div class="mb-6">
      <h1 class="text-xl font-semibold">Messenger</h1>
    </div>

    <EmptyState
      size="xl"
      eyebrow="Coming soon"
      :image="ILLUSTRATIONS.emptyMessages"
      title="Messaging isn’t available yet"
      message="In-app messaging is planned for a future release and isn’t connected to the backend yet."
      class="h-[640px]"
    >
      <template #hint>Until then, task comments and notifications carry project conversations.</template>
    </EmptyState>
  </div>
</template>
