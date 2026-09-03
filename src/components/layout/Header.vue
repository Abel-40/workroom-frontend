<script setup lang="ts">
import {
  Search,
  Bell,
  Calendar,
  Moon,
  Sun,
} from "lucide-vue-next";
import { computed, ref, watch } from "vue";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotificationStore } from "@/stores/notificationStore";
import NotificationsPanel from "@/components/layout/NotificationsPanel.vue";
import { useTheme } from "@/composables/useTheme";

const notificationStore = useNotificationStore();
const isNotificationsOpen = ref(false);

const emit = defineEmits<{
  (e: "update:search", value: string): void;
  (e: "search", value: string): void;
}>();
const searchQuery = ref("");
watch(searchQuery, (value) => emit("update:search", value));
const emitSearch = () => emit("search", searchQuery.value);

// Quick on/off toggle -- the 3-way light/dark/system choice still lives in
// Settings for anyone who wants "system"; this button just flips between the
// two explicit states from wherever the effective theme currently sits.
const { isDark, setTheme } = useTheme();
const toggleTheme = () => setTheme(isDark.value ? "light" : "dark");

const todayLabel = computed(() =>
  new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
);
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
              <span class="hidden items-center gap-2 rounded-xl bg-card px-3.5 h-12 text-sm text-subtle shadow-sm sm:flex">
                <Calendar class="h-4 w-4" />
                {{ todayLabel }}
              </span>

              <Button variant="ghost" size="icon" class="bg-card shadow-sm" :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggleTheme">
                <Moon v-if="!isDark" class="w-5 h-5" />
                <Sun v-else class="w-5 h-5" />
              </Button>

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