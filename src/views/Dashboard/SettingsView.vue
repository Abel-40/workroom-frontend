<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
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
import Header from "@/components/layout/Header.vue";
import { useAuthStore } from "@/stores/authStore";
import { useUserProfileStore } from "@/stores/userProfileStore";
import { useCompanyConfigStore } from "@/stores/companyConfigStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import { currentTimeZone } from "@/lib/dates";

const authStore = useAuthStore();
const profileStore = useUserProfileStore();
const companyConfigStore = useCompanyConfigStore();
const directoryStore = useDirectoryStore();
const { toast } = useToast();
const activeTab = ref<"account" | "notifications" | "company" | "apps" | "payments" | "confidentiality" | "safety">("notifications");

onMounted(() => {
  const userId = authStore.logedInUserInfo?.user?.id;
  if (userId) profileStore.fetchEmailPreference(userId);
});

watch(
  activeTab,
  (tab) => {
    if (tab === "company" && !companyConfigStore.departments.length && !companyConfigStore.taskTypes.length) {
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
const onTimezoneChange = async (tz: string) => {
  selectedTimezone.value = tz;
  savingTimezone.value = true;
  const { error } = await authStore.updateTimezone(tz);
  savingTimezone.value = false;
  if (error) toast({ title: "Timezone not saved", description: error, variant: "destructive" });
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
            Manage the default departments and task types available to your company. Enabling a default adds it
            once -- it won't create a duplicate if you've already added it manually or enabled it before.
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
          </div>
        </template>

        <template v-else-if="activeTab === 'account'">
          <h3 class="mb-4 text-sm font-semibold text-ink">Account</h3>
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
        </template>

        <template v-else>
          <h3 class="mb-2 text-sm font-semibold capitalize text-ink">{{ activeTab }}</h3>
          <p class="text-sm text-subtle">Nothing to configure here yet.</p>
        </template>
      </div>
    </div>
  </div>
</template>
