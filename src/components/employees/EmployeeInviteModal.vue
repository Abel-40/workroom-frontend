<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Plus, UserPlus } from "lucide-vue-next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useEmployeeStore, type EmployeeRole } from "@/stores/employeeStore";
import { useAuthStore } from "@/stores/authStore";
import { hasPermission } from "@/lib/permissions";
import { useToast } from "@/components/ui/toast/use-toast";

const open = defineModel<boolean>("open", { required: true });
const employeeStore = useEmployeeStore();
const directoryStore = useDirectoryStore();
const authStore = useAuthStore();
const { toast } = useToast();
const canInviteCm = computed(() => hasPermission(authStore.logedInUserInfo?.role, "members:invite_cm"));

const NO_DEPARTMENT = "__no_department__";
const emails = ref<string[]>([""]);
const departmentId = ref(NO_DEPARTMENT);
const role = ref<Exclude<EmployeeRole, "Owner">>("DM");
const sent = ref(false);
const sending = ref(false);
const departmentRequired = computed(() => role.value === "DL");

watch(open, (isOpen) => {
  if (isOpen) {
    emails.value = [""];
    departmentId.value = NO_DEPARTMENT;
    role.value = "DM";
    sent.value = false;
    sending.value = false;
    if (!directoryStore.loaded) directoryStore.fetchAll();
  }
});

const addAnother = () => emails.value.push("");
const removeAt = (index: number) => emails.value.splice(index, 1);

const approve = async () => {
  if (!emails.value.some((email) => email.trim())) {
    toast({ title: "Add an email address", description: "Enter at least one employee email before sending an invitation.", variant: "destructive" });
    return;
  }
  if (departmentRequired.value && departmentId.value === NO_DEPARTMENT) {
    toast({ title: "Select a department", description: "A Department Leader must be assigned to a department.", variant: "destructive" });
    return;
  }
  sending.value = true;
  try {
    const { sent: invited, errors } = await employeeStore.invite(emails.value, {
      departmentId: departmentId.value === NO_DEPARTMENT ? null : departmentId.value,
      role: role.value,
    });
    for (const [email, message] of Object.entries(errors)) {
      toast({ title: `Couldn't invite ${email}`, description: message, variant: "destructive" });
    }
    if (invited.length) sent.value = true;
  } finally {
    sending.value = false;
  }
};
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>Add Employee</DialogTitle>
      </DialogHeader>

      <div v-if="!sent" class="space-y-4">
        <div class="flex items-center justify-center rounded-2xl bg-primary/10 py-8">
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
            <UserPlus class="h-8 w-8 text-primary" />
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-xs text-subtle">Member's Email</label>
          <div v-for="(_, index) in emails" :key="index" class="flex gap-2">
            <Input v-model="emails[index]" type="email" placeholder="member@email.com" class="rounded-xl" />
            <button
              v-if="emails.length > 1"
              type="button"
              class="shrink-0 px-2 text-subtle hover:text-red-500"
              @click="removeAt(index)"
            >
              &times;
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="invite-department">Department <span v-if="departmentRequired" class="text-destructive">*</span></Label>
            <Select v-model="departmentId">
              <SelectTrigger id="invite-department" class="rounded-xl">
                <SelectValue placeholder="No department" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem :value="NO_DEPARTMENT">No department</SelectItem>
                  <SelectItem v-for="department in directoryStore.departments" :key="department.id" :value="department.id">
                    {{ department.name }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="invite-role">Role</Label>
            <Select v-model="role">
              <SelectTrigger id="invite-role" class="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="DM">Department Member</SelectItem>
                  <SelectItem value="DL">Department Leader</SelectItem>
                  <SelectItem v-if="canInviteCm" value="CM">Company Manager</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <p class="text-xs text-subtle">The selected department and role are applied when the invited employee accepts the invitation.</p>

        <button
          type="button"
          class="flex items-center gap-1 text-sm font-medium text-primary"
          @click="addAnother"
        >
          <Plus class="h-4 w-4" /> Add another Member
        </button>

        <div class="flex justify-end">
          <Button class="rounded-xl" :disabled="sending" @click="approve">
            {{ sending ? "Sending…" : "Approve" }}
          </Button>
        </div>
      </div>

      <div v-else class="flex flex-col items-center gap-3 py-8 text-center">
        <div class="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
          <UserPlus class="h-7 w-7" />
        </div>
        <p class="font-medium text-ink">Invitations sent!</p>
        <p class="text-sm text-subtle">They'll receive an email to join your company.</p>
      </div>
    </DialogContent>
  </Dialog>
</template>
