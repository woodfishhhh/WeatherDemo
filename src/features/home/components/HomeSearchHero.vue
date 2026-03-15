<template>
  <div class="group relative mb-20 mt-10 w-full sm:mb-24 sm:mt-16 md:mb-32 md:mt-24">
    <div class="relative mb-8 -ml-1 overflow-hidden pointer-events-none select-none sm:-ml-4">
      <BilingualStack en="Forecast" zh="气象探索" wrapper-class="absolute left-1 top-0 z-10 sm:left-4 md:-top-12"
        en-class="text-[10px] md:text-xs uppercase tracking-[0.4em] font-medium text-brand-muted/60"
        zh-class="text-sm md:text-base font-zh-weight tracking-[0.1em]" />
      <h1
        class="block max-w-full overflow-hidden text-ellipsis pt-8 text-[clamp(4.5rem,22vw,11.25rem)] font-bold tracking-tighter leading-[0.8] opacity-90 uppercase md:pt-0 md:text-[180px]">
        FORECAST.
      </h1>
    </div>

    <div class="relative ml-0 mt-10 w-full border-t-2 border-brand-primary pt-6 sm:pt-8 md:ml-auto md:mt-12 md:w-3/4 lg:w-2/3">
      <div class="flex w-full flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <input v-model="searchQuery" data-testid="home-search-input" type="text" placeholder="SEARCH LOCATION"
          aria-label="Search location" @focus="emit('focus-input')" @blur="emit('blur-input')"
          @keydown.enter.prevent="emit('select-first-tip')"
          class="min-w-0 w-full max-w-full bg-transparent text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight leading-none uppercase placeholder:text-brand-muted/30 focus:outline-none transition-all duration-700" />
        <div class="shrink-0 self-start text-brand-secondary/80 transition-opacity sm:self-auto">
          <BilingualStack v-if="isSearching" en="Locating..." zh="定位中..." class="animate-pulse"
            en-class="text-xs uppercase tracking-widest" zh-class="text-xs opacity-60 text-right" />
          <BilingualStack v-else en="Search ↗" zh="搜索" en-class="text-xs uppercase tracking-widest"
            zh-class="text-xs opacity-60 text-right" />
        </div>
      </div>

      <transition name="fade">
        <ul v-if="showTips && searchResults.length" data-testid="search-results"
          class="absolute left-0 right-0 top-full z-30 mt-6 max-h-[60vh] overflow-y-auto overflow-x-hidden border-y-2 border-brand-primary bg-surface py-4 shadow-2xl md:mt-8">
          <li v-for="(tip, index) in searchResults" :key="tip.id" data-testid="search-result-item"
            :style="{ transitionDelay: `${index * 50}ms` }" @mousedown.prevent="emit('select-tip', tip)"
            class="group/item flex cursor-pointer flex-col items-start gap-3 border-b border-brand-primary/10 px-5 py-5 transition-all duration-500 hover:bg-brand-primary hover:text-brand-text last:border-0 sm:px-8 sm:py-6 md:flex-row md:items-center md:justify-between md:px-10 md:py-8">
            <BilingualStack :en="tip.name" :zh="tip.name" as="span"
              wrapper-class="flex min-w-0 max-w-full flex-col-reverse md:flex-row md:items-baseline md:gap-4"
              en-class="max-w-full overflow-hidden text-ellipsis text-2xl sm:text-4xl md:text-5xl font-semibold tracking-tighter uppercase"
              zh-class="max-w-full overflow-hidden text-ellipsis text-lg sm:text-xl md:text-2xl font-zh-weight opacity-60" />
            <BilingualStack :en="tip.province || tip.name"
              :zh="tip.district ? tip.province + ' — ' + tip.district : tip.province" as="span"
              wrapper-class="mt-1 flex min-w-0 max-w-full flex-col items-start md:mt-0 md:items-end"
              en-class="max-w-full overflow-hidden text-ellipsis text-xs sm:text-sm md:text-base uppercase tracking-[0.2em] opacity-70 transition-opacity duration-500 font-light md:opacity-50 md:group-hover/item:opacity-100"
              zh-class="max-w-full overflow-hidden text-ellipsis text-xs sm:text-sm font-zh-weight opacity-60 md:opacity-40 md:group-hover/item:opacity-80" />
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

    <transition name="fade">
      <div
        v-show="!searchQuery"
        data-testid="home-popular-cities-mobile"
        class="mt-10 md:hidden"
      >
        <BilingualStack
          en="Popular Cities"
          zh="热门城市"
          wrapper-class="mb-4 flex flex-col gap-1"
          en-class="text-[10px] uppercase tracking-[0.34em] font-medium text-brand-muted/60"
          zh-class="text-sm font-zh-weight text-brand-muted/60"
        />
        <div class="no-scrollbar -mx-4 overflow-x-auto px-4 pb-2">
          <div class="flex w-max gap-3 pr-4">
            <button
              v-for="city in allPopularCities"
              :key="`mobile-${city.id}`"
              type="button"
              class="flex min-w-[10rem] flex-col items-start rounded-[1.5rem] border border-brand-primary/10 bg-brand-accent/10 px-4 py-4 text-left transition-colors duration-500 hover:border-brand-primary/30 hover:bg-brand-accent/20"
              @mousedown.prevent="emit('select-tip', city as unknown as LocationRecord)"
            >
              <span class="max-w-full truncate text-lg font-medium tracking-tight">{{ city.name }}</span>
              <span class="mt-2 max-w-full truncate text-[10px] uppercase tracking-[0.32em] text-brand-muted/68">{{ city.enName }}</span>
              <span class="mt-3 max-w-full truncate text-xs font-zh-weight text-brand-secondary/80">{{ city.province }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-show="!searchQuery"
        class="relative left-1/2 z-0 mt-12 hidden w-[100vw] -translate-x-1/2 overflow-hidden pb-4 pt-6 mask-edges md:mt-16 md:block">
        <div class="flex flex-col gap-8 w-full opacity-80 hover:opacity-100 transition-opacity duration-1000">
          <div ref="topSetRef" class="flex w-max items-center" :style="{ transform: `translateX(${xTop}px)` }">
            <button v-for="(city, index) in doubledCities" :key="'zh-' + index" type="button"
              @mousedown.prevent="emit('select-tip', city as unknown as LocationRecord)"
              @mouseenter="onHover(city, index)" @mouseleave="onLeave"
              :class="['px-12 py-2 transition-all duration-700 flex items-center group cursor-pointer', activeCityId === city.id ? 'opacity-100' : 'opacity-40 hover:opacity-100']">
              <span
                class="text-2xl sm:text-3xl md:text-4xl font-light tracking-[0.4em] text-brand-primary whitespace-nowrap">{{
                  city.name }}</span>
            </button>
          </div>
          <div ref="bottomSetRef" class="flex w-max items-center -mt-6"
            :style="{ transform: `translateX(${xBottom}px)` }">
            <button v-for="(city, index) in doubledCities" :key="'en-' + index" type="button"
              @mousedown.prevent="emit('select-tip', city as unknown as LocationRecord)"
              :class="['px-12 py-2 transition-all duration-700 flex items-center group cursor-pointer', activeCityId === city.id ? 'opacity-100' : 'opacity-30']">
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
  import { ref, onMounted, onUnmounted } from 'vue';
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

  const doubledCities = ref<typeof allPopularCities>([]);

  // 跑马灯状态与物理引擎
  const topSetRef = ref<HTMLElement | null>(null);
  const bottomSetRef = ref<HTMLElement | null>(null);

  const xTop = ref(0);
  const xBottom = ref(0);
  let vTop = 0.5;
  let vBottom = -0.5;

  const baseSpeedTop = 0.5;
  const baseSpeedBottom = -0.5;

  const activeCityId = ref<string | null>(null);
  let activeIndex = -1;
  let isTracking = false;

  let topSetWidth = 0;
  let bottomSetWidth = 0;
  let rafId: number;

  const onHover = (city: typeof allPopularCities[0], index: number) => {
    activeCityId.value = city.id;
    activeIndex = index;
    isTracking = true;
  };

  const onLeave = () => {
    activeCityId.value = null;
    activeIndex = -1;
    isTracking = false;
  };

  const loop = () => {
    if (!topSetRef.value || !bottomSetRef.value) return;

    if (topSetWidth === 0) {
      topSetWidth = topSetRef.value.scrollWidth / 4;
      bottomSetWidth = bottomSetRef.value.scrollWidth / 4;
      if (topSetWidth === 0) {
        rafId = requestAnimationFrame(loop);
        return;
      }
    }

    if (isTracking && activeIndex !== -1) {
      // 减缓中文行
      vTop += (0 - vTop) * 0.1;

      const topChildren = topSetRef.value.children;
      const bottomChildren = bottomSetRef.value.children;

      const topEl = topChildren[activeIndex] as HTMLElement;
      const bottomEl = bottomChildren[activeIndex] as HTMLElement;

      if (topEl && bottomEl) {
        // 计算目标视觉中心
        const topElCenter = topEl.offsetLeft + topEl.offsetWidth / 2;
        const bottomElCenter = bottomEl.offsetLeft + bottomEl.offsetWidth / 2;

        const idealXBottom = xTop.value + topElCenter - bottomElCenter;

        // 最短路径对齐
        let err = idealXBottom - xBottom.value;
        err = ((err % bottomSetWidth) + bottomSetWidth) % bottomSetWidth;
        if (err > bottomSetWidth / 2) {
          err -= bottomSetWidth;
        }

        // 吸附弹性计算 (根据上文设定的弹簧效果)
        vBottom += err * 0.005;
        vBottom -= vBottom * 0.08;
      }
    } else {
      // 恢复滚动基准速度
      vTop += (baseSpeedTop - vTop) * 0.02;
      vBottom += (baseSpeedBottom - vBottom) * 0.02;
    }

    xTop.value += vTop;
    xBottom.value += vBottom;

    // 循环复位
    if (xTop.value > 0) xTop.value -= topSetWidth;
    if (xTop.value < -topSetWidth * 2) xTop.value += topSetWidth;

    if (xBottom.value > 0) xBottom.value -= bottomSetWidth;
    if (xBottom.value < -bottomSetWidth * 2) xBottom.value += bottomSetWidth;

    rafId = requestAnimationFrame(loop);
  };

  onMounted(() => {
    const shuffled = [...allPopularCities].sort(() => 0.5 - Math.random());
    doubledCities.value = [...shuffled, ...shuffled, ...shuffled, ...shuffled];

    requestAnimationFrame(() => {
      // 初始化起点和开始渲染循环
      setTimeout(() => {
        if (topSetRef.value && bottomSetRef.value) {
          topSetWidth = topSetRef.value.scrollWidth / 4;
          bottomSetWidth = bottomSetRef.value.scrollWidth / 4;
          xTop.value = -topSetWidth * 2;
          xBottom.value = -bottomSetWidth * 2;
          rafId = requestAnimationFrame(loop);
        }
      }, 100);
    });
  });

  onUnmounted(() => {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
  });
</script>

<style scoped>

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
