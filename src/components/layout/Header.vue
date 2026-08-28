<script setup lang="ts">
import {
  Search,
  Bell,
  Calendar,
  ChevronDown,
  LogOut,
  Settings,
  UserRound,
} from "lucide-vue-next";
import { ref, watch } from "vue";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotificationStore } from "@/stores/notificationStore";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";
import NotificationsPanel from "@/components/layout/NotificationsPanel.vue";

const notificationStore = useNotificationStore();
const authStore = useAuthStore();
const router = useRouter();
const isNotificationsOpen = ref(false);

const emit = defineEmits<{
  (e: "update:search", value: string): void;
  (e: "search", value: string): void;
}>();
const searchQuery = ref("");
watch(searchQuery, (value) => emit("update:search", value));
const emitSearch = () => emit("search", searchQuery.value);

const displayName = authStore.logedInUserInfo?.user?.username || "Abel";
const initials = (name: string) =>
  (name || "?").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

const goToProfile = () => router.push({ name: "admin-dashboard", query: { section: "profile" } });
const goToSettings = () => router.push({ name: "admin-dashboard", query: { section: "settings" } });
const onLogout = () => {
  authStore.logout();
  router.push("/auth/login/");
};
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
              <DropdownMenu>
                <DropdownMenuTrigger as-child >
                  <button type="button" class="rounded-lg ">
                    <span class="flex items-center gap-2 bg-card p-2 rounded-lg shadow-sm">
                      <Avatar size="sm" class="h-6 w-6 text-xs">
                        <AvatarFallback>{{ initials(displayName) }}</AvatarFallback>
                      </Avatar>
                      <span class="text-sm">{{ displayName }}</span>
                      <ChevronDown class="w-4 h-4" />
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="goToProfile">
                    <UserRound class="mr-2 h-4 w-4" /> My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="goToSettings">
                    <Settings class="mr-2 h-4 w-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem class="text-destructive" @click="onLogout">
                    <LogOut class="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
</template>