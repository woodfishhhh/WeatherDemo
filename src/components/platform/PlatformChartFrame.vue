<script setup lang="ts">
  import PlatformPanel from "@/components/platform/PlatformPanel.vue";

  const props = defineProps<{
    eyebrow: string;
    title: string;
    description: string;
    testId?: string;
    reducedMotion?: boolean;
  }>();
</script>

<template>
  <PlatformPanel
    :data-testid="props.testId"
    :data-motion="props.reducedMotion ? 'reduced' : 'full'"
    tone="soft"
    class="p-6 md:p-8"
  >
    <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-[10px] uppercase tracking-[0.28em] text-brand-muted/72 font-bold">{{ props.eyebrow }}</p>
        <h3 class="mt-3 text-2xl md:text-3xl font-light tracking-tight">{{ props.title }}</h3>
      </div>
      <p class="max-w-xl text-sm leading-7 text-brand-muted/68">{{ props.description }}</p>
    </div>

    <div class="mt-8">
      <slot />
    </div>

    <div v-if="$slots.footer" class="mt-4">
      <slot name="footer" />
    </div>
  </PlatformPanel>
</template>
