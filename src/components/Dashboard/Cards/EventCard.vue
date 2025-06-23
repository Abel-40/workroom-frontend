<script setup lang="ts">
interface EventTypes {
  title:string,
  date:String,
  time:string,
  duration:string
}
import { 
  Clock10,
  ArrowUp,
 } from 'lucide-vue-next';
const props = defineProps<EventTypes>()
</script>

<template>
      <div class="max-w- 2xl:max-w- bg-white rounded-lg  shadow-lg h-full p-3">
        <div class="border-l-4 border-blue-400 ">
          <div class="flex justify-between p-3">
            <h3 class="font-medium">
              {{ props.title }}
            </h3>
            <ArrowUp class="w-4 h-4 text-yellow-500" />
          </div>
          <div class="flex justify-between items-center mt-1 p-3">
            <p class="text-sm text-[#91929E]">{{props.date}} | {{props.time}}</p>
            <div class="flex items-center gap-1 bg-[#F4F9FD] px-2 py-1 rounded">
              <Clock10 class="w-3 h-3 rounded-sm" />
              <span class="text-xs">{{props.duration}}</span>
            </div>
          </div>
        </div>
      </div>
</template>