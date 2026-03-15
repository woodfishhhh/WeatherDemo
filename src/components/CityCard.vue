<template>
  <div
    data-testid="city-card"
    class="relative group cursor-pointer overflow-hidden border-b border-brand-primary/20 transition-all duration-700 hover:border-brand-primary"
  >
    <div class="flex w-full min-w-0 flex-col gap-8 py-8 sm:py-10 md:flex-row md:items-end md:justify-between md:gap-10 md:py-16">
      <div
        class="z-10 flex min-w-0 w-full flex-col md:w-1/2 md:group-hover:translate-x-6 transition-transform duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)]"
      >
        <p
          v-if="weatherData"
          class="mb-4 flex max-w-full flex-col gap-1 opacity-100 transition-opacity duration-500 md:mb-6 md:opacity-0 md:group-hover:opacity-100"
        >
          <span class="truncate text-[10px] md:text-sm uppercase tracking-[0.4em] font-medium text-brand-muted/70">
            {{ weatherData.province }} — DOMAIN
          </span>
        </p>
        <BilingualStack
          :en="city.city"
          :zh="city.city"
          wrapper-class="flex min-w-0 flex-col gap-2"
          en-class="max-w-full overflow-hidden text-ellipsis text-[clamp(2.5rem,14vw,4.5rem)] md:text-7xl font-bold tracking-tighter leading-none uppercase"
          zh-class="max-w-full overflow-hidden text-ellipsis text-xl sm:text-2xl md:text-4xl font-zh-weight opacity-60"
        />
      </div>

      <div
        class="z-10 flex w-full min-w-0 flex-col gap-6 md:w-auto md:flex-row md:items-end md:justify-end md:gap-16 transition-transform duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] md:group-hover:-translate-x-40"
      >
        <div v-if="weatherData" class="flex min-w-0 items-center gap-4 md:gap-6">
          <i :class="`qi-${weatherData.icon}`" class="weather-glyph shrink-0 text-3xl md:text-5xl opacity-80"></i>
          <div class="flex min-w-0 flex-col">
            <p class="truncate text-sm md:text-lg font-medium tracking-tight uppercase">
              {{ weatherData.textBilingual.en }}
            </p>
            <p class="truncate mt-1 text-xs md:text-sm font-light tracking-wider text-brand-secondary">
              {{ weatherData.textBilingual.zh || 'Details' }}
            </p>
          </div>
        </div>

        <div
          v-if="weatherData"
          class="flex min-w-0 flex-col items-start gap-2 border-t border-brand-primary/10 pt-6 md:items-end md:border-t-0 md:border-l md:pl-10 md:pt-0"
        >
          <p class="max-w-full overflow-hidden text-ellipsis text-[clamp(3.5rem,20vw,5.75rem)] md:text-8xl font-medium tracking-tighter tabular-nums leading-none">
            {{ formatTemperatureNumber(weatherData.temperature) }}<span class="align-top text-2xl md:text-4xl text-brand-primary/50">°</span>
          </p>
          <p class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-[0.3em] font-light text-brand-muted">
            <span>H:{{ weatherData.humidity }}%</span>
            <span class="opacity-30">|</span>
            <span>W:{{ formatWind({ scale: weatherData.windScale }) }}</span>
          </p>
        </div>
      </div>
    </div>

    <div
      class="z-20 flex w-full justify-end pb-2 md:absolute md:inset-y-0 md:right-0 md:w-auto md:items-center md:pb-0 md:pr-4 md:pointer-events-none md:opacity-0 md:translate-x-8 md:group-hover:opacity-100 md:group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)]"
    >
      <button
        data-testid="city-card-remove-button"
        @click.stop="deleteCity"
        aria-label="Remove location"
        class="pointer-events-auto group/btn inline-flex items-center justify-center gap-3 rounded-full border border-brand-primary/12 px-4 py-3 text-left transition-transform duration-500 ease-out hover:bg-brand-primary/5 md:h-full md:flex-col md:gap-1.5 md:rounded-none md:border-0 md:px-6 md:py-8 md:hover:scale-105"
      >
        <span
          class="hidden w-[1px] bg-brand-primary/20 transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] md:block md:h-0 md:mb-4 md:origin-bottom md:transform-gpu md:group-hover:h-full md:group-hover/btn:bg-red-500"
        ></span>

        <div class="flex items-center gap-3 md:flex-col md:gap-1.5">
          <svg
            class="h-4 w-4 text-brand-primary transition-colors duration-500 group-hover/btn:text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span class="text-[11px] md:text-[13px] uppercase tracking-[0.2em] font-bold text-brand-primary transition-colors duration-500 group-hover/btn:text-red-500">
            REMOVE
          </span>
          <span class="text-[10px] md:text-sm font-zh-weight tracking-[0.3em] text-brand-primary transition-colors duration-500 group-hover/btn:text-red-500">
            删除
          </span>
        </div>

        <span
          class="hidden w-[1px] bg-brand-primary/20 transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] md:block md:h-0 md:mt-4 md:origin-top md:transform-gpu md:delay-75 md:group-hover:h-full md:group-hover/btn:bg-red-500"
        ></span>
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
