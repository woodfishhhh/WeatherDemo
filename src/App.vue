<template>
  <div
    class="app-shell flex flex-col min-h-screen bg-surface text-surface-text font-sans selection:bg-brand-primary selection:text-brand-text relative overflow-hidden">
    <div class="app-shell__glow app-shell__glow--top pointer-events-none absolute inset-x-0 top-0 z-0 h-[34rem]"></div>
    <div
      class="app-shell__glow app-shell__glow--bottom pointer-events-none absolute inset-x-0 bottom-[-12rem] z-0 h-[28rem]">
    </div>
    <div class="wave-lines pointer-events-none fixed inset-0 z-0 opacity-30">
      <div class="wave-line top-[20%]" ref="line1"></div>
      <div class="wave-line top-[50%]" ref="line2"></div>
      <div class="wave-line top-[80%]" ref="line3"></div>
    </div>

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
  import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue';
  import { storeToRefs } from 'pinia';
  import { RouterView } from 'vue-router';
  import SiteNavigation from './components/SiteNavigation.vue';
  import Lenis from 'lenis';
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { useTheme } from './composables/useTheme';
  import { useSettingsStore } from '@/features/settings/stores/settings';

  gsap.registerPlugin(ScrollTrigger);

  const line1 = ref<HTMLElement | null>(null);
  const line2 = ref<HTMLElement | null>(null);
  const line3 = ref<HTMLElement | null>(null);
  const systemReducedMotion = shallowRef(false);

  const { theme, initializeTheme, toggleTheme } = useTheme();
  const settingsStore = useSettingsStore();
  settingsStore.hydrate();
  const { reducedMotion } = storeToRefs(settingsStore);
  const prefersReducedMotion = computed(() => systemReducedMotion.value || reducedMotion.value === true);

  let lenis: Lenis | null = null;
  let lenisTicker: ((time: number) => void) | null = null;
  let reduceMotionMedia: MediaQueryList | null = null;
  let reduceMotionListener: ((event: MediaQueryListEvent) => void) | null = null;
  let waveTweens: gsap.core.Tween[] = [];

  type ViewTransitionLike = {
    ready: Promise<void>;
    finished: Promise<void>;
    updateCallbackDone?: Promise<void>;
    skipTransition?: () => void;
  };

  type DocumentWithViewTransition = Document & {
    startViewTransition?: (callback: () => void | Promise<void>) => ViewTransitionLike;
  };

  const setThemeTransitionOrigin = (x: number, y: number) => {
    const root = document.documentElement;
    const maxX = Math.max(x, window.innerWidth - x);
    const maxY = Math.max(y, window.innerHeight - y);
    const radius = Math.hypot(maxX, maxY);

    root.style.setProperty('--theme-switch-x', `${x}px`);
    root.style.setProperty('--theme-switch-y', `${y}px`);
    root.style.setProperty('--theme-switch-radius', `${radius}px`);
  };

  const clearThemeTransitionOrigin = () => {
    const root = document.documentElement;
    root.style.removeProperty('--theme-switch-x');
    root.style.removeProperty('--theme-switch-y');
    root.style.removeProperty('--theme-switch-radius');
  };

  const clearWaveTweens = () => {
    for (const tween of waveTweens) {
      tween.scrollTrigger?.kill();
      tween.kill();
    }

    waveTweens = [];
    gsap.set([line1.value, line2.value, line3.value], {
      clearProps: 'transform',
    });
  };

  const syncMotionMode = () => {
    document.documentElement.dataset.motion = prefersReducedMotion.value ? 'reduced' : 'full';

    if (prefersReducedMotion.value) {
      lenis?.stop();
      clearWaveTweens();
      return;
    }

    lenis?.start();
    clearWaveTweens();

    waveTweens = [
      gsap.to(line1.value, {
        y: '-200px',
        ease: 'none',
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      }),
      gsap.to(line2.value, {
        y: '100px',
        ease: 'none',
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.5,
        },
      }),
      gsap.to(line3.value, {
        y: '-150px',
        ease: 'none',
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
        },
      }),
    ];
  };

  const handleThemeToggle = ({ x, y }: { x: number; y: number }) => {
    setThemeTransitionOrigin(x, y);

    const transitionApi = (document as DocumentWithViewTransition).startViewTransition;
    if (!transitionApi || prefersReducedMotion.value) {
      toggleTheme();
      clearThemeTransitionOrigin();
      return;
    }

    const transition = transitionApi.call(document, async () => {
      toggleTheme();
      await nextTick();
    });

    transition.finished.finally(() => {
      clearThemeTransitionOrigin();
    });
  };

  onMounted(() => {
    initializeTheme();
    setThemeTransitionOrigin(window.innerWidth / 2, window.innerHeight / 2);

    reduceMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    systemReducedMotion.value = reduceMotionMedia.matches;
    reduceMotionListener = (event: MediaQueryListEvent) => {
      systemReducedMotion.value = event.matches;
    };
    reduceMotionMedia.addEventListener('change', reduceMotionListener);

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

    lenisTicker = (time) => {
      lenis?.raf(time * 1000);
    };

    gsap.ticker.add(lenisTicker);
    gsap.ticker.lagSmoothing(0, 0);
    syncMotionMode();
  });

  watch(prefersReducedMotion, () => {
    syncMotionMode();
  });

  onUnmounted(() => {
    clearWaveTweens();
    if (lenis) {
      lenis.destroy();
    }
    if (lenisTicker) {
      gsap.ticker.remove(lenisTicker);
    }
    if (reduceMotionMedia && reduceMotionListener) {
      reduceMotionMedia.removeEventListener('change', reduceMotionListener);
    }
  });

  const onEnter = (el: Element, done: () => void) => {
    if (prefersReducedMotion.value) {
      gsap.set(el, { opacity: 1, y: 0, scale: 1 });
      done();
      return;
    }

    gsap.fromTo(el,
      { opacity: 0, y: 30, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power4.out', onComplete: done }
    );
  };

  const onLeave = (el: Element, done: () => void) => {
    if (prefersReducedMotion.value) {
      gsap.set(el, { opacity: 0, y: 0, scale: 1 });
      done();
      return;
    }

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

  /* Reset basic router transition as we are doing it via JS/GSAP */
  .page-enter-active,
  .page-leave-active {
    transition: none;
  }

  .page-enter-from,
  .page-leave-to {
    opacity: 0;
  }

  ::view-transition-old(*) {
    animation: none;
  }

  ::view-transition-new(*) {
    animation: theme-clip-reveal 500ms ease-in both;
  }

  ::view-transition-old(root) {
    z-index: 1;
    mix-blend-mode: normal;
  }

  ::view-transition-new(root) {
    z-index: 9999;
    mix-blend-mode: normal;
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, var(--color-brand-primary) 10%, transparent),
      inset 0 0 12rem color-mix(in srgb, var(--color-brand-primary) 4%, transparent);
  }

  html[data-theme='dark']::view-transition-old(*) {
    animation: theme-clip-reveal 500ms ease-in reverse both;
  }

  html[data-theme='dark']::view-transition-new(*) {
    animation: none;
  }

  html[data-theme='dark']::view-transition-old(root) {
    z-index: 9999;
  }

  html[data-theme='dark']::view-transition-new(root) {
    z-index: 1;
  }

  html[data-motion='reduced'] .wave-lines {
    opacity: 0.08;
  }

  html[data-motion='reduced']::view-transition-old(*),
  html[data-motion='reduced']::view-transition-new(*) {
    animation: none;
  }

  @keyframes theme-clip-reveal {
    0% {
      clip-path: circle(0 at var(--theme-switch-x) var(--theme-switch-y));
    }

    100% {
      clip-path: circle(var(--theme-switch-radius) at var(--theme-switch-x) var(--theme-switch-y));
    }
  }

  @media (prefers-reduced-motion: reduce) {

    ::view-transition-old(*),
    ::view-transition-new(*) {
      animation-duration: 0.01ms !important;
    }
  }
</style>
