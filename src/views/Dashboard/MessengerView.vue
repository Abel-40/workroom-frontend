<script setup lang="ts">
import { MessageSquare } from "lucide-vue-next";
import Header from "@/components/layout/Header.vue";
</script>

<template>
  <div class="flex-1 p-4">
    <div class="mb-6">
      <Header />
      <h1 class="text-xl font-semibold">Messenger</h1>
    </div>

    <div class="flex h-[640px] flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card text-center">
      <span class="flex h-14 w-14 items-center justify-center rounded-full bg-page text-subtle">
        <MessageSquare class="h-6 w-6" />
      </span>
      <p class="text-lg font-medium text-ink">Messaging isn't available yet</p>
      <p class="max-w-sm text-sm text-subtle">
        In-app messaging is planned for a future release and isn't connected to the backend yet.
      </p>
    </div>
  </div>
</template>
