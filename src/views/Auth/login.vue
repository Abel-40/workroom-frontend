<script lang="ts" setup>
import { WorkflowIcon, ArrowRight, FlaskConical } from 'lucide-vue-next'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Button from '@/components/ui/button/Button.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/components/ui/toast/use-toast'

interface userForm {
  email: string
  password: string
}

const form = ref<userForm>({
  email: '',
  password: ''
})

const showErrors = ref(false)
const errorMessage = ref('')
const validate = {
  email: () => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.value.email),
  password: () => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/.test(form.value.password)
}

const authStore = useAuthStore()
const router = useRouter()
const { toast } = useToast()
const onSubmit = async (e: Event) => {
  e.preventDefault()
  showErrors.value = true
  errorMessage.value = ''

  if (validate.email() && validate.password()) {
  const result = await authStore.loginUser(form.value)
  if (result.error) {
    errorMessage.value = result.error
    toast({
      title: 'Error!',
      description: errorMessage.value,
      variant: 'destructive',
    })
  } else{
      router.push({path:'/admin/dashboard/',query:{section:'dashboard'}})
    }
}

}

// ── Demo / Mock login ───────────────────────────────────────────
const isDemoLoading = ref(false)
const loginAsDemoUser = async () => {
  isDemoLoading.value = true
  await new Promise(r => setTimeout(r, 500)) // short UX delay
  authStore.loginAsDummy()
  router.push({ path: '/admin/dashboard/', query: { section: 'dashboard' } })
  isDemoLoading.value = false
}
</script>


<template>
  <div class="w-full min-h-screen bg-[#F4F9FD] flex items-center justify-center p-4">
    <div class="w-full max-w-6xl bg-white rounded-2xl overflow-hidden shadow-lg">
      <main class="w-full flex flex-col lg:flex-row">
        <!-- Left Container -->
        <div class="w-full xl:w-1/2 bg-[#3F8CFF] p-6 sm:p-8 flex flex-col justify-between">
          <!-- Logo - Always visible -->
          <div class="flex items-center space-x-2 mb-4">
            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center">
              <WorkflowIcon class="w-6 h-6 sm:w-8 sm:h-8 text-[#3F8CFF]" />
            </div>
            <span class="text-xl sm:text-2xl text-white font-bold">Workroom</span>
          </div>

          <!-- Only visible on extra large screens -->
          <div class="hidden xl:flex xl:flex-col xl:space-y-6">
            <div class="text-white space-y-2">
              <h1 class="text-3xl font-bold">Your place to work</h1>
              <p class="text-xl">Plan. Create. Control.</p>
            </div>

            <div class="flex flex-wrap gap-2 text-white text-sm sm:text-base font-medium">
              <span>To Do</span><span>|</span>
              <span>In Progress</span><span>|</span>
              <span>In Review</span><span>|</span>
              <span>Done</span>
            </div>

            <!-- Image: only on xl+ -->
            <img
              src="https://plus.unsplash.com/premium_photo-1733306696471-807493ff845b?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y3JtfGVufDB8fDB8fHww"
              alt="Workroom illustration"
              class="w-full h-auto object-cover rounded-lg mt-4"
            />
          </div>
        </div>



        <!-- Right Container -->
        <div class="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
          <form @submit.prevent="onSubmit" class="w-full flex flex-col justify-center items-center">
            <Card class="w-full max-w-md border-none shadow-none">
              <CardHeader class="text-center">
                <CardTitle class="text-xl sm:text-2xl font-bold">Sign In to Workroom</CardTitle>
              </CardHeader>

              <CardContent class="space-y-6">
                <div class="space-y-2">
                  <Label for="email">Email Address</Label>
                  <Input id="email" placeholder="youremail@gmail.com" type="email" v-model="form.email"/>
                  <span v-if="showErrors && !validate.email()" class="text-red-500 text-4 md-1">Enter a valid email</span>
                </div>

                <div class="space-y-2">
                  <Label for="password">Password</Label>
                  <Input id="password" placeholder="**********" type="password" v-model="form.password"/>
                  <span v-if="showErrors && !validate.password()" class="text-red-500 text-4 md-1"> Password must be at least 8 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.</span>


                </div>

                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  <div class="flex items-center space-x-2">
                    <input type="checkbox" id="remember" class="w-4 h-4" />
                    <Label for="remember" class="text-sm">Remember me</Label>
                  </div>

                  <Button variant="link" class="text-sm text-gray-600 h-auto p-0">
                    Forgot Password?
                  </Button>
                </div>
              </CardContent>

              <div class="px-6 pb-4">
                <Button
                  type="submit"
                  class="w-full bg-[#3F8CFF] hover:bg-[#2a74e0] text-white"
                >
                  Sign In <ArrowRight class="ml-2 w-4 h-4" />
                </Button>
              </div>

              <!-- ── Demo Login Banner ───────────────────────── -->
              <div class="mx-6 mb-6 rounded-xl border border-dashed border-blue-300 bg-blue-50 p-4 space-y-3">
                <div class="flex items-center gap-2">
                  <FlaskConical class="w-4 h-4 text-[#3F8CFF]" />
                  <span class="text-sm font-semibold text-[#3F8CFF]">Developer Demo Mode</span>
                </div>
                <p class="text-xs text-gray-500">Use these credentials to sign in, or click the button below for instant access:</p>
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div class="bg-white rounded-lg p-2 border border-blue-100">
                    <span class="block text-gray-400 font-medium mb-0.5">Email</span>
                    <span class="font-mono text-gray-700 select-all">demo@workroom.dev</span>
                  </div>
                  <div class="bg-white rounded-lg p-2 border border-blue-100">
                    <span class="block text-gray-400 font-medium mb-0.5">Password</span>
                    <span class="font-mono text-gray-700 select-all">Demo@1234</span>
                  </div>
                </div>
                <Button
                  type="button"
                  class="w-full bg-[#3F8CFF]/10 hover:bg-[#3F8CFF]/20 text-[#3F8CFF] border border-[#3F8CFF]/30 font-semibold"
                  variant="outline"
                  :disabled="isDemoLoading"
                  @click="loginAsDemoUser"
                >
                  <span v-if="isDemoLoading">Logging in…</span>
                  <span v-else class="flex items-center gap-2">
                    <FlaskConical class="w-4 h-4" />
                    Continue as Demo User
                  </span>
                </Button>
              </div>

              <CardFooter class="justify-center text-sm">
                Don't have an account?
                <Button as="a" variant="link" href="/auth/" class="text-[#3F8CFF] p-0 ml-1 h-auto">
                  Register
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </main>
    </div>
  </div>
</template>
