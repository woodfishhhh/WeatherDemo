<script setup lang="ts">
  import PlatformPanel from "@/components/platform/PlatformPanel.vue";
  import PlatformStatRow from "@/components/platform/PlatformStatRow.vue";
  import BilingualStack from "@/components/BilingualStack.vue";
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
      <div class="space-y-4">
        <BilingualStack
          en="Workspace Groups"
          zh="工作台分组"
          wrapper-class="flex flex-col gap-2"
          en-class="text-[10px] uppercase tracking-[0.34em] font-bold text-brand-muted/70"
          zh-class="text-xs font-zh-weight text-brand-muted/60"
        />
        <BilingualStack
          en="Switch the active lane without breaking the route contract."
          zh="无缝切换分组，保持路由状态不断联。"
          wrapper-class="flex flex-col gap-1"
          en-class="text-2xl md:text-3xl font-zh-weight tracking-tight"
          zh-class="text-xl md:text-2xl font-zh-weight tracking-tight text-brand-muted/80"
        />
      </div>

      <div class="flex w-full max-w-sm flex-col gap-4 lg:w-auto lg:min-w-[14rem]">
        <BilingualStack
          en="Active Group"
          zh="当前分组"
          wrapper-class="flex items-center gap-3"
          en-class="text-[10px] uppercase tracking-[0.28em] font-bold text-brand-muted/70"
          zh-class="text-xs font-zh-weight text-brand-muted/60"
        />
        <div class="relative">
          <select
            data-testid="workspace-filter-group"
            :value="props.activeGroup"
            class="w-full appearance-none rounded-2xl border border-brand-primary/18 bg-brand-accent/5 px-5 py-4 text-sm font-medium tracking-[0.1em] focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/20 transition-all cursor-pointer"
            @change="handleGroupChange"
          >
            <option value="all">ALL / 全部城市</option>
            <option value="favorites">FAVORITES / 特别关注</option>
            <option value="recent">RECENT / 最近访问</option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-5 text-brand-muted/50">
            <svg class="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" fill-rule="evenodd"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 border-t border-brand-primary/10 pt-8">
      <PlatformStatRow label="All / 全部" :value="props.groupCounts.all" tone="soft" />
      <PlatformStatRow label="Favorites / 特别关注" :value="props.groupCounts.favorites" tone="soft" />
      <PlatformStatRow label="Recent / 最近访问" :value="props.groupCounts.recent" tone="soft" />
    </div>
  </PlatformPanel>
</template>
