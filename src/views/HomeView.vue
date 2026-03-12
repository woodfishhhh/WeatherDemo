<template>
  <main class="container relative z-10 pt-32 pb-24 md:pt-48 md:pb-32 min-h-screen flex flex-col justify-between">

    <div class="max-w-4xl mx-auto w-full relative group mb-24 md:mb-32 mt-12">
      <h1
        class="text-[15vw] md:text-9xl font-bold tracking-tighter leading-none mb-4 absolute -top-16 -left-8 md:-top-32 md:-left-16 opacity-[0.03] pointer-events-none select-none">
        FORECAST</h1>
      <input type="text" placeholder="Enter location..." v-model="searchQuery" @focus="onInputFocus" @blur="onInputBlur"
        @keydown.enter.prevent="selectFirstTip"
        class="py-4 md:py-6 w-full bg-transparent border-b-2 border-brand-primary placeholder:text-brand-muted/30 text-4xl md:text-6xl font-light tracking-tight focus:outline-none focus:border-brand-primary transition-all duration-700" />

      <div
        class="absolute right-0 bottom-4 md:bottom-6 pointer-events-none text-brand-primary/40 text-xs md:text-sm uppercase tracking-[0.3em] font-medium hidden md:block">
        <span v-if="isSearching" class="animate-pulse">Searching</span>
        <span v-else>Search</span>
      </div>

      <!-- Search Results Dropdown -->
      <transition name="fade">
        <ul v-if="showTips && searchResults.length"
          class="absolute left-0 right-0 top-full mt-0 bg-surface border border-brand-primary/10 shadow-2xl z-30">
          <li v-for="tip in searchResults" :key="tip.adcode || tip.name" @mousedown.prevent="selectTip(tip)"
            class="px-6 py-5 md:py-8 cursor-pointer hover:bg-brand-primary hover:text-surface transition-colors duration-500 flex justify-between items-end border-b border-brand-primary/5 last:border-0 group/item">
            <p class="text-2xl md:text-4xl font-light tracking-tight">{{ tip.name }}</p>
            <p
              class="text-xs md:text-sm uppercase tracking-widest opacity-50 group-hover/item:opacity-80 transition-opacity duration-500">
              {{ tip.district || 'Location' }}</p>
          </li>
        </ul>
      </transition>

      <p v-if="errorMessage" class="mt-8 text-sm text-red-500 uppercase tracking-widest">{{ errorMessage }}</p>
      <p v-if="!isSearching && !isLoading && !searchResults.length && searchQuery.trim()"
        class="mt-8 text-sm text-brand-muted/50 uppercase tracking-widest fade-in">No results found</p>
    </div>

    <div class="flex-1 flex flex-col gap-12 mt-auto">
      <div class="flex items-center gap-6">
        <div class="w-16 h-[2px] bg-brand-primary"></div>
        <p class="text-[10px] md:text-xs uppercase tracking-[0.4em] font-bold">Saved Locations</p>
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
