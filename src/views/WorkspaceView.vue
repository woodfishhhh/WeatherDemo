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
      <div class="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
        <div class="border border-brand-primary/10 rounded-[1.6rem] px-5 py-5 bg-brand-accent/18">
          <p class="text-[10px] uppercase tracking-[0.28em] font-bold text-brand-muted/70">Saved Cities / 已收藏城市</p>
          <p class="mt-3 text-2xl font-light tracking-tight">{{ savedCities.length }}</p>
        </div>
        <div class="border border-brand-primary/10 rounded-[1.6rem] px-5 py-5 bg-brand-accent/18">
          <p class="text-[10px] uppercase tracking-[0.28em] font-bold text-brand-muted/70">Recent Group / 当前分组</p>
          <p class="mt-3 text-2xl font-light tracking-tight">{{ selectedGroup }}</p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue';
  import { storeToRefs } from 'pinia';
  import BilingualStack from '@/components/BilingualStack.vue';
  import { useLocationsStore } from '@/features/locations/stores/locations';
  import { useWorkspaceStore } from '@/features/workspace/stores/workspace';

  const locationsStore = useLocationsStore();
  const workspaceStore = useWorkspaceStore();
  const { savedCities } = storeToRefs(locationsStore);
  const { selectedGroup } = storeToRefs(workspaceStore);

  onMounted(() => {
    void locationsStore.loadSavedCities();
  });
</script>
