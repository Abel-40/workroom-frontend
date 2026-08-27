<script setup lang="ts">
import Sidebar from "./Sidebar.vue";
</script>

<template>
  <div class="wr-shell min-h-screen w-full">
    <div class="mx-auto flex max-w-[1600px] gap-4 p-4 pb-24 md:pb-4">
      <Sidebar />
      <main class="min-w-0 flex-1">
        <div class="mx-auto w-full max-w-[1440px]">
          <slot />
        </div>
      </main>
    </div>
    <slot name="floating" />
  </div>
</template>
