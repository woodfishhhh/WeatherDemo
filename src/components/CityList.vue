<template>
  <div class="flex-1 flex flex-col gap-0">
    <CityCard v-for="city in savedData" :key="city.id" :city="city" @click="goToCityView(city)" @delete="handleDelete" />

    <div v-if="savedData.length === 0" class="mt-10 sm:mt-12">
      <BilingualStack
        en="No Saved Locations"
        zh="暂无已收藏城市"
        wrapper-class="flex flex-col gap-2"
        en-class="text-xs uppercase tracking-[0.28em] sm:tracking-[0.3em] font-medium text-brand-muted/50"
        zh-class="text-sm font-light text-brand-muted/60"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import BilingualStack from './BilingualStack.vue';
  import CityCard from './CityCard.vue';
  import { getSavedCityWeatherSummary, resolveLocation } from '@/features/weather/services/qweather';
  import type { SavedCityWeatherSummary } from '@/features/weather/types';
  import { getSavedCitiesSnapshot, loadSavedCitiesWithSync, saveSavedCities, type SavedCity } from '@/services/savedCities';

  type SavedCityWithWeather = SavedCity & {
    weather?: SavedCityWeatherSummary | null;
  };

  const savedData = ref<SavedCityWithWeather[]>(getSavedCitiesSnapshot());
  const router = useRouter();

  const hydrateWeather = async () => {
    if (!savedData.value.length) {
      return;
    }

    const nextData = await Promise.all(
      savedData.value.map(async (city) => {
        try {
          const location =
            city.locationId && city.latitude && city.longitude
              ? {
                  id: city.locationId,
                  name: city.city,
                  province: city.province,
                  latitude: city.latitude,
                  longitude: city.longitude,
                  timezone: city.timezone,
                  country: city.country,
                }
              : await resolveLocation({
                  id: city.locationId,
                  city: city.city,
                  province: city.province,
                });

          if (!location) {
            return city;
          }

          const weather = await getSavedCityWeatherSummary(location);

          return {
            ...city,
            locationId: location.id,
            latitude: location.latitude,
            longitude: location.longitude,
            timezone: location.timezone,
            country: location.country,
            weather,
          };
        } catch {
          return {
            ...city,
            weather: null,
          };
        }
      })
    );

    savedData.value = nextData;
    const persistedCities = nextData.map(({ weather, ...city }) => city);
    void saveSavedCities(persistedCities);
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

  const goToCityView = (city: SavedCity) => {
    router.push({
      name: 'cityview',
      params: { province: city.province, city: city.city },
      query: {
        id: city.id,
        qid: city.locationId,
        lat: city.latitude,
        lon: city.longitude,
      },
    });
  };

  const handleDelete = (id: string) => {
    savedData.value = savedData.value.filter((city) => city.id !== id);
    const persistedCities = savedData.value.map(({ weather, ...city }) => city);
    void saveSavedCities(persistedCities);
  };
</script>
