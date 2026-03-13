<template>
  <component :is="as" :class="wrapperClass">
    <span :class="enClass">{{ en }}</span>
    <span :class="zhClass">{{ zh }}</span>
  </component>
</template>

<script setup lang="ts">
  withDefaults(defineProps<{
    as?: string
    en: string
    zh: string
    wrapperClass?: string
    enClass?: string
    zhClass?: string
  }>(), {
    as: 'div',
    wrapperClass: 'flex flex-col gap-2',
    enClass: 'text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-brand-muted/75',
    zhClass: 'text-sm md:text-base font-light tracking-[0.04em]',
  })
</script>
