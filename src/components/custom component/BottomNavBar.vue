<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] rounded-t-2xl z-30 h-20">
    <div class="flex justify-around items-center h-full px-2">
      <!-- Left Nav Items -->
      <button
        v-for="item in leftNavItems"
        :key="item.name"
        @click="setActive(item.name)"
        class="relative flex flex-col items-center justify-center w-full h-full group"
      >
        <!-- Icon Container with Background for Active State -->
        <div
          class="p-2 rounded-full transition-all duration-300"
          :class="{
            'bg-blue-100': activeItem === item.name,
            'group-hover:bg-gray-100': activeItem !== item.name
          }"
        >
          <component
            :is="item.icon"
            :class="[
              'w-5 h-5 transition-all duration-300',
              activeItem === item.name ? 'text-indigo-600' : 'text-gray-500'
            ]"
          />
        </div>
        
        <!-- Label -->
        <span
          class="text-xs mt-1 transition-all duration-300"
          :class="{
            'text-gray-500': activeItem !== item.name,
            'text-indigo-600 font-medium': activeItem === item.name,
          }"
        >
          {{ item.label }}
        </span>
        
        <!-- Active Indicator -->
        <div
          v-if="activeItem === item.name"
          class="absolute top-0 w-12 h-1 bg-blue-400 rounded-b-full"
        ></div>
      </button>
      
      <!-- Center Home Button -->
      <button
        @click="setActive('home')"
        class="relative flex flex-col items-center justify-center w-full h-full group"
      >
        <!-- Icon Container with Background for Active State -->
        <div
          class="p-2 rounded-full transition-all duration-300"
          :class="{
            'bg-blue-100': activeItem === 'home',
            'group-hover:bg-gray-100': activeItem !== 'home'
          }"
        >
          <Home
            :class="[
              'w-5 h-5 transition-all duration-300',
              activeItem === 'home' ? 'text-indigo-600' : 'text-gray-500'
            ]"
          />
        </div>
        
        <!-- Label -->
        <span
          class="text-xs mt-1 transition-all duration-300"
          :class="{
            'text-gray-500': activeItem !== 'home',
            'text-indigo-600 font-medium': activeItem === 'home',
          }"
        >
          Home
        </span>
        
        <!-- Active Indicator -->
        <div
          v-if="activeItem === 'home'"
          class="absolute top-0 w-12 h-1 bg-blue-400 rounded-b-full"
        ></div>
      </button>

      <!-- Right Nav Items -->
      <button
        v-for="item in rightNavItems"
        :key="item.name"
        @click="setActive(item.name)"
        class="relative flex flex-col items-center justify-center w-full h-full group"
      >
        <!-- Icon Container with Background for Active State -->
        <div
          class="p-2 rounded-full transition-all duration-300"
          :class="{
            'bg-blue-100': activeItem === item.name,
            'group-hover:bg-gray-100': activeItem !== item.name
          }"
        >
          <component
            :is="item.icon"
            :class="[
              'w-5 h-5 transition-all duration-300',
              activeItem === item.name ? 'text-indigo-600' : 'text-gray-500'
            ]"
          />
        </div>
        
        <!-- Label -->
        <span
          class="text-xs mt-1 transition-all duration-300"
          :class="{
            'text-gray-500': activeItem !== item.name,
            'text-indigo-600 font-medium': activeItem === item.name,
          }"
        >
          {{ item.label }}
        </span>
        
        <!-- Active Indicator -->
        <div
          v-if="activeItem === item.name"
          class="absolute top-0 w-12 h-1 bg-blue-400 rounded-b-full"
        ></div>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  Home,
  User,
  MessageCircle,
  Bell,
  Activity,
} from 'lucide-vue-next';

interface NavItem {
  name: string;
  label: string;
  icon: any;
}

const leftNavItems: NavItem[] = [
  { name: 'profile', label: 'Profile', icon: User },
  { name: 'chat', label: 'Chat', icon: MessageCircle },
];

const rightNavItems: NavItem[] = [
  { name: 'alerts', label: 'Alerts', icon: Bell },
  { name: 'performance', label: 'Stats', icon: Activity },
];

const activeItem = ref<string>('home');

const setActive = (itemName: string) => {
  activeItem.value = itemName;
  // Here you would also add navigation logic
  // e.g., router.push(`/${itemName}`);
};
</script>