<template>
  <div class="flex flex-col flex-1 pb-32">
    <Transition name="banner-slide">
      <div v-if="resolvedLocation && !isSaved"
        class="w-full bg-brand-primary text-brand-text py-10 text-center z-20 flex flex-col items-center justify-center">
        <p class="text-sm md:text-2xl tracking-[0.24em] font-bold">Preview Mode / 预览模式</p>
        <p class="text-lg md:text-2xl mt-4 font-medium">City not saved yet / 当前城市尚未收藏</p>
      </div>
    </Transition>

    <div class="container relative z-10 pt-24" data-testid="city-current-panel" v-if="weatherData?.current">
      <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-12 ml-[-2px] md:ml-[-4px]">
        <h1 class="text-[18vw] sm:text-[14vw] md:text-9xl font-bold tracking-tighter leading-none break-words">{{
          route.params.city }}</h1>
        <div class="flex flex-col gap-3 md:items-end">
          <div class="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
            <button @click="toggleSaveCity" data-testid="save-city-button"
              :aria-label="isSaved ? 'Remove saved city / 取消收藏城市' : 'Save city / 收藏城市'"
              class="w-full md:w-auto px-6 py-3 border border-brand-primary/30 rounded-full hover:bg-brand-primary hover:text-brand-text transition-colors duration-300 text-sm tracking-widest uppercase">
              {{ isSaved ? 'Saved / 已收藏' : 'Save / 收藏' }}
            </button>
            <button type="button" data-testid="open-workspace-button" :disabled="!canOpenWorkspace"
              :aria-label="workspaceContinuation.label"
              class="w-full md:w-auto px-6 py-3 border border-brand-primary/18 rounded-full transition-colors duration-300 text-sm tracking-widest uppercase hover:bg-brand-primary hover:text-brand-text disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent disabled:hover:text-inherit"
              @click="openWorkspace">
              <BilingualStack :en="workspaceContinuation.label" zh="打开工作台" wrapper-class="flex items-center gap-2"
                en-class="uppercase tracking-[0.3em] font-medium" zh-class="text-xs font-zh-weight opacity-80" />
            </button>
          </div>
          <p data-testid="workspace-journey-note" class="max-w-md text-xs leading-6 text-brand-muted/72 md:text-right">
            {{ workspaceContinuation.description }}
          </p>
          <span v-if="isSaved" data-testid="saved-state-badge"
            class="text-[10px] uppercase tracking-[0.26em] font-bold text-brand-muted/75">
            Persistent / 已持久保存
          </span>
        </div>
      </div>

      <div
        class="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-start border-t-2 border-brand-primary/10 pt-12">
        <div class="col-span-1 md:col-span-3">
          <div class="flex items-center gap-4 pb-4 border-b border-brand-primary/10">
            <i :class="`qi-${weatherData.current.icon}`" class="weather-glyph text-4xl md:text-5xl"></i>
            <div class="flex flex-col gap-2">
              <p class="text-[10px] uppercase tracking-[0.28em] font-bold text-brand-secondary/85">
                {{ weatherData.current.textBilingual.en }}
              </p>
              <p class="text-[5vw] md:text-5xl font-light tracking-tight">{{ weatherData.current.textBilingual.zh }}</p>
            </div>
          </div>
          <div class="mt-4 flex flex-col gap-2">
            <p class="text-xs tracking-[0.18em] font-medium text-brand-muted/80">Current Condition / 当前状况</p>
            <p class="text-sm font-light mt-4 text-brand-secondary">Feels like: {{
              formatTemperature(weatherData.current.feelsLike) }}
            </p>
            <p class="text-sm font-light text-brand-secondary">Humidity: {{ weatherData.current.humidity }}%</p>
            <p class="text-sm font-light text-brand-secondary">Wind: {{ weatherData.current.windDirection }} {{
              formatWind({ scale: weatherData.current.windScale, speed: weatherData.current.windSpeed }) }}</p>
          </div>
        </div>

        <div class="col-span-1 md:col-span-6 flex justify-start md:justify-end md:pr-16">
          <p class="text-[20vw] sm:text-[18vw] md:text-[10rem] leading-none font-light tracking-tighter select-none">
            {{ formatTemperature(weatherData.current.temperature) }}
          </p>
        </div>

        <div class="col-span-1 md:col-span-3 flex flex-col justify-end h-full">
          <p class="text-xs tracking-[0.18em] text-brand-muted/75 mb-2">Location Details / 城市信息</p>
          <p class="text-lg font-light">{{ weatherData.location.province }}</p>
          <p class="text-sm font-zh-weight text-brand-secondary mt-1">Updated / 更新时间: {{
            formatDateTime(weatherData.current.observationTime) }}</p>
          <p class="text-sm font-zh-weight text-brand-secondary mt-1">TZ / 时区: {{ weatherData.location.timezone || '--' }}
          </p>
        </div>
      </div>
    </div>

    <div class="container mt-20" data-testid="city-hourly-strip" v-if="weatherData?.hourly.length">
      <div class="w-full flex items-center justify-between border-b border-brand-primary/10 pb-6 mb-8">
        <h2 class="text-xl md:text-3xl font-zh-weight tracking-tight">24 Hour Outlook / 24 小时趋势</h2>
        <p class="text-xs tracking-[0.18em] text-brand-muted/75 hidden md:block">Next 8 points / 未来 8 个时段</p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
        <div v-for="point in weatherData.hourly" :key="point.time"
          class="border border-brand-primary/10 rounded-3xl px-4 py-5 flex flex-col gap-4 bg-brand-accent/25">
          <p class="text-[10px] uppercase tracking-[0.2em] text-brand-muted/75">{{ formatHour(point.time) }}</p>
          <i :class="`qi-${point.icon}`" class="weather-glyph text-3xl"></i>
          <p class="text-2xl font-light">{{ formatTemperature(point.temperature) }}</p>
          <div class="flex flex-col gap-1">
            <p class="text-[10px] uppercase tracking-[0.2em] text-brand-secondary/85">{{ point.textBilingual.en }}</p>
            <p class="text-sm font-light tracking-[0.08em]">{{ point.textBilingual.zh }}</p>
          </div>
          <p class="text-[10px] uppercase tracking-[0.2em] text-brand-muted/75">Pop {{ point.pop }}%</p>
        </div>
      </div>
    </div>

    <div class="container mt-32" data-testid="city-daily-grid" v-if="weatherData?.daily.length">
      <div class="w-full flex items-center justify-between border-b-2 border-brand-primary pb-6 mb-12">
        <h2 class="text-xl md:text-3xl font-zh-weight tracking-tight">Extended Forecast / 长周期预报</h2>
        <p class="text-xs tracking-[0.18em] text-brand-muted/75 hidden md:block">Next 7 Days / 未来 7 天</p>
      </div>

      <div class="flex flex-col w-full">
        <div v-for="cast in weatherData.daily" :key="cast.date"
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-center py-8 md:py-10 border-b border-brand-primary/10 group cursor-default hover:bg-brand-primary/5 transition-colors duration-500 px-4 md:px-8 -mx-4 md:-mx-8 rounded-2xl">
          <div class="col-span-1 sm:col-span-2 md:col-span-1">
            <p class="text-xl md:text-2xl font-light tracking-tight">{{ formatDay(cast.date) }}</p>
            <p class="text-[10px] md:text-xs uppercase tracking-[0.2em] text-brand-muted/75 mt-2">{{ cast.date }}</p>
          </div>

          <div class="col-span-1 flex flex-col">
            <div class="flex items-start gap-3">
              <i :class="`qi-${cast.iconDay}`" class="weather-glyph"></i>
              <div class="flex flex-col gap-1">
                <p class="text-[10px] uppercase tracking-[0.2em] text-brand-secondary/85">{{ cast.textDayBilingual.en }}
                </p>
                <p class="text-lg font-light">{{ cast.textDayBilingual.zh }}</p>
              </div>
            </div>
            <p class="text-[10px] tracking-[0.18em] text-brand-muted/75 mt-2">Daytime / 白天</p>
          </div>

          <div class="col-span-1 flex flex-col">
            <div class="flex items-start gap-3">
              <i :class="`qi-${cast.iconNight}`" class="weather-glyph"></i>
              <div class="flex flex-col gap-1">
                <p class="text-[10px] uppercase tracking-[0.2em] text-brand-secondary/85">{{ cast.textNightBilingual.en
                  }}</p>
                <p class="text-lg font-light">{{ cast.textNightBilingual.zh }}</p>
              </div>
            </div>
            <p class="text-[10px] tracking-[0.18em] text-brand-muted/75 mt-2">Nighttime / 夜间</p>
          </div>

          <div class="col-span-1 flex flex-col items-start text-left">
            <p class="text-sm font-light text-brand-secondary">Wind {{ cast.windDirectionDay }} {{ formatWind({
              scale:
                cast.windScaleDay }) }}
            </p>
            <p class="text-sm font-light text-brand-secondary">Humidity {{ cast.humidity }}%</p>
            <p class="text-[10px] tracking-[0.18em] text-brand-muted/75 mt-2">Conditions / 细节</p>
          </div>

          <div class="col-span-1 flex justify-end md:justify-end items-center gap-6">
            <div class="text-right">
              <span class="text-brand-muted/75 text-sm mr-2">↑</span>
              <span class="text-3xl font-light">{{ formatTemperature(cast.tempMax) }}</span>
            </div>
            <div class="text-right">
              <span class="text-brand-muted/75 text-sm mr-2">↓</span>
              <span class="text-3xl font-light text-brand-secondary">{{ formatTemperature(cast.tempMin) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container mt-20" v-if="weatherIntelligence.cards.length">
      <CityIntelligencePanel :intelligence="weatherIntelligence" />
    </div>

    <div class="container mt-20" data-testid="aqi-panel"
      v-if="weatherData && weatherData.airQuality.status === 'available' && weatherData.airQuality.data">
      <PlatformPanel tone="wash" class="p-8 md:p-10">
        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p class="text-xs tracking-[0.18em] text-brand-muted/75">Air Quality / 空气质量</p>
            <p data-testid="aqi-index" class="mt-4 text-6xl md:text-7xl font-light tracking-tighter">{{
              weatherData.airQuality.data.aqi }}</p>
            <p class="mt-3 text-lg font-light">{{ weatherData.airQuality.data.category }}</p>
          </div>
          <div>
            <p class="text-xs tracking-[0.18em] text-brand-muted/75">Primary Pollutant / 首要污染物</p>
            <p class="mt-4 text-xl font-light">{{ weatherData.airQuality.data.primary }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-6 gap-4 mt-10">
          <PlatformStatRow v-for="pollutant in weatherData.airQuality.data.pollutants" :key="pollutant.label"
            :label="pollutant.label" :value="pollutant.value" tone="transparent" size="sm" />
        </div>
      </PlatformPanel>
    </div>

    <div class="container mt-20" data-testid="aqi-unavailable"
      v-if="weatherData && weatherData.airQuality.status === 'unavailable'">
      <PlatformErrorState eyebrow="Air Quality / 空气质量" title="Unavailable in this session / 当前会话不可用"
        :description="weatherData.airQuality.reason || 'Air quality data is currently unavailable.'"
        class="p-8 md:p-10" />
    </div>

    <div class="container mt-20" data-testid="comfort-metrics" v-if="comfortMetrics.length">
      <PlatformPanel class="p-8 md:p-10">
        <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p class="text-xs tracking-[0.18em] text-brand-muted/75">Comfort Snapshot / 舒适度概览</p>
            <p class="mt-4 text-2xl md:text-3xl font-light tracking-tight">Secondary weather signals stay readable, even
              when individual upstream fields are missing.</p>
          </div>
          <p class="max-w-xl text-sm leading-7 text-brand-muted/70">
            Feels like, visibility, pressure, UV, and daylight are surfaced as monochrome utilities rather than
            dashboard widgets.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mt-10">
          <PlatformStatRow v-for="metric in comfortMetrics" :key="metric.id" :label="metric.label" :value="metric.value"
            :detail="metric.detail" tone="wash" size="sm" />
        </div>
      </PlatformPanel>
    </div>

    <div class="container mt-20" v-if="historicalTrends.status === 'available' && historicalTrends.data.length">
      <div class="flex items-center justify-between border-b border-brand-primary/10 pb-6 mb-8">
        <h2 class="text-xl md:text-3xl font-zh-weight tracking-tight">Historical Trends / 历史趋势</h2>
        <p class="text-xs tracking-[0.18em] text-brand-muted/75 hidden md:block">Monochrome chart system / 单色图表系统</p>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <MonochromeTrendChart chart-test-id="trend-chart-temperature" eyebrow="Temperature / 温度"
          title="High / low temperature rhythm"
          description="Historical highs and lows are rendered as quiet dual lines, keeping the city page analytical without turning it into a dashboard."
          :points="historicalTrends.data" :series="[
            { key: 'temperatureMax', label: 'Max Temp', color: '#111111' },
            { key: 'temperatureMin', label: 'Min Temp', color: '#6b6b6b' },
          ]" :reduced-motion="prefersReducedMotion" />

        <MonochromeTrendChart chart-test-id="trend-chart-climate" eyebrow="Precipitation / Wind"
          title="Precipitation and wind pressure"
          description="Secondary climate motion is separated into a reusable chart surface that can move into the workspace route later."
          :points="historicalTrends.data" :series="[
            { key: 'precipitation', label: 'Precipitation', color: '#2f2f2f' },
            { key: 'windSpeed', label: 'Wind Speed', color: '#8a8a8a' },
          ]" :reduced-motion="prefersReducedMotion" />
      </div>
    </div>

    <div class="container mt-20" data-testid="trend-unavailable" v-if="historicalTrends.status === 'unavailable'">
      <PlatformErrorState eyebrow="Historical Trends / 历史趋势" title="Unavailable in this session / 当前会话不可用"
        :description="historicalTrends.reason" class="p-8 md:p-10">
        <template #actions>
          <button type="button"
            class="inline-flex items-center justify-center rounded-full border border-brand-primary/18 px-5 py-3 text-xs uppercase tracking-[0.3em] font-bold transition-colors duration-300 hover:bg-brand-primary hover:text-brand-text"
            @click="retryLoadWeather">
            Retry Trends / 重试趋势
          </button>
        </template>
      </PlatformErrorState>
    </div>

    <div v-if="errorMessage" class="container pt-20">
      <PlatformErrorState eyebrow="Weather Data / 数据状态" title="Unable to load this forecast / 当前预报暂不可用"
        :description="errorMessage">
        <template #actions>
          <button type="button"
            class="inline-flex items-center justify-center rounded-full border border-brand-primary/18 px-5 py-3 text-xs uppercase tracking-[0.3em] font-bold transition-colors duration-300 hover:bg-brand-primary hover:text-brand-text"
            @click="retryLoadWeather">
            Retry Forecast / 重试预报
          </button>
        </template>
      </PlatformErrorState>
    </div>

    <div v-if="!weatherData?.current && !errorMessage" class="container pt-32 pb-32 flex justify-center">
      <PlatformEmptyState title="No data available for this region / 当前区域暂无可用数据"
        description="Try another saved city or search for a nearby location to continue the forecast flow." />
    </div>
  </div>
</template>

<script setup lang="ts">
  import MonochromeTrendChart from '@/components/charts/MonochromeTrendChart.vue';
  import BilingualStack from '@/components/BilingualStack.vue';
  import CityIntelligencePanel from '@/features/weather/components/CityIntelligencePanel.vue';
  import PlatformEmptyState from '@/components/platform/PlatformEmptyState.vue';
  import PlatformErrorState from '@/components/platform/PlatformErrorState.vue';
  import PlatformPanel from '@/components/platform/PlatformPanel.vue';
  import PlatformStatRow from '@/components/platform/PlatformStatRow.vue';
  import { useCityWeatherView } from '@/features/weather/composables/useCityWeatherView';

  const {
    comfortMetrics,
    canOpenWorkspace,
    errorMessage,
    formatDateTime,
    formatDay,
    formatHour,
    formatTemperature,
    formatWind,
    historicalTrends,
    isSaved,
    openWorkspace,
    prefersReducedMotion,
    retryLoadWeather,
    resolvedLocation,
    route,
    toggleSaveCity,
    weatherIntelligence,
    weatherData,
    workspaceContinuation,
  } = useCityWeatherView();
</script>

<style scoped>
  .weather-glyph {
    line-height: 1;
  }

  .banner-slide-enter-active,
  .banner-slide-leave-active {
    transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), padding 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    max-height: 200px;
    overflow: hidden;
  }

  .banner-slide-enter-from,
  .banner-slide-leave-to {
    max-height: 0;
    opacity: 0;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }
</style>
