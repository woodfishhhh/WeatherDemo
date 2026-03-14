<template>
  <div class="flex items-center gap-4 sm:gap-6">
    <div class="w-10 sm:w-12 md:w-16 h-[2px] bg-brand-primary"></div>
    <p class="text-[10px] md:text-xs tracking-[0.26em] sm:tracking-[0.34em] font-bold">SAVED LOCATIONS / 已收藏城市</p>
  </div>

  <section data-testid="saved-locations-section">
    <Suspense>
      <template #default>
        <CityList @open-city="emit('open-saved-city', $event)" />
      </template>
      <template #fallback>
        <CityCardSkeleton />
      </template>
    </Suspense>
  </section>
</template>

<script setup lang="ts">
  import CityCardSkeleton from '@/components/CityCardSkeleton.vue';
  import CityList from '@/components/CityList.vue';
  import type { SavedCity } from '@/features/locations/services/persistence';

  const emit = defineEmits<{
    (event: 'open-saved-city', city: SavedCity): void;
  }>();
</script>
