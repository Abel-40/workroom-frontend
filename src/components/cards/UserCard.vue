<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import axiosInstance from "@/plugins/axios";
import WorkloadRing from "@/components/shared/WorkloadRing.vue";

const props = withDefaults(
  defineProps<{
    customClass?: string;
    imageSrc?: string;
    profilePictureUrl?: string | null;
    name?: string;
    role?: string;
    profession?: string | null;
    department?: string;
    /** Active task count, shown as a ring around the avatar. Omit to fall back to the plain static ring. */
    activeTaskCount?: number;
    /** The busiest teammate's active task count -- the ring fills relative to this, not an absolute scale. */
    maxActiveTaskCount?: number;
  }>(),
  { maxActiveTaskCount: 1 }
);

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

// "Not provided" is CompanyUserProfile.profession's unset-default at the
// model level -- treat it the same as no profession rather than showing the
// placeholder string as if it were real data.
const subtitle = computed(() => (props.profession && props.profession !== "Not provided" ? props.profession : props.role));

const ringProgress = computed(() =>
  props.activeTaskCount === undefined ? undefined : Math.min(1, props.activeTaskCount / Math.max(1, props.maxActiveTaskCount))
);
const ringTone = computed(() => {
  if (ringProgress.value === undefined) return "light";
  return ringProgress.value >= 0.75 ? "heavy" : ringProgress.value >= 0.4 ? "medium" : "light";
});
</script>

<template>
  <div
    class="group relative max-w-[185px] h-[180px]  flex flex-col justify-center items-center rounded-lg p-3 m-2 border border-border shadow-sm overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/30 transition-all duration-300 ease-out"
    :class="customClass"
    role="button"
    tabindex="0"
    @click="$emit('click')"
    @keydown.enter="$emit('click')"
  >
              <span class="pointer-events-none absolute -top-8 -right-8 w-24 h-24 rounded-full bg-[#3F8CFF]/15 blur-xl transition-all duration-300 group-hover:bg-[#3F8CFF]/30 group-hover:scale-125"></span>
              <div class="relative z-10 flex w-full justify-center transition-transform duration-300 group-hover:scale-105">
                <WorkloadRing v-if="ringProgress !== undefined" :progress="ringProgress" :image-url="imageSrc" :initials="initials" :tone="ringTone" />
                <template v-else>
                  <img
                    v-if="imageSrc"
                    :src="imageSrc"
                    alt="user_profile"
                    class="rounded-full w-14 h-14 object-cover ring-2 ring-card shadow-[0_0_0_3px_rgba(63,140,255,0.15)]"
                  >
                  <span v-else class="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary ring-2 ring-card shadow-[0_0_0_3px_rgba(63,140,255,0.15)]">
                    {{ initials }}
                  </span>
                </template>
              </div>
              <div class="relative z-10 flex flex-col justify-center items-center gap-1 mt-2">
                <p class="font-semibold text-sm text-ink text-center leading-tight">{{ name ?? 'Abel Addis' }}</p>
                <p class="text-xs text-subtle">{{ subtitle ?? 'no profession' }}</p>
                <p v-if="activeTaskCount !== undefined" class="text-[10px] font-medium tracking-wide text-primary bg-primary-soft rounded-full px-2 py-0.5">
                  {{ activeTaskCount }} active {{ activeTaskCount === 1 ? 'task' : 'tasks' }}
                </p>
                <p v-else-if="department" class="text-[10px] font-medium tracking-wide uppercase text-primary bg-primary-soft rounded-full px-2 py-0.5">{{ department }}</p>
              </div>
  </div>
</template>
