<script setup lang="ts">
import userModal from '@/components/userModal.vue';
import userModalComposables from '@/composables/userModalComposables';
import {ref,onMounted} from "vue"
import { useAuthStore } from '@/stores/authStore';
import {useDepartmentStore} from "@/stores/departmentStore"
import type { Departments } from '@/types/types';
import { useToast } from '@/components/ui/toast';
import { useAttrs } from 'vue';
const { isOpen, onClose } = userModalComposables();

const email = ref("");
const department = ref("");
const role = ref("member");
interface invitationForm {
  email:string;
  department:number;
  role:string
}

const invitationForm = ref<invitationForm>({
  email:'',
  department:0,
  role:''
})
const deptStore = useDepartmentStore()
const authStore = useAuthStore()

const departments = ref<Departments | null>(null)
const errorMessage = ref<string[]>([])
const {toast} = useToast()

onMounted(async () => {
  const result = await deptStore.get_company_departments()
  console.log(result.company_departments)
  if (result.company_departments) {
    departments.value = result.company_departments
  } else if (result.errors) {
    const errorData = result.errors

    errorMessage.value = []

    if (typeof errorData === 'string') {
      errorMessage.value.push(errorData)
      toast({
        title: 'Error!',
        description: errorData,
        variant: 'destructive',
      })
    } else {
      Object.entries(errorData).forEach(([field, messages]) => {
        messages.forEach((msg) => {
          errorMessage.value.push(`Error in ${field}: ${msg}`)
          toast({
            title: `Error in ${field}`,
            description: msg,
            variant: 'destructive',
          })
        })
      })
    }
  }
})


function checkDepartment(): string | null {
  if (!departments.value || departments.value.length === 0) {
    // Search for department-related error
    const deptError = errorMessage.value.find((err) =>
      err.toLowerCase().includes('department')
    )
    return deptError || 'No departments available.'
  }
  return null
}

function inviteUser() {
  // Handle invite logic here
  alert(
    `Invited ${email.value} to ${department.value} as ${role.value === "leader" ? "Department Leader" : "Department Member"}`
  );
}
const validateEmail =  () => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(invitationForm.value.email)
const Submit = async ()=>{
  if(validateEmail() && invitationForm.value.department && invitationForm.value.role){
    const result = await  authStore.inviteNewEmployee(invitationForm.value)
    if(result.errors){
      toast({
        title: 'Error!',
        description: "Employee Invitation Failed.",
        variant: 'destructive',
      })
    }else{
      toast({
        title: 'Successfull!',
        description: "Employee Invited Successfully!!!",
        variant: 'default',
      })
      onClose()
    }
  }
}

</script>


<template>
  <userModal v-model:open="isOpen" :title="'Add New Staff'">
    <div class="max-w-md w-full h-full mx-auto bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-3xl shadow-lg p-6 sm:p-8 space-y-6 flex flex-col items-center" >
          <!-- Top Illustration -->
          <img
            src="https://undraw.co/illustration/invite_ds8f.png"
            alt="Invite Illustration"
            class="w-24 h-24 object-contain mb-2 mt-2 drop-shadow-md"
            loading="lazy"
          />

          <!-- Email -->
          <div class="w-full">
            <label class="block text-gray-700 font-medium mb-1" for="email"
              >Email</label
            >
            <input
              id="email"
              v-model="invitationForm.email"
              type="email"
              placeholder="user@example.com"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition shadow-sm hover:border-blue-300"
            />
          </div>
          <!-- Department -->
          <div class="w-full">
            <label class="block text-gray-700 font-medium mb-1" for="department"
              >Department</label
            >
            <select
              id="department"
              v-model="invitationForm.department"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white transition shadow-sm hover:border-blue-300"
            >
              <option value="" disabled>Select department</option>
              <option
                v-for="dept in departments"
                :key="dept.id"
                :value="dept.id"
              >
                {{ dept.name }}
              </option>
            </select>
          </div>
          <!-- Role -->
          <div class="w-full">
            <label class="block text-gray-700 font-medium mb-1">Role</label>
            <div class="flex flex-col sm:flex-row gap-3 sm:gap-6 mt-2">
              <label class="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  class="form-radio text-blue-600 focus:ring-blue-600"
                  value="DL"
                  v-model="invitationForm.role"
                />
                <span class="ml-2 text-gray-700">Department Leader</span>
              </label>
              <label class="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  class="form-radio text-blue-600 focus:ring-blue-600"
                  value="DM"
                  v-model="invitationForm.role"
                />
                <span class="ml-2 text-gray-700">Department Member</span>
              </label>
            </div>
          </div>
          <!-- Invite Button -->
          <button
            class="w-full py-2 mt-2 rounded-lg bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none transition disabled:opacity-60 disabled:cursor-not-allowed"
            @click="Submit()"
            :disabled="!invitationForm.email || !invitationForm.department || !invitationForm.role"
          >
            Invite
          </button>
      </div>
  </userModal>

</template>