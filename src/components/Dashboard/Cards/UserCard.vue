<script setup lang="ts">
 defineProps<{customClass?:string; imageSrc?:string}>()
</script>

<template>
            <div class="max-w-[175px] h-[180px] bg-background flex flex-col justify-center items-center rounded-lg p-3 m-2" :class="customClass">
              <div class="w-full rounded-full flex justify-center">
                <img :src="imageSrc" alt="user_profile" class="rounded-full w-14 h-14 object-center">
              </div>
              <div class="flex flex-col justify-center items-center">
                <p class="font-semibold text-2 text-[#0A1629]">Abel Addis</p>
                <p class="font-leight">no profession</p>
                <p class="text-2 border-2 border-solid  rounded-sm text-gray-400 w-12 text-sm text-center px-1">junior</p>
              </div>
            </div>
</template>

