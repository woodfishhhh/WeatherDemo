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
  import { computed, onMounted, watch } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useRouter } from 'vue-router';
  import BilingualStack from './BilingualStack.vue';
  import CityCard from './CityCard.vue';
  import { useLocationsStore } from '@/features/locations/stores/locations';
  import type { SavedCity } from '@/features/locations/services/persistence';
  import { useWeatherStore } from '@/features/weather/stores/weather';
  import { useWorkspaceStore } from '@/features/workspace/stores/workspace';

  const router = useRouter();
  const locationsStore = useLocationsStore();
  const weatherStore = useWeatherStore();
  const workspaceStore = useWorkspaceStore();
  const { savedCities } = storeToRefs(locationsStore);

  const savedData = computed(() =>
    savedCities.value.map((city) => ({
      ...city,
      weather: weatherStore.getSavedCitySummary(city),
    }))
  );

  onMounted(() => {
    void locationsStore.loadSavedCities();
  });

  watch(
    savedCities,
    (cities) => {
      void weatherStore.hydrateSavedCitySummaries(cities);
    },
    { immediate: true }
  );

  const goToCityView = (city: SavedCity) => {
    workspaceStore.rememberRecentLocation(city.locationId || city.id);
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
    void locationsStore.removeSavedCityById(id);
  };
</script>
