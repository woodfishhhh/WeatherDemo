<script setup lang="ts">
  import PlatformPanel from "@/components/platform/PlatformPanel.vue";
  import PlatformStatRow from "@/components/platform/PlatformStatRow.vue";
  import type { WorkspaceGroup } from "@/features/workspace/stores/workspace";

  const props = defineProps<{
    activeGroup: WorkspaceGroup;
    groupCounts: Record<WorkspaceGroup, number>;
  }>();

  const emit = defineEmits<{
    selectGroup: [group: WorkspaceGroup];
  }>();

  const handleGroupChange = (event: Event): void => {
    const nextGroup = (event.target as HTMLSelectElement | null)?.value as WorkspaceGroup | undefined;
    if (!nextGroup) {
      return;
    }

    emit("selectGroup", nextGroup);
  };
</script>

<template>
  <PlatformPanel as="section" tone="elevated" class="mt-12 px-5 py-6 md:px-8 md:py-7">
    <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p class="text-[10px] uppercase tracking-[0.34em] font-bold text-brand-muted/70">Workspace Groups / 工作台分组</p>
        <p class="mt-4 text-2xl md:text-3xl font-light tracking-tight">
          Switch the active lane without breaking the route contract.
        </p>
      </div>

      <label class="flex flex-col gap-3 min-w-[14rem]">
        <span class="text-[10px] uppercase tracking-[0.28em] font-bold text-brand-muted/70">
          Active Group / 当前分组
        </span>
        <select
          data-testid="workspace-filter-group"
          :value="props.activeGroup"
          class="rounded-[1.4rem] border border-brand-primary/12 bg-transparent px-4 py-4 text-sm tracking-[0.14em] focus:outline-none focus:border-brand-primary/40"
          @change="handleGroupChange"
        >
          <option value="all">All / 全部</option>
          <option value="favorites">Favorites / 关注</option>
          <option value="recent">Recent / 最近</option>
        </select>
      </label>
    </div>

    <div class="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <PlatformStatRow label="All / 全部" :value="props.groupCounts.all" />
      <PlatformStatRow label="Favorites / 关注" :value="props.groupCounts.favorites" />
      <PlatformStatRow label="Recent / 最近" :value="props.groupCounts.recent" />
    </div>
  </PlatformPanel>
</template>
