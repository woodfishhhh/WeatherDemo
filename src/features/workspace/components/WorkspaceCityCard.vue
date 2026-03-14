<script setup lang="ts">
  import type { SavedCity } from "@/features/locations/services/persistence";
  import { useWeatherDisplayPreferences } from "@/features/settings/composables/useWeatherDisplayPreferences";
  import type { SavedCityWeatherSummary } from "@/features/weather/types";

  const props = defineProps<{
    city: SavedCity;
    locationId: string;
    summary: SavedCityWeatherSummary | null | undefined;
    isFavorite: boolean;
    isCompared: boolean;
    isRecent: boolean;
  }>();

  const emit = defineEmits<{
    open: [city: SavedCity];
    toggleCompare: [locationId: string];
    toggleFavorite: [locationId: string];
    remove: [cityId: string];
  }>();
  const { formatTemperature, formatWind } = useWeatherDisplayPreferences();
</script>

<template>
  <article
    data-testid="workspace-city-card"
    class="group border border-brand-primary/10 rounded-[2rem] bg-brand-accent/16 px-5 py-6 md:px-6 md:py-7 cursor-pointer transition-colors duration-300 hover:border-brand-primary/30 hover:bg-brand-accent/24"
    @click="emit('open', props.city)"
  >
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-muted/70">{{ props.city.province }}</p>
        <h3 class="mt-4 text-3xl md:text-4xl font-light tracking-tight">{{ props.city.city }}</h3>
      </div>

      <div class="flex flex-wrap justify-end gap-2">
        <span
          v-if="props.isRecent"
          class="rounded-full border border-brand-primary/10 px-3 py-2 text-[10px] uppercase tracking-[0.22em] font-bold text-brand-muted/70"
        >
          Recent / 最近
        </span>
        <span
          v-if="props.isFavorite"
          class="rounded-full border border-brand-primary/14 px-3 py-2 text-[10px] uppercase tracking-[0.22em] font-bold"
        >
          Favorite / 关注
        </span>
      </div>
    </div>

    <div class="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-[1.15fr_0.85fr] sm:items-end">
      <div v-if="props.summary" class="space-y-4">
        <div class="flex items-center gap-3">
          <i :class="`qi-${props.summary.icon}`" class="weather-glyph text-3xl"></i>
          <div>
            <p class="text-[10px] uppercase tracking-[0.24em] font-bold text-brand-secondary/85">
              {{ props.summary.textBilingual.en }}
            </p>
            <p class="mt-1 text-lg font-light tracking-[0.08em]">{{ props.summary.textBilingual.zh }}</p>
          </div>
        </div>
        <p class="text-sm leading-7 text-brand-muted/68">
          Humidity {{ props.summary.humidity }}% · Wind {{ formatWind({ scale: props.summary.windScale }) }}
        </p>
      </div>

      <div v-else-if="props.summary === null" class="space-y-3">
        <p class="text-xl font-light tracking-tight">Summary unavailable / 概览不可用</p>
        <p class="text-sm leading-7 text-brand-muted/68">
          The saved city is available, but its compact weather summary could not be resolved in this session.
        </p>
      </div>

      <div v-else class="space-y-3">
        <p class="text-xl font-light tracking-tight">Summary loading / 概览加载中</p>
        <p class="text-sm leading-7 text-brand-muted/68">
          Live summary data will hydrate here as the saved city cards settle.
        </p>
      </div>

      <div class="sm:text-right">
        <p class="text-[10px] uppercase tracking-[0.24em] font-bold text-brand-muted/70">Current / 当前</p>
        <p class="mt-3 text-5xl md:text-6xl font-light tracking-tighter">
          {{ props.summary ? formatTemperature(props.summary.temperature) : "--" }}
        </p>
      </div>
    </div>

    <div class="mt-8 flex flex-wrap gap-3">
      <button
        type="button"
        class="rounded-full border border-brand-primary/12 px-4 py-3 text-[10px] uppercase tracking-[0.28em] font-bold transition-colors duration-300 hover:bg-brand-primary hover:text-brand-text"
        @click.stop="emit('toggleFavorite', props.locationId)"
      >
        {{ props.isFavorite ? "Favorited / 已关注" : "Favorite / 关注" }}
      </button>
      <button
        type="button"
        class="rounded-full border border-brand-primary/12 px-4 py-3 text-[10px] uppercase tracking-[0.28em] font-bold transition-colors duration-300 hover:bg-brand-primary hover:text-brand-text"
        @click.stop="emit('toggleCompare', props.locationId)"
      >
        {{ props.isCompared ? "Comparing / 对比中" : "Compare / 对比" }}
      </button>
      <button
        type="button"
        class="rounded-full border border-brand-primary/10 px-4 py-3 text-[10px] uppercase tracking-[0.28em] font-bold text-brand-muted/80 transition-colors duration-300 hover:border-brand-primary/28 hover:text-brand-primary"
        @click.stop="emit('remove', props.city.id)"
      >
        Remove / 移除
      </button>
    </div>
  </article>
</template>

<style scoped>
  .weather-glyph {
    line-height: 1;
  }
</style>
