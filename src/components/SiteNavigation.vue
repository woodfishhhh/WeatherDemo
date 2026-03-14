<template>
  <header
    data-testid="site-navigation"
    class="fixed top-0 w-full z-50 transition-all duration-700 py-6 px-6 md:px-12 flex justify-between items-center mix-blend-difference">
    <RouterLink :to="{ name: 'home' }"
      class="group flex items-center gap-4">
      <img src="/logo.png" alt="Logo" class="h-6 md:h-8 w-auto transition-transform duration-700 group-hover:scale-105" />
      <p class="text-sm md:text-base font-medium tracking-[0.4em] uppercase text-white">WTHR.studio</p>
    </RouterLink>

    <div class="flex items-center gap-6 md:gap-10">
      <nav class="hidden sm:flex items-center gap-8">
        <RouterLink
          :to="{ name: 'workspace' }"
          data-testid="nav-workspace-link"
          class="text-xs uppercase tracking-[0.3em] font-medium transition-all duration-300 text-white opacity-60 hover:opacity-100"
          :class="$route.name === 'workspace' ? 'opacity-100' : ''"
        >
          Workspace
        </RouterLink>
        <RouterLink
          :to="{ name: 'settings' }"
          data-testid="nav-settings-link"
          class="text-xs uppercase tracking-[0.3em] font-medium transition-all duration-300 text-white opacity-60 hover:opacity-100"
          :class="$route.name === 'settings' ? 'opacity-100' : ''"
        >
          Settings
        </RouterLink>
      </nav>
      
      <div class="flex items-center gap-4">
        <button
          @click="emitThemeToggle"
          class="flex h-10 w-10 items-center justify-center text-white opacity-60 hover:opacity-100 transition-opacity duration-300"
          :aria-label="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
        >
          <SunMedium v-if="theme === 'dark'" class="w-5 h-5" stroke-width="1.5" />
          <MoonStar v-else class="w-5 h-5" stroke-width="1.5" />
        </button>
        <button @click="toggleModal"
          data-testid="nav-about-button"
          class="flex h-10 w-10 items-center justify-center text-white opacity-60 hover:opacity-100 transition-opacity duration-300"
          aria-label="About this project">
          <Info class="w-5 h-5" stroke-width="1.5" />
        </button>
      </div>
    </div>

    <!-- Modal remains the same -->
    <BaseModal :show="showModal" @close-modal="toggleModal">
      <div class="p-8 md:p-12 pb-16 text-surface-text border-l-2 border-brand-primary">
        <BilingualStack
          as="h2"
          en="Concept"
          zh="理念"
          wrapper-class="flex flex-col gap-4 mb-12"
          en-class="text-xs uppercase tracking-[0.5em] font-medium text-brand-muted/75"
          zh-class="text-5xl font-light tracking-tighter"
        />
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
  import { ref } from 'vue';
  import { RouterLink } from 'vue-router';
  import { Info, MoonStar, SunMedium } from 'lucide-vue-next';
  import BilingualStack from '@/components/BilingualStack.vue';
  import type { ThemeMode } from '@/composables/useTheme';

  const { theme } = defineProps<{
    theme: ThemeMode;
  }>();

  const emit = defineEmits<{
    toggleTheme: [{ x: number; y: number }];
  }>();

  const showModal = ref(false);

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
