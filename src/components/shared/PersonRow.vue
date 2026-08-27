<script setup lang="ts">
import { computed } from "vue";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const props = defineProps<{
  name: string;
  subtitle?: string;
  avatarUrl?: string | null;
  clickable?: boolean;
}>();

defineEmits<{ (e: "click"): void }>();

const initials = computed(() => {
  const words = props.name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  return words.length > 1
    ? `${words[0]![0]}${words[words.length - 1]![0]}`.toUpperCase()
    : words[0]!.slice(0, 2).toUpperCase();
});
</script>

<template>
  <div
    class="flex items-center gap-3 rounded-xl px-2 py-2"
    :class="clickable ? 'cursor-pointer transition hover:bg-white/50' : ''"
    :role="clickable ? 'button' : undefined"
    :tabindex="clickable ? 0 : undefined"
    @click="clickable && $emit('click')"
    @keydown.enter="clickable && $emit('click')"
  >
    <Avatar size="sm" class="h-9 w-9 shrink-0 text-xs">
      <AvatarImage v-if="avatarUrl" :src="avatarUrl" :alt="name" />
      <AvatarFallback class="bg-primary-soft text-primary-strong">{{ initials }}</AvatarFallback>
    </Avatar>
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-semibold text-ink">{{ name }}</p>
      <p v-if="subtitle" class="truncate text-xs text-[#7D8592]">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.trailing" class="flex shrink-0 items-center gap-2">
      <slot name="trailing" />
    </div>
  </div>
</template>
