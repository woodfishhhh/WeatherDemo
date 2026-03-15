<template>
  <header data-testid="site-navigation"
    class="fixed top-0 w-full z-50 transition-all duration-700 py-6 px-6 md:px-12 flex justify-between items-center mix-blend-difference">
    <RouterLink :to="{ name: 'home' }" class="group flex items-center gap-4 text-white">
      <LogoIcon class="h-6 md:h-8 w-auto transition-transform duration-700 group-hover:scale-105" />
      <p class="text-sm md:text-base font-medium tracking-[0.4em] uppercase">WOODFISH.STUDIO</p>
    </RouterLink>

    <div class="flex items-center gap-6 md:gap-10">
      <nav class="hidden sm:flex items-center gap-8 relative" @mouseleave="hoverIndex = null">
        <!-- Animated Underline -->
        <div
          class="absolute -bottom-2 h-[2px] bg-white transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          :style="underlineStyle"
        ></div>

        <RouterLink
          v-for="(link, index) in navLinks"
          :key="link.name"
          :to="{ name: link.name }"
          :data-testid="`nav-${link.name}-link`"
          :ref="el => setNavRef(el, index)"
          @mouseenter="hoverIndex = index"
          class="text-xs uppercase tracking-[0.3em] font-medium transition-all duration-300 text-white"
          :class="($route.name === link.name || hoverIndex === index) ? 'opacity-100' : 'opacity-60'"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="flex items-center gap-4">
        <button @click="emitThemeToggle"
          class="flex h-10 w-10 items-center justify-center text-white opacity-60 hover:opacity-100 transition-opacity duration-300"
          :aria-label="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'">
          <SunMedium v-if="theme === 'dark'" class="w-5 h-5" stroke-width="1.5" />
          <MoonStar v-else class="w-5 h-5" stroke-width="1.5" />
        </button>
        <button @click="toggleModal" data-testid="nav-about-button"
          class="flex h-10 w-10 items-center justify-center text-white opacity-60 hover:opacity-100 transition-opacity duration-300"
          aria-label="About this project">
          <Info class="w-5 h-5" stroke-width="1.5" />
        </button>
      </div>
    </div>

    <!-- Modal remains the same -->
    <BaseModal :show="showModal" @close-modal="toggleModal">
      <div class="p-8 md:p-12 pb-16 text-surface-text border-l-2 border-brand-primary">
        <BilingualStack as="h2" en="Concept" zh="理念" wrapper-class="flex flex-col gap-4 mb-12"
          en-class="text-xs uppercase tracking-[0.5em] font-medium text-brand-muted/75"
          zh-class="text-5xl font-light tracking-tighter" />
        <div class="text-brand-secondary leading-relaxed font-light text-xl md:text-2xl mb-12 space-y-6">
          <p>A weather study in monochrome motion, designed to keep atmosphere legible without losing restraint.</p>
          <p class="text-lg opacity-80 font-medium">一款以黑白留白和克制动效呈现的天气可视化工具，用更安静的方式传达真实气象。</p>
        </div>
        <a href="https://www.woodfishhhh.xyz/" target="_blank" rel="noopener noreferrer"
          class="inline-block px-8 py-4 border-b-2 border-brand-primary text-sm uppercase tracking-[0.3em] font-bold hover:text-brand-secondary hover:border-brand-secondary transition-all duration-300">
          Visit The Journal ↗
        </a>
      </div>
    </BaseModal>
  </header>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
  import { RouterLink, useRoute } from 'vue-router';
  import { Info, MoonStar, SunMedium } from 'lucide-vue-next';
  import BilingualStack from '@/components/BilingualStack.vue';
  import LogoIcon from '@/components/LogoIcon.vue';
  import type { ThemeMode } from '@/composables/useTheme';

  const route = useRoute();

  const { theme } = defineProps<{
    theme: ThemeMode;
  }>();

  const emit = defineEmits<{
    toggleTheme: [{ x: number; y: number }];
  }>();

  const showModal = ref(false);

  const navLinks = [
    { name: 'home', label: 'Home' },
    { name: 'workspace', label: 'Workspace' },
    { name: 'settings', label: 'Settings' }
  ];

  const navElements = ref<(HTMLElement | null)[]>([]);
  const setNavRef = (el: unknown, index: number) => {
    if (el) navElements.value[index] = (el as any).$el || el;
  };

  const hoverIndex = ref<number | null>(null);

  const activeIndex = computed(() => {
    if (hoverIndex.value !== null) return hoverIndex.value;
    const idx = navLinks.findIndex(l => l.name === route.name);
    return idx >= 0 ? idx : null;
  });

  const underlineStyle = ref({ left: '0px', width: '0px', opacity: 0 });

  const updateUnderline = async () => {
    await nextTick();
    if (activeIndex.value === null) {
      underlineStyle.value.opacity = 0;
      return;
    }
    const target = navElements.value[activeIndex.value];
    if (target) {
      underlineStyle.value = {
        left: `${target.offsetLeft}px`,
        width: `${target.offsetWidth}px`,
        opacity: 1
      };
    } else {
      underlineStyle.value.opacity = 0;
    }
  };

  watch(activeIndex, updateUnderline, { immediate: true });
  watch(() => route.name, updateUnderline);

  onMounted(() => {
    setTimeout(updateUnderline, 100);
    window.addEventListener('resize', updateUnderline);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateUnderline);
  });

  const emitThemeToggle = (event: MouseEvent) => {
    const target = event.currentTarget as HTMLElement | null;
    if (!target) {
      emit('toggleTheme', {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      return;
    }

    const bounds = target.getBoundingClientRect();

    emit('toggleTheme', {
      x: event.clientX || bounds.left + bounds.width / 2,
      y: event.clientY || bounds.top + bounds.height / 2,
    });
  };

  function toggleModal() {
    showModal.value = !showModal.value;
  }
</script>
