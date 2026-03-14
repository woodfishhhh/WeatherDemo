<template>
  <main
    class="container relative z-10 pt-28 pb-20 sm:pt-32 md:pt-48 md:pb-32 min-h-screen flex flex-col justify-between">
    <div class="max-w-4xl mx-auto w-full relative group mb-20 md:mb-32 mt-10 sm:mt-12">
      <h1
        class="block text-[17vw] sm:text-[18vw] md:text-9xl font-bold tracking-[-0.06em] md:tracking-tighter leading-[0.86] mb-4 sm:mb-5 md:mb-4 static md:absolute md:-top-32 md:-left-16 opacity-80 pointer-events-none select-none max-w-full">
        FORECAST
      </h1>
      <input
        v-model="searchQuery"
        data-testid="home-search-input"
        type="text"
        placeholder="Enter location / 输入城市"
        aria-label="Search location / 搜索城市"
        @focus="onInputFocus"
        @blur="onInputBlur"
        @keydown.enter.prevent="selectFirstTip"
        class="py-3 sm:py-4 md:py-6 w-full bg-transparent border-b-2 border-brand-primary/70 placeholder:text-brand-muted/55 text-[8vw] sm:text-4xl md:text-6xl font-light tracking-tight leading-none focus:outline-none focus:border-brand-primary transition-all duration-700"
      />

      <div
        class="absolute right-0 bottom-4 md:bottom-6 pointer-events-none text-brand-secondary/60 text-xs md:text-sm uppercase tracking-[0.3em] font-medium hidden md:block">
        <span v-if="isSearching" class="animate-pulse">Searching / 搜索中</span>
        <span v-else>Search / 搜索</span>
      </div>

      <transition name="fade">
        <ul
          v-if="showTips && searchResults.length"
          data-testid="search-results"
          class="absolute left-0 right-0 top-full mt-3 bg-brand-accent/90 border border-brand-primary/12 shadow-2xl shadow-black/40 z-30 backdrop-blur-xl">
          <li
            v-for="tip in searchResults"
            :key="tip.id"
            data-testid="search-result-item"
            @mousedown.prevent="selectTip(tip)"
            class="px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-8 cursor-pointer hover:bg-brand-primary hover:text-brand-text transition-colors duration-500 flex flex-col gap-2 md:flex-row md:justify-between md:items-end border-b border-brand-primary/8 last:border-0 group/item">
            <p class="text-xl sm:text-2xl md:text-4xl font-light tracking-tight">{{ tip.name }}</p>
            <p
              class="text-xs md:text-sm uppercase tracking-widest opacity-60 group-hover/item:opacity-80 transition-opacity duration-500">
              {{ tip.province }}{{ tip.district ? ` · ${tip.district}` : '' }}
            </p>
          </li>
        </ul>
      </transition>

      <p v-if="errorMessage" data-testid="search-error" class="mt-8 text-sm text-red-400 tracking-[0.18em]">
        {{ errorMessage }}
      </p>
      <p
        v-if="!isSearching && !isLoading && !searchResults.length && searchQuery.trim()"
        class="mt-8 text-sm text-brand-muted/80 tracking-[0.18em] fade-in">
        NO RESULTS FOUND / 未找到匹配城市
      </p>
    </div>

    <div class="flex-1 flex flex-col gap-12 mt-auto">
      <div class="flex items-center gap-4 sm:gap-6">
        <div class="w-10 sm:w-12 md:w-16 h-[2px] bg-brand-primary"></div>
        <p class="text-[10px] md:text-xs tracking-[0.26em] sm:tracking-[0.34em] font-bold">CURRENT LOCATION / 当前位置</p>
      </div>

      <PlatformPanel tone="wash" class="px-5 py-6 md:px-8 md:py-8">
        <div v-if="currentLocation" class="group cursor-pointer" @click="openCurrentLocation">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-[1.3fr_1fr_1fr_auto] md:items-center">
            <div>
              <p class="text-3xl md:text-4xl font-light tracking-tight">{{ currentLocation.location.name }}</p>
              <p class="mt-2 text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-brand-muted/85">
                {{ currentLocation.location.province }}{{ currentLocation.location.district ? ` ·
                ${currentLocation.location.district}` : '' }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <i :class="`qi-${currentLocation.weather.icon}`" class="weather-glyph text-2xl"></i>
              <div>
                <p class="text-[10px] uppercase tracking-[0.24em] font-bold text-brand-secondary/85">
                  {{ currentLocation.weather.textBilingual.en }}
                </p>
                <p class="mt-1 text-sm font-medium tracking-[0.08em]">{{ currentLocation.weather.textBilingual.zh }}</p>
                <p class="mt-2 text-[10px] md:text-xs tracking-[0.24em] font-bold text-brand-muted/85">Conditions / 天气概况
                </p>
              </div>
            </div>
            <div>
              <p class="text-sm uppercase tracking-widest font-medium">
                H: {{ currentLocation.weather.humidity }}% / Wind: {{ formatWind({ scale: currentLocation.weather.windScale }) }}
              </p>
              <p class="mt-2 text-[10px] md:text-xs tracking-[0.24em] font-bold text-brand-muted/85">Details / 细节</p>
            </div>
            <div class="flex items-center justify-between gap-4 md:justify-end">
              <p class="text-5xl md:text-6xl font-light tracking-tighter">{{ formatTemperature(currentLocation.weather.temperature) }}
              </p>
              <span class="text-[10px] tracking-[0.24em] font-bold text-brand-muted/85">Open / 打开</span>
            </div>
          </div>
        </div>

        <div v-else class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <BilingualStack
              en="Use Your Current Location"
              zh="使用你的当前位置"
              wrapper-class="flex flex-col gap-3"
              en-class="text-[10px] uppercase tracking-[0.38em] font-bold text-brand-muted/75"
              zh-class="text-xl md:text-2xl font-light tracking-tight"
            />
            <div class="mt-3 max-w-2xl text-sm leading-7 text-brand-muted/70 space-y-2">
              <p>We can request browser location permission, resolve your city with QWeather, and show live conditions
                here.</p>
              <p>我们会请求浏览器定位权限，用和风天气解析你的城市，并在这里展示当前天气。</p>
            </div>
          </div>
          <button
            type="button"
            @click="requestCurrentLocation"
            :disabled="isLocating"
            aria-label="Use current location / 使用当前位置"
            class="inline-flex items-center justify-center rounded-full border border-brand-primary/20 px-6 py-3 text-xs uppercase tracking-[0.32em] font-bold transition-colors duration-300 hover:bg-brand-primary hover:text-brand-text disabled:cursor-wait disabled:opacity-60">
            {{ isLocating ? 'Locating / 定位中' : 'Use Current Location / 使用当前位置' }}
          </button>
        </div>

        <p v-if="locationErrorMessage" class="mt-5 text-xs tracking-[0.18em] font-bold text-red-400">
          {{ locationErrorMessage }}
        </p>
      </PlatformPanel>

      <div class="flex items-center gap-4 sm:gap-6">
        <div class="w-10 sm:w-12 md:w-16 h-[2px] bg-brand-primary"></div>
        <p class="text-[10px] md:text-xs tracking-[0.26em] sm:tracking-[0.34em] font-bold">PLATFORM ENTRY / 平台入口</p>
      </div>

      <section data-testid="workspace-shortcuts" class="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-5 md:gap-6">
        <PlatformPanel tone="elevated" class="px-5 py-6 md:px-8 md:py-8">
          <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p class="text-[10px] uppercase tracking-[0.34em] font-bold text-brand-muted/70">Workspace / 工作台</p>
              <p class="mt-4 text-2xl md:text-4xl font-light tracking-tight">Monitor saved cities without breaking the home rhythm.</p>
              <p class="mt-3 text-sm leading-7 text-brand-muted/72 max-w-2xl">
                Use the workspace to compare your saved list, reopen recent cities, and keep a lightweight dashboard path ready for the next wave.
              </p>
            </div>
            <div class="grid grid-cols-3 gap-3 md:min-w-[16rem]">
              <PlatformStatRow label="Saved" :value="workspaceShortcutSummary.savedCount" tone="transparent" />
              <PlatformStatRow label="Recent" :value="workspaceShortcutSummary.recentCount" tone="transparent" />
              <PlatformStatRow label="Compare" :value="workspaceShortcutSummary.compareCount" tone="transparent" />
            </div>
          </div>

          <div class="mt-8 flex flex-col md:flex-row gap-3">
            <button
              type="button"
              @click="openWorkspace('all')"
              class="inline-flex items-center justify-center rounded-full border border-brand-primary/18 px-5 py-3 text-xs uppercase tracking-[0.3em] font-bold transition-colors duration-300 hover:bg-brand-primary hover:text-brand-text">
              Open Workspace / 打开工作台
            </button>
            <button
              type="button"
              @click="openWorkspace('recent')"
              class="inline-flex items-center justify-center rounded-full border border-brand-primary/12 px-5 py-3 text-xs uppercase tracking-[0.3em] font-bold text-brand-muted/85 transition-colors duration-300 hover:border-brand-primary/28 hover:text-brand-primary">
              View Recent / 查看最近
            </button>
          </div>
        </PlatformPanel>

        <div class="grid grid-cols-1 gap-5">
          <PlatformPanel tone="elevated" class="px-5 py-6 md:px-7 md:py-7">
            <p class="text-[10px] uppercase tracking-[0.34em] font-bold text-brand-muted/70">Recent Locations / 最近查看</p>
            <div v-if="recentLocations.length" class="mt-5 flex flex-wrap gap-3">
              <button
                v-for="city in recentLocations"
                :key="city.id"
                type="button"
                data-testid="recent-location-chip"
                @click="openSavedCity(city)"
                class="rounded-full border border-brand-primary/12 px-4 py-2 text-xs uppercase tracking-[0.24em] font-bold transition-colors duration-300 hover:bg-brand-primary hover:text-brand-text">
                {{ city.city }}
              </button>
            </div>
            <p v-else class="mt-5 text-sm leading-7 text-brand-muted/68">
              Recent locations appear here after you open city forecasts from search or saved cards.
            </p>
          </PlatformPanel>

          <PlatformPanel tone="elevated" class="px-5 py-6 md:px-7 md:py-7">
            <p class="text-[10px] uppercase tracking-[0.34em] font-bold text-brand-muted/70">Quick Compare / 快速对比</p>
            <div v-if="comparePreview.length" class="mt-5 space-y-3">
              <div v-for="city in comparePreview" :key="city.id" class="flex items-center justify-between gap-4">
                <div>
                  <p class="text-xl font-light tracking-tight">{{ city.city }}</p>
                  <p class="mt-1 text-[10px] uppercase tracking-[0.22em] text-brand-muted/68">{{ city.province }}</p>
                </div>
                <button
                  type="button"
                  @click="openSavedCity(city)"
                  class="rounded-full border border-brand-primary/12 px-4 py-2 text-[10px] uppercase tracking-[0.24em] font-bold transition-colors duration-300 hover:bg-brand-primary hover:text-brand-text">
                  Open / 打开
                </button>
              </div>
            </div>
            <p v-else class="mt-5 text-sm leading-7 text-brand-muted/68">
              Save two cities and the compare launch surface will stay ready here.
            </p>
          </PlatformPanel>
        </div>
      </section>

      <div class="flex items-center gap-4 sm:gap-6">
        <div class="w-10 sm:w-12 md:w-16 h-[2px] bg-brand-primary"></div>
        <p class="text-[10px] md:text-xs tracking-[0.26em] sm:tracking-[0.34em] font-bold">SAVED LOCATIONS / 已收藏城市</p>
      </div>

      <section data-testid="saved-locations-section">
        <Suspense>
          <template #default>
            <CityList />
          </template>
          <template #fallback>
            <CityCardSkeleton />
          </template>
        </Suspense>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
  import BilingualStack from '@/components/BilingualStack.vue';
  import CityCardSkeleton from '@/components/CityCardSkeleton.vue';
  import CityList from '@/components/CityList.vue';
  import PlatformPanel from '@/components/platform/PlatformPanel.vue';
  import PlatformStatRow from '@/components/platform/PlatformStatRow.vue';
  import { useHomeLocationSearch } from '@/features/locations/composables/useHomeLocationSearch';

  const {
    comparePreview,
    currentLocation,
    errorMessage,
    formatTemperature,
    formatWind,
    isLoading,
    isLocating,
    isSearching,
    locationErrorMessage,
    onInputBlur,
    onInputFocus,
    openCurrentLocation,
    openSavedCity,
    openWorkspace,
    recentLocations,
    requestCurrentLocation,
    savedCities,
    searchQuery,
    searchResults,
    selectFirstTip,
    selectTip,
    showTips,
    workspaceShortcutSummary,
  } = useHomeLocationSearch();
</script>

<style scoped>

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s ease, transform 0.5s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    transform: translateY(-20px);
  }
</style>
