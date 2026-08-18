<script setup lang="ts">
interface EventTypes {
  title: string;
  date: string;
  time: string;
  duration: string;
  icon?: string;
  priority?: "up" | "down";
  color?: "purple" | "pink" | "amber" | "blue" | "green";
}
import {
  Clock10,
  ArrowUp,
  ArrowDown,
} from 'lucide-vue-next';
const props = withDefaults(defineProps<EventTypes>(), {
  icon: "📌",
  priority: "up",
  color: "purple",
});

const BORDER_CLASS: Record<string, string> = {
  purple: "border-violet-400",
  pink: "border-pink-400",
  amber: "border-amber-400",
  blue: "border-blue-400",
  green: "border-emerald-400",
};

const priorityClass = props.priority === "up" ? "bg-amber-50 text-amber-500" : "bg-emerald-50 text-emerald-500";
</script>

<template>
      <div class="group relative max-w- 2xl:max-w- bg-background rounded-lg border border-gray-100 shadow-sm h-full p-3 overflow-hidden hover:shadow-lg hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 ease-out">
        <span class="pointer-events-none absolute -top-10 -right-10 w-28 h-28 rounded-full bg-blue-400/15 blur-2xl transition-all duration-300 group-hover:bg-blue-400/25 group-hover:scale-125"></span>
        <div class="relative z-10 border-l-4 rounded-sm" :class="BORDER_CLASS[props.color]">
          <div class="flex justify-between items-start p-3">
            <h3 class="font-medium text-[#0A1629] flex items-center gap-2">
              <span>{{ props.icon }}</span>
              {{ props.title }}
            </h3>
            <div class="w-7 h-7 shrink-0 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110" :class="priorityClass">
              <component :is="props.priority === 'up' ? ArrowUp : ArrowDown" class="w-4 h-4" />
            </div>
          </div>
          <div class="flex justify-between items-center mt-1 p-3">
            <p class="text-sm text-[#91929E]">{{props.date}} <span class="text-gray-300 mx-0.5">|</span> {{props.time}}</p>
            <div class="flex items-center gap-1 bg-[#F4F9FD] px-2 py-1 rounded-full">
              <Clock10 class="w-3 h-3 rounded-sm text-[#3F8CFF]" />
              <span class="text-xs font-medium text-[#3F8CFF]">{{props.duration}}</span>
            </div>
          </div>
        </div>
      </div>
</template>
