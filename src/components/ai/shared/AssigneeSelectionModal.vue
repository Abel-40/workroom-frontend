<script setup lang="ts">
// Shared assignee-selection modal: members eligible on the already-selected
// project (server-scoped, see projects_and_tasks.services.list_eligible_assignees),
// grouped by department and available for multi-select.
import { computed, ref, watch } from "vue";
import { ArrowRight, LoaderCircle, Pencil, Search, SlidersHorizontal, X } from "lucide-vue-next";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import AiAvatar from "@/components/ai/AiAvatar.vue";
import AvatarStack from "@/components/ai/shared/AvatarStack.vue";
import type { EligibleAssignee } from "@/stores/aiStore";

type SortKey = "department" | "name";

const props = withDefaults(
  defineProps<{
    projectName: string;
    members: EligibleAssignee[];
    initialSelectedIds?: string[];
    stepLabel?: string;
    loading?: boolean;
    loadError?: string | null;
  }>(),
  { initialSelectedIds: () => [], stepLabel: "", loading: false, loadError: null }
);

const emit = defineEmits<{
  (e: "confirm", memberIds: string[]): void;
  (e: "back"): void;
  (e: "retry"): void;
}>();

const open = defineModel<boolean>("open", { required: true });

const query = ref("");
const sort = ref<SortKey>("department");
const selectedIds = ref<string[]>([]);

watch(open, (isOpen) => {
  if (isOpen) {
    selectedIds.value = [...props.initialSelectedIds];
    query.value = "";
  }
});

const filteredMembers = computed(() => {
  const q = query.value.trim().toLowerCase();
  return props.members.filter((member) => {
    const searchText = [member.name, member.email, member.roleLabel, member.department]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return !q || searchText.includes(q);
  });
});

const groups = computed(() => {
  if (sort.value === "name") {
    return [{ title: "All members", members: [...filteredMembers.value].sort((a, b) => a.name.localeCompare(b.name)) }];
  }

  const byDepartment = new Map<string, EligibleAssignee[]>();
  for (const member of filteredMembers.value) {
    const department = member.department || "No department";
    if (!byDepartment.has(department)) byDepartment.set(department, []);
    byDepartment.get(department)!.push(member);
  }

  return [...byDepartment.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([title, members]) => ({ title, members: [...members].sort((a, b) => a.name.localeCompare(b.name)) }));
});

const selectedMembers = computed(() => props.members.filter((member) => selectedIds.value.includes(member.id)));

function toggle(id: string) {
  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter((existing) => existing !== id)
    : [...selectedIds.value, id];
}

function selectAllInGroup(members: EligibleAssignee[]) {
  const ids = members.map((member) => member.id);
  const allSelected = ids.every((id) => selectedIds.value.includes(id));
  selectedIds.value = allSelected
    ? selectedIds.value.filter((id) => !ids.includes(id))
    : [...new Set([...selectedIds.value, ...ids])];
}

function confirm() {
  emit("confirm", selectedIds.value);
  open.value = false;
}

