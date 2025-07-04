<script setup lang="ts">
import { WorkflowIcon, ArrowRight } from 'lucide-vue-next';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Button from '@/components/ui/button/Button.vue'
import { ref,computed,watch } from 'vue'
import { useAuthStore } from '@/stores/authStore';
import { useRoute, useRouter } from 'vue-router';
import { onMounted } from 'vue';
import { useToast } from '@/components/ui/toast/use-toast';
import router from '@/router';
import SelectionCard from '@/components/Dashboard/Cards/SelectionCard.vue';
const route = useRoute
const authStore = useAuthStore()
onMounted(()=>{
  authStore.getDefaultTaskTypes(authStore.company.sector)
})
const {toast}  = useToast()

interface DefaultTaskType {
  selected_types?:number[];
  use_all_default_task_types?:boolean;
}

const taskTypeSelcected = ref<DefaultTaskType>({
  selected_types:[],
  use_all_default_task_types:false
})


const selected = ref<number[]>([])

function toggleSelection(id: number) {
  if (selected.value.includes(id)) {
    selected.value = selected.value.filter(item => item !== id)
  } else {
    selected.value.push(id)
  }
}
taskTypeSelcected.value.selected_types = selected.value

watch(taskTypeSelcected.value.selected_types,(newValue,oldValue)=>{
  console.log(newValue)
  console.log(authStore.company.id)
})
console.log(authStore.company.id)
const handleSubmit = async ()=>{
    authStore.updateStep3Form({
    selected_types:taskTypeSelcected.value.selected_types,
    use_all_default_task_types:taskTypeSelcected.value.use_all_default_task_types,
    company_id:authStore.company.id,
    isStep3Complete:true
  })
  console.log(authStore.step3Form)
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
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
