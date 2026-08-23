<script setup lang="ts">
// Generic right-anchored slide-over -- used to host the plan inspector when
// a Sequence card is selected, so the sequence grid can use the full width
// like the design brief shows, while task detail stays one click away
// instead of permanently eating a side column.
const open = defineModel<boolean>("open", { required: true });
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition-opacity duration-200" leave-active-class="transition-opacity duration-150" enter-from-class="opacity-0" leave-to-class="opacity-0">
      <div v-if="open" class="fixed inset-0 z-[60] bg-black/30" @click="open = false" />
    </Transition>
    <Transition
      enter-active-class="transition-transform duration-250 ease-out"
      leave-active-class="transition-transform duration-200 ease-in"
      enter-from-class="translate-x-full"
      leave-to-class="translate-x-full"
    >
      <div v-if="open" class="fixed right-0 top-0 z-[61] h-full w-full max-w-[420px] p-4">
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>
