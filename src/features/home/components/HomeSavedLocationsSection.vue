<template>
  <div class="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12 mb-10 w-full lg:w-2/3 ml-auto">
    <BilingualStack en="ARCHIVED LOCATIONS" zh="已归档位置" wrapper-class="flex items-center gap-3" en-class="text-xs md:text-sm tracking-[0.4em] font-medium uppercase shrink-0" zh-class="text-sm font-zh-weight shrink-0 opacity-60" />
    <div class="flex-1 h-[1px] bg-brand-primary/20 w-full md:w-auto"></div>
  </div>

  <section data-testid="saved-locations-section" class="w-full">
    <div
      v-if="props.savedCityIntelligence"
      data-testid="saved-city-intelligence-strip"
      class="mb-8 rounded-[2rem] border border-brand-primary/10 bg-brand-accent/14 px-6 py-6 md:px-8"
      :data-severity="props.savedCityIntelligence.severity"
    >
      <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div class="space-y-3">
          <BilingualStack
            en="Highest Saved-City Watch"
            zh="收藏城市优先关注"
            wrapper-class="flex flex-col gap-1"
            en-class="text-[10px] uppercase tracking-[0.28em] font-bold text-brand-muted/70"
            zh-class="text-xs font-zh-weight text-brand-muted/60"
          />
          <p class="text-3xl md:text-4xl font-light tracking-tight">{{ props.savedCityIntelligence.city.city }}</p>
          <p class="text-sm leading-7 text-brand-muted/68">{{ props.savedCityIntelligence.summaryEn }}</p>
          <p class="text-xs leading-6 text-brand-muted/60">{{ props.savedCityIntelligence.summaryZh }}</p>
          <p class="text-[11px] uppercase tracking-[0.18em] text-brand-muted/72">
            {{ props.savedCityIntelligence.detail }}
          </p>
        </div>

        <button
          type="button"
          data-testid="open-risk-city-button"
          class="inline-flex items-center justify-center rounded-full border border-brand-primary/14 px-5 py-3 text-[10px] uppercase tracking-[0.28em] font-bold transition-colors duration-300 hover:bg-brand-primary hover:text-brand-text"
          @click="emit('open-saved-city', props.savedCityIntelligence.city)"
        >
          Inspect City / 查看城市
        </button>
      </div>
    </div>

    <div
      v-else
      data-testid="saved-city-intelligence-fallback"
      class="mb-8 rounded-[2rem] border border-dashed border-brand-primary/10 px-6 py-6 md:px-8"
    >
      <BilingualStack
        en="Saved-city intelligence will appear here once saved locations hydrate."
        zh="已收藏城市的风险摘要会在收藏列表完成加载后出现在这里。"
        wrapper-class="flex flex-col gap-2"
        en-class="text-sm leading-7 text-brand-muted/68"
        zh-class="text-xs leading-6 text-brand-muted/60"
      />
    </div>

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
  import type { HomeSavedCityIntelligence } from '@/features/home/utils/homeWorkspaceIntelligence';
  import type { SavedCity } from '@/features/locations/services/persistence';

  const props = defineProps<{
    savedCityIntelligence: HomeSavedCityIntelligence | null;
  }>();

  const emit = defineEmits<{
    (event: 'open-saved-city', city: SavedCity): void;
  }>();
</script>
