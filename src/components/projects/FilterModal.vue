<script setup lang="ts">
import filterComposables from "@/composables/filterComposables";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CircleAlert } from "lucide-vue-next";

import DateRangePicker from "@/components/ui/DateRangePicker/DateRangePicker.vue";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
} from "@/components/ui/tags-input";
import Button from "@/components/ui/button/Button.vue";
import {
  ChevronDown,
  ChevronsDown,
  XCircle,
  ClockFading,
  Filter,
} from "lucide-vue-next";
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import CustomModal from "@/components/common/CustomModal.vue";
import { useEmployeeStore } from "@/stores/employeeStore";
import { useToast } from "@/components/ui/toast/use-toast";

const { isOpen, onClose } = filterComposables();
const modelValue = ref(["Abel", "Abel2", "Abel3"]);
const { toast } = useToast();

const employeeStore = useEmployeeStore();
onMounted(() => {
  if (!employeeStore.employees.length) employeeStore.fetchEmployees();
});
// "Assigned By" shows real company members (project creators) rather than
// placeholder names, capped at 5 with a working "View more" toggle -- same
// checkbox+avatar+label layout as before, just real data underneath.
const showAllAssignedBy = ref(false);
const visibleAssignedByOptions = computed(() =>
  showAllAssignedBy.value ? employeeStore.employees : employeeStore.employees.slice(0, 5)
);

interface FilterOptions {
  period?: {
    start: Date | null;
    end: Date | null;
  };
  taskGroups?: string[]; // e.g. ["Design", "Development"]
  assignedBy?: string[]; // e.g. ["Abel", "Danel"]
  assignees?: string[]; // modelValue
  estimate?: string; // duration as string
  priority?: "low" | "medium" | "high" | null;
}
const props = defineProps<{ intialFilters: FilterOptions }>();
const emit = defineEmits<{
  (e: "apply", filters: FilterOptions): void;
}>();
const localFilters = reactive<FilterOptions>({ ...props.intialFilters });
// DateRangePicker needs a concrete end date to render; the app-wide default
// filter intentionally has no end date set (see ProjectsView.vue), so only
// fall back to "today" for this picker's own display, not the applied filter.
const dateRange = ref<{ start: Date | null; end: Date }>({
  start: props.intialFilters.period?.start ?? null,
  end: props.intialFilters.period?.end ?? new Date(),
});
const taskGroups = ref<string[]>([...(props.intialFilters.taskGroups || [])]);
const assignedBy = ref<string[]>([...(props.intialFilters.assignedBy || [])]);
const assignees = ref<string[]>([...(props.intialFilters.assignees || [])]);

// Assignees must be real company members -- free text that doesn't match
// anyone is rejected the moment it's added (TagsInput itself has no
// built-in "only allow known values" mode), and a search dropdown lets you
// find/pick a real name instead of typing blind.
const isRealCompanyMember = (name: string) =>
  employeeStore.employees.some((e) => e.name.toLowerCase() === name.trim().toLowerCase());
const onAssigneesAddTag = async (value: unknown) => {
  const name = String(value);
  if (isRealCompanyMember(name)) return;
  // TagsInputRoot's own v-model sync back to `assignees` hasn't landed yet
  // at the moment this event fires -- wait a tick so the tag actually is in
  // the array before trying to filter it back out.
  await nextTick();
  assignees.value = assignees.value.filter((existing) => existing !== name);
  toast({
    title: "Not a company member",
    description: `"${name}" doesn't match anyone in your company.`,
    variant: "destructive",
  });
};
const assigneeSearchText = ref("");
const showAssigneeSuggestions = ref(false);
const assigneeSuggestions = computed(() => {
  const query = assigneeSearchText.value.trim().toLowerCase();
  if (!query) return [];
  return employeeStore.employees
    .filter((e) => !assignees.value.includes(e.name))
    .filter((e) => e.name.toLowerCase().includes(query))
    .slice(0, 6);
});
const onAssigneeSearchInput = (event: Event) => {
  assigneeSearchText.value = (event.target as HTMLInputElement).value;
  showAssigneeSuggestions.value = true;
};
const tagsInputInputEl = ref<InstanceType<typeof TagsInputInput> | null>(null);
const pickAssigneeSuggestion = (name: string) => {
  if (!assignees.value.includes(name)) assignees.value = [...assignees.value, name];
  assigneeSearchText.value = "";
  showAssigneeSuggestions.value = false;
  const inputEl = (tagsInputInputEl.value as unknown as { $el?: HTMLInputElement })?.$el;
  if (inputEl) inputEl.value = "";
};
// Delay hiding the dropdown on blur so a click on a suggestion registers first.
const onAssigneeSearchBlur = () => {
  setTimeout(() => {
    showAssigneeSuggestions.value = false;
  }, 150);
};

const estimate = ref<string>(props.intialFilters.estimate || "");
const priority = ref<FilterOptions["priority"]>(
  props.intialFilters.priority || null
);

const apply = () => {
  localFilters.period = dateRange.value;
  localFilters.taskGroups = taskGroups.value;
  localFilters.assignedBy = assignedBy.value;
  localFilters.assignees = assignees.value;
  localFilters.estimate = estimate.value;
  localFilters.priority = priority.value;
  emit("apply", localFilters);
  document.body.classList.remove("overflow-hidden");
  onClose();
};
</script>

