<script setup lang="ts">
import { WorkflowIcon, ArrowRight } from 'lucide-vue-next';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Button from '@/components/ui/button/Button.vue'
import { ref,computed } from 'vue'
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
import { useToast } from '@/components/ui/toast/use-toast';

interface userProfile {
  email:string
  address:string
  phone_number:string,
  department: string ,
  profile_picture: File | null,
  resume: File | null
}

const formData = ref<userProfile>({
  email:'',
  address: '',
  phone_number: '',
  department: '' ,
  profile_picture:null,
  resume: null
})

const message = ref('')
const errorMessage = ref('')

const authStore = useAuthStore()
const router = useRouter()

onMounted(()=>{
  formData.value.email= authStore.step1Form.email
})



onMounted(async()=>{
   await authStore.getDepartments()
})
console.log(formData.value.email)

const handleFileUpload = (field:string,event:any) =>{
  const file = event.target.files[0]
  if(field === 'resume'){
    formData.value.resume = file;
  }else if(field==='profile_picture'){
    formData.value.profile_picture = file;
  }
}
const {toast} = useToast()

const isValidPhoneNumber = computed(() => {
  const regex = /^\+251-\d{9}$/;
  return regex.test(formData.value.phone_number);
  });

const handleSubmit = async ()=>{
  if (!formData.value.profile_picture || !formData.value.resume){
    message.value = 'Both files are required'
  }

  const form = new FormData();
  form.append('email',formData.value.email)
  form.append('address',formData.value.address);
  form.append('phone_number',formData.value.phone_number);
  form.append('department',formData.value.department);
  if (formData.value.profile_picture instanceof File) {
    form.append('profile_picture', formData.value.profile_picture);
  }

  if (formData.value.resume instanceof File) {
    form.append('resume', formData.value.resume);
  }
  const formOjbect:object = Object.fromEntries(form.entries())
  authStore.updateStep2Form({
    ...formOjbect
  })
  const result = await authStore.userProfile(form)
  if (result.errors) {
    errorMessage.value = result.errors
    toast({
      title: 'Error!',
      description: errorMessage.value,
      variant: 'destructive',
    })
  } else {
    router.push('/Auth/login/')
    authStore.restoreData()
  }

}



const steps =  [
        { title: 'Validate Email', description: 'Secure your account' },
        { title: 'Personal Info', description: 'Tell us about yourself' },
        { title: 'Company Info', description: 'Setup your workspace' },
        { title: 'Team Members', description: 'Invite your colleagues' }
      ]


</script>

<template>
  <div class="min-h-screen bg-[#F4F9FD] flex items-center justify-center p-4">
    <div class="w-full max-w-6xl rounded-2xl overflow-hidden shadow-lg">
      <main class="w-full flex flex-col lg:flex-row">
        <!-- Left Container - Blue Panel -->
        <div class="w-full lg:w-1/3 xl:w-1/4 bg-primary text-white p-6 sm:p-8 flex flex-col mr-8 rounded-2xl ">
        <!-- Logo -->
        <div class="flex items-center space-x-3 mb-8">
          <div class="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center">
            <WorkflowIcon class="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <span class="text-xl sm:text-2xl font-bold">Workroom</span>
        </div>

        <!-- Progress Steps -->
        <div class="flex-1 flex flex-col justify-between">
          <div class="space-y-8">
            <h2 class="hidden text-xl font-semibold">Get started</h2>
            
            <!-- Desktop Steps -->
            <div class="hidden lg:block space-y-6">
              <div v-for="(step, index) in steps" :key="index" class="flex items-start space-x-4">
                <div class="flex flex-col items-center">
                  <div class="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center">
                    <span>{{ index + 1 }}</span>
                  </div>
                  <div v-if="index < steps.length - 1" class="w-0.5 h-6 bg-white/50 my-1"></div>
                </div>
                <div>
                  <p class="font-medium">{{ step.title }}</p>
                  <p class="text-sm text-white/80 mt-1">{{ step.description }}</p>
                </div>
              </div>
            </div>
            
            <!-- Mobile Steps - Simple Numbers -->
            <div class="lg:hidden grid grid-cols-4 gap-4">
              <div v-for="(step, index) in steps" :key="index" class="flex flex-col items-center">
                <div class="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center">
                  <span>{{ index + 1 }}</span>
                </div>
                <p class="text-xs mt-1 text-center">{{ step.title }}</p>
              </div>
            </div>
          </div>
          
          <!-- Help Link - Bottom Aligned -->
          <div class="mt-8 text-sm">
            <a href="#" class="flex items-center text-white/80 hover:text-white">
              <span>Need help?</span>
              <ArrowRight class="ml-1 w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

        <!-- Right Container - Form -->
      <div class="w-full lg:w-2/3 xl:w-3/4 px-6 sm:p-8 md:px-12 flex flex-col items-center justify-center bg-white rounded-2xl">
        <div class="w-full max-w-md">
          <!-- Step Indicator -->
          <div class="text-center ">
            <p class="text-sm text-gray-500">STEP 2 OF 4</p>
            <p class="text-gray-500 mt-2">Create your account to get started</p>
          </div>

          <!-- Form -->
          <div class="w-full  flex items-center justify-center px-6 ">
          <Card class="w-full  border-none shadow-none">
            <CardContent class="space-y-5">
              <form @submit.prevent="handleSubmit">
                <!-- Basic Information -->
                <div class="space-y-3">
                  <div class="space-y-1">
                    <Label for="address">Address</Label>
                    <Input 
                      id="address" 
                      v-model="formData.address" 
                      placeholder="Enter your full address" 
                      required
                    />
                  </div>

                  <div class="space-y-1">
                    <Label for="phoneNumber">Phone Number</Label>
                    <Input 
                      id="phoneNumber" 
                      v-model="formData.phone_number" 
                      placeholder="+251-9XXXXXXXX" 
                    />
                    <p v-if="!isValidPhoneNumber && formData.phone_number" class="text-red-500 text-4 md-1">Invalid phone number format</p>
                  </div>
                </div>
                

                <!-- Work Information -->
                <div class="space-y-3 pt-2">
                  <div class="space-y-1">
                    <Label for="department">Department</Label>
                    <select
                      id="department"
                      v-model="formData.department"
                      class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="">Select Department</option>
                      <option 
                        v-for="dept in authStore.departments" 
                        :key="dept.id" 
                        :value="dept.id"
                      >
                        {{ dept.name }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Documents -->
                <div class="space-y-3 pt-2">
                  <div class="space-y-1">
                    <Label for="profile_picture">Profile Picture</Label>
                    <Input
                      id="profile_picture"
                      type="file"
                      accept=".jpg, .jpeg, .png"
                      @change="(e:any) => handleFileUpload('profile_picture',e)"
                      class="cursor-pointer"
                      required
                    />
                  </div>

                  <div class="space-y-1">
                    <Label for="resume">Resume Document</Label>
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf"
                      @change="(e:any) => handleFileUpload('resume', e)"
                      class="cursor-pointer"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" class="w-full mt-2 bg-[#3F8CFF] hover:bg-[#3F8CFF]/90">
                  Complete Profile <ArrowRight class="ml-2 w-4 h-4" />
                </Button>
              </form>
            </CardContent>

            <CardFooter class="justify-center text-sm">
              Already have an account?
              <Button as="a" variant="link" href="/Auth/login/" class="text-[#3F8CFF] p-0 ml-1 h-auto">
                Sign In
              </Button>
            </CardFooter>
          </Card>
        </div>
        </div>
      </div>
      </main>
    </div>
  </div>
</template>