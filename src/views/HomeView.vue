<template>
  <main
    class="container relative z-10 pt-28 pb-20 sm:pt-32 md:pt-48 md:pb-32 min-h-screen flex flex-col justify-between">
    <HomeSearchHero
      v-model="searchQuery"
      :error-message="errorMessage"
      :is-loading="isLoading"
      :is-searching="isSearching"
      :search-results="searchResults"
      :show-tips="showTips"
      @blur-input="onInputBlur"
      @focus-input="onInputFocus"
      @select-first-tip="selectFirstTip"
      @select-tip="selectTip"
    />

    <div class="flex-1 flex flex-col gap-12 mt-auto">
      <HomeCurrentLocationSection
        :current-location="currentLocation"
        :format-temperature="formatTemperature"
        :format-wind="formatWind"
        :is-locating="isLocating"
        :location-error-message="locationErrorMessage"
        @open-current-location="openCurrentLocation"
        @request-current-location="requestCurrentLocation"
      />

      <HomeWorkspaceShortcutsSection
        :compare-preview="comparePreview"
        :recent-locations="recentLocations"
        :workspace-shortcut-summary="workspaceShortcutSummary"
        @open-compare-city="openCompareCity"
        @open-recent-city="openRecentCity"
        @open-workspace="openWorkspace"
      />

      <HomeSavedLocationsSection @open-saved-city="openSavedCity" />
    </div>
  </main>
</template>

<script setup lang="ts">
  import HomeCurrentLocationSection from '@/features/home/components/HomeCurrentLocationSection.vue';
  import HomeSavedLocationsSection from '@/features/home/components/HomeSavedLocationsSection.vue';
  import HomeSearchHero from '@/features/home/components/HomeSearchHero.vue';
  import HomeWorkspaceShortcutsSection from '@/features/home/components/HomeWorkspaceShortcutsSection.vue';
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
    openCompareCity,
    openCurrentLocation,
    openRecentCity,
    openSavedCity,
    openWorkspace,
    recentLocations,
    requestCurrentLocation,
    searchQuery,
    searchResults,
    selectFirstTip,
    selectTip,
    showTips,
    workspaceShortcutSummary,
  } = useHomeLocationSearch();
</script>
