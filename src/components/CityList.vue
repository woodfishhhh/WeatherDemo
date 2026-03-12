<template>
  <div class="flex-1 flex flex-col gap-0">
    <CityCard v-for="city in savedData" :key="city.id" :city="city" @click="goToCityView(city)"
      @delete="handleDelete" />

    <p v-if="savedData.length === 0" class="text-xs uppercase tracking-[0.3em] font-medium text-brand-muted/50 mt-12">
      No Locations Saved
    </p>
  </div>
</template>

<script setup>
  import axios from 'axios';
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import CityCard from './CityCard.vue';
  import { loadSavedCities, saveSavedCities } from '@/services/savedCities';

  const savedData = ref([]);
  const gaodeKey = import.meta.env.VITE_GAODE_KEY;

  const getCityData = async () => {
    savedData.value = await loadSavedCities();
    if (!savedData.value.length) {
      return;
    }

    const requests = [];
    savedData.value.forEach((city) => {
      requests.push(
        axios.get(`${import.meta.env.VITE_AMAP_BASE_URL}/weather/weatherInfo`, {
          params: { key: gaodeKey, city: city.city, extensions: 'base' }
        })
      );
    });

    const weatherData = await Promise.all(requests);
    weatherData.forEach((value, index) => {
      savedData.value[index].weather = value.data;
    });
  };

  await getCityData();

  const router = useRouter();
  const goToCityView = (city) => {
    router.push({
      name: 'cityview',
      params: { province: city.province, city: city.city },
      query: { id: city.id, adcode: city.adcode },
    });
  };

  const handleDelete = async (id) => {
    savedData.value = savedData.value.filter(c => c.id !== id);
    await saveSavedCities(savedData.value);
  };
</script>
