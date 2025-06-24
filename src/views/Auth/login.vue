<script lang="ts" setup>
import { WorkflowIcon, ArrowRight } from 'lucide-vue-next'
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
import {computed, ref } from 'vue'
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
          <form @submit.pervent="onSubmit" class="w-full flex flex-col justify-center items-center">
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

              <div class="px-6 pb-6">
                <Button class="w-full bg-[#3F8CFF] hover:bg-[#D8E0F0]/90 hover:text-black">
                  Sign In <ArrowRight class="ml-2 w-4 h-4" />
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
