<script setup lang="ts">
// Small confirm dialog for abandoning an unsaved generated plan when the
// user tries to change project/assignee context mid-draft.
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-vue-next";

defineProps<{ description?: string }>();

const emit = defineEmits<{
  (e: "discard"): void;
}>();

const open = defineModel<boolean>("open", { required: true });

function discard() {
  open.value = false;
  emit("discard");
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-sm gap-0 rounded-3xl p-0">
      <div class="flex flex-col gap-4 p-6">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-warning text-warning-foreground">
          <AlertTriangle class="h-5 w-5" />
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-base font-semibold text-ink">Discard this draft plan?</span>
          <span class="text-sm text-subtle">
            {{ description || "Changing the project or assignees now will discard the plan you haven't saved yet." }}
          </span>
        </div>
        <div class="flex items-center justify-end gap-3">
          <button type="button" class="rounded-xl border border-border px-4 py-2.5 text-sm text-subtle" @click="open = false">
            Keep editing
          </button>
          <button type="button" class="rounded-xl bg-danger px-4 py-2.5 text-sm font-medium text-danger-foreground" @click="discard">
            Discard and start over
          </button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
