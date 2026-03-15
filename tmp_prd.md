<template>
  <main class="w-full relative z-10">
    <section class="min-h-[100dvh] w-full flex flex-col justify-center items-center px-6 md:px-12 py-12">
      <div class="w-full max-w-7xl mx-auto flex flex-col justify-center h-full gap-24">
        <HomeSearchHero v-model="searchQuery" :error-message="errorMessage" :is-loading="isLoading"
          :is-searching="isSearching" :search-results="searchResults" :show-tips="showTips" @blur-input="onInputBlur"
          @focus-input="onInputFocus" @select-first-tip="selectFirstTip" @select-tip="selectTip" />
      </div>
    </section>

    <section class="min-h-[100dvh] w-full flex flex-col justify-center items-center px-6 md:px-12 py-12">
      <div class="w-full max-w-7xl mx-auto flex flex-col justify-center h-full">
        <HomeCurrentLocationSection :current-location="currentLocation" :format-temperature="formatTemperature"
          :format-wind="formatWind" :is-locating="isLocating" :location-error-message="locationErrorMessage"
          @open-current-location="openCurrentLocation" @request-current-location="requestCurrentLocation" />
      </div>
    </section>

    <section class="min-h-[100dvh] w-full flex flex-col justify-center items-center px-6 md:px-12 py-12">
      <div class="w-full max-w-7xl mx-auto flex flex-col justify-center h-full">
        <HomeSavedLocationsSection :saved-city-intelligence="savedCityIntelligence" @open-saved-city="openSavedCity" />
      </div>
    </section>

    <section class="min-h-[100dvh] w-full flex flex-col justify-center items-center px-6 md:px-12 py-12">
      <div class="w-full max-w-7xl mx-auto flex flex-col justify-center h-full">
        <HomeWorkspaceShortcutsSection :compare-preset="comparePreset" :compare-preview="comparePreview"
          :recent-locations="recentLocations" :workspace-shortcut-summary="workspaceShortcutSummary"
          @open-compare-city="openCompareCity" @open-compare-preset="openComparePreset"
          @open-recent-city="openRecentCity" @open-workspace="openWorkspace" />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
  import HomeCurrentLocationSection from '@/features/home/components/HomeCurrentLocationSection.vue';
  import HomeSavedLocationsSection from '@/features/home/components/HomeSavedLocationsSection.vue';
  import HomeSearchHero from '@/features/home/components/HomeSearchHero.vue';
  import HomeWorkspaceShortcutsSection from '@/features/home/components/HomeWorkspaceShortcutsSection.vue';
  import { useHomeLocationSearch } from '@/features/locations/composables/useHomeLocationSearch';

  const {
    comparePreset,
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
    openComparePreset,
    openCompareCity,
    openCurrentLocation,
    openRecentCity,
    openSavedCity,
    openWorkspace,
    recentLocations,
    requestCurrentLocation,
    searchQuery,
    searchResults,
    savedCityIntelligence,
    selectFirstTip,
    selectTip,
    showTips,
    workspaceShortcutSummary,
  } = useHomeLocationSearch();
</script>
