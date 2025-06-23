<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Props {
  title: string,
  description: string
}

defineProps<Props>()
const isOpen = defineModel('isOpen', {
  required: true,
  type: Boolean
});
const emit = defineEmits(['onClose']);
</script>

<template>
  <Dialog :open="isOpen" @update:open="emit('onClose')" class="" >
    <DialogContent class="w-auto min-w-[500px] max-w-full p-2 absolute right-0"> <!-- Reduced p-6 to p-2 -->
      <DialogHeader class="flex justify-center items-center">
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>{{ description }}</DialogDescription>
      </DialogHeader>
      <slot/>
    </DialogContent>
  </Dialog>
</template>
