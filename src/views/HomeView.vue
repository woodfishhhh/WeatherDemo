<template>
  <main
    class="container relative z-10 pt-28 pb-20 sm:pt-32 md:pt-48 md:pb-32 min-h-screen flex flex-col justify-between">
    <div class="max-w-4xl mx-auto w-full relative group mb-20 md:mb-32 mt-10 sm:mt-12">
      <h1
        class="block text-[17vw] sm:text-[18vw] md:text-9xl font-bold tracking-[-0.06em] md:tracking-tighter leading-[0.86] mb-4 sm:mb-5 md:mb-4 static md:absolute md:-top-32 md:-left-16 opacity-80 pointer-events-none select-none max-w-full">
        FORECAST
      </h1>
      <input v-model="searchQuery" type="text" placeholder="Enter location / 输入城市" aria-label="Search location / 搜索城市"
        @focus="onInputFocus" @blur="onInputBlur" @keydown.enter.prevent="selectFirstTip"
        class="py-3 sm:py-4 md:py-6 w-full bg-transparent border-b-2 border-brand-primary/70 placeholder:text-brand-muted/55 text-[8vw] sm:text-4xl md:text-6xl font-light tracking-tight leading-none focus:outline-none focus:border-brand-primary transition-all duration-700" />

      <div
        class="absolute right-0 bottom-4 md:bottom-6 pointer-events-none text-brand-secondary/60 text-xs md:text-sm uppercase tracking-[0.3em] font-medium hidden md:block">
        <span v-if="isSearching" class="animate-pulse">Searching / 搜索中</span>
        <span v-else>Search / 搜索</span>
      </div>

      <transition name="fade">
        <ul v-if="showTips && searchResults.length"
          class="absolute left-0 right-0 top-full mt-3 bg-brand-accent/90 border border-brand-primary/12 shadow-2xl shadow-black/40 z-30 backdrop-blur-xl">
          <li v-for="tip in searchResults" :key="tip.id" @mousedown.prevent="selectTip(tip)"
            class="px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-8 cursor-pointer hover:bg-brand-primary hover:text-brand-text transition-colors duration-500 flex flex-col gap-2 md:flex-row md:justify-between md:items-end border-b border-brand-primary/8 last:border-0 group/item">
            <p class="text-xl sm:text-2xl md:text-4xl font-light tracking-tight">{{ tip.name }}</p>
            <p
              class="text-xs md:text-sm uppercase tracking-widest opacity-60 group-hover/item:opacity-80 transition-opacity duration-500">
              {{ tip.province }}{{ tip.district ? ` · ${tip.district}` : '' }}
            </p>
          </li>
        </ul>
      </transition>

      <p v-if="errorMessage" class="mt-8 text-sm text-red-400 tracking-[0.18em]">{{ errorMessage }}</p>
      <p v-if="!isSearching && !isLoading && !searchResults.length && searchQuery.trim()"
        class="mt-8 text-sm text-brand-muted/80 tracking-[0.18em] fade-in">
        NO RESULTS FOUND / 未找到匹配城市
      </p>
    </div>

    <div class="flex-1 flex flex-col gap-12 mt-auto">
      <div class="flex items-center gap-4 sm:gap-6">
        <div class="w-10 sm:w-12 md:w-16 h-[2px] bg-brand-primary"></div>
        <p class="text-[10px] md:text-xs tracking-[0.26em] sm:tracking-[0.34em] font-bold">CURRENT LOCATION / 当前位置</p>
      </div>

      <div class="border border-brand-primary/10 rounded-[2rem] bg-brand-accent/20 px-5 py-6 md:px-8 md:py-8">
        <div v-if="currentLocation" class="group cursor-pointer" @click="openCurrentLocation">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-[1.3fr_1fr_1fr_auto] md:items-center">
            <div>
              <p class="text-3xl md:text-4xl font-light tracking-tight">{{ currentLocation.location.name }}</p>
              <p class="mt-2 text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-brand-muted/85">
                {{ currentLocation.location.province }}{{ currentLocation.location.district ? ` ·
                ${currentLocation.location.district}` : '' }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <i :class="`qi-${currentLocation.weather.icon}`" class="weather-glyph text-2xl"></i>
              <div>
                <p class="text-[10px] uppercase tracking-[0.24em] font-bold text-brand-secondary/85">
                  {{ currentLocation.weather.textBilingual.en }}
                </p>
                <p class="mt-1 text-sm font-medium tracking-[0.08em]">{{ currentLocation.weather.textBilingual.zh }}</p>
                <p class="mt-2 text-[10px] md:text-xs tracking-[0.24em] font-bold text-brand-muted/85">Conditions / 天气概况
                </p>
              </div>
            </div>
            <div>
              <p class="text-sm uppercase tracking-widest font-medium">
                H: {{ currentLocation.weather.humidity }}% / Wind: {{ currentLocation.weather.windScale }}
              </p>
              <p class="mt-2 text-[10px] md:text-xs tracking-[0.24em] font-bold text-brand-muted/85">Details / 细节</p>
            </div>
            <div class="flex items-center justify-between gap-4 md:justify-end">
              <p class="text-5xl md:text-6xl font-light tracking-tighter">{{ currentLocation.weather.temperature }}&deg;
              </p>
              <span class="text-[10px] tracking-[0.24em] font-bold text-brand-muted/85">Open / 打开</span>
            </div>
          </div>
        </div>

        <div v-else class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <BilingualStack en="Use Your Current Location" zh="使用你的当前位置" wrapper-class="flex flex-col gap-3"
              en-class="text-[10px] uppercase tracking-[0.38em] font-bold text-brand-muted/75"
              zh-class="text-xl md:text-2xl font-light tracking-tight" />
            <div class="mt-3 max-w-2xl text-sm leading-7 text-brand-muted/70 space-y-2">
              <p>We can request browser location permission, resolve your city with QWeather, and show live conditions
                here.</p>
              <p>我们会请求浏览器定位权限，用和风天气解析你的城市，并在这里展示当前天气。</p>
            </div>
          </div>
          <button type="button" @click="requestCurrentLocation" :disabled="isLocating"
            aria-label="Use current location / 使用当前位置"
            class="inline-flex items-center justify-center rounded-full border border-brand-primary/20 px-6 py-3 text-xs uppercase tracking-[0.32em] font-bold transition-colors duration-300 hover:bg-brand-primary hover:text-brand-text disabled:cursor-wait disabled:opacity-60">
            {{ isLocating ? 'Locating / 定位中' : 'Use Current Location / 使用当前位置' }}
          </button>
        </div>

        <p v-if="locationErrorMessage" class="mt-5 text-xs tracking-[0.18em] font-bold text-red-400">
          {{ locationErrorMessage }}
        </p>
      </div>

      <div class="flex items-center gap-4 sm:gap-6">
        <div class="w-10 sm:w-12 md:w-16 h-[2px] bg-brand-primary"></div>
        <p class="text-[10px] md:text-xs tracking-[0.26em] sm:tracking-[0.34em] font-bold">SAVED LOCATIONS / 已收藏城市</p>
      </div>

      <Suspense>
        <template #default>
          <CityList />
        </template>
        <template #fallback>
          <CityCardSkeleton />
        </template>
      </Suspense>
    </div>
  </main>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, ref, shallowRef, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import BilingualStack from '@/components/BilingualStack.vue';
  import CityCardSkeleton from '@/components/CityCardSkeleton.vue';
  import CityList from '@/components/CityList.vue';
  import { getSavedCityWeatherSummary, lookupLocationByCoordinates, searchLocations } from '@/features/weather/services/qweather';
  import type { LocationRecord, SavedCityWeatherSummary } from '@/features/weather/types';

  type CurrentLocationWeather = {
    location: LocationRecord;
    weather: SavedCityWeatherSummary;
  };

  const router = useRouter();
  const searchQuery = shallowRef('');
  const searchResults = ref<LocationRecord[]>([]);
  const showTips = shallowRef(false);
  const isLoading = shallowRef(false);
  const isSearching = shallowRef(false);
  const errorMessage = shallowRef('');
  const isLocating = shallowRef(false);
  const locationErrorMessage = shallowRef('');
  const currentLocation = shallowRef<CurrentLocationWeather | null>(null);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let blurTimer: ReturnType<typeof setTimeout> | null = null;

  const getSearchResults = async (keyword: string) => {
    if (!keyword) {
      searchResults.value = [];
      return;
    }

    isLoading.value = true;
    isSearching.value = true;
    errorMessage.value = '';

    try {
      const locations = await searchLocations(keyword);
      const lowerKeyword = keyword.toLowerCase();

      searchResults.value = locations
        .filter((location) => location.name.toLowerCase().includes(lowerKeyword))
        .sort((a, b) => {
          const aStarts = a.name.toLowerCase().startsWith(lowerKeyword);
          const bStarts = b.name.toLowerCase().startsWith(lowerKeyword);
          return aStarts === bStarts ? 0 : aStarts ? -1 : 1;
        });

      showTips.value = searchResults.value.length > 0;
    } catch (error) {
      searchResults.value = [];
      errorMessage.value = error instanceof Error ? error.message : 'Search failed / 搜索失败';
    } finally {
      isLoading.value = false;
      isSearching.value = false;
    }
  };

  const selectTip = (tip: LocationRecord) => {
    openLocation(tip);
    searchQuery.value = tip.name;
    showTips.value = false;
  };

  const openLocation = (location: LocationRecord) => {
    router.push({
      name: 'cityview',
      params: {
        province: location.province || location.name,
        city: location.name,
      },
      query: {
        qid: location.id,
        lat: location.latitude,
        lon: location.longitude,
      },
    });
  };

  const openCurrentLocation = () => {
    if (currentLocation.value) {
      openLocation(currentLocation.value.location);
    }
  };

  const requestCurrentLocation = async () => {
    if (!navigator.geolocation) {
      locationErrorMessage.value = 'Geolocation is not supported in this browser. / 当前浏览器不支持定位。';
      return;
    }

    isLocating.value = true;
    locationErrorMessage.value = '';

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 300000,
        });
      });

      const location = await lookupLocationByCoordinates(
        position.coords.longitude,
        position.coords.latitude
      );

      if (!location) {
        currentLocation.value = null;
        locationErrorMessage.value = 'Unable to match your coordinates to a QWeather city. / 无法将坐标匹配到和风天气城市。';
        return;
      }

      const weather = await getSavedCityWeatherSummary(location);
      if (!weather) {
        currentLocation.value = null;
        locationErrorMessage.value = 'Current location resolved, but weather data is unavailable right now. / 已解析当前位置，但暂时无法获取天气。';
        return;
      }

      currentLocation.value = {
        location,
        weather,
      };
    } catch (error) {
      if (error instanceof GeolocationPositionError) {
        const messageMap: Record<number, string> = {
          [error.PERMISSION_DENIED]: 'Location permission was denied. / 定位权限已被拒绝。',
          [error.POSITION_UNAVAILABLE]: 'Your location could not be determined. / 无法确定当前位置。',
          [error.TIMEOUT]: 'Location request timed out. / 定位请求超时。',
        };

        locationErrorMessage.value = messageMap[error.code] ?? 'Location request failed. / 定位请求失败。';
      } else {
        locationErrorMessage.value = error instanceof Error ? error.message : 'Location request failed. / 定位请求失败。';
      }
    } finally {
      isLocating.value = false;
    }
  };

  const selectFirstTip = () => {
    const firstTip = searchResults.value[0];
    if (firstTip) {
      selectTip(firstTip);
    }
  };

  const onInputFocus = () => {
    if (blurTimer) {
      clearTimeout(blurTimer);
      blurTimer = null;
    }

    if (searchResults.value.length) {
      showTips.value = true;
    }
  };

  const onInputBlur = () => {
    blurTimer = setTimeout(() => {
      showTips.value = false;
    }, 120);
  };

  watch(searchQuery, (value) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const keyword = value.trim();
    if (!keyword) {
      errorMessage.value = '';
      searchResults.value = [];
      showTips.value = false;
      isSearching.value = false;
      return;
    }

    isSearching.value = true;
    debounceTimer = setTimeout(() => {
      void getSearchResults(keyword);
    }, 400);
  });

  onBeforeUnmount(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (blurTimer) {
      clearTimeout(blurTimer);
    }
  });
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
