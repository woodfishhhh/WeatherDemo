<template>
  <div
    class="relative group grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 md:gap-4 items-start sm:items-center py-6 md:py-8 border-b border-brand-primary/10 cursor-pointer hover:border-brand-primary/55 transition-colors duration-500 overflow-hidden"
  >
    <div class="flex flex-col col-span-1 sm:col-span-2 md:col-span-1 z-10">
      <h2 class="text-3xl md:text-4xl font-light tracking-tight group-hover:translate-x-4 transition-transform duration-700 ease-out">
        {{ city.city }}
      </h2>
      <p v-if="weatherData" class="text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-brand-muted/85 mt-2">
        {{ weatherData.province }}
      </p>
    </div>

    <div v-if="weatherData" class="col-span-1 flex flex-col z-10">
      <div class="flex items-start gap-3">
        <i :class="`qi-${weatherData.icon}`" class="weather-glyph text-lg"></i>
        <div class="flex flex-col gap-1">
          <p class="text-[10px] uppercase tracking-[0.24em] font-bold text-brand-secondary/85">
            {{ weatherData.textBilingual.en }}
          </p>
          <p class="text-sm font-medium tracking-[0.08em]">{{ weatherData.textBilingual.zh }}</p>
        </div>
      </div>
      <p class="text-[10px] md:text-xs tracking-[0.24em] font-bold text-brand-muted/85 mt-2">Conditions / 天气概况</p>
    </div>

    <div v-if="weatherData" class="col-span-1 flex flex-col z-10">
      <p class="text-sm uppercase tracking-widest font-medium">H: {{ weatherData.humidity }}% / Wind: {{ formatWind({ scale: weatherData.windScale }) }}</p>
      <p class="text-[10px] md:text-xs tracking-[0.24em] font-bold text-brand-muted/85 mt-2">Details / 细节</p>
    </div>

    <div class="flex justify-between sm:justify-end items-center col-span-1 sm:col-span-2 md:col-span-1 z-10 gap-4">
      <p v-if="weatherData" class="text-5xl md:text-7xl font-light tracking-tighter">{{ formatTemperature(weatherData.temperature) }}</p>
      <button
        @click.stop="deleteCity"
        aria-label="Remove saved location / 移除已收藏城市"
        class="remove-action md:hidden pointer-events-auto flex items-center gap-2 border border-brand-primary/15 rounded-full px-4 py-2 text-[10px] uppercase tracking-[0.28em] font-bold hover:bg-brand-primary hover:text-brand-text transition-colors duration-300"
      >
        <span class="remove-label">Remove / 移除</span>
      </button>
    </div>

    <div
      class="city-card-hover-overlay absolute inset-y-0 right-0 z-20 text-brand-text flex items-center justify-end px-6 md:px-8 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none transform origin-right scale-x-0 group-hover:scale-x-100 ease-in-out"
    >
      <button
        @click.stop="deleteCity"
        aria-label="Remove saved location / 移除已收藏城市"
        class="remove-action pointer-events-auto flex items-center gap-3 hover:opacity-50 transition-opacity uppercase tracking-[0.3em] text-xs font-bold mt-12 mb-12"
      >
        <span class="remove-label">Remove / 移除</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="remove-icon h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
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
</script>

<style scoped>
  .weather-glyph {
    line-height: 1;
  }

  .remove-label {
    display: inline-block;
    transition:
      transform 0.3s ease,
      font-size 0.3s ease;
  }

  .remove-action:hover .remove-label,
  .remove-label:hover {
    transform: scale(1.08);
    font-size: 1.08em;
  }

  .remove-icon {
    transition: transform 0.3s ease;
    transform-origin: center;
  }

  .remove-action:hover .remove-icon,
  .remove-icon:hover {
    transform: scale(1.24);
  }

  .city-card-hover-overlay {
    left: 0;
    background: linear-gradient(
      to left,
      rgb(0 0 0 / 1) 0%,
      rgb(0 0 0 / 0.94) 28%,
      rgb(0 0 0 / 0.56) 58%,
      rgb(0 0 0 / 0) 100%
    );
  }

  @media (min-width: 640px) {
    .city-card-hover-overlay {
      left: 18%;
    }
  }

  @media (min-width: 768px) {
    .city-card-hover-overlay {
      left: 38%;
    }
  }
</style>
