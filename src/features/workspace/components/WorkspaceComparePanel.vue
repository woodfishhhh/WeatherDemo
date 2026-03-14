<script setup lang="ts">
  import PlatformEmptyState from "@/components/platform/PlatformEmptyState.vue";
  import PlatformErrorState from "@/components/platform/PlatformErrorState.vue";
  import PlatformPanel from "@/components/platform/PlatformPanel.vue";
  import PlatformPanelSkeleton from "@/components/platform/PlatformPanelSkeleton.vue";
  import PlatformStatRow from "@/components/platform/PlatformStatRow.vue";
  import WorkspaceTrendMiniPanel from "@/features/workspace/components/WorkspaceTrendMiniPanel.vue";
  import type { SavedCity } from "@/features/locations/services/persistence";
  import { useWeatherDisplayPreferences } from "@/features/settings/composables/useWeatherDisplayPreferences";
  import type { HistoricalTrendPoint, SavedCityWeatherSummary } from "@/features/weather/types";

  type WorkspaceTrendPanelState =
    | {
        status: "loading";
        data: null;
        reason: string;
      }
    | {
        status: "available";
        data: HistoricalTrendPoint[];
      }
    | {
        status: "unavailable";
        data: null;
        reason: string;
      };

  type CompareRecord = {
    city: SavedCity;
    locationId: string;
    summary: SavedCityWeatherSummary | null | undefined;
    trendState: WorkspaceTrendPanelState;
  };

  type CompareMetric = {
    id: string;
    label: string;
    value: string;
    detail: string;
  };

  const props = defineProps<{
    records: CompareRecord[];
    metrics: CompareMetric[];
    reducedMotion: boolean;
  }>();

  const emit = defineEmits<{
    openCity: [city: SavedCity];
    toggleCompare: [locationId: string];
  }>();
  const { formatTemperature, formatWind } = useWeatherDisplayPreferences();
</script>

<template>
  <PlatformPanel
    as="aside"
    data-testid="compare-panel"
    tone="elevated"
    class="px-5 py-6 md:px-6 md:py-7"
  >
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-[10px] uppercase tracking-[0.34em] font-bold text-brand-muted/70">Compare Module / 快速对比</p>
        <h2 class="mt-4 text-2xl md:text-3xl font-light tracking-tight">
          Quiet cross-city signals, kept compact.
        </h2>
      </div>
      <p class="text-sm leading-7 text-brand-muted/68 max-w-md">
        The compare lane reuses the trend system, but it stays list-led and narrow enough to fit beside grouped saved cities.
      </p>
    </div>

    <div v-if="props.records.length" class="mt-8 space-y-4">
      <article
        v-for="record in props.records"
        :key="record.locationId"
      >
        <PlatformPanel tone="soft" shape="card" class="px-4 py-4">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-[10px] uppercase tracking-[0.24em] font-bold text-brand-muted/68">{{ record.city.province }}</p>
              <p class="mt-3 text-2xl font-light tracking-tight">{{ record.city.city }}</p>
              <p v-if="record.summary" class="mt-3 text-sm leading-7 text-brand-muted/68">
                {{ record.summary.textBilingual.en }} · {{ record.summary.humidity }}% humidity · wind {{ formatWind({ scale: record.summary.windScale }) }}
              </p>
              <p v-else-if="record.summary === null" class="mt-3 text-sm leading-7 text-brand-muted/68">
                Summary unavailable / 概览不可用
              </p>
              <p v-else class="mt-3 text-sm leading-7 text-brand-muted/68">Summary loading / 概览加载中</p>
            </div>

            <div class="text-right">
              <p class="text-[10px] uppercase tracking-[0.24em] font-bold text-brand-muted/68">Current / 当前</p>
              <p class="mt-3 text-4xl font-light tracking-tighter">
                {{ record.summary ? formatTemperature(record.summary.temperature) : "--" }}
              </p>
            </div>
          </div>

          <div class="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              class="rounded-full border border-brand-primary/12 px-4 py-3 text-[10px] uppercase tracking-[0.28em] font-bold transition-colors duration-300 hover:bg-brand-primary hover:text-brand-text"
              @click="emit('openCity', record.city)"
            >
              Open / 打开
            </button>
            <button
              type="button"
              class="rounded-full border border-brand-primary/10 px-4 py-3 text-[10px] uppercase tracking-[0.28em] font-bold text-brand-muted/80 transition-colors duration-300 hover:border-brand-primary/28 hover:text-brand-primary"
              @click="emit('toggleCompare', record.locationId)"
            >
              Release / 移出
            </button>
          </div>
        </PlatformPanel>
      </article>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <PlatformStatRow
          v-for="metric in props.metrics"
          :key="metric.id"
          :label="metric.label"
          :value="metric.value"
          :detail="metric.detail"
          tone="transparent"
        />
      </div>

      <div class="grid grid-cols-1 gap-3">
        <template v-for="record in props.records.slice(0, 2)" :key="`${record.locationId}-trend`">
          <WorkspaceTrendMiniPanel
            v-if="record.trendState.status === 'available' && record.trendState.data.length"
            :title="`${record.city.city} / 温度节奏`"
            :caption="`Five-day high and low temperature cadence for ${record.city.city}.`"
            :points="record.trendState.data"
            :reduced-motion="props.reducedMotion"
          />
          <PlatformPanelSkeleton
            v-else-if="record.trendState.status === 'loading'"
            shape="card"
            :lines="2"
          />
          <PlatformErrorState
            v-else
            eyebrow="Trend State / 趋势状态"
            :title="`${record.city.city} / Trend unavailable`"
            :description="record.trendState.status === 'unavailable' ? record.trendState.reason : ''"
          />
        </template>
      </div>
    </div>

    <PlatformEmptyState
      v-else
      class="mt-8"
      eyebrow="Compare Module / 快速对比"
      title="No compare set yet / 还没有对比集合"
      description="Toggle “Compare” on saved city cards and the workspace will build a compact monitoring lane here."
    />
  </PlatformPanel>
</template>
