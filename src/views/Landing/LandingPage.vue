<script setup lang="ts">
// Public marketing page, mounted at "/". Deliberately independent of the
// authenticated dashboard tree (no Pinia store fetches, no AppShell) -- it
// has to render correctly for a signed-out visitor with no company/session
// context at all.
import LandingNavbar from "./components/LandingNavbar.vue";
import HeroSection from "./components/HeroSection.vue";
import FeatureHighlights from "./components/FeatureHighlights.vue";
import WorkflowSection from "./components/WorkflowSection.vue";
import ScreenshotsGallery from "./components/ScreenshotsGallery.vue";
import CtaBanner from "./components/CtaBanner.vue";
import LandingFooter from "./components/LandingFooter.vue";
</script>

<template>
  <div class="wr-shell min-h-screen w-full">
    <LandingNavbar />
    <HeroSection />
    <FeatureHighlights />
    <WorkflowSection />
    <ScreenshotsGallery />
    <CtaBanner />
    <LandingFooter />
  </div>
</template>
