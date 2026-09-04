<script setup lang="ts">
// Google-Docs-shaped sharing: a folder is private to whoever created it, and
// access is granted to named individuals one at a time. Sharing, revoking,
// and deleting are all creator-only on the backend (pages/services.py), so
// this modal offers those controls only when `isOwner` says the caller is
// the creator -- and a non-owner still gets to see who else has access, and
// to remove themselves.
import { computed, ref, watch } from "vue";
import { Loader2, Plus, Trash2 } from "lucide-vue-next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEmployeeStore } from "@/stores/employeeStore";
import { usePagesStore } from "@/stores/pagesStore";
import { useToast } from "@/components/ui/toast/use-toast";

const props = defineProps<{ folderId: string | null }>();
const open = defineModel<boolean>("open", { required: true });
const employeeStore = useEmployeeStore();
const pagesStore = usePagesStore();
const { toast } = useToast();

const selected = ref<string[]>([""]);
const sharing = ref(false);
const loadingShares = ref(false);
const revoking = ref<string | null>(null);

const folder = computed(() => pagesStore.folders.find((f) => f.id === props.folderId) ?? null);
const isOwner = computed(() => folder.value?.isOwner ?? false);
const shares = computed(() => (props.folderId ? pagesStore.sharesFor(props.folderId) : []));

// Somebody who already has access shouldn't be offerable again -- re-sharing
// is a no-op on the backend, so showing them is just a dead end.
const shareableEmployees = computed(() => {
  const alreadyShared = new Set(shares.value.map((s) => s.userId));
  return employeeStore.employees.filter((e) => !alreadyShared.has(e.id));
});

watch(
  open,
  async (isOpen) => {
    if (!isOpen || !props.folderId) return;
    selected.value = [""];
    loadingShares.value = true;
    const { error } = await pagesStore.fetchFolderShares(props.folderId);
    loadingShares.value = false;
    if (error) toast({ title: "Couldn't load access", description: error, variant: "destructive" });
  },
  { immediate: true },
);

const addAnother = () => selected.value.push("");

const share = async () => {
  const emails = selected.value.filter(Boolean);
  if (!emails.length || !props.folderId) return;
  const userIds = emails
    .map((email) => employeeStore.employees.find((e) => e.email === email)?.id)
    .filter((id): id is string => !!id);
  if (!userIds.length) return;
  sharing.value = true;
  const { error } = await pagesStore.shareFolder(props.folderId, userIds);
  sharing.value = false;
  if (error) {
    toast({ title: "Couldn't share the folder", description: error, variant: "destructive" });
    return;
  }
  selected.value = [""];
  toast({ title: "Folder shared", description: "They'll be notified that they now have access." });
};

const revoke = async (userId: string) => {
  if (!props.folderId) return;
  revoking.value = userId;
  const { error } = await pagesStore.revokeFolderShare(props.folderId, userId);
  revoking.value = null;
  if (error) {
    toast({ title: "Couldn't remove access", description: error, variant: "destructive" });
    return;
  }
  toast({ title: "Access removed" });
};
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>{{ isOwner ? "Share the folder" : "Who has access" }}</DialogTitle>
      </DialogHeader>

      <div class="space-y-5">
        <p class="text-xs text-subtle">
          This folder and its pages are private. Only the people listed below can open them.
        </p>

        <div v-if="isOwner" class="space-y-3">
          <label class="text-xs text-subtle">Add a member</label>
          <Select v-for="(_, index) in selected" :key="index" v-model="selected[index]">
            <SelectTrigger class="rounded-xl">
              <SelectValue placeholder="member@email.com" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="emp in shareableEmployees" :key="emp.id" :value="emp.email">
                  {{ emp.name }} — {{ emp.email }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <button
            type="button"
            class="flex items-center gap-1 text-sm font-medium text-primary"
            @click="addAnother"
          >
            <Plus class="h-4 w-4" /> Add another member
          </button>

          <div class="flex justify-end">
            <Button class="rounded-xl" :disabled="sharing" @click="share">
              <Loader2 v-if="sharing" class="mr-2 h-4 w-4 animate-spin" />
              {{ sharing ? "Sharing…" : "Share" }}
            </Button>
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium uppercase tracking-wide text-subtle">People with access</p>

          <div v-if="loadingShares" class="flex items-center gap-2 py-2 text-sm text-muted-foreground">
            <Loader2 class="h-4 w-4 animate-spin" /> Loading…
          </div>

          <p v-else-if="!shares.length" class="py-2 text-sm text-muted-foreground">
            Only you. Nobody else can see this folder.
          </p>

          <ul v-else class="space-y-1">
            <li
              v-for="person in shares"
              :key="person.userId"
              class="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-accent"
            >
              <span class="min-w-0">
                <span class="block truncate text-sm text-ink">{{ person.name }}</span>
                <span class="block truncate text-xs text-subtle">{{ person.email }}</span>
              </span>
              <!-- The backend also lets a shared collaborator remove
                   themselves; the owner can remove anyone. -->
              <Button
                v-if="isOwner"
                variant="ghost"
                size="icon"
                class="h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:text-destructive"
                :disabled="revoking === person.userId"
                :aria-label="`Remove ${person.name}'s access`"
                @click="revoke(person.userId)"
              >
                <Loader2 v-if="revoking === person.userId" class="h-4 w-4 animate-spin" />
                <Trash2 v-else class="h-4 w-4" />
              </Button>
            </li>
          </ul>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
