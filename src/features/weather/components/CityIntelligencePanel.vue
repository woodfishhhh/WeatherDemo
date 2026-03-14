<template>
  <PlatformPanel data-testid="city-intelligence-panel" class="p-8 md:p-10">
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-xs tracking-[0.18em] text-brand-muted/75">Weather Intelligence / 天气研判</p>
        <p class="mt-4 text-2xl md:text-3xl font-light tracking-tight">
          Deterministic decision-support cards derived from the normalized forecast.
        </p>
      </div>
      <p class="max-w-xl text-sm leading-7 text-brand-muted/70">
        Precipitation, temperature swing, daylight, comfort, and weather-watch signals stay readable even when some
        upstream fields are missing.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mt-10">
      <article
        v-for="card in intelligence.cards"
        :key="card.id"
        data-testid="city-intelligence-card"
        class="rounded-3xl border px-5 py-6 transition-colors duration-300"
        :class="cardToneClass(card)"
      >
        <p class="text-[10px] uppercase tracking-[0.24em] font-bold text-brand-muted/75">
          {{ card.label }}
        </p>
        <p class="mt-5 text-2xl font-light tracking-tight">
          {{ card.headline }}
        </p>
        <p class="mt-4 text-sm leading-7 text-brand-secondary">
          {{ card.summary }}
        </p>
        <p class="mt-5 text-[11px] leading-6 text-brand-muted/80">
          {{ card.detail }}
        </p>
        <p
          v-if="card.status === 'unavailable'"
          data-testid="city-intelligence-fallback"
          class="mt-5 inline-flex rounded-full border border-brand-primary/18 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-brand-muted/80"
        >
          Fallback / 已降级
        </p>
      </article>
    </div>
  </PlatformPanel>
</template>

<script setup lang="ts">
  import PlatformPanel from '@/components/platform/PlatformPanel.vue';
  import type { CityWeatherIntelligence, WeatherIntelligenceCard } from '@/features/weather/types';

  defineProps<{
    intelligence: CityWeatherIntelligence;
  }>();

  const cardToneClass = (card: WeatherIntelligenceCard): string => {
    if (card.status === 'unavailable') {
      return 'border-brand-primary/10 bg-brand-primary/5';
    }

    if (card.severity === 'high') {
      return 'border-brand-primary/30 bg-brand-primary/12';
    }

    if (card.severity === 'moderate') {
      return 'border-brand-primary/18 bg-brand-primary/8';
    }

    return 'border-brand-primary/10 bg-brand-accent/25';
  };
</script>
