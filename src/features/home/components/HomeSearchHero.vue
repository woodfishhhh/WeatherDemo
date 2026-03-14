<template>
  <div class="max-w-4xl mx-auto w-full relative group mb-20 md:mb-32 mt-10 sm:mt-12">
    <h1
      class="block text-[17vw] sm:text-[18vw] md:text-9xl font-bold tracking-[-0.06em] md:tracking-tighter leading-[0.86] mb-4 sm:mb-5 md:mb-4 static md:absolute md:-top-32 md:-left-16 opacity-80 pointer-events-none select-none max-w-full">
      FORECAST
    </h1>
    <input
      v-model="searchQuery"
      data-testid="home-search-input"
      type="text"
      placeholder="Enter location / 输入城市"
      aria-label="Search location / 搜索城市"
      @focus="emit('focus-input')"
      @blur="emit('blur-input')"
      @keydown.enter.prevent="emit('select-first-tip')"
      class="py-3 sm:py-4 md:py-6 w-full bg-transparent border-b-2 border-brand-primary/70 placeholder:text-brand-muted/55 text-[8vw] sm:text-4xl md:text-6xl font-light tracking-tight leading-none focus:outline-none focus:border-brand-primary transition-all duration-700"
    />

    <div
      class="absolute right-0 bottom-4 md:bottom-6 pointer-events-none text-brand-secondary/60 text-xs md:text-sm uppercase tracking-[0.3em] font-medium hidden md:block">
      <span v-if="isSearching" class="animate-pulse">Searching / 搜索中</span>
      <span v-else>Search / 搜索</span>
    </div>

    <transition name="fade">
      <ul
        v-if="showTips && searchResults.length"
        data-testid="search-results"
        class="absolute left-0 right-0 top-full mt-3 bg-brand-accent/90 border border-brand-primary/12 shadow-2xl shadow-black/40 z-30 backdrop-blur-xl">
        <li
          v-for="tip in searchResults"
          :key="tip.id"
          data-testid="search-result-item"
          @mousedown.prevent="emit('select-tip', tip)"
          class="px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-8 cursor-pointer hover:bg-brand-primary hover:text-brand-text transition-colors duration-500 flex flex-col gap-2 md:flex-row md:justify-between md:items-end border-b border-brand-primary/8 last:border-0 group/item">
          <p class="text-xl sm:text-2xl md:text-4xl font-light tracking-tight">{{ tip.name }}</p>
          <p
            class="text-xs md:text-sm uppercase tracking-widest opacity-60 group-hover/item:opacity-80 transition-opacity duration-500">
            {{ tip.province }}{{ tip.district ? ` · ${tip.district}` : '' }}
          </p>
        </li>
      </ul>
    </transition>

    <p v-if="errorMessage" data-testid="search-error" class="mt-8 text-sm text-red-400 tracking-[0.18em]">
      {{ errorMessage }}
    </p>
    <p
      v-if="!isSearching && !isLoading && !searchResults.length && searchQuery.trim()"
      class="mt-8 text-sm text-brand-muted/80 tracking-[0.18em] fade-in">
      NO RESULTS FOUND / 未找到匹配城市
    </p>
  </div>
</template>

<script setup lang="ts">
  import type { LocationRecord } from '@/features/weather/types';

  const searchQuery = defineModel<string>({
    required: true,
  });

  defineProps<{
    errorMessage: string;
    isLoading: boolean;
    isSearching: boolean;
    searchResults: LocationRecord[];
    showTips: boolean;
  }>();

  const emit = defineEmits<{
    (event: 'blur-input'): void;
    (event: 'focus-input'): void;
    (event: 'select-first-tip'): void;
    (event: 'select-tip', tip: LocationRecord): void;
  }>();
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s ease, transform 0.5s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    transform: translateY(-20px);
  }
</style>
