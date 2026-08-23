<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/stores/notificationStore";

const notificationStore = useNotificationStore();
const router = useRouter();

onMounted(() => {
  notificationStore.fetchNotifications({ pageSize: 8 });
  notificationStore.markAllRead();
});

const initials = (title: string) =>
  (title || "?")
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

const viewAll = () => router.push({ name: "admin-dashboard", query: { section: "notifications" } });
</script>

<template>
  <div class="w-[340px]">
    <div class="flex items-center justify-between px-3 py-2">
      <p class="font-semibold text-ink">Notifications</p>
    </div>
    <div class="max-h-[420px] divide-y divide-gray-100 overflow-y-auto">
      <div
        v-for="notif in notificationStore.notifications"
        :key="notif.id"
        class="flex gap-3 px-3 py-3"
        :class="!notif.isRead ? 'bg-blue-50/50' : ''"
      >
        <Avatar size="sm" class="h-8 w-8 shrink-0 text-xs">
          <AvatarFallback>{{ initials(notif.title) }}</AvatarFallback>
        </Avatar>
        <div class="min-w-0">
          <p class="text-sm text-ink">{{ notif.title }}</p>
          <p v-if="notif.message" class="text-xs text-subtle">{{ notif.message }}</p>
          <p class="mt-1 text-xs text-subtle">{{ formatTime(notif.createdAt) }}</p>
        </div>
      </div>
      <p v-if="!notificationStore.loading && !notificationStore.notifications.length" class="px-3 py-6 text-center text-sm text-subtle">
        You're all caught up.
      </p>
    </div>
    <div class="border-t border-gray-100 px-3 py-2">
      <Button variant="link" class="w-full text-sm text-primary" @click="viewAll">View all notifications</Button>
    </div>
  </div>
</template>
