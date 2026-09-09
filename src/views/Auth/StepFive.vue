<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore';
import { onMounted } from 'vue';
import { useToast } from '@/components/ui/toast/use-toast';
import router from '@/router';
import SelectionCard from '@/components/cards/SelectionCard.vue';

const authStore = useAuthStore()
onMounted(()=>{
  authStore.getDefaultEventTypes()
})
const {toast} = useToast()

const selected = ref<string[]>([])

function toggleSelection(id: string) {
  if (selected.value.includes(id)) {
    selected.value = selected.value.filter(item => item !== id)
  } else {
    selected.value.push(id)
  }
}

const proceed = () => router.push({ path: '/auth/', query: { section: 'success' } })

const handleSubmit = async ()=>{
  const result = await authStore.createEventTypes({
    selected_ids: selected.value,
    use_all: false,
  })
  if (result.errors) {
    for(const [field,message] of Object.entries(result.errors)){
      toast({
        title: 'Error!',
        description: message.join(','),
        variant: 'destructive',
      })
    }
    return
  }
  proceed()
}

const skip = () => proceed()
</script>

<template>
    <!-- Right Container - Form -->
    <div class="w-full lg:w-2/3 xl:w-3/4 px-6 sm:p-8 md:px-12 flex flex-col items-center justify-center bg-white rounded-2xl">
      <div class="w-full">
        <p class="text-sm font-medium text-gray-700 mb-6">
          Pick which event types your company uses -- a fully remote team might skip Office Social or Coffee Time:
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <SelectionCard
            v-for="option in authStore.defaultEventTypes"
            :key="option.id"
            :name="option.name"
            :selected="selected.includes(option.id)"
            @toggle="toggleSelection(option.id)"
          />
        </div>
        <div class="mt-6 flex justify-between w-full">
          <button class="text-gray-400 text-sm" @click="skip">Skip</button>
          <Button class="bg-primary text-white rounded-lg px-6 py-2 text-sm font-semibold" @click="handleSubmit">Next</Button>
        </div>
      </div>
  </div>
</template>
