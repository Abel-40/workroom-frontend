<script setup lang="ts">
defineProps<{
  user: {
    name: string
    email: string
    gender: string
    birthday: string
    age: number
    position: string
    level: string
    avatar: string
  }
}>()
</script>

<template>
  <div class="flex flex-col md:flex-row md:items-center justify-between bg-white rounded-2xl shadow p-4 md:p-6">
    <!-- Avatar and Name -->
    <div class="flex justify-around items-center gap-4 flex-1">
      <img :src="user.avatar" alt="avatar" class="w-14 h-14 rounded-full object-cover border-2 border-blue-100" />
      <div>
        <div class="font-semibold text-gray-800 text-lg">{{ user.name }}</div>
        <div class="text-gray-400 text-sm">{{ user.email }}</div>
      </div>

          <!-- Actions -->
    <div class="flex items-center mt-4 md:mt-0">
      <button class="p-2 rounded-full hover:bg-blue-50 transition">
        <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="10" cy="4" r="2"/>
          <circle cx="10" cy="10" r="2"/>
          <circle cx="10" cy="16" r="2"/>
        </svg>
      </button>
    </div>
    </div>
    <!-- Info -->
    <div class="grid grid-cols-6 gap-6  mt-4 md:mt-0 flex-[2]">
      <div >
        <div class="text-xs text-gray-400 ">Gender</div>
        <div class="font-medium text-gray-700">{{ user.gender }}</div>
      </div>
      <div class="hidden lg:block">
        <div class="text-xs text-gray-400 text-center">Birthday</div>
        <div class="font-medium text-gray-700">{{ user.birthday }}</div>
      </div>
      <div>
        <div class="text-xs text-gray-400 text-center">Age</div>
        <div class="font-medium text-gray-700 text-center">{{ user.age }}</div>
      </div>
      <div class="col-span-4 lg:col-span-2">
        <div class="text-xs text-gray-400">Position</div>
        <div class="flex items-center gap-2">
          <span class="font-medium text-gray-700">{{ user.position }}</span>
          <span class="text-[10px] px-1 py-0.5 rounded border-gray-300 border-[1px]  text-blue-600 font-semibold">{{ user.level }}</span>
        </div>
      </div>
    </div>
    <!-- Actions -->
    <div class="hidden lg:flex items-center mt-4 md:mt-0">
      <button class="p-2 rounded-full hover:bg-blue-50 transition">
        <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="10" cy="4" r="2"/>
          <circle cx="10" cy="10" r="2"/>
          <circle cx="10" cy="16" r="2"/>
        </svg>
      </button>
    </div>
  </div>
</template>