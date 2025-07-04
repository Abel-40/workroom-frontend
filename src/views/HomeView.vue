<script setup lang="ts">
import { ref } from "vue";

const email = ref("");
const department = ref("");
const role = ref("member");

const departments = [
  { label: "Engineering", value: "engineering" },
  { label: "Marketing", value: "marketing" },
  { label: "Sales", value: "sales" },
  { label: "HR", value: "hr" },
];

function inviteUser() {
  // Handle invite logic here
  alert(
    `Invited ${email.value} to ${department.value} as ${role.value === "leader" ? "Department Leader" : "Department Member"}`
  );
}
</script>

<template>
  <div
    class="max-w-md w-full mx-auto bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-3xl shadow-lg p-6 sm:p-8 space-y-6 flex flex-col items-center"
  >
    <!-- Top Illustration -->
    <img
      src="https://undraw.co/api/illustrations/5e4b6e7b-2e7e-4e2e-8e2e-2e7e4e2e8e2e"
      alt="Invite Illustration"
      class="w-24 h-24 object-contain mb-2 mt-2 drop-shadow-md"
      loading="lazy"
    />
    <h2 class="text-2xl font-bold text-gray-800 mb-2 text-center">
      Add New Employee
    </h2>
    <!-- Email -->
    <div class="w-full">
      <label class="block text-gray-700 font-medium mb-1" for="email"
        >Email</label
      >
      <input
        id="email"
        v-model="email"
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
        v-model="department"
        class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white transition shadow-sm hover:border-blue-300"
      >
        <option value="" disabled>Select department</option>
        <option
          v-for="dept in departments"
          :key="dept.value"
          :value="dept.value"
        >
          {{ dept.label }}
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
            value="leader"
            v-model="role"
          />
          <span class="ml-2 text-gray-700">Department Leader</span>
        </label>
        <label class="inline-flex items-center cursor-pointer">
          <input
            type="radio"
            class="form-radio text-blue-600 focus:ring-blue-600"
            value="member"
            v-model="role"
          />
          <span class="ml-2 text-gray-700">Department Member</span>
        </label>
      </div>
    </div>
    <!-- Invite Button -->
    <button
      class="w-full py-2 mt-2 rounded-lg bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none transition disabled:opacity-60 disabled:cursor-not-allowed"
      @click="inviteUser"
      :disabled="!email || !department"
    >
      Invite
    </button>
  </div>
</template>
