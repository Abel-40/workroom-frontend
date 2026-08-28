<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/toast/use-toast';
import router from '@/router';
import SelectionCard from '@/components/cards/SelectionCard.vue';
const authStore = useAuthStore()
onMounted(()=>{
  authStore.getDefaultTaskTypes(authStore.company.sector)
})
const {toast}  = useToast()

const selected = ref<string[]>([])
const useAllDefaults = ref(false)

function toggleSelection(id: string) {
  if (selected.value.includes(id)) {
    selected.value = selected.value.filter(item => item !== id)
  } else {
    selected.value.push(id)
  }
}

const handleSubmit = async ()=>{
  // isStep3Complete stays false until createTaskType actually succeeds --
  // setting it true beforehand let a failed request still satisfy the
  // step4 router guard (same bug as step1 -> step2 and step2 -> step3).
  authStore.updateStep3Form({
    selected_types:selected.value,
    use_all_default_task_types:useAllDefaults.value,
    company_id:authStore.company.id,
    isStep3Complete:false
  })
  const result = await authStore.createTaskType(authStore.step3Form)
  if (result.errors) {
    for(const [field,message] of Object.entries(result.errors)){
      toast({
      title: 'Error!',
      description: message.join(','),
      variant: 'destructive',
    })
    }
  } else {
    authStore.updateStep3Form({ isStep3Complete: true })
    router.push({
      path:'/auth/',
      query:{section:'step4'}
    })
  }

}

const skip = ()=>{
    router.push({
      path:'/auth/',
      query:{section:'step4'}
    })
}

</script>

<template>
    <!-- Right Container - Form -->
    <div class="w-full lg:w-2/3 xl:w-3/4 px-6 sm:p-8 md:px-12 flex flex-col items-center justify-center bg-white rounded-2xl">
      <div class="w-full">
        <p class="text-sm font-medium text-gray-700 mb-6">
          To match you with the right tools, pick a task type based on your company’s sector. Workroom will take it from there!:
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <SelectionCard
            v-for="option in authStore.defaultTaskTypes"
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
