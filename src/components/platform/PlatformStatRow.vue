<script setup lang="ts">
  import { computed } from "vue";
  import PlatformPanel from "@/components/platform/PlatformPanel.vue";

  type StatTone = "subtle" | "soft" | "elevated" | "wash" | "transparent";
  type StatSize = "sm" | "md" | "lg";
  type StatAlign = "start" | "end";

  const props = withDefaults(defineProps<{
    label: string;
    value: string | number;
    detail?: string;
    tone?: StatTone;
    size?: StatSize;
    align?: StatAlign;
  }>(), {
    detail: undefined,
    tone: "soft",
    size: "md",
    align: "start",
  });

  const valueClasses = computed(() => [
    props.size === "lg"
      ? "text-3xl md:text-4xl"
      : props.size === "sm"
        ? "text-2xl"
        : "text-3xl",
    "font-light tracking-tight",
  ]);
</script>

<template>
  <PlatformPanel
    tone="transparent"
    shape="card"
    class="px-4 py-4"
    :class="[
      props.tone === 'subtle'
        ? 'bg-brand-accent/12'
        : props.tone === 'elevated'
          ? 'bg-brand-accent/18'
          : props.tone === 'wash'
            ? 'bg-brand-accent/20'
            : props.tone === 'transparent'
              ? ''
              : 'bg-brand-accent/14',
      props.align === 'end' ? 'text-right' : '',
    ]"
  >
    <p class="text-[10px] uppercase tracking-[0.22em] font-bold text-brand-muted/68">{{ props.label }}</p>
    <p class="mt-3" :class="valueClasses">{{ props.value }}</p>
    <p v-if="props.detail" class="mt-3 text-sm leading-7 text-brand-muted/68">{{ props.detail }}</p>
    <div v-if="$slots.default" class="mt-4">
      <slot />
    </div>
  </PlatformPanel>
</template>
