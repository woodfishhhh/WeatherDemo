<template>
  <main class="container text-white">
    <div class="pt-4 mb-8 relative">
      <input type="text" placeholder="搜索你的城市" v-model="searchQuery" @focus="onInputFocus" @blur="onInputBlur"
        @keydown.enter.prevent="selectFirstTip"
        class="py-2 px-1 w-full bg-transparent border-b focus:border-weather-secondary focus:outline-none transition-colors duration-300 focus:shadow-[0px_1px_0_0_#004e71]">

      <ul v-if="showTips && searchResults.length"
        class="absolute left-0 right-0 top-full mt-2 rounded-md border border-white/20 bg-[#0f2d3a] shadow-lg overflow-hidden z-20">
        <li v-for="tip in searchResults" :key="tip.adcode || tip.name" @mousedown.prevent="selectTip(tip)"
          class="px-3 py-2 cursor-pointer hover:bg-white/10">
          <p class="text-sm">{{ tip.name }}</p>
          <p class="text-xs text-white/70">{{ tip.district || '省/市/区' }}</p>
        </li>
      </ul>

      <p v-if="isSearching || isLoading" class="mt-2 text-xs text-white/70">正在搜索...</p>
      <p v-if="errorMessage" class="mt-2 text-xs text-red-300">{{ errorMessage }}</p>
      <p v-if="!isSearching && !isLoading && !searchResults.length && searchQuery.trim()"
        class="mt-2 text-xs text-white/70">没有找到相关城市</p>
    </div>
    <div class="flex flex-col gap-4">
      <Suspense>
        <!-- 默认插槽：放置需要异步加载的组件 -->
        <template #default>
          <CityList />
        </template>
        <!-- 后备插槽：在组件加载完成前显示的内容 -->
        <template #fallback>
          <CityCardSkeleton />
        </template>
      </Suspense>
    </div>
  </main>
</template>

<script setup>
  import { ref, watch, onBeforeUnmount } from "vue";
  import axios from "axios";
  import { useRouter } from "vue-router";
  import CityCardSkeleton from "@/components/CityCardSkeleton.vue";

  const router = useRouter();
  const gaodeKey = "REMOVED_GAODE_KEY";
  const searchQuery = ref("");
  const searchResults = ref([]);
  const showTips = ref(false);
  const isLoading = ref(false);
  const isSearching = ref(false);
  const errorMessage = ref("");

  let debounceTimer = null;
  let blurTimer = null;

  const getSearchResults = async (keyword) => {
    if (!keyword) return (searchResults.value = []);
    isLoading.value = true;
    isSearching.value = true;
    errorMessage.value = "";
    try {
      const { data } = await axios.get("https://restapi.amap.com/v3/assistant/inputtips", {
        params: { key: gaodeKey, keywords: keyword, type: "190102|190103|190104|190105" },
      });
      console.log(data);

      if (data?.status !== "1") throw new Error(data?.info || "请求异常");
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
      errorMessage.value = error?.message || "搜索失败";
    } finally {
      isLoading.value = false;
      isSearching.value = false;

    }
  };

  const selectTip = (tip) => {
    // 高德 district 通常格式：[省份][城市][区县]。提取其省份和城市。
    const districtStr = tip.district || "";
    let province = tip.name;
    let city = tip.name;

    // 省、自治区、直辖市提取
    const provinceMatch = districtStr.match(/^(.*?(?:省|自治区|市))(.*)$/);
    if (provinceMatch) {
      province = provinceMatch[1];
      const remaining = provinceMatch[2];

      // 有剩余的部分，提取城市（地级市/州/盟）如果没有则用本身 name 作为 city
      if (remaining) {
        const cityMatch = remaining.match(/^(.*?(?:市|州|地区|盟|区|县))(.*)$/);
        city = cityMatch ? cityMatch[1] : tip.name;
      } else {
        // 直辖市等情况，省市同名
        city = province;
      }
    }

    // 如果最后是区县而且有上级城市，可以传完整的城市，这里以 name 作为目标城市展示是最准确的
    city = tip.name;

    router.push({
      name: "cityview",
      params: {
        province: province || city,
        city: city,
      },
      query: {
        adcode: tip.adcode,
      }
    });

    searchQuery.value = tip.name;
    showTips.value = false;
  };

  const selectFirstTip = () => {
    if (searchResults.value.length) {
      selectTip(searchResults.value[0]);
    }
  };

  const onInputFocus = () => {
    if (blurTimer) {
      clearTimeout(blurTimer);
      blurTimer = null;
    }
    if (searchResults.value.length) {
      showTips.value = true;
    }
  };

  const onInputBlur = () => {
    // Delay hiding so click/mousedown on tip can run first.
    blurTimer = setTimeout(() => {
      showTips.value = false;
    }, 120);
  };

  watch(searchQuery, (value) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const keyword = value.trim();
    if (!keyword) {
      errorMessage.value = "";
      searchResults.value = [];
      showTips.value = false;
      isSearching.value = false;
      return;
    }

    isSearching.value = true;

    debounceTimer = setTimeout(() => {
      getSearchResults(keyword);
    }, 400);
  });

  onBeforeUnmount(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    if (blurTimer) {
      clearTimeout(blurTimer);
    }
  });
</script>
