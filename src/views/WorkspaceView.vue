<template>
  <main class="container relative z-10 min-h-screen pt-28 pb-20 sm:pt-32 md:pt-40 md:pb-28">
    <section class="max-w-5xl">
      <BilingualStack
        en="Workspace"
        zh="工作台"
        wrapper-class="flex flex-col gap-3"
        en-class="text-[10px] md:text-xs uppercase tracking-[0.38em] font-bold text-brand-muted/75"
        zh-class="text-lg md:text-xl font-light tracking-[0.08em]"
      />
      <div class="mt-6 space-y-4">
        <p data-testid="workspace-heading" class="text-5xl md:text-7xl font-light tracking-tighter">
          Multi-city monitoring is taking shape.
        </p>
        <p class="text-3xl md:text-5xl font-light tracking-tight text-brand-muted/88">
          多城市监测工作台正在形成。
        </p>
      </div>
      <div class="mt-8 max-w-2xl text-sm md:text-base leading-7 text-brand-muted/70 space-y-2">
        <p>This route is reserved for the workspace dashboard from the `.sisyphus` plan and keeps a stable smoke target.</p>
        <p>这个页面将承接 `.sisyphus` 计划中的多城市工作台，也为当前验证保留了稳定入口。</p>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
  import BilingualStack from '@/components/BilingualStack.vue';
</script>
