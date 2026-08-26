<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { ChevronRight, Clock10, MapPin, MoreVertical } from "lucide-vue-next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDayNumber, formatMonthShort, formatTime } from "@/lib/dates";
import { EVENT_BADGE_CLASS, EVENT_CARD_BG_CLASS, eventColorFor } from "@/lib/eventColor";
import { canManageEvent } from "@/lib/eventPermissions";
import { useAuthStore } from "@/stores/authStore";
import { useEventStore, type EventEntry } from "@/stores/eventStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog.vue";
import { useToast } from "@/components/ui/toast/use-toast";

const props = withDefaults(
  defineProps<{ event: EventEntry; selectable?: boolean; selected?: boolean }>(),
  { selectable: false, selected: false }
);
const emit = defineEmits<{ (e: "toggle-select", id: string): void }>();

const router = useRouter();
const authStore = useAuthStore();
const eventStore = useEventStore();
const { toast } = useToast();

const goToDetail = () =>
  router.push({ name: "admin-dashboard", query: { section: "event-detail", eventId: props.event.id } });

// In bulk-select mode, clicking the card toggles its checkbox instead of
// navigating away -- the whole card acts as the checkbox's hit target.
const onCardClick = () => {
  if (props.selectable) emit("toggle-select", props.event.id);
  else goToDetail();
};

const color = computed(() => eventColorFor(props.event.eventTypeName || props.event.title));
const badgeClass = computed(() => EVENT_BADGE_CLASS[color.value]);
const cardBgClass = computed(() => EVENT_CARD_BG_CLASS[color.value]);
const canManage = computed(() =>
  canManageEvent(
    props.event,
    authStore.logedInUserInfo?.user?.id,
    authStore.logedInUserInfo?.role,
    authStore.logedInUserInfo?.departmentId
  )
);

const initials = (name: string) => (name || "?").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

// Not every event has named attendees -- one can just as validly be scoped
// to a whole department, a team, or the whole company. "No attendees" read
// as broken/incomplete on those; show what the event is actually for instead.
const audienceLabel = computed(() => {
  if (props.event.departmentName) return `${props.event.departmentName} dept.`;
  if (props.event.teamName) return `${props.event.teamName} team`;
  return "Company-wide";
});

const isDeleteDialogOpen = ref(false);
const deleting = ref(false);
const confirmDelete = async () => {
  deleting.value = true;
  const { error } = await eventStore.deleteEvent(props.event.id);
  deleting.value = false;
  isDeleteDialogOpen.value = false;
  if (error) toast({ title: "Event not deleted", description: error, variant: "destructive" });
};
</script>

<template>
  <div
    class="group relative flex h-full min-h-[210px] flex-col gap-3 rounded-2xl border p-4 shadow-sm transition-all duration-300 ease-out cursor-pointer hover:-translate-y-1 hover:shadow-lg"
    :class="[cardBgClass, selected ? 'ring-2 ring-primary' : '']"
    role="button"
    tabindex="0"
    @click="onCardClick"
    @keydown.enter="onCardClick"
  >
    <div class="flex items-start justify-between gap-2">
      <div class="flex min-w-0 items-center gap-3">
        <div class="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl leading-none" :class="badgeClass">
          <span class="text-[10px] font-semibold tracking-wide">{{ formatMonthShort(event.startAt) }}</span>
          <span class="text-base font-bold">{{ formatDayNumber(event.startAt) }}</span>
        </div>
        <div class="min-w-0">
          <h3 class="truncate font-semibold text-[#0A1629]" :title="event.title">{{ event.title }}</h3>
          <span v-if="event.eventTypeName" class="mt-1 inline-block truncate rounded-full px-2 py-0.5 text-[10px] font-medium" :class="badgeClass">
            {{ event.eventTypeName }}
          </span>
        </div>
      </div>
      <Checkbox
        v-if="selectable"
        class="shrink-0 bg-white"
        :model-value="selected"
        :disabled="!canManage"
        :title="canManage ? undefined : 'You do not have permission to delete this event'"
        @click.stop
        @update:model-value="() => emit('toggle-select', event.id)"
      />
      <DropdownMenu v-else>
        <DropdownMenuTrigger as-child>
          <button
            type="button"
            class="shrink-0 rounded-lg p-1 text-subtle hover:bg-page hover:text-ink"
            aria-label="Event options"
            @click.stop
          >
            <MoreVertical class="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem @click="goToDetail">View Details</DropdownMenuItem>
          <DropdownMenuItem v-if="canManage" class="text-red-500" @click="isDeleteDialogOpen = true">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div class="flex flex-col gap-1.5 text-sm text-[#91929E]">
      <div class="flex items-center gap-1.5">
        <Clock10 class="h-3.5 w-3.5 shrink-0" />
        <span>{{ formatTime(event.startAt) }}</span>
      </div>
      <div v-if="event.location" class="flex items-center gap-1.5">
        <MapPin class="h-3.5 w-3.5 shrink-0" />
        <span class="truncate">{{ event.location }}</span>
      </div>
    </div>

    <div class="mt-auto flex items-center justify-between border-t border-black/5 pt-3">
      <div v-if="event.attendees.length" class="flex -space-x-2">
        <Avatar
          v-for="person in event.attendees.slice(0, 3)"
          :key="person.id"
          size="sm"
          class="h-6 w-6 border-2 border-white text-[9px]"
          :title="person.name"
        >
          <AvatarFallback>{{ initials(person.name) }}</AvatarFallback>
        </Avatar>
        <span
          v-if="event.attendees.length > 3"
          class="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-page text-[9px] font-medium text-subtle"
        >
          +{{ event.attendees.length - 3 }}
        </span>
      </div>
      <span v-else class="text-xs text-subtle">{{ audienceLabel }}</span>
      <ChevronRight class="h-4 w-4 shrink-0 text-[#3F8CFF] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
    </div>

    <ConfirmDeleteDialog
      v-model:open="isDeleteDialogOpen"
      title="Delete this event?"
      :description="`This permanently deletes “${event.title}”. This can't be undone.`"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>
