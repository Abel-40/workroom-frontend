<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import {
  ChevronLeft,
  Monitor,
  Sun,
  Moon,
} from "lucide-vue-next";
import { RouterLink, useRoute } from "vue-router";
import { SETTINGS_TABS, getVisibleSettingsTabs, type SettingsTabKey } from "@/lib/settingsTabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast/use-toast";
import { useAuthStore } from "@/stores/authStore";
import { useUserProfileStore } from "@/stores/userProfileStore";
import { useCompanyConfigStore } from "@/stores/companyConfigStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import { currentTimeZone } from "@/lib/dates";
import { useTheme, type ThemePreference } from "@/composables/useTheme";
import type { AcceptableValue } from "reka-ui";

const authStore = useAuthStore();
const profileStore = useUserProfileStore();
const companyConfigStore = useCompanyConfigStore();
const directoryStore = useDirectoryStore();
const { toast } = useToast();
const route = useRoute();

// Deep-linkable via ?section=settings&tab=<key> (global search routes here) --
// falls back to "notifications" when absent/invalid, same as before.
const initialTab = SETTINGS_TABS.find((t) => t.key === route.query.tab)?.key ?? "notifications";
const activeTab = ref<SettingsTabKey>(initialTab);

watch(
  () => route.query.tab,
  (tab) => {
    const match = SETTINGS_TABS.find((t) => t.key === tab);
    if (match) activeTab.value = match.key;
  }
);

onMounted(() => {
  const userId = authStore.logedInUserInfo?.user?.id;
  if (userId) profileStore.fetchEmailPreference(userId);
});

watch(
  activeTab,
  (tab) => {
    if (
      tab === "company" &&
      !companyConfigStore.departments.length &&
      !companyConfigStore.taskTypes.length &&
      !companyConfigStore.eventTypes.length
    ) {
      companyConfigStore.fetchDefaults();
    }
  },
  { immediate: true }
);

const onToggleEmailNotifications = async (checked: boolean) => {
  const { error } = await profileStore.setEmailNotificationsEnabled(checked);
  if (error) toast({ title: "Preference not saved", description: error, variant: "destructive" });
};

// Full IANA tz database via the native Intl API -- no extra dependency, and
// it's the same source src/lib/dates.ts's currentTimeZone() falls back to
// when a user hasn't picked one yet.
const supportedValuesOf = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf;
const TIMEZONES: string[] = supportedValuesOf ? supportedValuesOf("timeZone") : [currentTimeZone()];

const selectedTimezone = ref(authStore.logedInUserInfo?.user?.timezone || currentTimeZone());
const savingTimezone = ref(false);
const onTimezoneChange = async (tz: AcceptableValue) => {
  if (typeof tz !== "string") return;
  selectedTimezone.value = tz;
  savingTimezone.value = true;
  const { error } = await authStore.updateTimezone(tz);
  savingTimezone.value = false;
  if (error) toast({ title: "Timezone not saved", description: error, variant: "destructive" });
};

const { theme, setTheme } = useTheme();
const savingTheme = ref(false);
const isThemePreference = (value: unknown): value is ThemePreference =>
  value === "light" || value === "dark" || value === "system";
const onThemeChange = async (value: AcceptableValue) => {
  if (!isThemePreference(value)) return;
  setTheme(value); // Applied instantly, regardless of the backend save outcome below.
  savingTheme.value = true;
  const { error } = await authStore.updateTheme(value);
  savingTheme.value = false;
  if (error) toast({ title: "Theme not saved to your account", description: error, variant: "destructive" });
};

const enablingId = ref<string | null>(null);
const enableDepartment = async (id: string) => {
  enablingId.value = id;
  const { error } = await companyConfigStore.enableDepartment(id);
  enablingId.value = null;
  if (error) toast({ title: "Not enabled", description: error, variant: "destructive" });
  else directoryStore.fetchAll();
};
const enableTaskType = async (id: string) => {
  enablingId.value = id;
  const { error } = await companyConfigStore.enableTaskType(id);
  enablingId.value = null;
  if (error) toast({ title: "Not enabled", description: error, variant: "destructive" });
  else directoryStore.fetchAll();
};
const enableEventType = async (id: string) => {
  enablingId.value = id;
  const { error } = await companyConfigStore.enableEventType(id);
  enablingId.value = null;
  if (error) toast({ title: "Not enabled", description: error, variant: "destructive" });
  else directoryStore.fetchAll();
};

const visibleTabs = computed(() => getVisibleSettingsTabs(authStore.logedInUserInfo?.role));
</script>

