<script setup lang="ts">
import { watch,onBeforeUnmount } from 'vue'
import { X } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import {useRouter } from 'vue-router'
const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  }
})


const emit = defineEmits(['update:open'])

// Optional: close the modal when clicking a close button
function closeModal() {
  document.body.classList.remove('overflow-hidden');
  emit('update:open', false)
}
const router = useRouter()
router.beforeEach(() => {
  emit('update:open', false)  // Close the modal when navigating to a new route
})

onBeforeUnmount(() => {
  emit('update:open', false)  // Ensure the modal is closed when the component is unmounted
})
</script>

<template>
  <div v-if="props.open" class="absolute z-50 w-full max-h-screen  inset-0 bg-black/50 flex py-4 justify-center items-center" @click="closeModal">
    <div class="min-w-[280px] max-h-[700px] overflow-y-auto bg-white  rounded-lg" @click.stop>
      <div class="flex justify-between px-3 py-4">
        <p class="font-semibold">{{ props.title }}</p>
        <div class="w-5 h-5 bg-[#F4F9FD] flex justify-center items-center rounded-md">
            <X @click="closeModal" class="w-4 h-4"/>
        </div>
        
      </div>

      <slot />
      
      
    </div>
  </div>
</template>
