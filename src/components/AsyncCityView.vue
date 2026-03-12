<template>
  <div class="flex flex-col flex-1 pb-32">
    <!-- Preview Banner -->
    <div v-if="!isSaved" class="w-full bg-brand-primary text-surface py-3 text-center z-20">
      <p class="text-xs uppercase tracking-[0.3em] font-bold">Preview Mode — City not saved</p>
    </div>

    <!-- Current Weather -->
    <div class="container relative z-10 pt-24" v-if="weatherData?.current?.lives?.length">
      <div class="flex items-end justify-between mb-12 ml-[-4px]">
        <h1 class="text-[12vw] md:text-9xl font-bold tracking-tighter leading-none">{{ route.params.city }}</h1>
        <button @click="toggleSaveCity"
          class="mb-2 px-6 py-2 border border-brand-primary rounded-full hover:bg-brand-primary hover:text-surface transition-colors duration-300 text-sm tracking-widest uppercase">
          {{ isSaved ? '已收藏' : '收藏' }}
        </button>
      </div>

      <div
        class="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-start border-t-2 border-brand-primary/10 pt-12">

        <div class="col-span-1 md:col-span-3">
          <p class="text-[5vw] md:text-5xl font-light tracking-tight pb-4 border-b border-brand-primary/10">{{
            weatherData.current.lives[0].weather }}</p>
          <div class="mt-4 flex flex-col gap-2">
            <p class="text-xs uppercase tracking-[0.2em] font-medium text-brand-muted/50">Current Condition</p>
            <p class="text-sm font-light mt-4">Humidity: {{ weatherData.current.lives[0].humidity }}%</p>
            <p class="text-sm font-light">Wind: {{ weatherData.current.lives[0].winddirection }} {{
              weatherData.current.lives[0].windpower }}</p>
          </div>
        </div>

        <div class="col-span-1 md:col-span-6 flex justify-center md:justify-end md:pr-16">
          <p class="text-[25vw] md:text-[15rem] leading-none font-light tracking-tighter select-none">{{
            weatherData.current.lives[0].temperature }}&deg;</p>
        </div>

        <div class="col-span-1 md:col-span-3 flex flex-col justify-end h-full">
          <p class="text-xs uppercase tracking-widest text-brand-muted/40 mb-2">Location details</p>
          <p class="text-lg font-light">{{ weatherData.current.lives[0].province }}</p>
          <p class="text-sm font-light text-brand-muted/60 mt-1">Report Time: {{ weatherData.current.lives[0].reporttime
          }}</p>
        </div>
      </div>
    </div>

    <!-- Forecast Section -->
    <div class="container mt-32" v-if="weatherData?.forecast?.forecasts?.length">
      <div class="w-full flex items-center justify-between border-b-2 border-brand-primary pb-6 mb-12">
        <h2 class="text-xl md:text-3xl font-light tracking-tight">Extended Forecast</h2>
        <p class="text-xs uppercase tracking-widest text-brand-muted/50 hidden md:block">Next 4 Days</p>
      </div>

      <div class="flex flex-col w-full">
        <div v-for="(cast, index) in weatherData.forecast.forecasts[0].casts" :key="index"
          class="grid grid-cols-2 md:grid-cols-5 gap-4 items-center py-10 border-b border-brand-primary/10 group cursor-default hover:bg-brand-primary/5 transition-colors duration-500 px-4 md:px-8 -mx-4 md:-mx-8">

          <div class="col-span-2 md:col-span-1">
            <p class="text-xl md:text-2xl font-light tracking-tight">{{ cast.date }}</p>
            <p class="text-[10px] md:text-xs uppercase tracking-[0.2em] text-brand-muted/40 mt-2">Day {{ cast.week }}
            </p>
          </div>

          <div class="col-span-1 hidden md:flex flex-col">
            <p class="text-lg font-light">{{ cast.dayweather }}</p>
            <p class="text-[10px] uppercase tracking-[0.2em] text-brand-muted/40 mt-2">Daytime</p>
          </div>

          <div class="col-span-1 hidden md:flex flex-col">
            <p class="text-lg font-light">{{ cast.nightweather }}</p>
            <p class="text-[10px] uppercase tracking-[0.2em] text-brand-muted/40 mt-2">Nighttime</p>
          </div>

          <div class="col-span-1 flex flex-col items-end md:items-start text-right md:text-left">
            <p class="text-sm font-light">Wind {{ cast.daywind }} {{ cast.daypower }}</p>
            <p class="text-[10px] uppercase tracking-[0.2em] text-brand-muted/40 mt-2">Conditions</p>
          </div>

          <div class="col-span-1 flex justify-end md:justify-end items-center gap-6">
            <div class="text-right">
              <span class="text-brand-muted/40 text-sm mr-2">↑</span>
              <span class="text-3xl font-light">{{ cast.daytemp }}&deg;</span>
            </div>
            <div class="text-right">
              <span class="text-brand-muted/40 text-sm mr-2">↓</span>
              <span class="text-3xl font-light text-brand-muted/60">{{ cast.nighttemp }}&deg;</span>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!weatherData?.current?.lives?.length" class="container pt-32 pb-32 flex justify-center">
      <p class="text-xs uppercase tracking-[0.3em] font-medium text-brand-muted/50">No data available for this region
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import axios from 'axios';
  import { useRoute, useRouter } from 'vue-router';
  import { computed, onMounted, ref } from 'vue';
  import { uid } from 'uid';
  import { getSavedCitiesSnapshot, loadSavedCitiesWithSync, saveSavedCities, type SavedCity } from '@/services/savedCities';

  const gaodeKey = import.meta.env.VITE_GAODE_KEY;
  const route = useRoute();
  const router = useRouter();

  const getWeatherData = async (cityParam: string) => {
    try {
      const [currentRes, forecastRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_AMAP_BASE_URL}/weather/weatherInfo`, {
          params: { key: gaodeKey, city: cityParam, extensions: 'base' },
        }),
        axios.get(`${import.meta.env.VITE_AMAP_BASE_URL}/weather/weatherInfo`, {
          params: { key: gaodeKey, city: cityParam, extensions: 'all' },
        })
      ]);

      return {
        current: currentRes.data,
        forecast: forecastRes.data
      };
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  const weatherData = await getWeatherData(route.params.city as string);

  const savedCities = ref<SavedCity[]>(getSavedCitiesSnapshot());
  const isSaved = computed(() => savedCities.value.some((city: SavedCity) =>
    (city.adcode && route.query.adcode && city.adcode === route.query.adcode) ||
    (city.province === route.params.province && city.city === route.params.city)
  ));

  const toggleSaveCity = async () => {
    const locationObj: SavedCity = {
      id: typeof route.query.id === 'string' ? route.query.id : uid(),
      province: route.params.province as string,
      city: route.params.city as string,
      adcode: typeof route.query.adcode === 'string' ? route.query.adcode : undefined,
    };

    const existingIndex = savedCities.value.findIndex((city: SavedCity) =>
      (city.adcode && locationObj.adcode && city.adcode === locationObj.adcode) ||
      (city.province === locationObj.province && city.city === locationObj.city)
    );

    if (existingIndex !== -1) {
      const nextCities = savedCities.value.filter((_: SavedCity, index: number) => index !== existingIndex);
      savedCities.value = nextCities;
      void saveSavedCities(nextCities);
    } else {
      const nextCities = [...savedCities.value, locationObj];
      savedCities.value = nextCities;
      void saveSavedCities(nextCities);

      let query = Object.assign({}, route.query);
      delete query.adcode;
      router.replace({ query });
    }
  };

  onMounted(() => {
    window.scrollTo(0, 0);
    void loadSavedCitiesWithSync({
      onCloudUpdate: (cities) => {
        savedCities.value = cities;
      },
    });
  });
</script>
