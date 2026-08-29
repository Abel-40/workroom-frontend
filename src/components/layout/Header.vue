<script setup lang="ts">
import {
  Search,
  Bell,
  Calendar,
} from "lucide-vue-next";
import { ref, watch } from "vue";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotificationStore } from "@/stores/notificationStore";
import NotificationsPanel from "@/components/layout/NotificationsPanel.vue";

const notificationStore = useNotificationStore();
const isNotificationsOpen = ref(false);

const emit = defineEmits<{
  (e: "update:search", value: string): void;
  (e: "search", value: string): void;
}>();
const searchQuery = ref("");
watch(searchQuery, (value) => emit("update:search", value));
const emitSearch = () => emit("search", searchQuery.value);
</script>

<template>
          <!-- Header -->
          <div
            class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
          >
            <!-- Search Bar -->
            <div class="relative w-full md:w-1/2 max-w-md">
              <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
              <Input
                id="search"
                v-model="searchQuery"
                type="text"
                placeholder="Search..."
                class="pl-10 bg-card h-12 shadow-sm"
                @keyup.enter="emitSearch"
              />
            </div>

            <!-- User Controls -->
            <div class="flex items-center gap-3">
              <Popover v-model:open="isNotificationsOpen">
                <PopoverTrigger as-child>
                  <Button variant="ghost" size="icon" class="relative bg-card shadow-sm">
                    <Bell class="w-6 h-6" />
                    <span
                      v-if="notificationStore.unreadCount"
                      class="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white"
                    >
                      {{ notificationStore.unreadCount }}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-auto p-0" align="end">
                  <NotificationsPanel />
                </PopoverContent>
              </Popover>
            </div>
          </div>
</template>