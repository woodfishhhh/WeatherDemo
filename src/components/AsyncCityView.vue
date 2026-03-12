<template>
  <div class="flex flex-col flex-1 items-center">
    <div v-if="route.query.adcode" class="text-white p-4 bg-weather-secondary w-full text-center ">
      <p>预览中,你当前没有添加该城市到收藏</p>
    </div>

    <div class="flex container flex-col items-center text-white py-12" v-if="weatherData?.current?.lives?.length">
      <h1 class="text-4xl mb-2">{{ route.params.city }}</h1>
      <p class="text-8xl mb-8">
        {{ weatherData.current.lives[0].temperature }}&deg;
      </p>
      <p>
        湿度: {{ weatherData.current.lives[0].humidity }} %
      </p>
      <p>
        风向: {{ weatherData.current.lives[0].winddirection }}风 {{ weatherData.current.lives[0].windpower }}级
      </p>
      <p class="capitalize mt-4 text-xl">
        天气: {{ weatherData.current.lives[0].weather }}
      </p>
      <hr class="border border-white/50 mt-4 w-full" />
    </div>

    <div class="max-w-screen-md w-full py-6" v-if="weatherData?.forecast?.forecasts?.length">
      <div class="mx-8 text-white">
        <div class="flex items-center justify-between mb-4 text-sm px-2">
          <h2 class="text-lg">未来几日预报</h2>
          <span class="text-gray-300">发布时间: {{ weatherData.forecast.forecasts[0].reporttime }}</span>
        </div>

        <!-- 左右滑动，隐藏滚动条，支持鼠标拖拽 -->
        <div ref="scrollContainer" class="flex gap-4 overflow-x-auto pb-4 select-none scrollbar-hide"
          :class="[isDragging ? 'cursor-grabbing snap-none' : 'cursor-grab snap-x']" @mousedown="startDrag"
          @mouseleave="stopDrag" @mouseup="stopDrag" @mousemove="doDrag">
          <div v-for="(cast, index) in weatherData.forecast.forecasts[0].casts" :key="index"
            class="flex flex-col flex-shrink-0 bg-weather-secondary rounded-xl p-5 text-center shadow-md snap-center border border-white/10"
            style="min-width: 200px">
            <p class="font-bold text-lg mb-1">{{ cast.date }} (星期{{ cast.week }})</p>

            <div class="my-3 flex justify-around text-sm border-t border-b border-white/20 py-2">
              <div class="flex flex-col">
                <span class="text-gray-300 mb-1">白天</span>
                <span>{{ cast.dayweather }}</span>
                <span class="text-2xl font-bold my-1">{{ cast.daytemp }}&deg;</span>
                <span class="text-xs">{{ cast.daywind }}风 {{ cast.daypower }}级</span>
              </div>
              <div class="w-px bg-white/20"></div>
              <div class="flex flex-col">
                <span class="text-gray-300 mb-1">夜间</span>
                <span>{{ cast.nightweather }}</span>
                <span class="text-2xl font-bold my-1">{{ cast.nighttemp }}&deg;</span>
                <span class="text-xs">{{ cast.nightwind }}风 {{ cast.nightpower }}级</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!weatherData?.current?.lives?.length" class=" text-white py-12">
      <p>暂无该城市天气数据</p>
    </div>
  </div>
</template>

<script setup>
  import axios from 'axios';
  import { useRoute } from 'vue-router';
  import { ref } from 'vue';

  const gaodeKey = "REMOVED_GAODE_KEY";
  const route = useRoute();

  // ----- 鼠标拖拽滚动逻辑 -----
  const scrollContainer = ref(null);
  const isDragging = ref(false);
  const startX = ref(0);
  const scrollLeft = ref(0);

  const startDrag = (e) => {
    isDragging.value = true;
    startX.value = e.pageX - scrollContainer.value.offsetLeft;
    scrollLeft.value = scrollContainer.value.scrollLeft;
  };

  const stopDrag = () => {
    isDragging.value = false;
  };

  const doDrag = (e) => {
    if (!isDragging.value) return;
    e.preventDefault();
    const x = e.pageX - scrollContainer.value.offsetLeft;
    const walk = (x - startX.value) * 1.5; // 控制滑动距离及速度
    scrollContainer.value.scrollLeft = scrollLeft.value - walk;
  };

  const getWeatherData = async (cityParam) => {
    try {
      // extensions="base" 获取实况天气，extensions="all" 获取预报天气
      const [currentRes, forecastRes] = await Promise.all([
        axios.get('https://restapi.amap.com/v3/weather/weatherInfo', {
          params: { key: gaodeKey, city: cityParam, extensions: 'base' },
        }),
        axios.get('https://restapi.amap.com/v3/weather/weatherInfo', {
          params: { key: gaodeKey, city: cityParam, extensions: 'all' },
        })
      ]);

      return {
        current: currentRes.data,
        forecast: forecastRes.data
      };
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // 通过路由参数传入城市名称进行查询
  const weatherData = await getWeatherData(route.params.city);
  console.log(weatherData);

</script>

<style scoped>

  /* 隐藏滚动条但保留滚动功能 */
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    /* IE and Edge */
    scrollbar-width: none;
    /* Firefox */
  }
</style>