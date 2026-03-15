<script setup lang="ts">
  import { computed } from "vue";
  import PlatformPanel from "@/components/platform/PlatformPanel.vue";
  import BilingualStack from "@/components/BilingualStack.vue";

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

  const parsedLabel = computed(() => {
    if (!props.label) return null;
    const parts = props.label.split(" / ");
    if (parts.length === 2) {
      return { en: parts[0]!.trim(), zh: parts[1]!.trim() };
    }
    return { en: props.label, zh: "" };
  });

  const parsedDetail = computed(() => {
    if (!props.detail) return null;
    const parts = props.detail.split(" / ");
    if (parts.length === 2) {
      return { en: parts[0]!.trim(), zh: parts[1]!.trim() };
    }
    return { en: props.detail, zh: "" };
  });
</script>

<template>
  <PlatformPanel
    tone="transparent"
    shape="card"
    class="px-4 py-4 flex flex-col justify-center"
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
    <BilingualStack
      v-if="parsedLabel"
      :en="parsedLabel.en"
      :zh="parsedLabel.zh"
      wrapper-class="flex flex-col gap-1"
      en-class="text-[10px] uppercase tracking-[0.22em] font-bold text-brand-muted/68"
      zh-class="text-xs font-light text-brand-muted/50"
    />
    <p class="mt-3" :class="valueClasses">{{ props.value }}</p>
    <BilingualStack
      v-if="parsedDetail"
      :en="parsedDetail.en"
      :zh="parsedDetail.zh"
      wrapper-class="flex flex-col gap-1 mt-3"
      en-class="text-sm leading-7 text-brand-muted/68"
      zh-class="text-sm leading-7 text-brand-muted/60"
    />
    <div v-if="$slots.default" class="mt-4">
      <slot />
    </div>
  </PlatformPanel>
</template>
