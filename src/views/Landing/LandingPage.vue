<script setup lang="ts">
// Public marketing page, mounted at "/". Deliberately independent of the
// authenticated dashboard tree (no Pinia store fetches, no AppShell) -- it
// has to render correctly for a signed-out visitor with no company/session
// context at all.
//
// Order is a narrative: what it is (hero) -> why it's needed (problem) ->
// what it feels like (the walkthrough) -> how it holds together (connected)
// -> what makes it different (AI) -> how to begin (CTA).
import LandingNav from "./components/LandingNav.vue";
import HeroSection from "./components/HeroSection.vue";
import ProblemBand from "./components/ProblemBand.vue";
import ProductDeck from "./components/ProductDeck.vue";
import ConnectedSection from "./components/ConnectedSection.vue";
import AiMoment from "./components/AiMoment.vue";
import CtaSection from "./components/CtaSection.vue";
import LandingFooter from "./components/LandingFooter.vue";
</script>

<template>
  <div class="wr-lp min-h-screen w-full">
    <LandingNav />
    <main>
      <HeroSection />
      <ProblemBand />
      <ProductDeck />
      <ConnectedSection />
      <AiMoment />
      <CtaSection />
    </main>
    <LandingFooter />
  </div>
</template>
