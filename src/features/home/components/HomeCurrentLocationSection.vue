<template>
  <div class="flex items-center gap-6 md:gap-12 mb-10 w-full md:w-3/4">
    <BilingualStack en="Current Location" zh="当前位置" wrapper-class="flex items-end gap-3"
      en-class="text-xs md:text-sm tracking-[0.4em] font-medium uppercase shrink-0"
      zh-class="text-sm font-zh-weight shrink-0 opacity-60" />
    <div class="flex-1 h-[1px] bg-brand-primary/20"></div>
  </div>

  <div class="relative w-full lg:w-4/5 ml-auto">
    <div v-if="currentLocation"
      data-testid="current-location-card"
      class="group cursor-pointer block border-l text-left border-brand-primary/20 pl-6 md:pl-12 py-4 hover:border-brand-primary transition-all duration-700"
      @click="emit('open-current-location')">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-12">
        <div>
          <BilingualStack :en="currentLocation.location.province || ''"
            :zh="currentLocation.location.district ? currentLocation.location.province + ' — ' + currentLocation.location.district : currentLocation.location.province"
            en-class="text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium text-brand-muted mb-1 opacity-50"
            zh-class="text-xs font-zh-weight opacity-40 mb-4" />

          <BilingualStack :en="currentLocation.location.name"
            :zh="currentLocation.location.name"
            wrapper-class="flex flex-col gap-2 mb-6 group-hover:px-4 transition-all duration-500"
            en-class="text-5xl md:text-7xl font-bold tracking-tighter leading-none uppercase"
            zh-class="text-2xl font-zh-weight opacity-60" />

          <div class="flex items-center gap-6 mt-8">
            <i :class="`qi-${currentLocation.weather.icon}`" class="weather-glyph text-4xl"></i>
            <div>
              <p class="text-xl font-medium tracking-tight">{{ currentLocation.weather.textBilingual.en ||
                currentLocation.weather.textBilingual.zh }}</p>
              <p class="text-sm font-light text-brand-secondary mt-1">{{ currentLocation.weather.textBilingual.zh }}</p>
            </div>
          </div>
        </div>

        <div
          class="flex flex-col items-start md:items-end gap-6 border-t md:border-t-0 md:border-l border-brand-primary/10 pt-6 md:pt-0 md:pl-12">
          <p class="text-7xl md:text-9xl font-medium tracking-tighter tabular-nums leading-none">{{
            formatTemperatureNumber(currentLocation.weather.temperature) }}<span
              class="text-3xl md:text-5xl align-top">°</span></p>

          <div class="flex flex-col md:items-end gap-1 mt-auto">
            <BilingualStack en="Humidity / Wind" zh="湿度与风级" wrapper-class="flex flex-col md:items-end gap-1"
              en-class="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40" zh-class="hidden" />
            <p class="text-sm tracking-widest font-light">
              H: {{ currentLocation.weather.humidity }}%<span class="mx-2 opacity-30">|</span>W: {{ formatWind({
                scale:
                  currentLocation.weather.windScale }) }}
            </p>
          </div>
          <BilingualStack en="Explore ↗" zh="探索"
            wrapper-class="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2"
            en-class="text-xs tracking-[0.4em] font-medium uppercase" zh-class="text-xs font-zh-weight opacity-60" />
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col gap-8 md:gap-12 border-l border-brand-primary/20 pl-6 md:pl-12 py-4">
      <div>
        <BilingualStack en="Discover Your Local Atmosphere" zh="探索本地气象" wrapper-class="flex flex-col gap-3 mb-6"
          en-class="text-3xl md:text-5xl font-medium tracking-tighter" zh-class="text-xl font-zh-weight opacity-75" />
        <BilingualStack en="We can request browser location permission to resolve your city securely."
          zh="允许获取浏览器定位权限，我们将安全地解析您所在的城市。" wrapper-class="flex flex-col gap-2 text-brand-secondary"
          en-class="text-lg font-zh-weight tracking-wide" zh-class="text-sm font-zh-weight opacity-60" />
      </div>
      <button type="button" data-testid="request-current-location-button" @click="emit('request-current-location')" :disabled="isLocating"
        aria-label="Use current location / 使用当前位置"
        class="self-start inline-flex items-center justify-center border-b-2 border-brand-primary pb-2 transition-all duration-500 hover:text-brand-secondary hover:border-brand-secondary disabled:cursor-wait disabled:opacity-60">
        <BilingualStack :en="isLocating ? 'Locating...' : 'Enable Location Services ↗'"
          :zh="isLocating ? '正在定位...' : '启用定位服务'" wrapper-class="flex items-center gap-3"
          en-class="text-sm md:text-base uppercase tracking-[0.3em] font-medium"
          zh-class="text-sm font-zh-weight opacity-75" />
      </button>
    </div>

    <p v-if="locationErrorMessage" class="mt-8">
      <BilingualStack en="Location Error" :zh="locationErrorMessage"
        en-class="text-xs tracking-[0.2em] uppercase font-bold text-red-400" zh-class="text-sm text-red-400 mt-1" />
    </p>
  </div>
</template>

<script setup lang="ts">
  import BilingualStack from '@/components/BilingualStack.vue';
  import type { CurrentLocationWeather } from '@/features/locations/stores/locations';

  const { currentLocation, formatTemperature, formatWind, isLocating, locationErrorMessage } = defineProps<{
    currentLocation: CurrentLocationWeather | null;
    formatTemperature: (value: string | undefined) => string;
    formatWind: (input: { speed?: string; scale?: string }) => string;
    isLocating: boolean;
    locationErrorMessage: string;
  }>();

  const emit = defineEmits<{
    (event: 'open-current-location'): void;
    (event: 'request-current-location'): void;
  }>();

  const formatTemperatureNumber = (value: string | undefined): string =>
    formatTemperature(value).replace(/[^\d.-]/g, '');
</script>
