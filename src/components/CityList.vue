<template>
  <div class="flex-1 flex flex-col gap-0">
    <CityCard v-for="city in savedData" :key="city.id" :city="city" @click="emit('open-city', city)" @delete="handleDelete" />

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
  import BilingualStack from './BilingualStack.vue';
  import CityCard from './CityCard.vue';
  import { useLocationsStore } from '@/features/locations/stores/locations';
  import type { SavedCity } from '@/features/locations/services/persistence';
  import { useWeatherStore } from '@/features/weather/stores/weather';

  const locationsStore = useLocationsStore();
  const weatherStore = useWeatherStore();
  const { savedCities } = storeToRefs(locationsStore);
  const emit = defineEmits<{
    (event: 'open-city', city: SavedCity): void;
  }>();

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

  const handleDelete = (id: string) => {
    void locationsStore.removeSavedCityById(id);
  };
</script>
