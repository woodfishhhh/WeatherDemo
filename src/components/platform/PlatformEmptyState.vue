<script setup lang="ts">
  import { computed } from "vue";
  import PlatformPanel from "@/components/platform/PlatformPanel.vue";
  import BilingualStack from "@/components/BilingualStack.vue";

  const props = withDefaults(defineProps<{
    eyebrow?: string;
    title: string;
    description: string;
  }>(), {
    eyebrow: "Empty State / 空状态",
  });

  const parsedEyebrow = computed(() => {
    if (!props.eyebrow) return null;
    const parts = props.eyebrow.split(" / ");
    if (parts.length === 2) {
      return { en: parts[0]!.trim(), zh: parts[1]!.trim() };
    }
    return { en: props.eyebrow, zh: "" };
  });

  const parsedTitle = computed(() => {
    if (!props.title) return null;
    const parts = props.title.split(" / ");
    if (parts.length === 2) {
      return { en: parts[0]!.trim(), zh: parts[1]!.trim() };
    }
    return { en: props.title, zh: "" };
  });

  const parsedDescription = computed(() => {
    if (!props.description) return null;
    const parts = props.description.split(" / ");
    if (parts.length === 2) {
      return { en: parts[0]!.trim(), zh: parts[1]!.trim() };
    }
    return { en: props.description, zh: "" };
  });
</script>

<template>
  <PlatformPanel data-testid="empty-state" tone="subtle" class="px-5 py-6 md:px-6 md:py-7">
    <BilingualStack
      v-if="parsedEyebrow"
      :en="parsedEyebrow.en"
      :zh="parsedEyebrow.zh"
      wrapper-class="flex flex-col gap-1"
      en-class="text-[10px] uppercase tracking-[0.32em] font-bold text-brand-muted/72"
      zh-class="text-xs font-zh-weight text-brand-muted/60"
    />
    <BilingualStack
      v-if="parsedTitle"
      :en="parsedTitle.en"
      :zh="parsedTitle.zh"
      wrapper-class="flex flex-col gap-2 mt-4"
      en-class="text-2xl md:text-3xl font-light tracking-tight"
      zh-class="text-xl md:text-2xl font-zh-weight tracking-tight text-brand-muted/80"
    />
    <BilingualStack
      v-if="parsedDescription"
      :en="parsedDescription.en"
      :zh="parsedDescription.zh"
      wrapper-class="flex flex-col gap-2 mt-4"
      en-class="max-w-2xl text-sm leading-7 text-brand-muted/68"
      zh-class="max-w-2xl text-sm leading-7 text-brand-muted/60"
    />
    <div v-if="$slots.actions" class="mt-6">
      <slot name="actions" />
    </div>
  </PlatformPanel>
</template>
