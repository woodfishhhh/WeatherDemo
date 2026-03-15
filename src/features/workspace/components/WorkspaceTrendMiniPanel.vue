<script setup lang="ts">
  import { computed } from "vue";
  import {
    CategoryScale,
    Chart as ChartJS,
    Filler,
    LineElement,
    LinearScale,
    PointElement,
    Tooltip,
    type ChartOptions,
  } from "chart.js";
  import { Line } from "vue-chartjs";
  import BilingualStack from "@/components/BilingualStack.vue";
  import { buildTrendChartData } from "@/components/charts/trendChartConfig";
  import type { HistoricalTrendPoint } from "@/features/weather/types";

  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

  const props = defineProps<{
    title: string;
    caption: string;
    points: HistoricalTrendPoint[];
    reducedMotion: boolean;
  }>();

  const titleParts = computed(() => {
    const parts = props.title.split(" / ");
    return {
      en: parts[0] ? parts[0].trim() : "",
      zh: parts[1] ? parts[1].trim() : "",
    };
  });

  const chartData = computed(() =>
    buildTrendChartData(props.points, [
      { key: "temperatureMax", label: "Max", color: "#111111" },
      { key: "temperatureMin", label: "Min", color: "#6b6b6b" },
    ])
  );

  const chartOptions = computed<ChartOptions<"line">>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: props.reducedMotion ? false : { duration: 450 },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 0,
      },
      line: {
        tension: 0.35,
        borderWidth: 2,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
  }));
</script>

<template>
  <article
    data-testid="workspace-trend-panel"
    class="rounded-[1.6rem] border border-brand-primary/10 px-4 py-4 bg-brand-accent/14"
    :data-motion="props.reducedMotion ? 'reduced' : 'full'"
  >
    <BilingualStack
      v-if="titleParts.zh"
      :en="titleParts.en"
      :zh="titleParts.zh"
      wrapper-class="flex flex-col gap-1"
      en-class="text-[10px] uppercase tracking-[0.24em] font-bold text-brand-muted/72"
      zh-class="text-[10px] font-zh-weight text-brand-muted/60"
    />
    <p v-else class="text-[10px] uppercase tracking-[0.24em] font-bold text-brand-muted/72">{{ props.title }}</p>

    <p class="mt-3 text-sm leading-7 text-brand-muted/68">{{ props.caption }}</p>
    <div class="mt-5 h-28">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </article>
</template>
