<script setup lang="ts">
  import type { SavedCity } from "@/features/locations/services/persistence";
  import { useWeatherDisplayPreferences } from "@/features/settings/composables/useWeatherDisplayPreferences";
  import BilingualStack from "@/components/BilingualStack.vue";
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
    class="group border border-brand-primary/10 rounded-[2rem] bg-brand-accent/16 px-5 py-6 md:px-6 md:py-7 cursor-pointer transition-colors duration-300 hover:border-brand-primary/30 hover:bg-brand-accent/24 flex flex-col"
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
          class="rounded-full border border-brand-primary/10 px-3 py-2 text-[10px] uppercase tracking-[0.22em] font-bold text-brand-muted/70 flex items-center gap-1"
        >
          <span>RECENT</span>
          <span class="font-light tracking-normal opacity-70">最近</span>
        </span>
        <span
          v-if="props.isFavorite"
          class="rounded-full border border-brand-primary/14 px-3 py-2 text-[10px] uppercase tracking-[0.22em] font-bold flex items-center gap-1"
        >
          <span>FAVORITE</span>
          <span class="font-light tracking-normal opacity-80">关注</span>
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
        <BilingualStack
          :en="`Humidity ${props.summary.humidity}% · Wind ${formatWind({ scale: props.summary.windScale })}`"
          :zh="`湿度 ${props.summary.humidity}% · 风力 ${props.summary.windScale} 级`"
          wrapper-class="flex flex-col gap-1"
          en-class="text-sm leading-7 text-brand-muted/68"
          zh-class="text-xs leading-6 text-brand-muted/60"
        />
      </div>

      <div v-else-if="props.summary === null" class="space-y-3">
        <BilingualStack
          en="Summary unavailable"
          zh="概览不可用"
          wrapper-class="flex flex-col gap-1"
          en-class="text-xl font-light tracking-tight"
          zh-class="text-lg font-light tracking-tight text-brand-muted/80"
        />
        <BilingualStack
          en="The saved city is available, but its compact weather summary could not be resolved in this session."
          zh="该城市的信息存在，但当前会话无法解析其天气概览。"
          wrapper-class="flex flex-col gap-1"
          en-class="text-sm leading-7 text-brand-muted/68"
          zh-class="text-xs leading-6 text-brand-muted/60"
        />
      </div>

      <div v-else class="space-y-3">
        <BilingualStack
          en="Summary loading..."
          zh="概览加载中..."
          wrapper-class="flex flex-col gap-1"
          en-class="text-xl font-light tracking-tight"
          zh-class="text-lg font-light tracking-tight text-brand-muted/80"
        />
        <BilingualStack
          en="Live summary data will hydrate here as the saved city cards settle."
          zh="预加载数据正准备呈现。"
          wrapper-class="flex flex-col gap-1"
          en-class="text-sm leading-7 text-brand-muted/68"
          zh-class="text-xs leading-6 text-brand-muted/60"
        />
      </div>

      <div class="sm:text-right">
        <BilingualStack
          en="Current"
          zh="当前"
          wrapper-class="flex flex-col gap-1 sm:items-end"
          en-class="text-[10px] uppercase tracking-[0.24em] font-bold text-brand-muted/70"
          zh-class="text-xs font-light text-brand-muted/60"
        />
        <p class="mt-3 text-5xl md:text-6xl font-light tracking-tighter">
          {{ props.summary ? formatTemperature(props.summary.temperature) : "--" }}
        </p>
      </div>
    </div>

    <div class="mt-auto pt-8 flex flex-wrap gap-3">
      <button
        type="button"
        class="rounded-full border border-brand-primary/12 px-4 py-3 text-[10px] uppercase tracking-[0.28em] font-bold transition-colors duration-300 hover:bg-brand-primary hover:text-brand-text flex items-center gap-1.5"
        @click.stop="emit('toggleFavorite', props.locationId)"
      >
        <span>{{ props.isFavorite ? "FAVORITED" : "FAVORITE" }}</span>
        <span class="font-light tracking-normal opacity-70 font-sans">{{ props.isFavorite ? "已关注" : "关注" }}</span>
      </button>
      <button
        type="button"
        class="rounded-full border border-brand-primary/12 px-4 py-3 text-[10px] uppercase tracking-[0.28em] font-bold transition-colors duration-300 hover:bg-brand-primary hover:text-brand-text flex items-center gap-1.5"
        @click.stop="emit('toggleCompare', props.locationId)"
      >
        <span>{{ props.isCompared ? "COMPARING" : "COMPARE" }}</span>
        <span class="font-light tracking-normal opacity-70 font-sans">{{ props.isCompared ? "对比中" : "对比" }}</span>
      </button>
      <button
        type="button"
        class="rounded-full border border-brand-primary/10 px-4 py-3 text-[10px] uppercase tracking-[0.28em] font-bold text-brand-muted/80 transition-colors duration-300 hover:border-brand-primary/28 hover:text-brand-primary flex items-center gap-1.5"
        @click.stop="emit('remove', props.city.id)"
      >
        <span>REMOVE</span>
        <span class="font-light tracking-normal opacity-70 font-sans">移除</span>
      </button>
    </div>
  </article>
</template>

<style scoped>
  .weather-glyph {
    line-height: 1;
  }
</style>
