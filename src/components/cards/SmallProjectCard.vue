<script setup lang="ts">
import type{Project} from "@/types/types"
import {ChevronRight} from 'lucide-vue-next'
import {useRouter,useRoute} from "vue-router"
const router = useRouter()
const route = useRoute()
const props = defineProps<{fields:Partial<Project>}>()
  const emit = defineEmits<{
  (e: 'view-detail'): void;
}>();

// Handle click
const currentProjectId = route.query.id
const onClick = () => {
  emit('view-detail')
  router.replace({
    path:'/admin/dashboard/',
    query:{section:'projects',id:route.query.id,detials:props.fields.id}
  })
};
</script>

<template>
      <div class="w-full h-full px-4 py-3  rounded-xl">
        <p class="text-xs text-gray-500">{{props.fields.id}}</p>
        <p class="font-medium">{{props.fields.title}}</p>
        <div class="cursor-pointer flex items-center">
          <Button variant="link" as="a" class="text-primary px-0 py-0 h-auto " @click="onClick">
          View details 
          </Button>
          <ChevronRight class="w-4 h-4 text-primary"/>
        </div>

      </div>
</template>