<template>
  <div
    class="relative group grid grid-cols-2 md:grid-cols-4 gap-4 items-center py-8 border-b border-brand-primary/10 cursor-pointer hover:border-brand-primary transition-colors duration-500 overflow-hidden">

    <div class="flex flex-col col-span-2 md:col-span-1 z-10">
      <h2
        class="text-3xl md:text-4xl font-light tracking-tight group-hover:translate-x-4 transition-transform duration-700 ease-out">
        {{ city.city }}</h2>
      <p v-if="weatherData"
        class="text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-brand-muted/40 mt-2">
        {{ weatherData.province }}
      </p>
    </div>

    <div v-if="weatherData" class="col-span-1 hidden md:flex flex-col z-10">
      <p class="text-sm uppercase tracking-widest font-medium">{{ weatherData.weather }}</p>
      <p class="text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-brand-muted/40 mt-2">Conditions</p>
    </div>

    <div v-if="weatherData" class="col-span-1 hidden md:flex flex-col z-10">
      <p class="text-sm uppercase tracking-widest font-medium">H: {{ weatherData.humidity }}% / Wind: {{
        weatherData.windpower }}</p>
      <p class="text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-brand-muted/40 mt-2">Details</p>
    </div>

    <div class="flex justify-end items-center col-span-2 md:col-span-1 z-10">
      <p v-if="weatherData" class="text-5xl md:text-7xl font-light tracking-tighter">{{ weatherData.temperature }}&deg;
      </p>
    </div>

    <!-- Hover Background & Delete Layer -->
    <div
      class="absolute inset-0 z-20 bg-brand-primary text-surface flex items-center justify-end px-8 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none transform origin-right scale-x-0 group-hover:scale-x-100 ease-in-out">
      <button @click.stop="deleteCity"
        class="pointer-events-auto flex items-center gap-3 hover:opacity-50 transition-opacity uppercase tracking-[0.3em] text-xs font-bold mt-12 mb-12">
        <span>Remove</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
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

  const deleteCity = () => {
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
