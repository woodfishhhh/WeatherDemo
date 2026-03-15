<template>
  <component :is="as" :class="computedWrapperClass">
    <span :class="computedEnClass">{{ en }}</span>
    <span :class="computedZhClass">{{ zh }}</span>
  </component>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = withDefaults(defineProps<{
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
    zhClass: 'text-sm md:text-base font-zh-weight tracking-[0.04em]',
  })

  const isRow = computed(() => props.wrapperClass?.includes('flex') && !props.wrapperClass?.includes('flex-col'))

  const computedWrapperClass = computed(() => {
    return isRow.value && !props.wrapperClass?.includes('flex-wrap')
      ? `${props.wrapperClass} flex-wrap`
      : props.wrapperClass
  })

  const computedEnClass = computed(() => {
    return isRow.value ? `${props.enClass} whitespace-nowrap` : props.enClass
  })

  const computedZhClass = computed(() => {
    return isRow.value ? `${props.zhClass} whitespace-nowrap` : props.zhClass
  })
</script>
