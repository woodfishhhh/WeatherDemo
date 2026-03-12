<template>
  <div class="flex py-6 px-6 bg-white/10 rounded-xl shadow-md backdrop-blur-md border border-white/10">
    <div class="flex flex-col flex-1 justify-between">
      <div>
        <AnimatedPlaceholder class="max-w-[150px] w-full h-[36px] mb-2" />
        <AnimatedPlaceholder class="max-w-[100px] w-full h-[20px]" />
      </div>
      <AnimatedPlaceholder class="max-w-[80px] w-full h-[24px] mt-4" />
    </div>

    <div class="flex flex-col items-end justify-between">
      <AnimatedPlaceholder class="max-w-[80px] w-full h-[48px]" />
      <AnimatedPlaceholder class="max-w-[120px] w-full h-[16px] mt-4" />
    </div>
  </div>
</template>

<script setup>
  import AnimatedPlaceholder from './AnimatedPlaceholder.vue';
</script>
