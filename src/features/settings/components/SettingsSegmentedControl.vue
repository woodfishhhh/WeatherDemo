<script setup lang="ts">
  import { computed } from "vue";
  import PlatformPanel from "@/components/platform/PlatformPanel.vue";

  type SelectOption = {
    value: string;
    label: string;
    descriptionEn: string;
    descriptionZh: string;
  };

  const props = defineProps<{
    label: string;
    descriptionEn: string;
    descriptionZh: string;
    testId: string;
    value: string;
    options: SelectOption[];
  }>();

  const emit = defineEmits<{
    change: [value: string];
  }>();

  const activeOption = computed(
    () => props.options.find((option) => option.value === props.value)
  );

  const activeDescriptionEn = computed(
    () => activeOption.value?.descriptionEn ?? props.descriptionEn
  );

  const activeDescriptionZh = computed(
    () => activeOption.value?.descriptionZh ?? props.descriptionZh
  );

</script>

<template>
  <PlatformPanel class="px-5 py-6 md:px-6 md:py-7 flex flex-col justify-between h-full">
    <div>
      <p class="text-[10px] uppercase tracking-[0.32em] font-bold text-brand-muted/70">{{ props.label }}</p>

      <!-- Segmented Control Container -->
      <div class="mt-6 relative flex p-1 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
        <!-- Sliding background track -->
        <div class="absolute inset-y-1 left-1" style="width: calc(100% - 8px)">
          <div 
            class="h-full bg-brand-primary rounded-xl shadow-md transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            :style="{
              width: `${100 / props.options.length}%`,
              transform: `translateX(calc(${props.options.findIndex(o => o.value === props.value)} * 100%))`
            }"
          ></div>
        </div>

        <button v-for="option in props.options" :key="option.value" :data-testid="`${props.testId}-${option.value}`"
          @click="emit('change', option.value)"
          class="relative z-10 flex-1 py-2 px-4 rounded-xl text-sm transition-colors duration-300 tracking-[0.1em]" :class="[
            props.value === option.value
              ? 'text-brand-text font-medium'
              : 'text-brand-muted hover:text-brand-primary'
          ]">
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- Description -->
    <div class="mt-8 pt-5 border-t border-brand-primary/10 flex flex-col gap-1 min-h-[4rem]">
      <p class="text-sm leading-relaxed text-brand-muted/80">{{ activeDescriptionEn }}</p>
      <p class="text-sm font-light text-brand-muted/60 tracking-wide">{{ activeDescriptionZh }}</p>
    </div>
  </PlatformPanel>
</template>