<template>
  <CustomModal v-model:open="isOpen" :title="'Filter'">
    <div class="h-full">
      <div>
        <div class="w-full border-t-border border-t-[1px] px-3 py-4">
          <Label for="date" class="text-xs font-normal">Period</Label>
          <DateRangePicker v-model="dateRange" class="w-full rounded-xl" />
        </div>

        <!-- Task Group Checkboxes -->
        <div class="border-t-border border-t-[1px] px-3 py-3 space-y-1">
          <p class="text-xs font-normal mb-2">Task Group</p>
          <div class="flex gap-1 items-center">
            <input
              type="checkbox"
              v-model="taskGroups"
              value="Design"
              id="design"
              class="text-primary w-3 h-3"
            />
            <Label for="design" class="text-xs font-normal">Design</Label>
          </div>
          <div class="flex gap-1 items-center">
            <input
              type="checkbox"
              v-model="taskGroups"
              value="Development"
              id="development"
              class="text-primary w-3 h-3"
            />
            <Label for="development" class="text-xs font-normal"
              >Development</Label
            >
          </div>
          <div class="flex gap-1 items-center">
            <input
              type="checkbox"
              v-model="taskGroups"
              value="Testing"
              id="testing"
              class="text-primary w-3 h-3"
            />
            <Label for="testing" class="text-xs font-normal">Testing</Label>
          </div>
          <div class="flex gap-1 items-center">
            <input
              type="checkbox"
              v-model="taskGroups"
              value="Marketing"
              id="marketing"
              class="text-primary w-3 h-3"
            />
            <Label for="marketing" class="text-xs font-normal">Marketing</Label>
          </div>
          <div class="flex gap-1 items-center">
            <input
              type="checkbox"
              v-model="taskGroups"
              value="Project Management"
              id="promangement"
              class="text-primary w-3 h-3"
            />
            <Label for="promangement" class="text-xs font-normal"
              >Project Management</Label
            >
          </div>
        </div>

        <!-- Assigned By Checkboxes -->
        <div class="border-b-border border-y-[1px] px-3 py-2 space-y-1">
          <p class="text-xs font-normal mb-2">Assigned By</p>

          <div
            v-for="person in visibleAssignedByOptions"
            :key="person.id"
            class="flex gap-1 items-center"
          >
            <input
              type="checkbox"
              v-model="assignedBy"
              :value="person.name"
              :id="person.id"
              class="text-primary w-3 h-3"
            />
            <div class="w-5 h-5 rounded-full overflow-hidden">
              <img
                :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=random`"
                :alt="person.name"
                class="w-full h-full object-cover"
              />
            </div>
            <Label :for="person.id" class="text-xs font-normal">{{ person.name }}</Label>
          </div>
          <p v-if="!employeeStore.employees.length" class="text-xs text-subtle">No company members yet.</p>

          <span v-if="employeeStore.employees.length > 5">
            <Button variant="link" class="text-xs p-0" @click="showAllAssignedBy = !showAllAssignedBy">
              {{ showAllAssignedBy ? "View less" : "View more" }} <ChevronDown class="text-primary w-4 h-4" />
            </Button>
          </span>
        </div>

        <div class="border-b-border border-t-[1px] px-3 py-2">
          <p class="text-xs font-normal mb-3">Assignees</p>
          <div class="relative">
            <TagsInput v-model="assignees" class="flex h-auto rounded-xl" @add-tag="onAssigneesAddTag">
              <TagsInputInput
                ref="tagsInputInputEl"
                placeholder="Search a company member..."
                @input="onAssigneeSearchInput"
                @blur="onAssigneeSearchBlur"
              />
              <div class="grid grid-cols-2 gap-2">
                <TagsInputItem
                  v-for="item in assignees"
                  :key="item"
                  :value="item"
                  class=""
                >
                  <TagsInputItemText />
                  <TagsInputItemDelete />
                </TagsInputItem>
              </div>
            </TagsInput>
            <div
              v-if="showAssigneeSuggestions && assigneeSuggestions.length"
              class="absolute z-10 mt-1 w-full rounded-xl border border-border bg-card p-1 shadow-lg"
            >
              <button
                v-for="person in assigneeSuggestions"
                :key="person.id"
                type="button"
                class="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-xs hover:bg-page"
                @click="pickAssigneeSuggestion(person.name)"
              >
                <span>{{ person.name }}</span>
                <span class="text-subtle">{{ person.roleLabel }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="border-b-border border-t-[1px] px-3 py-2">
          <p class="text-xs mb-3">Estimate</p>
          <Input
            type="search"
            placeholder="e.g. 30 days, 6 weeks"
            v-model="estimate"
            class="rounded-xl"
          />
        </div>

        <div class="border-t-border border-t-[1px] px-2 py-2">
          <p class="text-xs mb-3">Priority</p>
          <Select v-model="priority">
            <SelectTrigger class="rounded-xl">
              <SelectValue placeholder="Select a Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Priority</SelectLabel>
                <SelectItem value="high"> High </SelectItem>
                <SelectItem value="medium"> Medium </SelectItem>
                <SelectItem value="low"> Low </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div class="w-full flex justify-evenly items-center py-3">
          <p class="text-xs text-primary flex gap-1">
            <CircleAlert class="text-primary" :size="14" />
            10 matches found!
          </p>
          <Button class="h-6 w-20" @click="apply">Save Filters</Button>
        </div>
      </div>
    </div>
  </CustomModal>
</template>
