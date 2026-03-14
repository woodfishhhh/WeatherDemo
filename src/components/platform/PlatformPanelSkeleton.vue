<script setup lang="ts">
  import { computed } from "vue";
  import PlatformPanel from "@/components/platform/PlatformPanel.vue";

  const props = withDefaults(defineProps<{
    lines?: number;
    stats?: number;
    shape?: "panel" | "card";
  }>(), {
    lines: 3,
    stats: 0,
    shape: "panel",
  });

  const widths = computed(() =>
    Array.from({ length: props.lines }, (_, index) =>
      index % 3 === 0 ? "w-full" : index % 3 === 1 ? "w-5/6" : "w-2/3"
    )
  );
</script>

<template>
  <PlatformPanel
    data-testid="platform-panel-skeleton"
    tone="subtle"
    :shape="props.shape"
    class="animate-pulse px-5 py-6 md:px-6 md:py-7"
  >
    <div class="h-3 w-24 bg-brand-primary/10"></div>
    <div class="mt-5 h-8 w-2/3 bg-brand-primary/10"></div>
    <div class="mt-6 space-y-3">
      <div
        v-for="width in widths"
        :key="width"
        class="h-3 bg-brand-primary/8"
        :class="width"
      ></div>
    </div>

    <div v-if="props.stats" class="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div
        v-for="index in props.stats"
        :key="index"
        class="rounded-[1.4rem] border border-brand-primary/10 px-4 py-4"
      >
        <div class="h-3 w-16 bg-brand-primary/10"></div>
        <div class="mt-3 h-8 w-20 bg-brand-primary/8"></div>
      </div>
    </div>
  </PlatformPanel>
</template>
