<script setup lang="ts">
import { ArrowDown, ArrowUp } from 'lucide-vue-next';
import type{TaskType} from "@/types/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatHoursToDuration } from "@/lib/duration"
import TaskStatusPill from "./TaskStatusPill.vue"
import { useProjectStore } from "@/stores/projectStore"
const props = defineProps<{Task:TaskType}>()
const projectsStore = useProjectStore()
const getPriorityColor = (level: string) => {
  switch(level) {
    case 'high': return 'text-red-500';
    case 'medium': return ' text-yellow-500';
    case 'low': return 'text-green-500';
    default: return 'text-subtle';
  }
}
const getIcon = (level:String)=>{
  switch(level){
    case 'high':return ArrowUp;
    case 'medium':return ArrowUp;
    case 'low':return ArrowDown;
  }
}
const getProgresStatus = (percent:string)=>{
  const value = parseInt(percent, 10) || 0
  if (value <= 0) return 'border-[2px] border-border'
  if (value < 40) return 'border-l-[2px] border-r-[2px] border-l-blue-500 border-y-border border-y-[2px] border-r-border'
  if (value < 90) return 'border-l-[2px] border-l-blue-500 border-b-[2px] border-b-blue-500 border-r-[2px] border-r-border border-t-[2px] border-t-border'
  return 'border-[2px] border-blue-500'
}
const initials = (name: string) =>
  name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()

const onClick = ()=>{
  projectsStore.selectTask(props.Task)
  projectsStore.showDetial = true
}
</script>
<template>
  <div class="w-full flex justify-between items-center p-4 gap-5 bg-card rounded-3xl border border-border shadow-sm cursor-pointer" @click="onClick">
    <div class="min-w-[20%] max-w-[28%]">
      <div class="flex min-w-0 flex-col gap-3 justify-center ">
        <p class="text-sm text-left whitespace-nowrap text-subtle">Task Name</P>
        <p class="line-clamp-2 break-words" :title="props.Task.title">{{props.Task.title}}</p>
      </div>
    </div>
    <!-- left side properties -->
    <div class="w-[70%] grid grid-cols-6 gap-3 items-center">
      <div class="flex flex-col gap-3 justify-center items-center">
        <p class="text-sm whitespace-nowrap text-subtle">Estimate </P>
        <p class="text-sm font-semibold">{{formatHoursToDuration(props.Task.estimatedTimeHours)}}</p>

      </div>

      <div class="flex flex-col justify-center items-center gap-3">
        <p class="text-sm whitespace-nowrap text-subtle">Spent Time</P>
        <p class="text-sm font-semibold">{{formatHoursToDuration(props.Task.spentTimeHours)}}</p>
      </div>

      <div class="flex flex-col justify-center items-center gap-3">
        <p class="text-sm whitespace-nowrap text-subtle">Assignee</P>
        <Avatar size="sm" class="h-6 w-6 text-[10px]">
          <AvatarFallback>{{ initials(props.Task.assigneeName || "?") }}</AvatarFallback>
        </Avatar>
      </div>

      <div class="flex flex-col justify-center items-center gap-3">
        <p class="text-sm whitespace-nowrap text-subtle">Priority</P>
          <span class="flex gap-1">
            <component class="w-4 h-4" :is="getIcon(props.Task.priority)" :class="getPriorityColor(props.Task.priority)"/>
            <p class="text-sm font-semibold" :class="getPriorityColor(props.Task.priority)">{{props.Task.priority}}</p>
          </span>
      </div>

      <div class="flex flex-col justify-center items-center gap-3">
        <p class="text-sm whitespace-nowrap text-subtle">Status</P>
        <TaskStatusPill :task="props.Task" />
      </div>

      <div class="flex flex-col justify-center items-center gap-3">
        <p class="text-sm whitespace-nowrap text-subtle">progress</P>
        <div class="w-5 h-5 rounded-full" :class="getProgresStatus(props.Task.progress)"></div>
      </div>
    </div>
  </div>
</template>
