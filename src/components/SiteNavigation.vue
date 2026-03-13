<template>
  <header
    class="fixed top-0 w-full z-50 transition-all duration-500 py-4 px-4 md:px-12 flex justify-between items-center gap-3">
    <RouterLink :to="{ name: 'home' }"
      class="group min-w-0 flex items-center gap-2 rounded-full border border-brand-primary/10 bg-brand-accent/72 px-3 py-2 md:px-4 md:py-3 backdrop-blur-xl">
      <img src="/logo.png" alt="Logo" class="h-5 md:h-6 w-auto transition-transform duration-500 group-hover:scale-110" />
      <p class="text-xs sm:text-sm font-semibold tracking-[0.24em] sm:tracking-widest uppercase ml-1 sm:ml-2 truncate">WTHR.studio</p>
    </RouterLink>

    <div class="flex items-center gap-2 sm:gap-3">
      <button
        @click="emitThemeToggle"
        class="flex h-11 w-11 items-center justify-center rounded-full border border-brand-primary/10 bg-brand-accent/72 backdrop-blur-xl hover:opacity-60 transition-opacity duration-300"
        :aria-label="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
      >
        <SunMedium v-if="theme === 'dark'" class="w-5 h-5" stroke-width="1.5" />
        <MoonStar v-else class="w-5 h-5" stroke-width="1.5" />
      </button>
      <button @click="toggleModal"
        class="flex h-11 w-11 items-center justify-center rounded-full border border-brand-primary/10 bg-brand-accent/72 backdrop-blur-xl hover:opacity-60 transition-opacity duration-300"
        aria-label="About">
        <Info class="w-5 h-5" stroke-width="1.5" />
      </button>
      <a href="https://www.woodfishhhh.xyz/" target="_blank" rel="noopener noreferrer"
        class="flex h-11 w-11 items-center justify-center rounded-full border border-brand-primary/10 bg-brand-accent/72 backdrop-blur-xl hover:opacity-60 transition-opacity duration-300"
        aria-label="Author Blog">
        <User class="w-5 h-5" stroke-width="1.5" />
      </a>
    </div>

    <BaseModal :show="showModal" @close-modal="toggleModal">
      <div class="p-6 md:p-8 pb-10 text-surface-text">
        <h2 class="text-3xl font-light mb-8 tracking-tight">理念.</h2>
        <p class="text-brand-secondary leading-relaxed font-light text-base md:text-lg mb-8">
          一款精致的天气可视化工具。通过极简、不受拘束的视角，准确传达大气状况。基于 Vue.js 构建，为您带来高性能的交互体验。
        </p>
        <a href="https://www.woodfishhhh.xyz/" target="_blank" rel="noopener noreferrer"
          class="inline-block px-6 py-3 border border-brand-primary/20 rounded-full hover:bg-brand-primary hover:text-brand-text transition-colors duration-300">
          访问作者博客
        </a>
      </div>
    </BaseModal>
  </header>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { RouterLink } from 'vue-router';
  import { Info, MoonStar, SunMedium, User } from 'lucide-vue-next';
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
