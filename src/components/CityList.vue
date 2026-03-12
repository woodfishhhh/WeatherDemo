<template>
  <div class="flex-1 flex flex-col gap-0">
    <CityCard v-for="city in savedData" :key="city.id" :city="city" @click="goToCityView(city)"
      @delete="handleDelete" />

    <p v-if="savedData.length === 0" class="text-xs uppercase tracking-[0.3em] font-medium text-brand-muted/50 mt-12">
      No Locations Saved
    </p>
  </div>
</template>

<script setup lang="ts">
  import axios from 'axios';
  import { onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import CityCard from './CityCard.vue';
  import { getSavedCitiesSnapshot, loadSavedCitiesWithSync, saveSavedCities, type SavedCity } from '@/services/savedCities';

  type SavedCityWithWeather = SavedCity & {
    weather?: unknown;
  };

  const savedData = ref<SavedCityWithWeather[]>(getSavedCitiesSnapshot());
  const gaodeKey = import.meta.env.VITE_GAODE_KEY;

  const hydrateWeather = async () => {
    if (!savedData.value.length) {
      return;
    }

    const baseCities = [...savedData.value];
    const requests = baseCities.map((city) =>
      axios.get(`${import.meta.env.VITE_AMAP_BASE_URL}/weather/weatherInfo`, {
        params: { key: gaodeKey, city: city.city, extensions: 'base' }
      })
    );

    const weatherData = await Promise.all(requests);
    savedData.value = baseCities.map((city, index) => ({
      ...city,
      weather: weatherData[index]?.data,
    }));
  };

  onMounted(() => {
    void hydrateWeather();
    void loadSavedCitiesWithSync({
      onCloudUpdate: (cities) => {
        savedData.value = cities;
        void hydrateWeather();
      },
    });
  });

  const router = useRouter();
  const goToCityView = (city: SavedCity) => {
    router.push({
      name: 'cityview',
      params: { province: city.province, city: city.city },
      query: { id: city.id, adcode: city.adcode },
    });
  };

  const handleDelete = (id: string) => {
    savedData.value = savedData.value.filter((c: SavedCityWithWeather) => c.id !== id);
    void saveSavedCities(savedData.value);
  };
</script>
