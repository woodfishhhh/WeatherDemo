<template>
  <div class="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12 mb-10 w-full lg:w-2/3 ml-auto">
    <BilingualStack en="ARCHIVED LOCATIONS" zh="已归档位置" wrapper-class="flex items-center gap-3" en-class="text-xs md:text-sm tracking-[0.4em] font-medium uppercase shrink-0" zh-class="text-sm font-light shrink-0 opacity-60" />
    <div class="flex-1 h-[1px] bg-brand-primary/20 w-full md:w-auto"></div>
  </div>

  <section data-testid="saved-locations-section" class="w-full">
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
  import BilingualStack from '@/components/BilingualStack.vue';
  import CityCardSkeleton from '@/components/CityCardSkeleton.vue';
  import CityList from '@/components/CityList.vue';
  import type { SavedCity } from '@/features/locations/services/persistence';

  const emit = defineEmits<{
    (event: 'open-saved-city', city: SavedCity): void;
  }>();
</script>
