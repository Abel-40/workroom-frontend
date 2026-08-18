<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { HeadphonesIcon, Laptop } from "lucide-vue-next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const open = defineModel<boolean>("open", { required: true });

const SUBJECTS = ["Technical difficulties", "Billing question", "Feature request", "Other"];

const form = reactive({
  subject: SUBJECTS[0],
  description: "",
});
const sent = ref(false);

watch(open, (isOpen) => {
  if (isOpen) {
    sent.value = false;
    form.subject = SUBJECTS[0];
    form.description = "";
  }
});

const send = () => {
  if (!form.description.trim()) return;
  sent.value = true;
};
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>Need some Help?</DialogTitle>
      </DialogHeader>

      <div v-if="!sent" class="space-y-4">
        <div class="flex items-center justify-center gap-6 rounded-2xl bg-primary/10 py-8">
          <Laptop class="h-10 w-10 text-primary/60" />
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
            <HeadphonesIcon class="h-8 w-8 text-primary" />
          </div>
          <Laptop class="h-10 w-10 text-primary/60" />
        </div>

        <p class="text-sm text-subtle">
          Describe your question and our specialists will answer you within 24 hours.
        </p>

        <div class="space-y-1.5">
          <Label class="text-xs text-subtle">Request Subject</Label>
          <Select v-model="form.subject">
            <SelectTrigger class="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="subject in SUBJECTS" :key="subject" :value="subject">
                  {{ subject }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-1.5">
          <Label class="text-xs text-subtle">Description</Label>
          <Textarea v-model="form.description" placeholder="Add some description of the request" rows="4" class="rounded-xl" />
        </div>

        <div class="flex justify-end">
          <Button class="rounded-xl" @click="send">Send Request</Button>
        </div>
      </div>

      <div v-else class="flex flex-col items-center gap-3 py-8 text-center">
        <div class="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
          <HeadphonesIcon class="h-7 w-7" />
        </div>
        <p class="font-medium text-ink">Request sent!</p>
        <p class="text-sm text-subtle">Our specialists will get back to you within 24 hours.</p>
      </div>
    </DialogContent>
  </Dialog>
</template>
