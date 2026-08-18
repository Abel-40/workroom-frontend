<script setup lang="ts">
import { ref } from "vue";
import {
  Blocks,
  Building2,
  ChevronLeft,
  CreditCard,
  Lock,
  ShieldCheck,
  User,
} from "lucide-vue-next";
import { RouterLink } from "vue-router";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import Header from "./SubConatiners/Header.vue";
import { useUserProfileStore } from "@/stores/userProfileStore";

const profileStore = useUserProfileStore();
const activeTab = ref<"account" | "notifications" | "company" | "apps" | "payments" | "confidentiality" | "safety">("notifications");

const TABS = [
  { key: "account", label: "Account", icon: User },
  { key: "notifications", label: "Notifications", icon: Blocks },
  { key: "company", label: "My Company", icon: Building2 },
  { key: "apps", label: "Connected Apps", icon: Blocks },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "confidentiality", label: "Confidentiality", icon: Lock },
  { key: "safety", label: "Safety", icon: ShieldCheck },
] as const;
</script>

<template>
  <div class="flex-1 p-4">
    <div class="mb-6">
      <Header />
      <RouterLink :to="{ name: 'admin-dashboard', query: { section: 'profile' } }" class="flex items-center gap-1 text-sm text-primary">
        <ChevronLeft class="h-4 w-4" /> Settings
      </RouterLink>
    </div>

    <div class="flex flex-col gap-4 lg:flex-row">
      <nav class="w-full rounded-2xl border border-gray-100 bg-white p-2 lg:w-56">
        <button
          v-for="tabItem in TABS"
          :key="tabItem.key"
          type="button"
          class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm"
          :class="activeTab === tabItem.key ? 'bg-blue-50 font-medium text-primary' : 'text-ink hover:bg-page/60'"
          @click="activeTab = tabItem.key"
        >
          <component :is="tabItem.icon" class="h-4 w-4" />
          {{ tabItem.label }}
        </button>
      </nav>

      <div class="flex-1 rounded-2xl border border-gray-100 bg-white p-5">
        <template v-if="activeTab === 'notifications'">
          <h3 class="mb-4 text-sm font-semibold text-ink">Notifications</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-ink">Issue Activity</p>
                <p class="text-xs text-subtle">Send me email notifications for issue activity</p>
              </div>
              <Switch v-model:checked="profileStore.notifications.issueActivity" />
            </div>
            <div class="flex items-center justify-between border-t border-gray-100 pt-4">
              <div>
                <p class="text-sm font-medium text-ink">Tracking Activity</p>
                <p class="text-xs text-subtle">Send me notifications when someone's tracked time in tasks</p>
              </div>
              <Switch v-model:checked="profileStore.notifications.trackingActivity" />
            </div>
            <div class="flex items-center justify-between border-t border-gray-100 pt-4">
              <div>
                <p class="text-sm font-medium text-ink">New Comments</p>
                <p class="text-xs text-subtle">Send me notifications when someone's sent the comment</p>
              </div>
              <Switch v-model:checked="profileStore.notifications.newComments" />
            </div>
            <label class="flex items-center gap-2 border-t border-gray-100 pt-4 text-sm text-ink">
              <Checkbox v-model:checked="profileStore.notifications.muteAfter9pm" />
              Don't send me notifications after 9:00 PM
            </label>
          </div>
        </template>

        <template v-else>
          <h3 class="mb-2 text-sm font-semibold capitalize text-ink">{{ activeTab }}</h3>
          <p class="text-sm text-subtle">Nothing to configure here yet.</p>
        </template>
      </div>
    </div>
  </div>
</template>
