<script setup lang="ts">
import { ArrowDown, ArrowUp } from 'lucide-vue-next';
import type{TaskType} from "@/types/types"
import {useRouter} from 'vue-router'
const props = defineProps<{Task:TaskType}>()
const router = useRouter()
const getPriorityColor = (level: string) => {
  switch(level) {
    case 'high': return 'text-red-500';
    case 'medium': return ' text-yellow-500';
    case 'low': return 'text-green-500';
    default: return 'text-gray-500';
  }
}
const getIcon = (level:String)=>{
  switch(level){
    case 'high':return ArrowUp;
    case 'medium':return ArrowUp;
    case 'low':return ArrowDown;
  }
}
const getStatusColor = (status: string) => {
  switch(status) {
    case 'In Progress': return 'bg-blue-100 text-blue-500';
    case 'Done': return 'bg-green-100 text-green-500';
    case 'In Review': return 'bg-purple-100 text-purple-500';
    case 'To Do': return 'bg-gray-100 text-gray-500';
    default: return 'bg-gray-100 text-gray-500';
  }
}


const getProgresStatus = (percent:string)=>{
  switch(percent){
    case '0%': return  'border-[2px] border-r-gray';
    case '10%': return 'border-l-[2px] border-r-[2px] border-l-blue-500  border-y-gray border-y-[2px] border-r-gray';
    case '50%': return 'border-l-[2px] border-l-blue-500 border-b-[2px] border-b-blue-500  border-r-[2px] border-r-gray border-t-[2px] border-t-gray';
    case '70%': return 'border-l-[2px] border-l-blue-500 border-b-[2px] border-b-blue-500  border-r-[2px] border-r-gray border-t-[2px] border-t-blue';
    case '100%': return 'border-[2px] border-blue-500';
    default : return 'border-[2px] border-gray'
  }
}

const onClick = ()=>{
  router.push({
    path:'/admin/dashboard/',
    query:{section:'projects',
      id:props.Task.id

    }
  })
}
</script>
<template>
  <div class="w-full flex justify-between items-center p-4 gap-5 bg-white rounded-3xl border border-gray-200 shadow-sm cursor-pointer" @click="onClick">
    <div class="min-w-[20%]">
      <div class="flex flex-col gap-3 justify-center ">
        <p class="text-sm text-left whitespace-nowrap text-[#91929E]">Task Name</P>
        <p class="whitespace-nowrap">{{props.Task.name}}</p>
      </div>
    </div>
    <!-- left side properties -->
    <div class="w-[70%] grid grid-cols-6 gap-3 items-center">
      <div class="flex flex-col gap-3 justify-center items-center">
        <p class="text-sm whitespace-nowrap text-[#91929E]">Estimate </P>
        <p class="text-sm font-semibold">{{props.Task.EstimatedTime}}</p>
        
      </div>

      <div class="flex flex-col justify-center items-center gap-3">
        <p class="text-sm whitespace-nowrap text-[#91929E]">Spent Time</P>
        <p class="text-sm font-semibold">{{props.Task.SpentTime}}</p>
      </div>

      <div class="flex flex-col justify-center items-center gap-3">
        <p class="text-sm whitespace-nowrap text-[#91929E]">Assignee</P>
          <img :src="props.Task.assignee" class="w-5 h-5 rounded-full" />
      </div>

      <div class="flex flex-col justify-center items-center gap-3">
        <p class="text-sm whitespace-nowrap text-[#91929E]">Priority</P>
          <span class="flex gap-1">
            <component class="w-4 h-4" :is="getIcon(props.Task.priority.level)" :class="getPriorityColor(props.Task.priority.level)"/>
            <p class="text-sm font-semibold" :class="getPriorityColor(props.Task.priority.level)">{{props.Task.priority.level}}</p>
          </span>
      </div>

      <div class="flex flex-col justify-center items-center gap-3">
        <p class="text-sm whitespace-nowrap text-[#91929E]">Status</P>
        <div class="flex justify-center items-center w-[77px] h-[24px]  rounded-lg" :class="getStatusColor(props.Task.status)">
          <p class="text-xs font-semibold  whitespace-nowrap">{{props.Task.status}}</p>
        </div>
        
      </div>

      <div class="flex flex-col justify-center items-center gap-3">
        <p class="text-sm whitespace-nowrap text-[#91929E]">progress</P>
        <div class="w-5 h-5 rounded-full" :class="getProgresStatus(props.Task.Progress)"></div>
      </div>
    </div>
  </div>
</template>
