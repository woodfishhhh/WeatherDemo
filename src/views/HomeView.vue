<template>
  <main class="container relative z-10 pt-28 pb-20 sm:pt-32 md:pt-48 md:pb-32 min-h-screen flex flex-col justify-between">

    <div class="max-w-4xl mx-auto w-full relative group mb-20 md:mb-32 mt-10 sm:mt-12">
      <h1
        class="block text-[17vw] sm:text-[18vw] md:text-9xl font-bold tracking-[-0.06em] md:tracking-tighter leading-[0.86] mb-4 sm:mb-5 md:mb-4 static md:absolute md:-top-32 md:-left-16 opacity-80 pointer-events-none select-none max-w-full">
        FORECAST</h1>
      <input type="text" placeholder="Enter location..." v-model="searchQuery" @focus="onInputFocus" @blur="onInputBlur"
        @keydown.enter.prevent="selectFirstTip"
        class="py-3 sm:py-4 md:py-6 w-full bg-transparent border-b-2 border-brand-primary/70 placeholder:text-brand-muted/55 text-[12vw] sm:text-4xl md:text-6xl font-light tracking-tight leading-none focus:outline-none focus:border-brand-primary transition-all duration-700" />

      <div
        class="absolute right-0 bottom-4 md:bottom-6 pointer-events-none text-brand-secondary/60 text-xs md:text-sm uppercase tracking-[0.3em] font-medium hidden md:block">
        <span v-if="isSearching" class="animate-pulse">Searching</span>
        <span v-else>Search</span>
      </div>

      <!-- Search Results Dropdown -->
      <transition name="fade">
        <ul v-if="showTips && searchResults.length"
          class="absolute left-0 right-0 top-full mt-3 bg-brand-accent/90 border border-brand-primary/12 shadow-2xl shadow-black/40 z-30 backdrop-blur-xl">
          <li v-for="tip in searchResults" :key="tip.adcode || tip.name" @mousedown.prevent="selectTip(tip)"
            class="px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-8 cursor-pointer hover:bg-brand-primary hover:text-brand-text transition-colors duration-500 flex flex-col gap-2 md:flex-row md:justify-between md:items-end border-b border-brand-primary/8 last:border-0 group/item">
            <p class="text-xl sm:text-2xl md:text-4xl font-light tracking-tight">{{ tip.name }}</p>
            <p
              class="text-xs md:text-sm uppercase tracking-widest opacity-60 group-hover/item:opacity-80 transition-opacity duration-500">
              {{ tip.district || 'Location' }}</p>
          </li>
        </ul>
      </transition>

      <p v-if="errorMessage" class="mt-8 text-sm text-red-400 uppercase tracking-widest">{{ errorMessage }}</p>
      <p v-if="!isSearching && !isLoading && !searchResults.length && searchQuery.trim()"
        class="mt-8 text-sm text-brand-muted/80 uppercase tracking-widest fade-in">No results found</p>
    </div>

    <div class="flex-1 flex flex-col gap-12 mt-auto">
      <div class="flex items-center gap-4 sm:gap-6">
        <div class="w-10 sm:w-12 md:w-16 h-[2px] bg-brand-primary"></div>
        <p class="text-[10px] md:text-xs uppercase tracking-[0.28em] sm:tracking-[0.4em] font-bold">Saved Locations</p>
      </div>

      <Suspense>
        <template #default>
          <CityList />
        </template>
        <template #fallback>
          <CityCardSkeleton />
        </template>
      </Suspense>
    </div>
  </main>
</template>

<script setup>
  import { ref, watch, onBeforeUnmount } from 'vue';
  import axios from 'axios';
  import { useRouter } from 'vue-router';
  import CityCardSkeleton from '@/components/CityCardSkeleton.vue';
  import CityList from '@/components/CityList.vue';

  const router = useRouter();
  const gaodeKey = import.meta.env.VITE_GAODE_KEY;
  const searchQuery = ref('');
  const searchResults = ref([]);
  const showTips = ref(false);
  const isLoading = ref(false);
  const isSearching = ref(false);
  const errorMessage = ref('');

  let debounceTimer = null;
  let blurTimer = null;

  const getSearchResults = async (keyword) => {
    if (!keyword) return (searchResults.value = []);
    isLoading.value = true;
    isSearching.value = true;
    errorMessage.value = '';
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_AMAP_BASE_URL}/assistant/inputtips`, {
        params: { key: gaodeKey, keywords: keyword, type: '190102|190103|190104|190105' },
      });

      if (data?.status !== '1') throw new Error(data?.info || 'Request Error');
      const k = keyword.toLowerCase();
      searchResults.value = Array.from(
        new Map(
          (data.tips || [])
            .filter((d) => d.name && d.name.toLowerCase().includes(k))
            .map((d) => [d.adcode || d.name, { name: d.name, district: d.district, adcode: d.adcode }])
        ).values()
      ).sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(k);
        const bStarts = b.name.toLowerCase().startsWith(k);
        return aStarts === bStarts ? 0 : aStarts ? -1 : 1;
      });

      showTips.value = searchResults.value.length > 0;
    } catch (error) {
      searchResults.value = [];
      errorMessage.value = error?.message || 'Search failed';
    } finally {
      isLoading.value = false;
      isSearching.value = false;
    }
  };

  const selectTip = (tip) => {
    const districtStr = tip.district || '';
    let province = tip.name;
    let city = tip.name;

    const provinceMatch = districtStr.match(/^(.*?(?:省|自治区|市))(.*)$/);
    if (provinceMatch) {
      province = provinceMatch[1];
      const remaining = provinceMatch[2];
      if (remaining) {
        const cityMatch = remaining.match(/^(.*?(?:市|州|地区|盟|区|县))(.*)$/);
        city = cityMatch ? cityMatch[1] : tip.name;
      } else {
        city = province;
      }
    }
    city = tip.name;

    router.push({
      name: 'cityview',
      params: { province: province || city, city: city },
      query: { adcode: tip.adcode }
    });

    searchQuery.value = tip.name;
    showTips.value = false;
  };

  const selectFirstTip = () => {
    if (searchResults.value.length) selectTip(searchResults.value[0]);
  };

  const onInputFocus = () => {
    if (blurTimer) {
      clearTimeout(blurTimer);
      blurTimer = null;
    }
    if (searchResults.value.length) showTips.value = true;
  };

  const onInputBlur = () => {
    blurTimer = setTimeout(() => { showTips.value = false; }, 120);
  };

  watch(searchQuery, (value) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    const keyword = value.trim();
    if (!keyword) {
      errorMessage.value = '';
      searchResults.value = [];
      showTips.value = false;
      isSearching.value = false;
      return;
    }
    isSearching.value = true;
    debounceTimer = setTimeout(() => { getSearchResults(keyword); }, 400);
  });

  onBeforeUnmount(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    if (blurTimer) clearTimeout(blurTimer);
  });
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
