<script setup lang="ts">
  import { computed } from "vue";
  import PlatformPanel from "@/components/platform/PlatformPanel.vue";

  type SelectOption = {
    value: string;
    label: string;
    description: string;
  };

  const props = defineProps<{
    label: string;
    description: string;
    testId: string;
    value: string;
    options: SelectOption[];
  }>();

  const emit = defineEmits<{
    change: [value: string];
  }>();

  const activeDescription = computed(
    () => props.options.find((option) => option.value === props.value)?.description ?? props.description
  );

  const handleChange = (event: Event): void => {
    const nextValue = (event.target as HTMLSelectElement | null)?.value;
    if (!nextValue) {
      return;
    }

    emit("change", nextValue);
  };
</script>

<template>
  <PlatformPanel class="px-5 py-6 md:px-6 md:py-7">
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-[10px] uppercase tracking-[0.32em] font-bold text-brand-muted/70">{{ props.label }}</p>
        <p class="mt-4 text-sm leading-7 text-brand-muted/68 max-w-2xl">{{ props.description }}</p>
      </div>
      <select
        :data-testid="props.testId"
        :value="props.value"
        class="rounded-[1.4rem] border border-brand-primary/12 bg-transparent px-4 py-4 text-sm tracking-[0.14em] focus:outline-none focus:border-brand-primary/40 md:min-w-[15rem]"
        @change="handleChange"
      >
        <option v-for="option in props.options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>

    <p class="mt-5 text-sm leading-7 text-brand-muted/68">{{ activeDescription }}</p>
  </PlatformPanel>
</template>
