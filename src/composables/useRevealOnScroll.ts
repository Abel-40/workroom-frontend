import { onMounted, onUnmounted, type Ref } from "vue";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

// Scroll-reveal for landing-page sections: every element with [data-reveal]
// inside `root` fades/slides in once, staggered in DOM order. Scoped with
// gsap.context() so triggers/tweens are cleaned up on unmount (landing
// sections come and go with the route, unlike the dashboards' persistent
// shell) instead of leaking ScrollTrigger instances tied to removed DOM.
export function useRevealOnScroll(root: Ref<HTMLElement | null>) {
  let ctx: gsap.Context | undefined;

  onMounted(() => {
    if (!root.value) return;
    ctx = gsap.context(() => {
      const targets = gsap.utils.toArray<HTMLElement>("[data-reveal]", root.value!);
      if (!targets.length) return;

      if (prefersReducedMotion()) {
        gsap.set(targets, { opacity: 1, y: 0 });
        return;
      }

      targets.forEach((el, i) => {
        gsap.from(el, {
          opacity: 0,
          y: 36,
          duration: 0.7,
          ease: "power3.out",
          delay: (i % 4) * 0.08,
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        });
      });
    }, root);
  });

  onUnmounted(() => ctx?.revert());
}
