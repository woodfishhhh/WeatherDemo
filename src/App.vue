<template>
  <div
    class="flex flex-col min-h-screen bg-surface text-surface-text font-sans selection:bg-brand-primary selection:text-white relative overflow-hidden">
    <div class="wave-lines pointer-events-none fixed inset-0 z-0 opacity-20">
      <div class="wave-line top-[20%]" ref="line1"></div>
      <div class="wave-line top-[50%]" ref="line2"></div>
      <div class="wave-line top-[80%]" ref="line3"></div>
    </div>

    <SiteNavigation class="z-50 mix-blend-difference" />

    <div class="flex-1 z-10 w-full relative">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in" @enter="onEnter" @leave="onLeave">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </div>
  </div>
</template>

<script setup>
  import { onMounted, onUnmounted, ref } from 'vue';
  import { RouterView } from 'vue-router';
  import SiteNavigation from './components/SiteNavigation.vue';
  import Lenis from 'lenis';
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  gsap.registerPlugin(ScrollTrigger);

  const line1 = ref(null);
  const line2 = ref(null);
  const line3 = ref(null);

  let lenis;

  onMounted(() => {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0, 0);

    // Parallax waves
    gsap.to(line1.value, {
      y: '-200px',
      ease: 'none',
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1
      }
    });
    gsap.to(line2.value, {
      y: '100px',
      ease: 'none',
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5
      }
    });
    gsap.to(line3.value, {
      y: '-150px',
      ease: 'none',
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5
      }
    });
  });

  onUnmounted(() => {
    if (lenis) {
      lenis.destroy();
    }
  });

  // Page transition animations
  const onEnter = (el, done) => {
    gsap.fromTo(el,
      { opacity: 0, y: 30, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power4.out', onComplete: done }
    );
  };

  const onLeave = (el, done) => {
    gsap.to(el, { opacity: 0, y: -20, scale: 0.98, duration: 0.8, ease: 'power3.inOut', onComplete: done });
  };
</script>

<style>

  /* Reset basic router transition as we are doing it via JS/GSAP */
  .page-enter-active,
  .page-leave-active {
    transition: none;
  }

  .page-enter-from,
  .page-leave-to {
    opacity: 0;
  }

  .mix-blend-difference {
    mix-blend-mode: difference;
    color: #fff;
    /* When blending with white background, it becomes black text, blending with black image it becomes white */
  }
</style>