function back() {
  open.value = false;
  emit("back");
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      hide-close
      class="flex h-[660px] max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-[680px] flex-col gap-0 overflow-hidden rounded-[24px] border-0 bg-card p-0 shadow-2xl"
    >
      <div class="flex shrink-0 flex-col gap-5 px-7 pb-5 pt-6">
        <div class="flex items-start justify-between gap-3">
          <div class="flex flex-col gap-1">
            <span v-if="stepLabel" class="text-[10px] font-semibold uppercase tracking-[0.12em] text-subtle">{{ stepLabel }}</span>
            <span class="text-[22px] font-bold leading-7 tracking-[-0.02em] text-ink">Assign tasks to</span>
            <span class="flex items-center gap-2 text-sm leading-5 text-subtle">
              Members eligible on
              <button
                type="button"
                class="inline-flex h-7 items-center gap-1.5 rounded-lg bg-info px-2.5 text-xs font-medium text-info-foreground"
                @click="back"
              >
                {{ projectName }}
                <Pencil class="h-3 w-3" />
              </button>
            </span>
          </div>
          <button
            type="button"
            title="Close"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-page text-subtle transition hover:bg-page hover:text-ink"
            @click="open = false"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex h-12 flex-1 items-center gap-2.5 rounded-xl bg-surface px-4 text-subtle">
            <Search class="h-4 w-4 shrink-0" />
            <input
              v-model="query"
              type="text"
              placeholder="Search members"
              class="w-full bg-transparent text-sm text-ink placeholder:text-subtle focus:outline-none"
            />
          </div>
          <Select v-model="sort">
            <SelectTrigger class="h-12 w-[198px] gap-2 rounded-xl border-border bg-card px-4 text-sm shadow-none">
              <SlidersHorizontal class="h-3.5 w-3.5 text-subtle" />
              <span class="text-subtle">Sort</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="department">Department</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto px-7 pb-2">
        <div v-if="loading" class="flex h-full min-h-48 flex-col items-center justify-center gap-3 text-sm text-subtle">
          <LoaderCircle class="h-5 w-5 animate-spin text-primary" />
          Loading eligible members...
        </div>
        <div v-else-if="loadError" class="flex h-full min-h-48 flex-col items-center justify-center gap-3 px-8 text-center">
          <p class="text-sm text-subtle">{{ loadError }}</p>
          <button type="button" class="rounded-lg bg-page px-3 py-2 text-sm font-medium text-primary transition hover:bg-info" @click="emit('retry')">
            Try again
          </button>
        </div>
        <p v-else-if="!filteredMembers.length" class="py-12 text-center text-sm text-subtle">No eligible members found.</p>
        <div v-else class="flex flex-col gap-3.5">
          <div v-for="group in groups" :key="group.title" class="flex flex-col gap-2">
            <div class="flex items-center gap-2.5 px-0.5">
              <span class="max-w-24 text-[10px] font-semibold uppercase leading-3 tracking-[0.08em] text-subtle">
                {{ group.title }} &middot; {{ group.members.length }} eligible
              </span>
              <div class="h-px flex-1 bg-border" />
              <button type="button" class="shrink-0 text-[11px] font-medium text-primary" @click="selectAllInGroup(group.members)">
                Select all
              </button>
            </div>
            <button
              v-for="member in group.members"
              :key="member.id"
              type="button"
              class="flex min-h-[62px] items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              :class="selectedIds.includes(member.id) ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/40'"
              @click="toggle(member.id)"
            >
              <Checkbox
                class="h-5 w-5 rounded-md border-border shadow-none"
                :model-value="selectedIds.includes(member.id)"
                @update:model-value="toggle(member.id)"
                @click.stop
              />
              <AiAvatar :name="member.name" :seed="member.id" size="md" tone="soft" />
              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-semibold leading-5 text-ink">{{ member.name }}</span>
                <span class="block truncate text-xs leading-4 text-subtle">{{ member.roleLabel || "Member" }} &middot; Assignable</span>
              </span>
              <span class="w-14 shrink-0 text-xs leading-4 text-subtle">
                {{ member.openTaskCount }} open<br />task{{ member.openTaskCount === 1 ? "" : "s" }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div class="flex shrink-0 items-center gap-3 bg-card px-7 pb-5 pt-4 shadow-[0_-10px_20px_rgba(31,41,55,0.04)]">
        <AvatarStack v-if="selectedMembers.length" :people="selectedMembers" />
        <span class="text-sm leading-4 text-subtle">
          {{ selectedMembers.length }} assignee{{ selectedMembers.length === 1 ? "" : "s" }}<br />selected
        </span>
        <div class="flex-1" />
        <button type="button" class="h-12 rounded-xl border border-border px-5 text-sm text-subtle transition hover:bg-page" @click="back">
          Back
        </button>
        <button
          type="button"
          class="flex h-12 items-center gap-12 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_rgba(63,140,255,0.3)]"
          @click="confirm"
        >
          <span>Confirm<br />assignees</span>
          <ArrowRight class="h-4 w-4" />
        </button>
      </div>
    </DialogContent>
  </Dialog>
</template>
