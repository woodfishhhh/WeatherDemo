<template>
  <div class="flex items-center gap-4 sm:gap-6">
    <div class="w-10 sm:w-12 md:w-16 h-[2px] bg-brand-primary"></div>
    <p class="text-[10px] md:text-xs tracking-[0.26em] sm:tracking-[0.34em] font-bold">PLATFORM ENTRY / 平台入口</p>
  </div>

  <section data-testid="workspace-shortcuts" class="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-5 md:gap-6">
    <PlatformPanel tone="elevated" class="px-5 py-6 md:px-8 md:py-8">
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="text-[10px] uppercase tracking-[0.34em] font-bold text-brand-muted/70">Workspace / 工作台</p>
          <p class="mt-4 text-2xl md:text-4xl font-light tracking-tight">Monitor saved cities without breaking the home rhythm.</p>
          <p class="mt-3 text-sm leading-7 text-brand-muted/72 max-w-2xl">
            Use the workspace to compare your saved list, reopen recent cities, and carry the route handoff forward after a city-detail detour.
          </p>
        </div>
        <div class="grid grid-cols-3 gap-3 md:min-w-[16rem]">
          <PlatformStatRow label="Saved" :value="workspaceShortcutSummary.savedCount" tone="transparent" />
          <PlatformStatRow label="Recent" :value="workspaceShortcutSummary.recentCount" tone="transparent" />
          <PlatformStatRow label="Compare" :value="workspaceShortcutSummary.compareCount" tone="transparent" />
        </div>
      </div>

      <div class="mt-8 flex flex-col md:flex-row gap-3">
        <button
          type="button"
          @click="emit('open-workspace', 'all')"
          class="inline-flex items-center justify-center rounded-full border border-brand-primary/18 px-5 py-3 text-xs uppercase tracking-[0.3em] font-bold transition-colors duration-300 hover:bg-brand-primary hover:text-brand-text">
          Open Workspace / 打开工作台
        </button>
        <button
          type="button"
          @click="emit('open-workspace', 'recent')"
          class="inline-flex items-center justify-center rounded-full border border-brand-primary/12 px-5 py-3 text-xs uppercase tracking-[0.3em] font-bold text-brand-muted/85 transition-colors duration-300 hover:border-brand-primary/28 hover:text-brand-primary">
          View Recent / 查看最近
        </button>
      </div>
    </PlatformPanel>

    <div class="grid grid-cols-1 gap-5">
      <PlatformPanel tone="elevated" class="px-5 py-6 md:px-7 md:py-7">
        <p class="text-[10px] uppercase tracking-[0.34em] font-bold text-brand-muted/70">Recent Locations / 最近查看</p>
        <div v-if="recentLocations.length" class="mt-5 flex flex-wrap gap-3">
          <button
            v-for="city in recentLocations"
            :key="city.id"
            type="button"
            data-testid="recent-location-chip"
            @click="emit('open-recent-city', city)"
            class="rounded-full border border-brand-primary/12 px-4 py-2 text-xs uppercase tracking-[0.24em] font-bold transition-colors duration-300 hover:bg-brand-primary hover:text-brand-text">
            {{ city.city }}
          </button>
        </div>
        <p v-else class="mt-5 text-sm leading-7 text-brand-muted/68">
          Recent locations appear here after you open city forecasts from search or saved cards.
        </p>
      </PlatformPanel>

      <PlatformPanel tone="elevated" class="px-5 py-6 md:px-7 md:py-7">
        <p class="text-[10px] uppercase tracking-[0.34em] font-bold text-brand-muted/70">Quick Compare / 快速对比</p>
        <div v-if="comparePreview.length" class="mt-5 space-y-3">
          <div v-for="city in comparePreview" :key="city.id" class="flex items-center justify-between gap-4">
            <div>
              <p class="text-xl font-light tracking-tight">{{ city.city }}</p>
              <p class="mt-1 text-[10px] uppercase tracking-[0.22em] text-brand-muted/68">{{ city.province }}</p>
            </div>
            <button
              type="button"
              @click="emit('open-compare-city', city)"
              class="rounded-full border border-brand-primary/12 px-4 py-2 text-[10px] uppercase tracking-[0.24em] font-bold transition-colors duration-300 hover:bg-brand-primary hover:text-brand-text">
              Open / 打开
            </button>
          </div>
        </div>
        <p v-else class="mt-5 text-sm leading-7 text-brand-muted/68">
          Save two cities and the compare launch surface will stay ready here.
        </p>
      </PlatformPanel>
    </div>
  </section>
</template>

<script setup lang="ts">
  import PlatformPanel from '@/components/platform/PlatformPanel.vue';
  import PlatformStatRow from '@/components/platform/PlatformStatRow.vue';
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
