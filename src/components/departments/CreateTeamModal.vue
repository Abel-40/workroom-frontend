<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast/use-toast";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useEmployeeStore } from "@/stores/employeeStore";

const open = defineModel<boolean>("open", { required: true });
const { toast } = useToast();

const directoryStore = useDirectoryStore();
const employeeStore = useEmployeeStore();

onMounted(() => {
  if (!employeeStore.employees.length) employeeStore.fetchEmployees();
});

// A team pulls members across departments for one project/initiative, so the
// picker deliberately shows each candidate's home department -- that's the
// whole point of a team versus a department.
const memberQuery = ref("");
const showMemberMatches = ref(false);
const selectedMembers = ref<{ id: string; name: string; department: string | null }[]>([]);

const memberMatches = computed(() => {
  const query = memberQuery.value.trim().toLowerCase();
  return employeeStore.employees
    .filter((e) => !selectedMembers.value.some((s) => s.id === e.id))
    .filter((e) => !query || e.name.toLowerCase().includes(query))
    .slice(0, 8);
});

const onMemberFocus = () => {
  showMemberMatches.value = true;
};

const pickMember = (person: { id: string; name: string; department: string | null }) => {
  selectedMembers.value.push({ id: person.id, name: person.name, department: person.department });
  memberQuery.value = "";
};

const removeMember = (id: string) => {
  selectedMembers.value = selectedMembers.value.filter((p) => p.id !== id);
};

// Delay hiding the dropdown on blur so a click on a suggestion registers first.
const onMemberInputBlur = () => {
  setTimeout(() => {
    showMemberMatches.value = false;
  }, 150);
};

// Radix's Select reserves the empty string internally, so "no leader" uses
// this sentinel instead and is mapped back to null on save.
const NO_LEADER = "none";

const emptyForm = () => ({
  name: "",
  description: "",
  leaderId: NO_LEADER as string,
});

const form = reactive(emptyForm());
const saving = ref(false);
const canSave = computed(() => form.name.trim().length > 0);

const save = async () => {
  if (!canSave.value) return;
  saving.value = true;
  try {
    const { errors } = await directoryStore.createTeam({
      name: form.name,
      description: form.description,
      leaderId: form.leaderId === NO_LEADER ? null : form.leaderId,
      memberIds: selectedMembers.value.map((p) => p.id),
    });
    if (errors) {
      for (const [field, messages] of Object.entries(errors)) {
        toast({ title: `Error in ${field}`, description: messages.join(", "), variant: "destructive" });
      }
      return;
    }
    Object.assign(form, emptyForm());
    selectedMembers.value = [];
    memberQuery.value = "";
    open.value = false;
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>New Team</DialogTitle>
      </DialogHeader>

      <div class="space-y-4">
        <div class="space-y-1.5">
          <Label class="text-xs text-subtle">Name</Label>
          <Input v-model="form.name" placeholder="e.g. Q3 Launch Task Force" class="rounded-xl" />
        </div>

        <div class="space-y-1.5">
          <Label class="text-xs text-subtle">Description</Label>
          <Textarea v-model="form.description" placeholder="What is this team for?" class="rounded-xl" rows="3" />
        </div>

        <div class="space-y-1.5">
          <Label class="text-xs text-subtle">Members</Label>
          <div v-if="selectedMembers.length" class="flex flex-wrap gap-1.5">
            <span
              v-for="person in selectedMembers"
              :key="person.id"
              class="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
            >
              {{ person.name }}
              <span v-if="person.department" class="text-primary/60">· {{ person.department }}</span>
              <button type="button" class="text-primary/60 hover:text-primary" @click="removeMember(person.id)">&times;</button>
            </span>
          </div>
          <div class="relative">
            <Input
              v-model="memberQuery"
              placeholder="Search teammates by name…"
              class="rounded-xl"
              @focus="onMemberFocus"
              @blur="onMemberInputBlur"
            />
            <div
              v-if="showMemberMatches && memberMatches.length"
              class="absolute z-10 mt-1 w-full rounded-xl border border-border bg-card p-1 shadow-lg"
            >
              <button
                v-for="person in memberMatches"
                :key="person.id"
                type="button"
                class="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-page"
                @click="pickMember(person)"
              >
                <span>{{ person.name }}</span>
                <span class="text-xs text-subtle">{{ person.department ?? "No department" }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="space-y-1.5">
          <Label class="text-xs text-subtle">Leader</Label>
          <Select v-model="form.leaderId">
            <SelectTrigger class="rounded-xl">
              <SelectValue placeholder="No leader" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem :value="NO_LEADER">No leader</SelectItem>
                <SelectItem v-for="person in employeeStore.employees" :key="person.id" :value="person.id">
                  {{ person.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div class="flex justify-end pt-1">
          <Button class="rounded-xl" :disabled="!canSave || saving" @click="save">
            {{ saving ? "Creating…" : "Create Team" }}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
