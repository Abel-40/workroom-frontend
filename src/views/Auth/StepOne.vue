<script setup lang="ts">
import {ArrowRight} from 'lucide-vue-next';
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Button from '@/components/ui/button/Button.vue'
import {ref,computed} from 'vue'
import {useAuthStore} from '@/stores/authStore'
import { useRouter,useRoute } from 'vue-router';
import { useToast } from '@/components/ui/toast/use-toast'
interface userFormType {
  email:string,
  username:string,
  password:string,
}

const userForm = ref({
  email:'',
  username:'',
  password:''

})
const password2 = ref('')
const showErrors = ref(false)
const validate = {
  email: () => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userForm.value.email),
  username: () => userForm.value.username.trim().length >= 3,
  password: () => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/.test(userForm.value.password),
  passwordMatch: () => userForm.value.password === password2.value
}

const passwordChecks = {
  length: (pw: string) => pw.length >= 8,
  upper: (pw: string) => /[A-Z]/.test(pw),
  lower: (pw: string) => /[a-z]/.test(pw),
  number: (pw: string) => /\d/.test(pw),
  special: (pw: string) => /[@$!%*?#&]/.test(pw),
}
const {toast} = useToast()
const authStore = useAuthStore()
const router = useRouter()
const route =  useRoute()
const errorMessage = ref('')

const handleNext = async (e:Event)=>{
  e.preventDefault()
  errorMessage.value = ''
  showErrors.value = true 
  if (validate.email() && validate.username() && validate.password() && validate.passwordMatch()) {
    authStore.updateStep1Form({
    email :userForm.value.email,
    username: userForm.value.username,
    password: userForm.value.password,
    isStep1Complete:true
  })
    const result = await authStore.registerUser(authStore.step1Form)
    if (result.errors) {
      
      errorMessage.value = result.errors
      toast({
      title: 'Error!',
      description: errorMessage.value,
      variant: 'destructive',
    })
    } else {  
        interface userForm {
          email: string
          password: string
        }

        const form = ref<userForm>({
          email: authStore.step1Form.email,
          password: authStore.step1Form.password
        })
        await authStore.loginUser(form.value)
        router.push({
          path:'/auth/',
          query:{section:'step2'}
        })
        showErrors.value = false
    }


}
  console.log(authStore.step1Form.isStep1Complete)
}
</script>

<template>
        <!-- Right Side - Form -->
      <div class="w-full lg:w-2/3 xl:w-3/4 p-6 sm:p-8 md:p-12 flex flex-col items-center justify-center bg-white rounded-2xl">
        <div class="w-full max-w-md">
          <!-- Step Indicator -->
          <div class="text-center mb-8">
            <p class="text-sm text-gray-500">STEP 1 OF 4</p>
            <h1 class="text-2xl font-bold mt-2">Validate your Email</h1>
            <p class="text-gray-500 mt-2">Create your account to get started</p>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleNext" class="space-y-6">
            <div class="space-y-4">
              <div>
                <Label for="email" class="block mb-1">Email</Label>
                <Input id="email" type="email" placeholder="example@gmail.com" required v-model="userForm.email"/>
                <span v-if="showErrors && !validate.email()" class="text-red-500 text-4 md-1">Enter a valid email</span>
              </div>
              
              <div>
                <Label for="username" class="block mb-1">username</Label>
                <Input id="username" type="text" placeholder="Abel12" required v-model="userForm.username"/>
                <span v-if="showErrors && !validate.username()" class="text-red-500 text-4 md-1">Name is required</span>
              </div>
              
              <div>
                <Label for="password" class="block mb-1">Password</Label>
                <Input id="password" type="password" placeholder="**********" required v-model="userForm.password"/>
                <p class="text-xs text-gray-500 mt-1">
                  Minimum 8 characters, with 1 uppercase, 1 lowercase, 1 number, and 1 special character.
                </p>
                <ul v-if="showErrors && !validate.password()" class="text-red-500 text-sm space-y-1 mt-1">
                  <li v-if="!passwordChecks.length(userForm.password)">• At least 8 characters</li>
                  <li v-if="!passwordChecks.upper(userForm.password)">• One uppercase letter</li>
                  <li v-if="!passwordChecks.lower(userForm.password)">• One lowercase letter</li>
                  <li v-if="!passwordChecks.number(userForm.password)">• One number</li>
                  <li v-if="!passwordChecks.special(userForm.password)">• One special character (@$!%*?#&)</li>
                </ul>
              </div>

              
              <div>
                <Label for="password2" class="block mb-1">Confirm Password</Label>
                <Input id="password2" type="password" placeholder="**********" required v-model="password2" />
                <span v-if="showErrors && !validate.passwordMatch()" class="text-red-500 text-4 md-1">password doesn't match</span>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <input type="checkbox" id="terms" required class="w-4 h-4" />
              <Label for="terms" class="text-sm">
                I agree to the <a href="#" class="text-primary hover:underline">Terms of Service</a> and <a href="#" class="text-primary hover:underline">Privacy Policy</a>
              </Label>
            </div>

            <Button type="submit" class="w-full bg-primary hover:bg-[#D8E0F0]/90 hover:text-black">
              Continue <ArrowRight class="ml-2 w-4 h-4" />
            </Button>
          </form>
          <!-- <p v-if="errorMessage" class="text-red-500 text-center text-sm mt-2 px-6">{{ errorMessage }}</p> -->

          <div class="mt-6 text-center text-sm">
            <p class="text-gray-500">
              Already have an account? 
              <a href="/auth/login/" class="text-primary font-medium hover:underline">Sign in</a>
            </p>
          </div>
        </div>
      </div>
</template>