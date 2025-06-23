<script setup lang="ts">
import HomeView from './views/HomeView.vue';
import NavBar from './components/NavBar.vue';
import Toaster from '@/components/ui/toast/Toaster.vue'
</script>

<template>
  <!-- <NavBar/>-->
  <Toaster />
  <RouterView/> 
</template>