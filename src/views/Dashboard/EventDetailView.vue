<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Building2, Calendar, ChevronLeft, MapPin, Repeat, Trash2, User, Users } from "lucide-vue-next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog.vue";
import { useToast } from "@/components/ui/toast/use-toast";
import Header from "@/components/layout/Header.vue";
import { useAuthStore } from "@/stores/authStore";
import { useEventStore, type EventEntry } from "@/stores/eventStore";
import { formatDateTime } from "@/lib/dates";
import { canManageEvent } from "@/lib/eventPermissions";

const route = useRoute();
const router = useRouter();
const { toast } = useToast();
const authStore = useAuthStore();
const eventStore = useEventStore();

const eventId = computed(() => String(route.query.eventId ?? ""));
const event = ref<EventEntry | null>(null);
const loading = ref(true);

const load = async () => {
  loading.value = true;
  event.value = await eventStore.fetchEvent(eventId.value);
  loading.value = false;
};

onMounted(load);
watch(eventId, (id) => {
  if (id) load();
});

const canManage = computed(() =>
  canManageEvent(
    event.value,
    authStore.logedInUserInfo?.user?.id,
    authStore.logedInUserInfo?.role,
    authStore.logedInUserInfo?.departmentId
  )
);

const initials = (name: string) =>
  (name || "?").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

const recurrenceLabel = computed(() => {
  if (!event.value?.isRecurring) return null;
  const cadence = event.value.recurrenceCadence;
  const days = event.value.recurrenceDays;
  if (cadence === "weekly" && days.length) return `Repeats weekly on ${days.join(", ")}`;
  if (cadence) return `Repeats ${cadence}`;
  return "Repeats";
});

const isDeleteDialogOpen = ref(false);
const deleting = ref(false);
const goBack = () => router.push({ name: "admin-dashboard", query: { section: "events" } });
const confirmDelete = async () => {
  if (!event.value) return;
  deleting.value = true;
  const { error } = await eventStore.deleteEvent(event.value.id);
  deleting.value = false;
  isDeleteDialogOpen.value = false;
  if (error) {
    toast({ title: "Event not deleted", description: error, variant: "destructive" });
    return;
  }
  goBack();
};
</script>

<template>
  <div class="flex-1 p-4">
    <div class="mb-6">
      <Header />
      <button type="button" class="flex items-center gap-1 text-sm text-primary" @click="goBack">
        <ChevronLeft class="h-4 w-4" /> Events
      </button>
    </div>

    <p v-if="loading" class="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-subtle">
      Loading…
    </p>
    <div v-else-if="!event" class="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
      <p class="font-medium text-ink">Event not found</p>
    </div>

    <div v-else class="max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 flex-1">
          <p v-if="event.eventTypeName" class="text-xs font-medium uppercase tracking-wide text-primary">{{ event.eventTypeName }}</p>
          <h1 class="truncate text-xl font-semibold text-ink">{{ event.title }}</h1>
        </div>
        <button
          v-if="canManage"
          type="button"
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-subtle hover:border-red-300 hover:text-red-500"
          title="Delete event"
          @click="isDeleteDialogOpen = true"
        >
          <Trash2 class="h-4 w-4" />
        </button>
      </div>

      <p v-if="event.description" class="mt-3 whitespace-pre-line text-sm text-subtle">{{ event.description }}</p>

      <div class="mt-6 space-y-3 rounded-xl bg-page p-4">
        <div class="flex items-center gap-2 text-sm text-ink">
          <Calendar class="h-4 w-4 shrink-0 text-subtle" />
          <span>{{ formatDateTime(event.startAt) }}<template v-if="event.endAt"> – {{ formatDateTime(event.endAt) }}</template></span>
        </div>
        <div v-if="event.location" class="flex items-center gap-2 text-sm text-ink">
          <MapPin class="h-4 w-4 shrink-0 text-subtle" />
          <span>{{ event.location }}</span>
        </div>
        <div v-if="event.departmentName || event.teamName" class="flex items-center gap-2 text-sm text-ink">
          <Building2 class="h-4 w-4 shrink-0 text-subtle" />
          <span>
            <template v-if="event.departmentName">{{ event.departmentName }}</template>
            <template v-if="event.departmentName && event.teamName"> · </template>
            <template v-if="event.teamName">{{ event.teamName }}</template>
          </span>
        </div>
        <div v-else class="flex items-center gap-2 text-sm text-subtle">
          <Building2 class="h-4 w-4 shrink-0" />
          <span>Company-wide</span>
        </div>
        <div v-if="recurrenceLabel" class="flex items-center gap-2 text-sm text-ink">
          <Repeat class="h-4 w-4 shrink-0 text-subtle" />
          <span>{{ recurrenceLabel }}</span>
        </div>
      </div>

      <div class="mt-6">
        <div class="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink">
          <User class="h-4 w-4" /> Organizer
        </div>
        <p class="text-sm text-subtle">{{ event.organizerName ?? "Unknown" }}</p>
      </div>

      <div class="mt-6">
        <div class="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink">
          <Users class="h-4 w-4" /> Attendees ({{ event.attendees.length }})
        </div>
        <div v-if="event.attendees.length" class="space-y-2">
          <div v-for="person in event.attendees" :key="person.id" class="flex items-center gap-2">
            <Avatar size="sm" class="h-8 w-8 text-xs">
              <AvatarFallback>{{ initials(person.name) }}</AvatarFallback>
            </Avatar>
            <p class="text-sm text-ink">{{ person.name }}</p>
          </div>
        </div>
        <p v-else class="text-sm italic text-subtle">No attendees added</p>
      </div>
    </div>

    <ConfirmDeleteDialog
      v-model:open="isDeleteDialogOpen"
      title="Delete this event?"
      :description="`This permanently deletes “${event?.title}”. This can't be undone.`"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>
