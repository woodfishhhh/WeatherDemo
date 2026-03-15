<template>
  <div
    data-testid="city-card"
    class="relative group flex flex-col md:flex-row items-start md:items-end justify-between py-10 md:py-16 border-b border-brand-primary/20 cursor-pointer overflow-hidden transition-all duration-700 hover:border-brand-primary">
    <div
      class="flex flex-col z-10 w-full md:w-1/2 group-hover:translate-x-6 transition-transform duration-700 ease-out">
      <p v-if="weatherData"
        class="flex flex-col gap-1 mb-4 md:mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <span class="text-[10px] md:text-sm uppercase tracking-[0.4em] font-medium text-brand-muted/70">{{
          weatherData.province }} — DOMAIN</span>
      </p>
      <BilingualStack :en="city.city" :zh="city.city" wrapper-class="flex flex-col gap-2"
        en-class="text-4xl md:text-7xl font-bold tracking-tighter leading-none uppercase"
        zh-class="text-2xl md:text-4xl font-light opacity-60" />
    </div>

    <div
      class="flex flex-col md:flex-row md:items-end gap-8 md:gap-16 z-10 mt-8 md:mt-0 w-full md:w-auto justify-between md:justify-end">
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
              weatherData.windScale }) }}
        </p>
      </div>
    </div>

    <div
      class="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none pr-8">
      <button @click.stop="deleteCity" aria-label="Remove location"
        class="pointer-events-auto flex items-center justify-center w-12 h-12 rounded-full border border-brand-primary/20 bg-surface hover:bg-brand-primary hover:text-brand-text transition-all duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <span
        class="text-[10px] uppercase tracking-[0.3em] font-medium text-brand-muted rotate-90 origin-right translate-y-12">REMOVE</span>
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
