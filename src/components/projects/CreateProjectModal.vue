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
import { useProjectStore } from "@/stores/projectStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useEmployeeStore } from "@/stores/employeeStore";
import type { ProjectVisibility } from "@/types/types";

const open = defineModel<boolean>("open", { required: true });
const { toast } = useToast();

const projectStore = useProjectStore();
const directoryStore = useDirectoryStore();
const employeeStore = useEmployeeStore();

onMounted(() => {
  if (!directoryStore.loaded) directoryStore.fetchAll();
  if (!employeeStore.employees.length) employeeStore.fetchEmployees();
});

// @mention-style assignee picker: typing "@" filters teammates by name;
// picking one adds a removable chip below the input.
const assigneeInput = ref("");
const showMentions = ref(false);
const selectedAssignees = ref<{ id: string; name: string }[]>([]);

const mentionMatches = computed(() => {
  const lastAt = assigneeInput.value.lastIndexOf("@");
  if (lastAt < 0) return [];
  const query = assigneeInput.value.slice(lastAt + 1).toLowerCase();
  return employeeStore.employees
    .filter((e) => !selectedAssignees.value.some((s) => s.id === e.id))
    .filter((e) => e.name.toLowerCase().includes(query))
    .slice(0, 6);
});

const onAssigneeInput = () => {
  const lastAt = assigneeInput.value.lastIndexOf("@");
  showMentions.value = lastAt >= 0 && (lastAt === 0 || assigneeInput.value[lastAt - 1] === " ");
};

const pickAssignee = (person: { id: string; name: string }) => {
  selectedAssignees.value.push({ id: person.id, name: person.name });
  assigneeInput.value = "";
  showMentions.value = false;
};

const removeAssignee = (id: string) => {
  selectedAssignees.value = selectedAssignees.value.filter((p) => p.id !== id);
};

// Delay hiding the dropdown on blur so a click on a suggestion registers first.
const onAssigneeInputBlur = () => {
  setTimeout(() => {
    showMentions.value = false;
  }, 150);
};

// Radix's Select reserves the empty string internally, so "no department"
// uses this sentinel instead and is mapped back to null on save.
const NO_DEPARTMENT = "none";

const emptyForm = () => ({
  title: "",
  description: "",
  departmentId: NO_DEPARTMENT as string,
  visibility: "company" as ProjectVisibility,
  priority: "medium" as "low" | "medium" | "high",
  startDate: "",
  deadline: "",
});

const form = reactive(emptyForm());
const saving = ref(false);
const canSave = computed(() => form.title.trim().length > 0);

// Cover image: either an external link or a local file, applied right after
// the project is created (the create endpoint is JSON-only; file upload
// needs its own multipart request -- see projectStore.uploadProjectImage).
const coverMode = ref<"none" | "link" | "upload">("none");
const coverUrl = ref("");
const coverFile = ref<File | null>(null);
const coverFileInput = ref<HTMLInputElement | null>(null);
const onCoverFileChange = (event: Event) => {
  coverFile.value = (event.target as HTMLInputElement).files?.[0] ?? null;
};
const resetCover = () => {
  coverMode.value = "none";
  coverUrl.value = "";
  coverFile.value = null;
  if (coverFileInput.value) coverFileInput.value.value = "";
};

