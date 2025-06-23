<script setup lang="ts">
</script>

<template>
  <nav class="fixed top-0 left-0 w-full h-14 bg-white shadow-md border-b border-gray-300 flex justify-end items-center px-6 z-50">
    <div class="navLink m-4">
      <router-link to="/" active-class="text-blue-500 font-bold">Home</router-link>
    </div>
    <div class="navLink m-4">
      <router-link to="/auth/signup" active-class="text-blue-500 font-bold">Signup</router-link>
    </div>
    <div class="navLink m-4">
      <router-link to="/auth/login/" active-class="text-blue-500 font-bold">Login</router-link>
    </div>
  </nav>
</template>
