<template>
  <div class="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12 mb-10 w-full lg:w-2/3">
    <div class="flex-1 h-[1px] bg-brand-primary/20 w-full md:w-auto"></div>
    <BilingualStack en="WORKSPACE PLATFORM" zh="工作区平台" wrapper-class="flex items-center gap-3" en-class="text-xs md:text-sm tracking-[0.4em] font-medium uppercase shrink-0" zh-class="text-sm font-light shrink-0 opacity-60" />
  </div>

  <section data-testid="workspace-shortcuts"
    class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start w-full mx-auto md:w-5/6">
    <div class="border-t-2 border-brand-primary/20 pt-8 flex flex-col h-full group">
      <div>
        <BilingualStack en="Orchestration" zh="气象调度场" wrapper-class="flex flex-col gap-1 mb-6" en-class="text-[10px] uppercase tracking-[0.4em] font-medium text-brand-muted/70" zh-class="text-xs font-light opacity-60" />
        <BilingualStack en="The strategic overview of your monitored ecosystems." zh="掌控并对比您关注的全球气象动态" wrapper-class="flex flex-col gap-4 mt-4" en-class="text-3xl md:text-5xl font-medium tracking-tighter leading-[1.1]" zh-class="text-xl font-light opacity-80" />
        <BilingualStack en="Seamlessly navigate between saved coordinates, reopen recent analyses, and maintain global atmospheric awareness." zh="在已保存的城市和历史记录间无缝切换，建立全球气象认知。" wrapper-class="flex flex-col gap-2 mt-6" en-class="text-base font-light leading-relaxed text-brand-secondary" zh-class="text-sm font-light opacity-60 text-brand-secondary" />
      </div>

      <div class="mt-12 mb-12 flex gap-8">
        <div class="flex flex-col gap-2">
          <span class="text-5xl font-light tracking-tighter">{{ workspaceShortcutSummary.savedCount }}</span>
          <BilingualStack en="Saved" zh="已收藏" en-class="text-[10px] uppercase tracking-[0.3em] text-brand-muted" zh-class="text-xs font-light opacity-60" />
        </div>
        <div class="flex flex-col gap-2">
          <span class="text-5xl font-light tracking-tighter opacity-70">{{ workspaceShortcutSummary.recentCount }}</span>
          <BilingualStack en="Recent" zh="最近访问" en-class="text-[10px] uppercase tracking-[0.3em] text-brand-muted" zh-class="text-xs font-light opacity-60" />
        </div>
        <div class="flex flex-col gap-2">
          <span class="text-5xl font-light tracking-tighter opacity-40">{{ workspaceShortcutSummary.compareCount }}</span>
          <BilingualStack en="Compare" zh="对比分析" en-class="text-[10px] uppercase tracking-[0.3em] text-brand-muted" zh-class="text-xs font-light opacity-60" />
        </div>
      </div>

      <div class="mt-auto flex flex-col gap-6 pt-8 border-t border-brand-primary/10">
        <button type="button" data-testid="open-workspace-button" @click="emit('open-workspace', 'all')"
          class="text-left transition-all duration-300 hover:text-brand-secondary flex items-center justify-between group-hover:pl-4">
          <BilingualStack en="Enter Workspace" zh="进入工作台" wrapper-class="flex flex-col gap-1" en-class="text-sm uppercase tracking-[0.3em] font-medium" zh-class="text-xs font-light opacity-60" />
          <span class="ml-4 text-xl">↗</span>
        </button>
      </div>
    </div>

    <div class="flex flex-col gap-16 lg:mt-32">
      <div class="border-b border-brand-primary/20 pb-8">
        <BilingualStack en="Recent Atlas" zh="历史访问轨迹" wrapper-class="flex flex-col gap-1 mb-8" en-class="text-[10px] uppercase tracking-[0.4em] font-medium text-brand-muted/70" zh-class="text-xs font-light opacity-60" />
        
        <div v-if="recentLocations.length" class="flex flex-wrap gap-4">
          <button v-for="city in recentLocations" :key="city.id" type="button" data-testid="recent-location-chip"
            @click="emit('open-recent-city', city)"
            class="pb-1 border-b border-brand-primary/30 transition-all duration-300 hover:border-brand-primary hover:text-brand-secondary">
            <BilingualStack :en="city.city" :zh="city.city" wrapper-class="flex flex-col items-start gap-1" en-class="text-sm uppercase tracking-[0.2em] font-medium" zh-class="text-xs font-light opacity-60" />
          </button>
        </div>
        <BilingualStack v-else en="The history slate remains unmarked." zh="尚无气象访问记录" en-class="text-lg font-light text-brand-muted/68" zh-class="text-sm font-light text-brand-muted/40 mt-1" />
      </div>

      <div>
        <BilingualStack en="Comparative Analysis" zh="气象对比分析" wrapper-class="flex flex-col gap-1 mb-8" en-class="text-[10px] uppercase tracking-[0.4em] font-medium text-brand-muted/70" zh-class="text-xs font-light opacity-60" />
        <div v-if="comparePreview.length" class="space-y-6">
          <div v-for="city in comparePreview" :key="city.id"
            data-testid="compare-preview-card"
            class="flex items-end justify-between gap-6 group/city cursor-pointer"
            @click="emit('open-compare-city', city)">
            <div>
              <BilingualStack :en="city.city" :zh="city.city" wrapper-class="group-hover/city:translate-x-2 transition-transform duration-500 flex items-center gap-3" en-class="text-3xl font-medium tracking-tight uppercase" zh-class="text-xl font-light opacity-60" />
              <BilingualStack :en="city.province" :zh="city.province" wrapper-class="mt-2" en-class="text-[10px] uppercase tracking-[0.3em] text-brand-muted/68" zh-class="hidden" />
            </div>
            <BilingualStack en="Compare ↗" zh="分析" wrapper-class="opacity-0 group-hover/city:opacity-100 transition-opacity duration-300 flex items-center gap-2" en-class="text-xs uppercase tracking-[0.3em] font-light" zh-class="text-xs font-light opacity-60" />
          </div>
        </div>
        <BilingualStack v-else en="Select multiple coordinates to initiate comparative telemetry." zh="尚未选择对比城市" en-class="text-lg font-light text-brand-muted/68" zh-class="text-sm font-light text-brand-muted/40 mt-1" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import BilingualStack from '@/components/BilingualStack.vue';
  import type { SavedCity } from '@/features/locations/services/persistence';

  defineProps<{
    comparePreview: SavedCity[];
    recentLocations: SavedCity[];
    workspaceShortcutSummary: {
      compareCount: number;
      recentCount: number;
      savedCount: number;
    };
  }>();

  const emit = defineEmits<{
    (event: 'open-compare-city', city: SavedCity): void;
    (event: 'open-recent-city', city: SavedCity): void;
    (event: 'open-workspace', group: 'all' | 'recent'): void;
  }>();
</script>
