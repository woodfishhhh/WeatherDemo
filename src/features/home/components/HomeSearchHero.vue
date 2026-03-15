<template>
  <div class="w-full relative group mb-32 mt-16 sm:mt-24">
    <div class="mb-8 pointer-events-none select-none -ml-2 sm:-ml-4 relative">
      <BilingualStack en="Forecast" zh="气象探索" wrapper-class="absolute -top-12 left-2 sm:left-4 z-10"
        en-class="text-[10px] md:text-xs uppercase tracking-[0.4em] font-medium text-brand-muted/60"
        zh-class="text-sm md:text-base font-zh-weight tracking-[0.1em]" />
      <h1
        class="block text-[22vw] sm:text-[20vw] md:text-[180px] font-bold tracking-tighter leading-[0.8] opacity-90 uppercase">
        FORECAST.
      </h1>
    </div>

    <div class="relative w-full md:w-3/4 lg:w-2/3 ml-auto border-t-2 border-brand-primary pt-8 mt-12 pr-4 md:pr-0">
      <div class="flex items-end justify-between w-full">
        <input v-model="searchQuery" data-testid="home-search-input" type="text" placeholder="SEARCH LOCATION"
          aria-label="Search location" @focus="emit('focus-input')" @blur="emit('blur-input')"
          @keydown.enter.prevent="emit('select-first-tip')"
          class="w-full bg-transparent placeholder:text-brand-muted/30 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight leading-none focus:outline-none transition-all duration-700 uppercase" />
        <div class="hidden sm:block text-brand-secondary/80 shrink-0 transition-opacity">
          <BilingualStack v-if="isSearching" en="Locating..." zh="定位中..." class="animate-pulse"
            en-class="text-xs uppercase tracking-widest" zh-class="text-xs opacity-60 text-right" />
          <BilingualStack v-else en="Search ↗" zh="搜索" en-class="text-xs uppercase tracking-widest"
            zh-class="text-xs opacity-60 text-right" />
        </div>
      </div>

      <transition name="fade">
        <ul v-if="showTips && searchResults.length" data-testid="search-results"
          class="absolute left-0 right-0 top-full mt-8 bg-surface border-y-2 border-brand-primary shadow-2xl z-30 py-4">
          <li v-for="(tip, index) in searchResults" :key="tip.id" data-testid="search-result-item"
            :style="{ transitionDelay: `${index * 50}ms` }" @mousedown.prevent="emit('select-tip', tip)"
            class="px-6 py-6 sm:px-10 sm:py-8 cursor-pointer hover:bg-brand-primary hover:text-brand-text transition-all duration-500 flex flex-col md:flex-row md:justify-between border-b border-brand-primary/10 last:border-0 group/item items-start md:items-center">
            <BilingualStack :en="tip.name" :zh="tip.name" as="span"
              wrapper-class="flex flex-col-reverse md:flex-row md:items-baseline md:gap-4"
              en-class="text-3xl sm:text-5xl font-semibold tracking-tighter uppercase"
              zh-class="text-xl md:text-2xl font-zh-weight opacity-60" />
            <BilingualStack :en="tip.province || tip.name"
              :zh="tip.district ? tip.province + ' — ' + tip.district : tip.province" as="span"
              wrapper-class="flex flex-col items-start md:items-end mt-4 md:mt-0"
              en-class="text-sm md:text-base uppercase tracking-[0.2em] opacity-50 group-hover/item:opacity-100 transition-opacity duration-500 font-light"
              zh-class="text-sm font-zh-weight opacity-40 group-hover/item:opacity-80" />
          </li>
        </ul>
      </transition>

      <p v-if="errorMessage" data-testid="search-error" class="mt-12">
        <BilingualStack en="System Error" :zh="errorMessage"
          en-class="text-xs text-red-500 uppercase font-bold tracking-[0.2em]" zh-class="text-sm text-red-400 mt-2" />
      </p>
      <p v-if="!isSearching && !isLoading && !searchResults.length && searchQuery.trim()" class="mt-12">
        <BilingualStack en="Location Uncharted" zh="未找到该位置"
          en-class="text-xs text-brand-muted/60 uppercase tracking-[0.2em] font-medium"
          zh-class="text-sm text-brand-muted/40 mt-2" />
      </p>
    </div>

    <!-- 跑马灯占满屏幕宽度 -->
    <transition name="fade">
      <div v-show="!searchQuery"
        class="w-[100vw] relative left-1/2 -translate-x-1/2 mt-12 md:mt-16 pt-4 md:pt-6 overflow-hidden mask-edges pb-4 z-0">
        <div class="flex flex-col gap-8 w-full opacity-80 hover:opacity-100 transition-opacity duration-1000">
          <!-- 中文行 (向右滚动) -->
          <div class="flex w-max marquee-right hover:pause items-center">
            <button v-for="(city, index) in doubledCities" :key="'zh-' + index" type="button"
              @mousedown.prevent="emit('select-tip', city as unknown as LocationRecord)"
              class="px-12 py-2 transition-all duration-700 flex items-center group opacity-40 hover:opacity-100 cursor-pointer">
              <span
                class="text-2xl sm:text-3xl md:text-4xl font-light tracking-[0.4em] text-brand-primary whitespace-nowrap">{{
                  city.name }}</span>
            </button>
          </div>
          <!-- 英文行 (向左滚动) -->
          <div class="flex w-max marquee-left hover:pause items-center -mt-6">
            <button v-for="(city, index) in doubledCities" :key="'en-' + index" type="button"
              @mousedown.prevent="emit('select-tip', city as unknown as LocationRecord)"
              class="px-12 py-2 transition-all duration-700 flex items-center group opacity-30 hover:opacity-100 cursor-pointer">
              <span
                class="text-xs sm:text-sm md:text-base uppercase tracking-[0.6em] font-medium text-brand-primary whitespace-nowrap">{{
                  city.enName }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import BilingualStack from '@/components/BilingualStack.vue';
  import type { LocationRecord } from '@/features/weather/types';

  const searchQuery = defineModel<string>({
    required: true,
  });

  defineProps<{
    errorMessage: string;
    isLoading: boolean;
    isSearching: boolean;
    searchResults: LocationRecord[];
    showTips: boolean;
  }>();

  const emit = defineEmits<{
    (event: 'blur-input'): void;
    (event: 'focus-input'): void;
    (event: 'select-first-tip'): void;
    (event: 'select-tip', tip: LocationRecord): void;
  }>();

  const allPopularCities = [
    { id: "101010100", name: "北京", enName: "Beijing", province: "北京市" },
    { id: "101020100", name: "上海", enName: "Shanghai", province: "上海市" },
    { id: "101280101", name: "广州", enName: "Guangzhou", province: "广东省" },
    { id: "101280601", name: "深圳", enName: "Shenzhen", province: "广东省" },
    { id: "101270101", name: "成都", enName: "Chengdu", province: "四川省" },
    { id: "101040100", name: "重庆", enName: "Chongqing", province: "重庆市" },
    { id: "101210101", name: "杭州", enName: "Hangzhou", province: "浙江省" },
    { id: "101200101", name: "武汉", enName: "Wuhan", province: "湖北省" },
    { id: "101110101", name: "西安", enName: "Xi'an", province: "陕西省" },
    { id: "101030100", name: "天津", enName: "Tianjin", province: "天津市" },
    { id: "101190401", name: "苏州", enName: "Suzhou", province: "江苏省" },
    { id: "101190101", name: "南京", enName: "Nanjing", province: "江苏省" },
    { id: "101250101", name: "长沙", enName: "Changsha", province: "湖南省" },
    { id: "101180101", name: "郑州", enName: "Zhengzhou", province: "河南省" },
    { id: "101281601", name: "东莞", enName: "Dongguan", province: "广东省" },
    { id: "101120201", name: "青岛", enName: "Qingdao", province: "山东省" },
    { id: "101220101", name: "合肥", enName: "Hefei", province: "安徽省" },
    { id: "101280800", name: "佛山", enName: "Foshan", province: "广东省" },
    { id: "101070101", name: "沈阳", enName: "Shenyang", province: "辽宁省" },
    { id: "101240101", name: "南昌", enName: "Nanchang", province: "江西省" }
  ];

  const randomCities = ref<typeof allPopularCities>([]);
  const doubledCities = ref<typeof allPopularCities>([]);

  onMounted(() => {
    const shuffled = [...allPopularCities].sort(() => 0.5 - Math.random());
    randomCities.value = shuffled.slice(0, 5);
    doubledCities.value = [...shuffled, ...shuffled, ...shuffled, ...shuffled];
  });
</script>

<style scoped>
  .marquee-left {
    animation: marquee-left 90s linear infinite;
  }

  .marquee-right {
    animation: marquee-right 90s linear infinite;
  }

  .hover\:pause:hover {
    animation-play-state: paused;
  }

  @keyframes marquee-left {
    0% {
      transform: translateX(0);
    }

    100% {
      transform: translateX(-50%);
    }
  }

  @keyframes marquee-right {
    0% {
      transform: translateX(-50%);
    }

    100% {
      transform: translateX(0);
    }
  }

  /* 渐变遮罩边缘，让滚动看起来更自然且不突兀，两端留白更克制 */
  .mask-edges {
    mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
    -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
  }

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