<template>
  <div class="flex-1 p-4">
    <div class="mb-6">
      <RouterLink :to="{ name: 'admin-dashboard', query: { section: 'profile' } }" class="flex items-center gap-1 text-sm text-primary">
        <ChevronLeft class="h-4 w-4" /> Settings
      </RouterLink>
    </div>

    <div class="flex flex-col gap-4 lg:flex-row">
      <nav class="w-full rounded-2xl border border-border bg-card p-2 lg:w-56">
        <button
          v-for="tabItem in visibleTabs"
          :key="tabItem.key"
          type="button"
          class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm"
          :class="activeTab === tabItem.key ? 'bg-primary/10 font-medium text-primary' : 'text-ink hover:bg-page/60'"
          @click="activeTab = tabItem.key"
        >
          <component :is="tabItem.icon" class="h-4 w-4" />
          {{ tabItem.label }}
        </button>
      </nav>

      <div class="flex-1 rounded-2xl border border-border bg-card p-5">
        <template v-if="activeTab === 'notifications'">
          <h3 class="mb-4 text-sm font-semibold text-ink">Notifications</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-ink">Email me for time-sensitive notifications</p>
                <p class="text-xs text-subtle">
                  Task assignments and AI generation failures always email you. Everything else (task
                  completions, invitations, AI plans ready) follows this preference.
                </p>
              </div>
              <Switch
                :model-value="profileStore.emailNotificationsEnabled"
                :disabled="profileStore.loadingPreference"
                @update:model-value="onToggleEmailNotifications"
              />
            </div>
          </div>
        </template>

        <template v-else-if="activeTab === 'company'">
          <h3 class="mb-1 text-sm font-semibold text-ink">My Company</h3>
          <p class="mb-4 text-xs text-subtle">
            Manage the default departments, task types, and event types available to your company. Enabling a
            default adds it once -- it won't create a duplicate if you've already added it manually or enabled it
            before.
          </p>

          <div class="space-y-6">
            <div>
              <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-subtle">Department Defaults</h4>
              <div v-if="!companyConfigStore.departments.length" class="text-sm text-subtle">
                No default departments available for your sector.
              </div>
              <div v-else class="divide-y divide-gray-50">
                <div v-for="d in companyConfigStore.departments" :key="d.id" class="flex items-center justify-between py-2">
                  <div>
                    <p class="text-sm text-ink">{{ d.name }}</p>
                    <p v-if="d.description" class="text-xs text-subtle">{{ d.description }}</p>
                  </div>
                  <span v-if="d.enabled" class="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
                    Enabled
                  </span>
                  <button
                    v-else
                    type="button"
                    class="rounded-lg bg-primary px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
                    :disabled="enablingId === d.id"
                    @click="enableDepartment(d.id)"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-subtle">Task Type Defaults</h4>
              <div v-if="!companyConfigStore.taskTypes.length" class="text-sm text-subtle">
                No default task types available for your sector.
              </div>
              <div v-else class="divide-y divide-gray-50">
                <div v-for="t in companyConfigStore.taskTypes" :key="t.id" class="flex items-center justify-between py-2">
                  <div>
                    <p class="text-sm text-ink">{{ t.name }}</p>
                    <p v-if="t.description" class="text-xs text-subtle">{{ t.description }}</p>
                  </div>
                  <span v-if="t.enabled" class="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
                    Enabled
                  </span>
                  <button
                    v-else
                    type="button"
                    class="rounded-lg bg-primary px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
                    :disabled="enablingId === t.id"
                    @click="enableTaskType(t.id)"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-subtle">Event Type Defaults</h4>
              <div v-if="!companyConfigStore.eventTypes.length" class="text-sm text-subtle">
                No default event types available.
              </div>
              <div v-else class="divide-y divide-gray-50">
                <div v-for="e in companyConfigStore.eventTypes" :key="e.id" class="flex items-center justify-between py-2">
                  <div>
                    <p class="text-sm text-ink">{{ e.name }}</p>
                    <p v-if="e.description" class="text-xs text-subtle">{{ e.description }}</p>
                  </div>
                  <span v-if="e.enabled" class="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
                    Enabled
                  </span>
                  <button
                    v-else
                    type="button"
                    class="rounded-lg bg-primary px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
                    :disabled="enablingId === e.id"
                    @click="enableEventType(e.id)"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="activeTab === 'account'">
          <h3 class="mb-4 text-sm font-semibold text-ink">Account</h3>
          <div class="space-y-6">
            <div class="space-y-1.5">
              <p class="text-sm font-medium text-ink">Timezone</p>
              <p class="mb-2 text-xs text-subtle">
                Dates and times across Workroom (projects, tasks, activity, notifications) are shown in this timezone.
              </p>
              <Select :model-value="selectedTimezone" :disabled="savingTimezone" @update:model-value="onTimezoneChange">
                <SelectTrigger class="w-full max-w-sm rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem v-for="tz in TIMEZONES" :key="tz" :value="tz">{{ tz }}</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-1.5">
              <p class="text-sm font-medium text-ink">Appearance</p>
              <p class="mb-2 text-xs text-subtle">
                Choose how Workroom looks on this device. "System" follows your OS setting automatically.
              </p>
              <Select :model-value="theme" :disabled="savingTheme" @update:model-value="onThemeChange">
                <SelectTrigger class="w-full max-w-sm rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="light"><Sun class="mr-2 inline h-4 w-4" />Light</SelectItem>
                  <SelectItem value="dark"><Moon class="mr-2 inline h-4 w-4" />Dark</SelectItem>
                  <SelectItem value="system"><Monitor class="mr-2 inline h-4 w-4" />System</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
