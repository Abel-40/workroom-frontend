<script setup lang="ts">
import { ref, watch } from "vue";
import { Plus, UserPlus } from "lucide-vue-next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEmployeeStore } from "@/stores/employeeStore";
import { useToast } from "@/components/ui/toast/use-toast";

const open = defineModel<boolean>("open", { required: true });
const employeeStore = useEmployeeStore();
const { toast } = useToast();

const emails = ref<string[]>([""]);
const sent = ref(false);
const sending = ref(false);

watch(open, (isOpen) => {
  if (isOpen) {
    emails.value = [""];
    sent.value = false;
    sending.value = false;
  }
});

const addAnother = () => emails.value.push("");
const removeAt = (index: number) => emails.value.splice(index, 1);

const approve = async () => {
  sending.value = true;
  try {
    const { sent: invited, errors } = await employeeStore.invite(emails.value);
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