const save = async () => {
  if (!canSave.value) return;
  saving.value = true;
  try {
    const { project, errors } = await projectStore.createProject({
      title: form.title,
      description: form.description,
      departmentId: form.departmentId === NO_DEPARTMENT ? null : form.departmentId,
      visibility: form.visibility,
      priority: form.priority,
      startDate: form.startDate || null,
      deadline: form.deadline || null,
      collaboratorIds: selectedAssignees.value.map((p) => p.id),
    });
    if (errors) {
      for (const [field, messages] of Object.entries(errors)) {
        toast({ title: `Error in ${field}`, description: messages.join(", "), variant: "destructive" });
      }
      return;
    }
    if (project) {
      if (coverMode.value === "link" && coverUrl.value.trim()) {
        const { error } = await projectStore.setProjectImageLink(project.id, coverUrl.value.trim());
        if (error) toast({ title: "Cover image not set", description: error, variant: "destructive" });
      } else if (coverMode.value === "upload" && coverFile.value) {
        const { error } = await projectStore.uploadProjectImage(project.id, coverFile.value);
        if (error) toast({ title: "Cover image not uploaded", description: error, variant: "destructive" });
      }
    }
    Object.assign(form, emptyForm());
    selectedAssignees.value = [];
    assigneeInput.value = "";
    resetCover();
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
        <DialogTitle>New Project</DialogTitle>
      </DialogHeader>

      <div class="space-y-4">
        <div class="space-y-1.5">
          <Label class="text-xs text-subtle">Title</Label>
          <Input v-model="form.title" placeholder="Project title" class="rounded-xl" />
        </div>

        <div class="space-y-1.5">
          <Label class="text-xs text-subtle">Description</Label>
          <Textarea v-model="form.description" placeholder="What is this project about?" class="rounded-xl" rows="3" />
        </div>

        <div class="space-y-1.5">
          <Label class="text-xs text-subtle">Assignees</Label>
          <div v-if="selectedAssignees.length" class="flex flex-wrap gap-1.5">
            <span
              v-for="person in selectedAssignees"
              :key="person.id"
              class="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
            >
              {{ person.name }}
              <button type="button" class="text-primary/60 hover:text-primary" @click="removeAssignee(person.id)">&times;</button>
            </span>
          </div>
          <div class="relative">
            <Input
              v-model="assigneeInput"
              placeholder="Type @ to mention a teammate"
              class="rounded-xl"
              @input="onAssigneeInput"
              @blur="onAssigneeInputBlur"
            />
            <div
              v-if="showMentions && mentionMatches.length"
              class="absolute z-10 mt-1 w-full rounded-xl border border-border bg-card p-1 shadow-lg"
            >
              <button
                v-for="person in mentionMatches"
                :key="person.id"
                type="button"
                class="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-page"
                @click="pickAssignee(person)"
              >
                <span>{{ person.name }}</span>
                <span class="text-xs text-subtle">{{ person.roleLabel }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="space-y-1.5">
          <Label class="text-xs text-subtle">Cover Image</Label>
          <div class="flex rounded-xl bg-page p-1 text-xs">
            <button
              type="button"
              class="flex-1 rounded-lg py-1.5 font-medium transition"
              :class="coverMode === 'none' ? 'bg-card shadow-sm text-ink' : 'text-subtle'"
              @click="resetCover"
            >
              None
            </button>
            <button
              type="button"
              class="flex-1 rounded-lg py-1.5 font-medium transition"
              :class="coverMode === 'link' ? 'bg-card shadow-sm text-ink' : 'text-subtle'"
              @click="coverMode = 'link'; coverFile = null"
            >
              Image Link
            </button>
            <button
              type="button"
              class="flex-1 rounded-lg py-1.5 font-medium transition"
              :class="coverMode === 'upload' ? 'bg-card shadow-sm text-ink' : 'text-subtle'"
              @click="coverMode = 'upload'; coverUrl = ''"
            >
              Upload File
            </button>
          </div>
          <Input
            v-if="coverMode === 'link'"
            v-model="coverUrl"
            type="url"
            placeholder="https://example.com/cover.jpg"
            class="rounded-xl"
          />
          <input
            v-if="coverMode === 'upload'"
            ref="coverFileInput"
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            class="block w-full rounded-xl border border-border px-2 py-1.5 text-sm text-subtle file:mr-2 file:rounded-lg file:border-0 file:bg-primary/10 file:px-2 file:py-1 file:text-xs file:font-medium file:text-primary"
            @change="onCoverFileChange"
          />
        </div>

        <div class="space-y-1.5">
          <Label class="text-xs text-subtle">Department</Label>
          <Select v-model="form.departmentId">
            <SelectTrigger class="rounded-xl">
              <SelectValue placeholder="No department" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem :value="NO_DEPARTMENT">No department</SelectItem>
                <SelectItem v-for="dept in directoryStore.departments" :key="dept.id" :value="dept.id">
                  {{ dept.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <Label class="text-xs text-subtle">Visibility</Label>
            <Select v-model="form.visibility">
              <SelectTrigger class="rounded-xl">
                <SelectValue placeholder="Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-1.5">
            <Label class="text-xs text-subtle">Priority</Label>
            <Select v-model="form.priority">
              <SelectTrigger class="rounded-xl">
                <SelectValue placeholder="Medium" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <Label class="text-xs text-subtle">Start Date</Label>
            <Input v-model="form.startDate" type="date" class="rounded-xl" />
          </div>
          <div class="space-y-1.5">
            <Label class="text-xs text-subtle">Deadline</Label>
            <Input v-model="form.deadline" type="date" class="rounded-xl" />
          </div>
        </div>

        <div class="flex justify-end pt-1">
          <Button class="rounded-xl" :disabled="!canSave || saving" @click="save">
            {{ saving ? "Creating…" : "Create Project" }}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
