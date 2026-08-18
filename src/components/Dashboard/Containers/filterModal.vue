<script setup lang="ts">
import Modal from "@/components/Modal.vue";
import filterComposables from "@/composables/filterComposables";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import customModal from "@/components/customModal.vue";
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
import { computed, reactive, ref } from "vue";
import CustomModal from "@/components/customModal.vue";

const { isOpen, onClose } = filterComposables();
const modelValue = ref(["Abel", "Abel2", "Abel3"]);

interface FilterOptions {
  period?: {
    start: Date | null;
    end: Date;
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
const dateRange = ref(
  props.intialFilters.period || {
    start: null,
    end: new Date(),
  }
);
const taskGroups = ref<string[]>([...(props.intialFilters.taskGroups || [])]);
const assignedBy = ref<string[]>([...(props.intialFilters.assignedBy || [])]);
const assignees = ref<string[]>([...(props.intialFilters.assignees || [])]);
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
        <div class="w-full border-t-gray-200 border-t-[1px] px-3 py-4">
          <Label for="date" class="text-xs font-normal">Period</Label>
          <DateRangePicker v-model="dateRange" class="w-full rounded-xl" />
        </div>

        <!-- Task Group Checkboxes -->
        <div class="border-t-gray-200 border-t-[1px] px-3 py-3 space-y-1">
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
        <div class="border-b-gray-200 border-y-[1px] px-3 py-2 space-y-1">
          <p class="text-xs font-normal mb-2">Assigned By</p>

          <div class="flex gap-1 items-center">
            <input
              type="checkbox"
              v-model="assignedBy"
              value="John"
              id="John"
              class="text-primary w-3 h-3"
            />
            <div class="w-5 h-5 rounded-full overflow-hidden">
              <img
                src="https://ui-avatars.com/api/?name=John&background=random"
                alt="John"
                class="w-full h-full object-cover"
              />
            </div>
            <Label for="John" class="text-xs font-normal">John</Label>
          </div>

          <div class="flex gap-1">
            <input
              type="checkbox"
              v-model="assignedBy"
              value="Emma"
              id="Emma"
              class="text-primary w-3 h-3"
            />
            <div class="w-5 h-5 rounded-full overflow-hidden">
              <img
                src="https://ui-avatars.com/api/?name=Emma&background=random"
                alt="Emma"
                class="w-full h-full object-cover"
              />
            </div>
            <Label for="Emma" class="text-xs font-normal">Emma</Label>
          </div>

          <div class="flex gap-1">
            <input
              type="checkbox"
              v-model="assignedBy"
              value="Alex"
              id="Alex"
              class="text-primary w-3 h-3"
            />
            <div class="w-5 h-5 rounded-full overflow-hidden">
              <img
                src="https://ui-avatars.com/api/?name=Alex&background=random"
                alt="Alex"
                class="w-full h-full object-cover"
              />
            </div>
            <Label for="Alex" class="text-xs font-normal">Alex</Label>
          </div>

          <div class="flex gap-1">
            <input
              type="checkbox"
              v-model="assignedBy"
              value="Lisa"
              id="Lisa"
              class="text-primary w-3 h-3"
            />
            <div class="w-5 h-5 rounded-full overflow-hidden">
              <img
                src="https://ui-avatars.com/api/?name=Lisa&background=random"
                alt="Lisa"
                class="w-full h-full object-cover"
              />
            </div>
            <Label for="Lisa" class="text-xs font-normal">Lisa</Label>
          </div>

          <div class="flex gap-1">
            <input
              type="checkbox"
              v-model="assignedBy"
              value="Mark"
              id="Mark"
              class="text-primary w-3 h-3"
            />
            <div class="w-5 h-5 rounded-full overflow-hidden">
              <img
                src="https://ui-avatars.com/api/?name=Mark&background=random"
                alt="Mark"
                class="w-full h-full object-cover"
              />
            </div>
            <Label for="Mark" class="text-xs font-normal">Mark</Label>
          </div>

          <span class="">
            <Button variant="link" class="text-xs p-0">
              View more <ChevronDown class="text-primary w-4 h-4" />
            </Button>
          </span>
        </div>

        <div class="border-b-gray-200 border-t-[1px] px-3 py-2">
          <p class="text-xs font-normal mb-3">Assignees</p>
          <TagsInput v-model="assignees" class="flex h-auto rounded-xl">
            <TagsInputInput placeholder="Enter user name..." />
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
        </div>

        <div class="border-b-gray-200 border-t-[1px] px-3 py-2">
          <p class="text-xs mb-3">Estimate</p>
          <Input
            type="search"
            placeholder="Enter duration"
            v-model="estimate"
            class="rounded-xl"
          />
        </div>

        <div class="border-t-gray-200 border-t-[1px] px-2 py-2">
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
