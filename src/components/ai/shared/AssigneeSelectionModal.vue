<script setup lang="ts">
// Shared assignee-selection modal: members eligible on the already-selected
// project (server-scoped, see projects_and_tasks.services.list_eligible_assignees),
// grouped by department, multi-select. Sort options are limited to what the
// eligible-assignees endpoint actually returns (department/name). Each row's
// "N open tasks" is a real count from that same endpoint (open_task_count,
// scoped to this project -- see api/routers/projects.py::list_eligible_assignees),
// not an invented figure.
import { computed, ref, watch } from "vue";
import { ArrowRight, Pencil, Search, SlidersHorizontal, X } from "lucide-vue-next";
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
  }>(),
  { initialSelectedIds: () => [], stepLabel: "" }
);

const emit = defineEmits<{
  (e: "confirm", memberIds: string[]): void;
  (e: "back"): void;
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
  return props.members.filter((m) => !q || m.name.toLowerCase().includes(q));
});

const groups = computed(() => {
  if (sort.value === "name") {
    return [{ title: "All members", members: [...filteredMembers.value].sort((a, b) => a.name.localeCompare(b.name)) }];
  }
  const byDepartment = new Map<string, EligibleAssignee[]>();
  for (const member of filteredMembers.value) {
    const key = member.department || "No department";
    if (!byDepartment.has(key)) byDepartment.set(key, []);
    byDepartment.get(key)!.push(member);
  }
  return [...byDepartment.entries()].map(([title, members]) => ({ title, members }));
});

const selectedMembers = computed(() => props.members.filter((m) => selectedIds.value.includes(m.id)));

function toggle(id: string) {
  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter((existing) => existing !== id)
    : [...selectedIds.value, id];
}
function selectAllInGroup(members: EligibleAssignee[]) {
  const ids = members.map((m) => m.id);
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
    <DialogContent hide-close class="max-w-[620px] gap-0 rounded-3xl p-0">
      <div class="flex flex-col gap-4 p-6 pb-5">
        <div class="flex items-start justify-between gap-3">
          <div class="flex flex-col gap-1">
            <span v-if="stepLabel" class="text-[10.5px] font-semibold uppercase tracking-wide text-subtle">{{ stepLabel }}</span>
            <span class="text-xl font-bold tracking-tight text-ink">Assign tasks to</span>
            <span class="flex items-center gap-2 text-sm text-subtle">
              Members eligible on
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-lg bg-info px-2.5 py-1 text-xs font-medium text-info-foreground"
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
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-page text-subtle transition hover:bg-gray-200 hover:text-ink"
            @click="open = false"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <div class="flex items-center gap-2.5">
          <div class="flex flex-1 items-center gap-2 rounded-xl bg-surface px-3.5 py-2.5 text-subtle">
            <Search class="h-4 w-4 shrink-0" />
            <input
              v-model="query"
              type="text"
              placeholder="Search members"
              class="w-full bg-transparent text-sm text-ink placeholder:text-subtle focus:outline-none"
            />
          </div>
          <Select v-model="sort">
            <SelectTrigger class="w-[200px] gap-2 rounded-xl text-sm">
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

        <div class="flex max-h-[390px] flex-col gap-3.5 overflow-y-auto pr-1">
          <p v-if="!filteredMembers.length" class="py-8 text-center text-sm text-subtle">No members found.</p>
          <div v-for="group in groups" :key="group.title" class="flex flex-col gap-2">
            <div class="flex items-center gap-2.5 px-0.5">
              <span class="text-[10.5px] font-semibold uppercase tracking-wide text-subtle">
                {{ group.title }} · {{ group.members.length }} eligible
              </span>
              <div class="h-px flex-1 bg-gray-100" />
              <button type="button" class="text-[11.5px] font-medium text-primary" @click="selectAllInGroup(group.members)">
                Select all
              </button>
            </div>
            <button
              v-for="member in group.members"
              :key="member.id"
              type="button"
              class="flex items-center gap-3.5 rounded-2xl border p-3 text-left transition"
              :class="selectedIds.includes(member.id) ? 'border-primary bg-info/40' : 'border-transparent bg-surface hover:border-gray-200'"
              @click="toggle(member.id)"
            >
              <Checkbox :model-value="selectedIds.includes(member.id)" @update:model-value="toggle(member.id)" @click.stop />
              <AiAvatar :name="member.name" :seed="member.id" size="md" />
              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-medium text-ink">{{ member.name }}</span>
                <span class="block truncate text-xs text-subtle">{{ member.roleLabel || "Member" }} · Assignable</span>
              </span>
              <span class="shrink-0 text-xs text-subtle">{{ member.openTaskCount }} open task{{ member.openTaskCount === 1 ? "" : "s" }}</span>
            </button>
          </div>
        </div>

        <div class="flex items-center gap-3 pt-1">
          <AvatarStack v-if="selectedMembers.length" :people="selectedMembers" />
          <span class="text-xs text-subtle">{{ selectedMembers.length }} assignee{{ selectedMembers.length === 1 ? "" : "s" }} selected</span>
          <div class="flex-1" />
          <button type="button" class="rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-subtle" @click="back">
            Back
          </button>
          <button
            type="button"
            class="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(63,140,255,0.3)]"
            @click="confirm"
          >
            Confirm assignees
            <ArrowRight class="h-4 w-4" />
          </button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
