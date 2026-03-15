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

  type CompareDelta = {
    id: string;
    label: string;
    value: string;
    detail: string;
  };

  type ComparePreset = {
    label: string;
    description: string;
    cityNames: string[];
    compareQuery: string;
  };

  type TrendInsight = {
    locationId: string;
    headline: string;
    summary: string;
    detail: string;
    status: "available" | "loading" | "unavailable";
  };

  const props = defineProps<{
    deltas: CompareDelta[];
    records: CompareRecord[];
    metrics: CompareMetric[];
    preset: ComparePreset | null;
    reducedMotion: boolean;
    trendInsights: TrendInsight[];
  }>();

  const emit = defineEmits<{
    openCity: [city: SavedCity];
    toggleCompare: [locationId: string];
  }>();
  const { formatTemperature, formatWind } = useWeatherDisplayPreferences();

  const findTrendInsight = (locationId: string): TrendInsight | undefined =>
    props.trendInsights.find((insight) => insight.locationId === locationId);
</script>

<template>
  <PlatformPanel
    as="aside"
    data-testid="compare-panel"
    tone="elevated"
    class="overflow-hidden px-5 py-6 md:px-6 md:py-7"
  >
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div class="min-w-0 space-y-4">
        <BilingualStack
          en="Compare Module"
          zh="快速对比"
          wrapper-class="flex flex-col gap-2"
          en-class="text-[10px] uppercase tracking-[0.34em] font-bold text-brand-muted/70"
          zh-class="text-xs font-zh-weight text-brand-muted/60"
        />
        <h2 class="break-words text-2xl md:text-3xl font-light tracking-tight">
          Quiet cross-city signals, kept compact.
        </h2>
      </div>
      <BilingualStack
        en="The compare lane reuses the trend system, but it stays list-led and narrow enough to fit beside grouped saved cities."
        zh="对比面板复用了趋势系统，采用列表主导的紧凑布局，恰好安放在城市分组旁。"
        wrapper-class="flex flex-col gap-2 md:text-right"
        en-class="text-sm leading-7 text-brand-muted/68 max-w-md"
        zh-class="text-sm leading-7 text-brand-muted/60 max-w-md"
      />
    </div>

    <div
      v-if="props.preset"
      data-testid="workspace-compare-preset"
      class="mt-8 rounded-[1.6rem] border border-brand-primary/10 bg-brand-accent/10 px-4 py-5"
    >
      <div class="flex flex-col gap-4">
        <div class="min-w-0 space-y-3">
          <BilingualStack
            en="Active Preset"
            zh="当前预设"
            wrapper-class="flex flex-col gap-1"
            en-class="text-[10px] uppercase tracking-[0.28em] font-bold text-brand-muted/70"
            zh-class="text-xs font-zh-weight text-brand-muted/60"
          />
          <p class="break-words text-2xl font-light tracking-tight">{{ props.preset.label }}</p>
        </div>
        <p class="text-sm leading-7 text-brand-muted/68">{{ props.preset.description }}</p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="cityName in props.preset.cityNames"
            :key="cityName"
            class="rounded-full border border-brand-primary/10 px-3 py-2 text-[10px] uppercase tracking-[0.22em] font-bold text-brand-muted/78"
          >
            {{ cityName }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="props.records.length" class="mt-8 space-y-4">
      <article
        v-for="record in props.records"
        :key="record.locationId"
      >
        <PlatformPanel tone="soft" shape="card" class="px-4 py-4">
          <div class="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0">
              <p class="truncate text-[10px] uppercase tracking-[0.24em] font-bold text-brand-muted/68">{{ record.city.province }}</p>
              <p class="mt-3 break-words text-2xl font-light tracking-tight">{{ record.city.city }}</p>
              <BilingualStack
                v-if="record.summary"
                :en="`${record.summary.textBilingual.en} · ${record.summary.humidity}% humidity · wind ${formatWind({ scale: record.summary.windScale })}`"
                :zh="`${record.summary.textBilingual.zh} · 湿度 ${record.summary.humidity}% · 风力 ${record.summary.windScale} 级`"
                wrapper-class="flex flex-col gap-1 mt-3"
                en-class="text-sm leading-7 text-brand-muted/68"
                zh-class="text-xs leading-6 text-brand-muted/60"
              />
              <BilingualStack
                v-else-if="record.summary === null"
                en="Summary unavailable"
                zh="概览不可用"
                wrapper-class="flex flex-col gap-1 mt-3"
                en-class="text-sm leading-7 text-brand-muted/68"
                zh-class="text-xs leading-6 text-brand-muted/60"
              />
              <BilingualStack
                v-else
                en="Summary loading..."
                zh="概览加载中..."
                wrapper-class="flex flex-col gap-1 mt-3"
                en-class="text-sm leading-7 text-brand-muted/68"
                zh-class="text-xs leading-6 text-brand-muted/60"
              />
            </div>

            <div class="min-w-0 text-left sm:text-right">
              <BilingualStack
                en="Current"
                zh="当前"
                wrapper-class="flex flex-col gap-1 sm:items-end"
                en-class="text-[10px] uppercase tracking-[0.24em] font-bold text-brand-muted/68"
                zh-class="text-[10px] font-zh-weight text-brand-muted/50"
              />
              <p class="mt-3 max-w-full break-words text-[clamp(3rem,14vw,4rem)] font-light tracking-tighter">
                {{ record.summary ? formatTemperature(record.summary.temperature) : "--" }}
              </p>
            </div>
          </div>

          <div class="mt-5 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap">
            <button
              type="button"
              class="flex w-full flex-col items-center gap-1 rounded-full border border-brand-primary/12 px-4 py-3 text-[10px] uppercase tracking-[0.28em] font-bold transition-colors duration-300 hover:bg-brand-primary hover:text-brand-text sm:w-auto sm:min-w-[5rem]"
              @click="emit('openCity', record.city)"
            >
              <span>OPEN</span>
              <span class="text-[8px] font-zh-weight opacity-60 font-sans tracking-normal">打开</span>
            </button>
            <button
              type="button"
              class="flex w-full flex-col items-center gap-1 rounded-full border border-brand-primary/10 px-4 py-3 text-[10px] uppercase tracking-[0.28em] font-bold text-brand-muted/80 transition-colors duration-300 hover:border-brand-primary/28 hover:text-brand-primary sm:w-auto sm:min-w-[5rem]"
              @click="emit('toggleCompare', record.locationId)"
            >
              <span>RELEASE</span>
              <span class="text-[8px] font-zh-weight opacity-60 font-sans tracking-normal">移出</span>
            </button>
          </div>
        </PlatformPanel>
      </article>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div v-for="metric in props.metrics" :key="metric.id" data-testid="workspace-ranking-card">
          <PlatformStatRow
            :label="metric.label"
            :value="metric.value"
            :detail="metric.detail"
            tone="transparent"
          />
        </div>
      </div>

      <div v-if="props.deltas.length" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div v-for="delta in props.deltas" :key="delta.id" data-testid="workspace-delta-card">
          <PlatformStatRow
            :label="delta.label"
            :value="delta.value"
            :detail="delta.detail"
            tone="transparent"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3">
        <template v-for="record in props.records.slice(0, 2)" :key="`${record.locationId}-trend`">
          <div class="space-y-3">
            <PlatformPanel data-testid="workspace-trend-insight" tone="soft" shape="card" class="px-4 py-4">
              <BilingualStack
                en="Trend Insight"
                zh="趋势速览"
                wrapper-class="flex flex-col gap-1"
                en-class="text-[10px] uppercase tracking-[0.28em] font-bold text-brand-muted/70"
                zh-class="text-[10px] font-zh-weight text-brand-muted/60"
              />
              <p class="mt-3 break-words text-2xl font-light tracking-tight">
                {{ findTrendInsight(record.locationId)?.headline ?? "Trend snapshot" }}
              </p>
              <BilingualStack
                :en="findTrendInsight(record.locationId)?.summary ?? 'Trend insight is hydrating for this compare city.'"
                :zh="findTrendInsight(record.locationId)?.summary ? '' : '正在生成该城市的趋势快照。'"
                wrapper-class="flex flex-col gap-1 mt-3"
                en-class="text-sm leading-7 text-brand-muted/68"
                zh-class="text-xs leading-6 text-brand-muted/60"
              />
              <p class="mt-3 text-[11px] leading-6 text-brand-muted/70">
                {{ findTrendInsight(record.locationId)?.detail ?? record.city.city }}
              </p>
            </PlatformPanel>

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
          </div>
        </template>
      </div>
    </div>

      <div v-else class="mt-8" data-testid="workspace-compare-empty">
        <PlatformEmptyState
          eyebrow="Compare Module / 快速对比"
          title="No compare set yet / 还没有对比集合"
          description="Toggle “Compare” on saved city cards and the workspace will build a compact monitoring lane here. / 在右侧卡片中点击“加入对比”，在此处构建你的专属监测面板。"
        />
      </div>
  </PlatformPanel>
</template>
