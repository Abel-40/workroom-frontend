<script setup lang="ts">
import { watch } from "vue";
import CustomModal from "@/components/customModal.vue";
import { useNotificationStore } from "@/stores/notificationStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const open = defineModel<boolean>("open", { required: true });
const notificationStore = useNotificationStore();

watch(open, (isOpen) => {
  if (isOpen) notificationStore.markAllRead();
});

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const formatTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const diffMs = Date.now() - date.getTime();
  const diffHrs = Math.round(diffMs / (1000 * 60 * 60));
  if (diffHrs >= 0 && diffHrs < 24) return `${diffHrs || 1}h ago`;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
};
</script>

<template>
  <CustomModal :open="open" title="Notifications" @update:open="open = $event">
    <div class="w-[340px] divide-y divide-gray-100">
      <div
        v-for="notif in notificationStore.notifications"
        :key="notif.id"
        class="flex gap-3 px-3 py-3"
        :class="!notif.read ? 'bg-blue-50/50' : ''"
      >
        <Avatar size="sm" class="h-8 w-8 shrink-0 text-xs">
          <AvatarFallback>{{ initials(notif.actor) }}</AvatarFallback>
        </Avatar>
        <div class="min-w-0">
          <p class="text-sm text-ink">
            <span class="font-medium">{{ notif.actor }}</span>
            {{ " " }}{{ notif.message }}
            <span v-if="notif.taskName" class="font-medium">{{ " " }}{{ notif.taskName }}</span>
            <span v-if="notif.taskName"> task</span>
          </p>
          <p class="mt-1 text-xs text-subtle">{{ formatTime(notif.createdAt) }}</p>
        </div>
      </div>
      <p v-if="!notificationStore.notifications.length" class="px-3 py-6 text-center text-sm text-subtle">
        You're all caught up.
      </p>
    </div>
  </CustomModal>
</template>
