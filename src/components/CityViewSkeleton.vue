<template>
  <div class="flex flex-col flex-1 items-center">
    <!-- 概览区域骨架屏 -->
    <div class="flex container flex-col items-center py-12 w-full">
      <!-- 城市名称 -->
      <AnimatedPlaceholder class="max-w-[200px] w-full h-[40px] mb-2" />
      <!-- 温度 -->
      <AnimatedPlaceholder class="max-w-[150px] w-full h-[96px] mb-8" />
      <!-- 湿度和风向等细节 -->
      <AnimatedPlaceholder class="max-w-[180px] w-full h-[24px] mb-2" />
      <AnimatedPlaceholder class="max-w-[200px] w-full h-[24px] mb-2" />
      <AnimatedPlaceholder class="max-w-[120px] w-full h-[28px] mt-4" />
      <hr class="border border-white/50 mt-4 w-full" />
    </div>

    <!-- 预报区域骨架屏 -->
    <div class="max-w-screen-md w-full py-6">
      <div class="mx-8">
        <div class="flex items-center justify-between mb-4 px-2">
          <AnimatedPlaceholder class="max-w-[100px] w-full h-[24px]" />
          <AnimatedPlaceholder class="max-w-[160px] w-full h-[20px]" />
        </div>

        <div class="flex gap-4 overflow-x-hidden pb-4">
          <!-- 模拟渲染 3 个预报卡片 -->
          <div v-for="i in 3" :key="i"
            class="flex flex-col flex-shrink-0 bg-weather-secondary rounded-xl p-5 text-center shadow-md border border-white/10"
            style="min-width: 200px">
            <AnimatedPlaceholder class="w-full h-[28px] mb-1" />
            <div class="my-3 flex justify-around text-sm border-t border-b border-white/20 py-2 gap-4">
              <div class="flex flex-col items-center flex-1">
                <AnimatedPlaceholder class="w-full h-[16px] mb-2" />
                <AnimatedPlaceholder class="w-full h-[20px] mb-1" />
                <AnimatedPlaceholder class="w-full h-[32px] my-1" />
                <AnimatedPlaceholder class="w-full h-[16px]" />
              </div>
              <div class="flex flex-col items-center flex-1">
                <AnimatedPlaceholder class="w-full h-[16px] mb-2" />
                <AnimatedPlaceholder class="w-full h-[20px] mb-1" />
                <AnimatedPlaceholder class="w-full h-[32px] my-1" />
                <AnimatedPlaceholder class="w-full h-[16px]" />
              </div>
            </div>
            <AnimatedPlaceholder class="w-[80%] mx-auto h-[16px]" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import AnimatedPlaceholder from './AnimatedPlaceholder.vue';
</script>
