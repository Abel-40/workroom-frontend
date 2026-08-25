<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import axiosInstance from "@/plugins/axios";

const props = defineProps<{
  customClass?: string;
  imageSrc?: string;
  profilePictureUrl?: string | null;
  name?: string;
  role?: string;
  department?: string;
}>();

defineEmits<{ (e: "click"): void }>();

const blobUrl = ref<string | null>(null);
let currentObjectUrl: string | null = null;

const revokeImageUrl = () => {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
};

watch(
  () => props.profilePictureUrl,
  async (url) => {
    revokeImageUrl();
    blobUrl.value = null;
    if (!url) return;
    try {
      const { data } = await axiosInstance.get(url, { responseType: "blob" });
      if (props.profilePictureUrl !== url) return;
      currentObjectUrl = URL.createObjectURL(data);
      blobUrl.value = currentObjectUrl;
    } catch {
      blobUrl.value = null;
    }
  },
  { immediate: true }
);

onBeforeUnmount(revokeImageUrl);

const imageSrc = computed(() => props.imageSrc || blobUrl.value);
const initials = computed(() => {
  const words = (props.name || "User").trim().split(/\s+/).filter(Boolean);
  return words.length > 1 ? `${words[0]![0]}${words[words.length - 1]![0]}`.toUpperCase() : words[0]!.slice(0, 2).toUpperCase();
});
</script>

<template>
            <div
              class="group relative max-w-[175px] h-[180px] bg-background flex flex-col justify-center items-center rounded-lg p-3 m-2 border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] hover:border-[#3F8CFF]/30 transition-all duration-300 ease-out"
              :class="customClass"
              role="button"
              tabindex="0"
              @click="$emit('click')"
              @keydown.enter="$emit('click')"
            >
              <span class="pointer-events-none absolute -top-8 -right-8 w-24 h-24 rounded-full bg-[#3F8CFF]/15 blur-2xl transition-all duration-300 group-hover:bg-[#3F8CFF]/30 group-hover:scale-125"></span>
              <div class="relative z-10 w-full rounded-full flex justify-center">
                <img
                  v-if="imageSrc"
                  :src="imageSrc"
                  alt="user_profile"
                  class="rounded-full w-14 h-14 object-cover ring-2 ring-white shadow-[0_0_0_3px_rgba(63,140,255,0.15)] transition-transform duration-300 group-hover:scale-105"
                >
                <span v-else class="flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF2FF] text-sm font-semibold text-[#3F8CFF] ring-2 ring-white shadow-[0_0_0_3px_rgba(63,140,255,0.15)]">
                  {{ initials }}
                </span>
              </div>
              <div class="relative z-10 flex flex-col justify-center items-center gap-1 mt-2">
                <p class="font-semibold text-sm text-[#0A1629] text-center leading-tight">{{ name ?? 'Abel Addis' }}</p>
                <p class="text-xs text-[#91929E]">{{ role ?? 'no profession' }}</p>
                <p class="text-[10px] font-medium tracking-wide uppercase text-[#3F8CFF] bg-[#EAF2FF] rounded-full px-2 py-0.5">{{ department ?? 'junior' }}</p>
              </div>
            </div>
</template>
