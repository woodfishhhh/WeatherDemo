<script setup lang="ts">
  import { computed } from "vue";

  type PanelTone = "subtle" | "soft" | "elevated" | "wash" | "glass" | "transparent";
  type PanelShape = "panel" | "card" | "chip";

  const props = withDefaults(defineProps<{
    as?: string;
    tone?: PanelTone;
    shape?: PanelShape;
    interactive?: boolean;
  }>(), {
    as: "article",
    tone: "soft",
    shape: "panel",
    interactive: false,
  });

  const panelClasses = computed(() => {
    const toneClass =
      props.tone === "subtle"
        ? "bg-brand-accent/12"
        : props.tone === "elevated"
          ? "bg-brand-accent/18"
          : props.tone === "wash"
            ? "bg-brand-accent/20"
            : props.tone === "glass"
              ? "bg-brand-accent/72 backdrop-blur-xl"
              : props.tone === "transparent"
                ? ""
                : "bg-brand-accent/16";

    const shapeClass =
      props.shape === "card"
        ? "rounded-[1.6rem]"
        : props.shape === "chip"
          ? "rounded-[1.4rem]"
          : "rounded-[2rem]";

    return [
      "border border-brand-primary/10",
      shapeClass,
      toneClass,
      props.interactive
        ? "transition-colors duration-300 hover:border-brand-primary/30 hover:bg-brand-accent/24"
        : "",
    ];
  });
</script>

<template>
  <component :is="props.as" :class="panelClasses">
    <slot />
  </component>
</template>
