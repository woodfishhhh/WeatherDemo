<template>
  <div
    class="relative group flex py-6 px-6 bg-white/10 rounded-xl shadow-md cursor-pointer backdrop-blur-md hover:-translate-y-1 hover:shadow-xl hover:bg-white/20 transition-all duration-300 text-white border border-white/10">
    <!-- 左侧：城市与地理位置 -->
    <div class="flex flex-col flex-1 justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-wider">{{ city.city }}</h2>
        <p v-if="weatherData" class="text-sm text-gray-300 mt-1">
          {{ weatherData.province }} {{ weatherData.city }}
        </p>
      </div>
      <!-- 底部天气描述 -->
      <span v-if="weatherData" class="text-base font-medium tracking-wide mt-4">
        {{ weatherData.weather }}
      </span>
    </div>

    <!-- 右侧：温度与细节参数 -->
    <div class="flex flex-col items-end justify-between" v-if="weatherData">
      <p class="text-5xl font-light">{{ weatherData.temperature }}&deg;</p>
      <div class="flex gap-4 text-xs font-light tracking-wide text-gray-300 mt-4">
        <span>降水概率/湿度: {{ weatherData.humidity }}%</span>
        <span>{{ weatherData.winddirection }}风 {{ weatherData.windpower }}</span>
      </div>
    </div>

    <!-- 删除按钮（悬浮时显示） -->
    <button @click.stop="deleteCity"
      class="absolute top-3 right-3 text-white/50 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  </div>
</template>

<script setup>
  import { computed } from 'vue';

  const props = defineProps({
    city: {
      type: Object,
      required: true,
      default: () => ({})
    },
  });

  const emit = defineEmits(['delete']);

  // 删除城市逻辑
  const deleteCity = () => {
    // 1. 读取 localStorage 中的现有城市
    const savedCities = JSON.parse(localStorage.getItem("savedCities") || "[]");

    // 2. 过滤掉要删除的当前城市实体 (根据唯一 id 寻找并剔除)
    const updatedCities = savedCities.filter((c) => c.id !== props.city.id);

    // 3. 重新将其存入 localStorage 以保存真实更改
    localStorage.setItem("savedCities", JSON.stringify(updatedCities));

    // 4. 将删除操作事件向外传递，父组件（如 CityList）收到后才能把列表里的卡片同步消除
    emit('delete', props.city.id);
  };

  // 计算属性：安全提取高德天气 lives 数组中的第一条天气数据
  const weatherData = computed(() => {
    if (props.city?.weather?.lives?.length > 0) {
      return props.city.weather.lives[0];
    }
    return null;
  });
</script>
