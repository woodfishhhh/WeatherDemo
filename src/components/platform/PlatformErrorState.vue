<script setup lang="ts">
  import PlatformPanel from "@/components/platform/PlatformPanel.vue";

  const props = withDefaults(defineProps<{
    eyebrow?: string;
    title: string;
    description: string;
  }>(), {
    eyebrow: "Error State / 错误状态",
  });
</script>

<template>
  <PlatformPanel data-testid="error-state" tone="subtle" class="px-5 py-6 md:px-6 md:py-7">
    <p class="text-[10px] uppercase tracking-[0.32em] font-bold text-brand-muted/72">{{ props.eyebrow }}</p>
    <p class="mt-4 text-2xl md:text-3xl font-light tracking-tight">{{ props.title }}</p>
    <p class="mt-4 max-w-2xl text-sm leading-7 text-brand-muted/68">{{ props.description }}</p>
    <div v-if="$slots.actions" class="mt-6">
      <slot name="actions" />
    </div>
  </PlatformPanel>
</template>
