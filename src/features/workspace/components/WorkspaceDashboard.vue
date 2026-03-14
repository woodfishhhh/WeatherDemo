<script setup lang="ts">
  import BilingualStack from "@/components/BilingualStack.vue";
  import PlatformEmptyState from "@/components/platform/PlatformEmptyState.vue";
  import PlatformStatRow from "@/components/platform/PlatformStatRow.vue";
  import WorkspaceCityCard from "@/features/workspace/components/WorkspaceCityCard.vue";
  import WorkspaceComparePanel from "@/features/workspace/components/WorkspaceComparePanel.vue";
  import WorkspaceFilterBar from "@/features/workspace/components/WorkspaceFilterBar.vue";
  import { useWorkspaceDashboard } from "@/features/workspace/composables/useWorkspaceDashboard";

  const {
    activeGroupCopy,
    compareMetrics,
    compareRecords,
    groupCounts,
    openCity,
    prefersReducedMotion,
    removeCity,
    selectGroup,
    selectedGroup,
    syncErrorReason,
    syncStatus,
    toggleCompareForCity,
    toggleFavoriteForCity,
    visibleCityRecords,
    workspaceSummary,
  } = useWorkspaceDashboard();
</script>

<template>
  <main class="container relative z-10 min-h-screen pt-28 pb-20 sm:pt-32 md:pt-40 md:pb-28">
    <section class="max-w-6xl">
      <BilingualStack
        en="Workspace"
        zh="工作台"
        wrapper-class="flex flex-col gap-3"
        en-class="text-[10px] md:text-xs uppercase tracking-[0.38em] font-bold text-brand-muted/75"
        zh-class="text-lg md:text-xl font-light tracking-[0.08em]"
      />

      <div class="mt-6 grid grid-cols-1 gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
        <div class="space-y-4">
          <p data-testid="workspace-heading" class="text-5xl md:text-7xl font-light tracking-tighter">
            Multi-city monitoring now lives in a real workspace route.
          </p>
          <p class="text-3xl md:text-5xl font-light tracking-tight text-brand-muted/88">
            多城市监测已经接入真正的工作台页面。
          </p>
          <div class="max-w-3xl text-sm md:text-base leading-7 text-brand-muted/70 space-y-2">
            <p>
              Grouped saved cities, URL-backed filters, compact compare metrics, and mini trend panels now share one restrained monitoring surface.
            </p>
            <p>
              打开任意城市卡片时，当前分组和对比集合也会继续带到城市详情页，不会中断这条旅程。
            </p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
          <PlatformStatRow label="Saved" :value="workspaceSummary.savedCount" tone="elevated" />
          <PlatformStatRow label="Favorites" :value="workspaceSummary.favoriteCount" tone="elevated" />
          <PlatformStatRow label="Recent" :value="workspaceSummary.recentCount" tone="elevated" />
          <PlatformStatRow label="Compare" :value="workspaceSummary.compareCount" tone="elevated" />
        </div>
      </div>
    </section>

    <WorkspaceFilterBar
      :active-group="selectedGroup"
      :group-counts="groupCounts"
      @select-group="selectGroup"
    />

    <div v-if="syncStatus === 'recoverable-error' && syncErrorReason" class="mt-8 max-w-3xl">
      <p class="text-xs tracking-[0.18em] font-bold text-brand-muted/75">
        Sync fallback active / 同步回退已启用: {{ syncErrorReason }}
      </p>
    </div>

    <section class="mt-12 grid grid-cols-1 gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:items-start">
      <div>
        <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p class="text-[10px] uppercase tracking-[0.34em] font-bold text-brand-muted/70">Saved Group / 当前分组</p>
            <h2 class="mt-4 text-3xl md:text-4xl font-light tracking-tight">{{ activeGroupCopy.title }}</h2>
          </div>
          <p class="max-w-xl text-sm leading-7 text-brand-muted/68">
            {{ activeGroupCopy.description }}
          </p>
        </div>

        <div
          v-if="visibleCityRecords.length"
          data-testid="workspace-groups"
          class="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2"
        >
          <WorkspaceCityCard
            v-for="record in visibleCityRecords"
            :key="record.locationId"
            :city="record.city"
            :location-id="record.locationId"
            :summary="record.summary"
            :is-favorite="record.isFavorite"
            :is-compared="record.isCompared"
            :is-recent="record.isRecent"
            @open="openCity"
            @toggle-compare="toggleCompareForCity"
            @toggle-favorite="toggleFavoriteForCity"
            @remove="removeCity"
          />
        </div>

        <PlatformEmptyState
          v-else
          class="mt-8"
          eyebrow="Workspace Group / 工作台分组"
          title="No cities in this group / 当前分组暂无城市"
          description="Switch the filter, reopen a city from search, or mark a saved city as favorite to repopulate this workspace lane."
        />
      </div>

      <WorkspaceComparePanel
        :records="compareRecords"
        :metrics="compareMetrics"
        :reduced-motion="prefersReducedMotion"
        @open-city="openCity"
        @toggle-compare="toggleCompareForCity"
      />
    </section>
  </main>
</template>
