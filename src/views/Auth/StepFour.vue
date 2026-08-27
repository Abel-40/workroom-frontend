<script setup lang="ts">
import { WorkflowIcon, ArrowRight, Section } from 'lucide-vue-next';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Button from '@/components/ui/button/Button.vue'
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/toast/use-toast';
import router from '@/router';
import SelectionCard from '@/components/cards/SelectionCard.vue';
const authStore = useAuthStore()
onMounted(()=>{
  authStore.getDefaultDepartmentTypes(authStore.company.sector)
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
  // isStep4Complete stays false until createDepartmentType actually
  // succeeds -- setting it true beforehand let a failed request still
  // satisfy the step5 router guard (same bug as the earlier steps).
  authStore.updateStep4Form({
    selected_types:selected.value,
    use_all_default_departments:useAllDefaults.value,
    company_id:authStore.company.id,
    isStep4Complete:false
  })
  const result = await authStore.createDepartmentType(authStore.step4Form)
  if (result.errors) {
    for(const [field,message] of Object.entries(result.errors)){
      toast({
      title: 'Error!',
      description: message.join(','),
      variant: 'destructive',
    })
    }
  } else {
    authStore.updateStep4Form({ isStep4Complete: true })
    router.push({
      path:'/auth/',
      query:{section:'step5'}
    })
  }

}

const skip = ()=>{
    router.push({
      path:'/auth/',
      query:{section:'step5'}
    })
}

</script>

<template>
    <!-- Right Container - Form -->
    <div class="w-full lg:w-2/3 xl:w-3/4 px-6 sm:p-8 md:px-12 flex flex-col items-center justify-center bg-white rounded-2xl">
      <div class="w-full">
        <p class="text-sm font-medium text-gray-700 mb-6">
          pick a Departments based on your company’s sector. Workroom will take it from there!:
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <SelectionCard
            v-for="option in authStore.departments"
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
