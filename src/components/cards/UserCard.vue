<script setup lang="ts">
 defineProps<{customClass?:string; imageSrc?:string; name?:string; role?:string; department?:string}>()
</script>

<template>
            <div
              class="group relative max-w-[175px] h-[180px] bg-background flex flex-col justify-center items-center rounded-lg p-3 m-2 border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] hover:border-[#3F8CFF]/30 transition-all duration-300 ease-out"
              :class="customClass"
            >
              <span class="pointer-events-none absolute -top-8 -right-8 w-24 h-24 rounded-full bg-[#3F8CFF]/15 blur-2xl transition-all duration-300 group-hover:bg-[#3F8CFF]/30 group-hover:scale-125"></span>
              <div class="relative z-10 w-full rounded-full flex justify-center">
                <img
                  :src="imageSrc"
                  alt="user_profile"
                  class="rounded-full w-14 h-14 object-cover ring-2 ring-white shadow-[0_0_0_3px_rgba(63,140,255,0.15)] transition-transform duration-300 group-hover:scale-105"
                >
              </div>
              <div class="relative z-10 flex flex-col justify-center items-center gap-1 mt-2">
                <p class="font-semibold text-sm text-[#0A1629] text-center leading-tight">{{ name ?? 'Abel Addis' }}</p>
                <p class="text-xs text-[#91929E]">{{ role ?? 'no profession' }}</p>
                <p class="text-[10px] font-medium tracking-wide uppercase text-[#3F8CFF] bg-[#EAF2FF] rounded-full px-2 py-0.5">{{ department ?? 'junior' }}</p>
              </div>
            </div>
</template>

