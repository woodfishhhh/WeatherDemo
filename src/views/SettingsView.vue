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
      <div class="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
        <div class="border border-brand-primary/10 rounded-[1.6rem] px-5 py-5 bg-brand-accent/18">
          <p class="text-[10px] uppercase tracking-[0.28em] font-bold text-brand-muted/70">Temperature / 温度单位</p>
          <p class="mt-3 text-2xl font-light tracking-tight">{{ temperatureUnit }}</p>
        </div>
        <div class="border border-brand-primary/10 rounded-[1.6rem] px-5 py-5 bg-brand-accent/18">
          <p class="text-[10px] uppercase tracking-[0.28em] font-bold text-brand-muted/70">Motion / 动效偏好</p>
          <p class="mt-3 text-2xl font-light tracking-tight">{{ reducedMotionLabel }}</p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
  import { computed, onMounted } from 'vue';
  import { storeToRefs } from 'pinia';
  import BilingualStack from '@/components/BilingualStack.vue';
  import { useSettingsStore } from '@/features/settings/stores/settings';

  const settingsStore = useSettingsStore();
  const { reducedMotion, temperatureUnit } = storeToRefs(settingsStore);

  const reducedMotionLabel = computed(() => {
    if (reducedMotion.value === true) {
      return 'On / 开启';
    }

    if (reducedMotion.value === false) {
      return 'Off / 关闭';
    }

    return 'System / 跟随系统';
  });

  onMounted(() => {
    settingsStore.hydrate();
  });
</script>
