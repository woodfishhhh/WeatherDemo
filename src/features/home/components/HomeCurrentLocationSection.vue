<template>
  <div class="flex items-center gap-4 sm:gap-6">
    <div class="w-10 sm:w-12 md:w-16 h-[2px] bg-brand-primary"></div>
    <p class="text-[10px] md:text-xs tracking-[0.26em] sm:tracking-[0.34em] font-bold">CURRENT LOCATION / 当前位置</p>
  </div>

  <PlatformPanel tone="wash" class="px-5 py-6 md:px-8 md:py-8">
    <div v-if="currentLocation" class="group cursor-pointer" @click="emit('open-current-location')">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-[1.3fr_1fr_1fr_auto] md:items-center">
        <div>
          <p class="text-3xl md:text-4xl font-light tracking-tight">{{ currentLocation.location.name }}</p>
          <p class="mt-2 text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-brand-muted/85">
            {{ currentLocation.location.province }}{{ currentLocation.location.district ? ` · ${currentLocation.location.district}` : '' }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <i :class="`qi-${currentLocation.weather.icon}`" class="weather-glyph text-2xl"></i>
          <div>
            <p class="text-[10px] uppercase tracking-[0.24em] font-bold text-brand-secondary/85">
              {{ currentLocation.weather.textBilingual.en }}
            </p>
            <p class="mt-1 text-sm font-medium tracking-[0.08em]">{{ currentLocation.weather.textBilingual.zh }}</p>
            <p class="mt-2 text-[10px] md:text-xs tracking-[0.24em] font-bold text-brand-muted/85">Conditions / 天气概况</p>
          </div>
        </div>
        <div>
          <p class="text-sm uppercase tracking-widest font-medium">
            H: {{ currentLocation.weather.humidity }}% / Wind: {{ formatWind({ scale: currentLocation.weather.windScale }) }}
          </p>
          <p class="mt-2 text-[10px] md:text-xs tracking-[0.24em] font-bold text-brand-muted/85">Details / 细节</p>
        </div>
        <div class="flex items-center justify-between gap-4 md:justify-end">
          <p class="text-5xl md:text-6xl font-light tracking-tighter">{{ formatTemperature(currentLocation.weather.temperature) }}</p>
          <span class="text-[10px] tracking-[0.24em] font-bold text-brand-muted/85">Open / 打开</span>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <BilingualStack
          en="Use Your Current Location"
          zh="使用你的当前位置"
          wrapper-class="flex flex-col gap-3"
          en-class="text-[10px] uppercase tracking-[0.38em] font-bold text-brand-muted/75"
          zh-class="text-xl md:text-2xl font-light tracking-tight"
        />
        <div class="mt-3 max-w-2xl text-sm leading-7 text-brand-muted/70 space-y-2">
          <p>We can request browser location permission, resolve your city with QWeather, and show live conditions here.</p>
          <p>我们会请求浏览器定位权限，用和风天气解析你的城市，并在这里展示当前天气。</p>
        </div>
      </div>
      <button
        type="button"
        @click="emit('request-current-location')"
        :disabled="isLocating"
        aria-label="Use current location / 使用当前位置"
        class="inline-flex items-center justify-center rounded-full border border-brand-primary/20 px-6 py-3 text-xs uppercase tracking-[0.32em] font-bold transition-colors duration-300 hover:bg-brand-primary hover:text-brand-text disabled:cursor-wait disabled:opacity-60">
        {{ isLocating ? 'Locating / 定位中' : 'Use Current Location / 使用当前位置' }}
      </button>
    </div>

    <p v-if="locationErrorMessage" class="mt-5 text-xs tracking-[0.18em] font-bold text-red-400">
      {{ locationErrorMessage }}
    </p>
  </PlatformPanel>
</template>

<script setup lang="ts">
  import BilingualStack from '@/components/BilingualStack.vue';
  import PlatformPanel from '@/components/platform/PlatformPanel.vue';
  import type { CurrentLocationWeather } from '@/features/locations/stores/locations';

  defineProps<{
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
</script>
