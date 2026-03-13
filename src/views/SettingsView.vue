<template>
  <main class="container relative z-10 min-h-screen pt-28 pb-20 sm:pt-32 md:pt-40 md:pb-28">
    <section class="max-w-5xl">
      <BilingualStack
        en="Settings"
        zh="设置"
        wrapper-class="flex flex-col gap-3"
        en-class="text-[10px] md:text-xs uppercase tracking-[0.38em] font-bold text-brand-muted/75"
        zh-class="text-lg md:text-xl font-light tracking-[0.08em]"
      />
      <div class="mt-6 space-y-4">
        <p data-testid="settings-heading" class="text-5xl md:text-7xl font-light tracking-tighter">
          Personalization controls are queued next.
        </p>
        <p class="text-3xl md:text-5xl font-light tracking-tight text-brand-muted/88">
          个性化控制将在下一阶段接入。
        </p>
      </div>
      <div class="mt-8 max-w-2xl text-sm md:text-base leading-7 text-brand-muted/70 space-y-2">
        <p>This shell keeps the route contract stable while we continue through the platform roadmap.</p>
        <p>这个页面先保留稳定的路由结构，便于后续继续接入平台级设置能力。</p>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
  import BilingualStack from '@/components/BilingualStack.vue';
</script>
