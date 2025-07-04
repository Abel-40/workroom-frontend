<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const department = ref('')
const role = ref('')
const loading = ref(false)
const success = ref(false)
const error = ref('')

const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance']
const roles = ['Employee', 'Manager', 'Team Lead', 'Intern']

const sendInvite = async () => {
  error.value = ''
  success.value = false
  if (!email.value || !department.value || !role.value) {
    error.value = 'Please fill in all fields.'
    return
  }
  loading.value = true
  // Simulate API call
  setTimeout(() => {
    loading.value = false
    success.value = true
    email.value = ''
    department.value = ''
    role.value = ''
  }, 1200)
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7fafd] to-[#e9f1ff] p-6">
    <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
      <h2 class="text-2xl font-bold text-blue-600 mb-2">Invite New Employee</h2>
      <p class="text-gray-500 mb-6">Send an invitation to a new team member. They’ll receive an email to join your workspace.</p>
      
      <form @submit.prevent="sendInvite" class="space-y-5">
        <div>
          <label class="block text-gray-700 font-medium mb-1">Employee Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="employee@company.com"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
            required
          />
        </div>
        <div>
          <label class="block text-gray-700 font-medium mb-1">Department</label>
          <select
            v-model="department"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
            required
          >
            <option value="" disabled>Select department</option>
            <option v-for="dep in departments" :key="dep" :value="dep">{{ dep }}</option>
          </select>
        </div>
        <div>
          <label class="block text-gray-700 font-medium mb-1">Role</label>
          <select
            v-model="role"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
            required
          >
            <option value="" disabled>Select role</option>
            <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow transition disabled:opacity-60"
        >
          <span v-if="loading">Sending...</span>
          <span v-else>Send Invitation</span>
        </button>
      </form>

      <div v-if="success" class="mt-4 text-green-600 font-medium text-center">
        Invitation sent successfully!
      </div>
      <div v-if="error" class="mt-4 text-red-500 font-medium text-center">
        {{ error }}
      </div>
    </div>
  </div>
</template>