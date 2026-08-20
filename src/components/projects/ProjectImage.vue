<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import axiosInstance from "@/plugins/axios";
import type { ProjectCoverImage } from "@/types/types";

const props = defineProps<{
  image?: ProjectCoverImage | null;
  alt?: string;
}>();

// An uploaded cover image is streamed back through an authenticated endpoint
// (there's no public /media/ route for uploads -- see backend settings.py),
// so it can't go straight into <img src>; fetch it as a blob instead and
// hand the browser an object URL. A link-based cover is a plain external
// URL and needs none of this.
const blobUrl = ref<string | null>(null);
let currentObjectUrl: string | null = null;

const revoke = () => {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
};

watch(
  () => props.image,
  async (image) => {
    revoke();
    blobUrl.value = null;
    if (image?.kind !== "upload") return;
    const requestedUrl = image.url;
    try {
      const { data } = await axiosInstance.get(requestedUrl, { responseType: "blob" });
      // The prop may have moved on while this request was in flight.
      if (props.image?.kind !== "upload" || props.image.url !== requestedUrl) return;
      const objectUrl = URL.createObjectURL(data);
      currentObjectUrl = objectUrl;
      blobUrl.value = objectUrl;
    } catch {
      blobUrl.value = null;
    }
  },
  { immediate: true }
);

onBeforeUnmount(revoke);

const src = computed(() => {
  if (!props.image) return null;
  return props.image.kind === "link" ? props.image.url : blobUrl.value;
});
</script>

<template>
  <img v-if="src" :src="src" :alt="alt ?? ''" class="h-full w-full object-cover" />
  <slot v-else name="fallback" />
</template>
