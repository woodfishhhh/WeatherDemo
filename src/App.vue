<template>
  <div
    class="app-shell flex flex-col min-h-screen bg-surface text-surface-text font-sans selection:bg-brand-primary selection:text-brand-text relative overflow-hidden">
    <div class="app-shell__glow app-shell__glow--top pointer-events-none absolute inset-x-0 top-0 z-0 h-[34rem]"></div>
    <div class="app-shell__glow app-shell__glow--bottom pointer-events-none absolute inset-x-0 bottom-[-12rem] z-0 h-[28rem]"></div>
    <div class="wave-lines pointer-events-none fixed inset-0 z-0 opacity-30">
      <div class="wave-line top-[20%]" ref="line1"></div>
      <div class="wave-line top-[50%]" ref="line2"></div>
      <div class="wave-line top-[80%]" ref="line3"></div>
    </div>

    <Transition name="theme-ripple">
      <div
        v-if="rippleState.visible"
        class="theme-ripple pointer-events-none fixed inset-0 z-[70]"
        :style="rippleStyle"
      >
        <span class="theme-ripple__wash"></span>
        <span class="theme-ripple__ring theme-ripple__ring--one"></span>
        <span class="theme-ripple__ring theme-ripple__ring--two"></span>
        <span class="theme-ripple__ring theme-ripple__ring--three"></span>
        <span class="theme-ripple__core"></span>
      </div>
    </Transition>

    <SiteNavigation :theme="theme" class="z-50" @toggle-theme="handleThemeToggle" />

    <div class="flex-1 z-10 w-full relative">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in" @enter="onEnter" @leave="onLeave">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from 'vue';
  import { RouterView } from 'vue-router';
  import SiteNavigation from './components/SiteNavigation.vue';
  import Lenis from 'lenis';
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { useTheme, type ThemeMode } from './composables/useTheme';

  gsap.registerPlugin(ScrollTrigger);

  const line1 = ref<HTMLElement | null>(null);
  const line2 = ref<HTMLElement | null>(null);
  const line3 = ref<HTMLElement | null>(null);
  const rippleState = ref({
    visible: false,
    x: 0,
    y: 0,
    theme: 'dark' as ThemeMode,
  });

  const { theme, initializeTheme, toggleTheme } = useTheme();

  const rippleStyle = computed(() => ({
    '--ripple-x': `${rippleState.value.x}px`,
    '--ripple-y': `${rippleState.value.y}px`,
  }));

  let lenis: Lenis | null = null;
  let rippleTimer: ReturnType<typeof setTimeout> | null = null;

  const handleThemeToggle = ({ x, y }: { x: number; y: number }) => {
    rippleState.value = {
      visible: true,
      x,
      y,
      theme: theme.value === 'dark' ? 'light' : 'dark',
    };

    if (rippleTimer) {
      clearTimeout(rippleTimer);
    }

    toggleTheme();

    rippleTimer = setTimeout(() => {
      rippleState.value.visible = false;
    }, 1200);
  };

  onMounted(() => {
    initializeTheme();

    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis?.raf(time * 1000);
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
    if (rippleTimer) {
      clearTimeout(rippleTimer);
    }
  });

  // Page transition animations
  const onEnter = (el: Element, done: () => void) => {
    gsap.fromTo(el,
      { opacity: 0, y: 30, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power4.out', onComplete: done }
    );
  };

  const onLeave = (el: Element, done: () => void) => {
    gsap.to(el, { opacity: 0, y: -20, scale: 0.98, duration: 0.8, ease: 'power3.inOut', onComplete: done });
  };
</script>

<style>
  .app-shell {
    background-image:
      linear-gradient(180deg, var(--app-shell-sheen), transparent 28%),
      linear-gradient(120deg, var(--app-shell-start), var(--app-shell-end));
  }

  .app-shell__glow--top {
    background: radial-gradient(circle at top, var(--app-glow-top), transparent 58%);
  }

  .app-shell__glow--bottom {
    background: radial-gradient(circle at bottom, var(--app-glow-bottom), transparent 60%);
  }

  .theme-ripple {
    --theme-ripple-size: 10rem;
  }

  .theme-ripple__wash,
  .theme-ripple__ring,
  .theme-ripple__core {
    position: absolute;
    left: var(--ripple-x);
    top: var(--ripple-y);
    transform: translate(-50%, -50%);
    border-radius: 9999px;
  }

  .theme-ripple__wash {
    width: 18rem;
    height: 18rem;
    background:
      radial-gradient(circle, var(--theme-ripple-core) 0%, var(--theme-ripple-soft) 34%, transparent 72%);
    opacity: 0;
    animation: wash-expand 1.1s cubic-bezier(0.19, 1, 0.22, 1) forwards;
    filter: blur(2px);
  }

  .theme-ripple__ring {
    border: 1px solid var(--theme-ripple-line);
    opacity: 0;
    backdrop-filter: blur(3px);
  }

  .theme-ripple__ring--one {
    animation: ripple-ring 1.1s ease-out forwards;
  }

  .theme-ripple__ring--two {
    animation: ripple-ring 1.1s ease-out 0.12s forwards;
  }

  .theme-ripple__ring--three {
    animation: ripple-ring 1.1s ease-out 0.24s forwards;
  }

  .theme-ripple__core {
    width: 0.85rem;
    height: 0.85rem;
    background: var(--theme-ripple-line);
    opacity: 0.8;
    animation: ripple-core 0.8s ease-out forwards;
  }

  /* Reset basic router transition as we are doing it via JS/GSAP */
  .page-enter-active,
  .page-leave-active {
    transition: none;
  }

  .page-enter-from,
  .page-leave-to {
    opacity: 0;
  }

  .theme-ripple-enter-active,
  .theme-ripple-leave-active {
    transition: opacity 0.25s ease;
  }

  .theme-ripple-enter-from,
  .theme-ripple-leave-to {
    opacity: 0;
  }

  @keyframes wash-expand {
    0% {
      width: 5rem;
      height: 5rem;
      opacity: 0.4;
    }
    100% {
      width: 130vmax;
      height: 130vmax;
      opacity: 0.82;
    }
  }

  @keyframes ripple-ring {
    0% {
      width: 1rem;
      height: 1rem;
      opacity: 0.8;
    }
    100% {
      width: 42rem;
      height: 42rem;
      opacity: 0;
    }
  }

  @keyframes ripple-core {
    0% {
      width: 0.65rem;
      height: 0.65rem;
      opacity: 0.9;
    }
    100% {
      width: 6rem;
      height: 6rem;
      opacity: 0;
    }
  }

  @media (max-width: 640px) {
    .theme-ripple__ring--one,
    .theme-ripple__ring--two,
    .theme-ripple__ring--three {
      animation-duration: 0.9s;
    }
  }
</style>
