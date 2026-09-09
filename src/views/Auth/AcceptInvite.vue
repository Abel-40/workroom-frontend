<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Check, Clock3, ImagePlus, LoaderCircle, LockKeyhole, UserRound } from 'lucide-vue-next'
import logoUrl from '@/assets/logo.png'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const form = ref({ fullName: '', profession: '', phoneNumber: '', address: '', password: '', confirmPassword: '' })
const picture = ref<File | null>(null)
const pictureUrl = ref('')
const submitting = ref(false)
const submitted = ref(false)
const error = ref('')
const triedSubmit = ref(false)
const token = computed(() => typeof route.query.token === 'string' ? route.query.token : '')

const passwordChecks = computed(() => ({
  length: form.value.password.length >= 8,
  upper: /[A-Z]/.test(form.value.password),
  lower: /[a-z]/.test(form.value.password),
  number: /\d/.test(form.value.password),
  special: /[^A-Za-z0-9]/.test(form.value.password),
}))
const passwordValid = computed(() => Object.values(passwordChecks.value).every(Boolean))
const formValid = computed(() => token.value && form.value.fullName.trim().length >= 2 && passwordValid.value && form.value.password === form.value.confirmPassword && picture.value)

function selectPicture(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  if (!['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(file.type)) {
    error.value = 'Choose a PNG, JPEG, GIF, or WEBP image.'
    target.value = ''
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'Profile picture must be 5MB or smaller.'
    target.value = ''
    return
  }
  if (pictureUrl.value) URL.revokeObjectURL(pictureUrl.value)
  picture.value = file
  pictureUrl.value = URL.createObjectURL(file)
  error.value = ''
}

async function submit() {
  triedSubmit.value = true
  error.value = ''
  if (!formValid.value || !picture.value) return
  submitting.value = true
  const payload = new FormData()
  payload.append('token', token.value)
  payload.append('full_name', form.value.fullName.trim())
  payload.append('profession', form.value.profession.trim())
  payload.append('phone_number', form.value.phoneNumber.trim())
  payload.append('address', form.value.address.trim())
  payload.append('password', form.value.password)
  payload.append('profile_picture', picture.value)
  const result = await authStore.acceptInvite(payload)
  submitting.value = false
  if (result.error) {
    error.value = result.error
    return
  }
  submitted.value = true
  window.setTimeout(() => router.replace('/auth/login/'), 1800)
}

onBeforeUnmount(() => { if (pictureUrl.value) URL.revokeObjectURL(pictureUrl.value) })
</script>

<template>
  <main class="min-h-screen bg-surface px-4 py-8 sm:flex sm:items-center sm:justify-center">
    <section class="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl lg:grid-cols-[0.9fr_1.1fr]">
      <aside class="bg-primary p-7 text-white sm:p-10">
        <div class="flex items-center gap-2 font-bold"><span class="grid h-10 w-10 place-items-center rounded-xl bg-white text-primary"><img :src="logoUrl" alt="" class="h-6 w-6 object-contain" /></span>Workroom</div>
        <div class="mt-16 max-w-sm">
          <p class="text-sm font-medium text-white/75">TEAM INVITATION</p>
          <h1 class="mt-3 text-3xl font-bold leading-tight">Finish setting up your workspace profile.</h1>
          <p class="mt-4 text-sm leading-6 text-white/80">Your invitation has been reserved for you. Add the essentials and you’ll be ready to sign in.</p>
          <div class="mt-8 flex items-center gap-3 rounded-xl bg-white/15 p-3 text-sm"><Clock3 class="h-5 w-5 shrink-0" /><span>This invitation link expires 48 hours after it was sent.</span></div>
        </div>
      </aside>

      <div class="p-6 sm:p-10">
        <div v-if="submitted" class="flex min-h-[470px] flex-col items-center justify-center text-center">
          <span class="grid h-14 w-14 place-items-center rounded-full bg-success text-success-foreground"><Check class="h-7 w-7" /></span>
          <h2 class="mt-5 text-2xl font-bold text-ink">You’re all set</h2>
          <p class="mt-2 max-w-sm text-sm text-subtle">Your account and profile have been created. Taking you to sign in…</p>
        </div>
        <form v-else class="mx-auto max-w-lg space-y-5" @submit.prevent="submit">
          <div>
            <p class="text-sm font-medium text-primary">WELCOME TO WORKROOM</p>
            <h2 class="mt-1 text-2xl font-bold text-ink">Accept your invitation</h2>
            <p class="mt-2 text-sm text-subtle">Your profile picture is required. The rest helps your new team get to know you.</p>
          </div>
          <p v-if="!token" class="rounded-lg bg-danger px-3 py-2 text-sm text-danger-foreground">This invitation link is incomplete. Please use the link from your email.</p>
          <p v-if="error" role="alert" class="rounded-lg bg-danger px-3 py-2 text-sm text-danger-foreground">{{ error }}</p>

          <div class="flex items-center gap-4">
            <label for="profile-picture" class="group relative grid h-20 w-20 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full border-2 border-dashed border-primary/50 bg-page focus-within:ring-2 focus-within:ring-ring">
              <img v-if="pictureUrl" :src="pictureUrl" alt="Selected profile picture" class="h-full w-full object-cover" />
              <ImagePlus v-else class="h-6 w-6 text-primary" />
              <input id="profile-picture" class="sr-only" type="file" accept="image/png,image/jpeg,image/gif,image/webp" @change="selectPicture" />
            </label>
            <div><Label for="profile-picture" class="cursor-pointer font-medium text-ink">Profile picture <span class="text-destructive">*</span></Label><p class="mt-1 text-xs text-subtle">PNG, JPEG, GIF, or WEBP. Max 5MB.</p><p v-if="triedSubmit && !picture" class="mt-1 text-xs text-destructive">A profile picture is required.</p></div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-1.5 sm:col-span-2"><Label for="full-name">Full name <span class="text-destructive">*</span></Label><Input id="full-name" v-model="form.fullName" autocomplete="name" placeholder="Your full name" required /><p v-if="triedSubmit && form.fullName.trim().length < 2" class="text-xs text-destructive">Enter your full name.</p></div>
            <div class="space-y-1.5"><Label for="profession">Job title</Label><Input id="profession" v-model="form.profession" autocomplete="organization-title" placeholder="e.g. Product designer" /></div>
            <div class="space-y-1.5"><Label for="phone">Phone number</Label><Input id="phone" v-model="form.phoneNumber" autocomplete="tel" placeholder="+251 …" /></div>
            <div class="space-y-1.5 sm:col-span-2"><Label for="address">Location / address</Label><Input id="address" v-model="form.address" autocomplete="street-address" placeholder="City, country" /></div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-1.5"><Label for="password">Password <span class="text-destructive">*</span></Label><div class="relative"><LockKeyhole class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" /><Input id="password" v-model="form.password" class="pl-9" type="password" autocomplete="new-password" required /></div></div>
            <div class="space-y-1.5"><Label for="confirm-password">Confirm password <span class="text-destructive">*</span></Label><Input id="confirm-password" v-model="form.confirmPassword" type="password" autocomplete="new-password" required /><p v-if="triedSubmit && form.password !== form.confirmPassword" class="text-xs text-destructive">Passwords do not match.</p></div>
          </div>
          <div class="grid grid-cols-2 gap-x-3 gap-y-1 text-xs" :class="triedSubmit && !passwordValid ? 'text-destructive' : 'text-subtle'"><span :class="passwordChecks.length && 'text-success-foreground'">• 8+ characters</span><span :class="passwordChecks.upper && 'text-success-foreground'">• Uppercase letter</span><span :class="passwordChecks.lower && 'text-success-foreground'">• Lowercase letter</span><span :class="passwordChecks.number && 'text-success-foreground'">• Number</span><span :class="passwordChecks.special && 'text-success-foreground'">• Special character</span></div>
          <Button class="w-full" type="submit" :disabled="submitting"><LoaderCircle v-if="submitting" class="h-4 w-4 animate-spin" /><UserRound v-else class="h-4 w-4" />{{ submitting ? 'Creating your account…' : 'Accept invitation' }}</Button>
        </form>
      </div>
    </section>
  </main>
</template>
