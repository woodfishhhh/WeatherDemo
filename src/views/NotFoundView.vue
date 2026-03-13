<script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  import BilingualStack from '@/components/BilingualStack.vue';

  const route = useRoute();

  const attemptedPath = computed(() => route.fullPath || '/');
</script>

<template>
  <main class="container relative z-10 min-h-screen flex items-center py-32 md:py-40">
    <section class="w-full max-w-5xl mx-auto grid gap-10 md:grid-cols-[1.35fr_0.9fr] md:gap-16 items-end">
      <div class="relative">
        <p class="not-found-ghost">404</p>
        <BilingualStack
          en="Page Missing"
          zh="页面缺席"
          wrapper-class="flex flex-col gap-3 mb-6"
          en-class="text-[10px] md:text-xs uppercase tracking-[0.45em] font-bold"
          zh-class="text-base md:text-lg font-light tracking-[0.06em]"
        />
        <div class="max-w-3xl space-y-4">
          <p class="text-6xl md:text-[7rem] leading-none tracking-tighter font-light">Forecast not found.</p>
          <p class="text-3xl md:text-5xl leading-none tracking-tight font-light text-brand-muted/88">天气页面未找到。</p>
        </div>
        <div class="mt-8 max-w-xl text-sm md:text-base leading-7 text-brand-muted/70 space-y-2">
          <p>The page you requested drifted out of range. Try heading back to the main search and pick a saved city from there.</p>
          <p>你访问的页面已经偏离当前范围。可以返回首页，从搜索或已收藏城市重新进入。</p>
        </div>
      </div>

      <div class="border border-brand-primary/10 bg-brand-accent/72 backdrop-blur-sm p-8 md:p-10 rounded-[2rem] shadow-2xl shadow-black/30">
        <div class="flex items-center gap-4 mb-8">
          <div class="w-12 h-px bg-brand-primary"></div>
          <p class="text-[10px] tracking-[0.26em] font-bold">Requested Path / 请求路径</p>
        </div>

        <p class="break-all text-xl md:text-2xl tracking-tight font-light">
          {{ attemptedPath }}
        </p>

        <RouterLink
          to="/"
          class="inline-flex items-center gap-4 mt-10 text-xs md:text-sm uppercase tracking-[0.35em] font-bold border-b border-brand-primary pb-3 transition-opacity duration-300 hover:opacity-60"
        >
          <span>Return Home / 返回首页</span>
          <span aria-hidden="true">01</span>
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
  .not-found-ghost {
    position: absolute;
    top: -4.75rem;
    left: -0.35rem;
    margin: 0;
    font-size: clamp(7rem, 19vw, 14rem);
    line-height: 0.9;
    font-weight: 700;
    letter-spacing: -0.08em;
    opacity: 0.04;
    pointer-events: none;
    user-select: none;
  }
</style>
