<template>
  <div data-testid="city-card"
    class="relative group flex flex-col md:flex-row items-start md:items-end justify-between py-10 md:py-16 border-b border-brand-primary/20 cursor-pointer overflow-hidden transition-all duration-700 hover:border-brand-primary">
    <div
      class="flex flex-col z-10 w-full md:w-1/2 group-hover:translate-x-6 transition-transform duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)]">
      <p v-if="weatherData"
        class="flex flex-col gap-1 mb-4 md:mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <span class="text-[10px] md:text-sm uppercase tracking-[0.4em] font-medium text-brand-muted/70">{{
          weatherData.province }} — DOMAIN</span>
      </p>
      <BilingualStack :en="city.city" :zh="city.city" wrapper-class="flex flex-col gap-2"
        en-class="text-4xl md:text-7xl font-bold tracking-tighter leading-none uppercase"
        zh-class="text-2xl md:text-4xl font-zh-weight opacity-60" />
    </div>

    <div
      class="flex flex-col md:flex-row md:items-end gap-8 md:gap-16 z-10 mt-8 md:mt-0 w-full md:w-auto justify-between md:justify-end transition-transform duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:-translate-x-24 md:group-hover:-translate-x-40">
      <div v-if="weatherData" class="flex items-center gap-6">
        <i :class="`qi-${weatherData.icon}`" class="weather-glyph text-3xl md:text-5xl opacity-80"></i>
        <div class="flex flex-col">
          <p class="text-sm md:text-lg font-medium tracking-tight uppercase">
            {{ weatherData.textBilingual.en }}
          </p>
          <p class="text-xs md:text-sm font-light text-brand-secondary mt-1 tracking-wider">{{
            weatherData.textBilingual.zh || 'Details' }}</p>
        </div>
      </div>

      <div v-if="weatherData"
        class="flex flex-col items-start md:items-end gap-2 border-l border-brand-primary/10 pl-6 md:pl-10">
        <p class="text-5xl md:text-8xl font-medium tracking-tighter tabular-nums leading-none">{{
          formatTemperatureNumber(weatherData.temperature) }}<span
            class="text-2xl md:text-4xl align-top text-brand-primary/50">°</span></p>
        <p class="text-xs uppercase tracking-[0.3em] font-light text-brand-muted mt-2">
          H:{{ weatherData.humidity }}%<span class="mx-3 opacity-30">|</span>W:{{ formatWind({
            scale:
              weatherData.windScale
          }) }}
        </p>
      </div>
    </div>

    <!-- Minimalist Delete Button Container -->
    <div
      class="absolute right-0 top-0 bottom-0 z-20 flex items-center justify-end opacity-0 group-hover:opacity-100 translate-x-8 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] pointer-events-none md:pr-4">
      <button @click.stop="deleteCity" aria-label="Remove location"
        class="pointer-events-auto h-full flex flex-col items-center justify-center px-4 md:px-6 group/btn hover:scale-105 transition-transform duration-500 ease-out py-8 hover:bg-brand-primary/5">

        <!-- Flowing vertical line (Top) -->
        <span
          class="w-[1px] h-0 group-hover:h-full bg-brand-primary/20 group-hover/btn:bg-red-500 transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] mb-4 origin-bottom transform-gpu"></span>

        <!-- Typography -->
        <div class="flex flex-col items-center gap-1.5">
          <svg class="w-4 h-4 text-brand-primary group-hover/btn:text-red-500 transition-colors duration-500"
            fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span
            class="text-[11px] md:text-[13px] uppercase tracking-[0.2em] font-bold text-brand-primary group-hover/btn:text-red-500 transition-colors duration-500 mt-1">
            REMOVE
          </span>
          <span
            class="text-[10px] md:text-sm font-zh-weight tracking-[0.3em] text-brand-primary group-hover/btn:text-red-500 transition-colors duration-500">
            删除
          </span>
        </div>

        <!-- Flowing vertical line (Bottom) -->
        <span
          class="w-[1px] h-0 group-hover:h-full bg-brand-primary/20 group-hover/btn:bg-red-500 transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] mt-4 origin-top transform-gpu delay-75"></span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import BilingualStack from '@/components/BilingualStack.vue';
  import type { SavedCity } from '@/features/locations/services/persistence';
  import { useWeatherDisplayPreferences } from '@/features/settings/composables/useWeatherDisplayPreferences';
  import type { SavedCityWeatherSummary } from '@/features/weather/types';

  interface CityCardRecord extends SavedCity {
    weather?: SavedCityWeatherSummary | null;
  }

  const props = defineProps<{
    city: CityCardRecord;
  }>();

  const emit = defineEmits<{
    delete: [id: string];
  }>();
  const { formatTemperature, formatWind } = useWeatherDisplayPreferences();

  const deleteCity = () => {
    emit('delete', props.city.id);
  };

  const weatherData = computed(() => props.city.weather ?? null);
  const formatTemperatureNumber = (value: string | undefined): string =>
    formatTemperature(value).replace(/[^\d.-]/g, '');
</script>

<style scoped>
  .weather-glyph {
    line-height: 1;
  }
</style>
