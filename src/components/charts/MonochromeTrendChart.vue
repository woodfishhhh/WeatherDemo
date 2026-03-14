<script setup lang="ts">
  import { computed, shallowRef } from 'vue';
  import {
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    Tooltip,
    type ChartOptions,
    type TooltipItem,
  } from 'chart.js';
  import { Line } from 'vue-chartjs';
  import PlatformChartFrame from '@/components/platform/PlatformChartFrame.vue';
  import PlatformPanel from '@/components/platform/PlatformPanel.vue';
  import type { HistoricalTrendPoint } from '@/features/weather/types';
  import { buildTrendChartData, type TrendSeriesDefinition } from '@/components/charts/trendChartConfig';

  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

  const props = defineProps<{
    chartTestId: string;
    eyebrow: string;
    title: string;
    description: string;
    points: HistoricalTrendPoint[];
    series: TrendSeriesDefinition[];
    reducedMotion: boolean;
  }>();

  const tooltip = shallowRef<{
    visible: boolean;
    title: string;
    lines: string[];
  }>({
    visible: false,
    title: '',
    lines: [],
  });

  const chartData = computed(() => buildTrendChartData(props.points, props.series));

  const chartOptions = computed<ChartOptions<'line'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: props.reducedMotion
      ? false
      : {
          duration: 650,
        },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        align: 'start',
        labels: {
          color: '#3d3d3d',
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          pointStyle: 'line',
          font: {
            family: 'inherit',
            size: 11,
            weight: 600,
          },
        },
      },
      tooltip: {
        enabled: false,
        external: ({ tooltip: chartTooltip }) => {
          if (!chartTooltip || chartTooltip.opacity === 0) {
            tooltip.value = {
              visible: false,
              title: '',
              lines: [],
            };
            return;
          }

          tooltip.value = {
            visible: true,
            title: chartTooltip.title[0] ?? '',
            lines: chartTooltip.dataPoints.map((item: TooltipItem<'line'>) => `${item.dataset.label}: ${item.formattedValue}`),
          };
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(17, 17, 17, 0.08)',
        },
        ticks: {
          color: '#5d5d5d',
          maxRotation: 0,
          autoSkip: true,
        },
        border: {
          color: 'rgba(17, 17, 17, 0.12)',
        },
      },
      y: {
        grid: {
          color: 'rgba(17, 17, 17, 0.08)',
        },
        ticks: {
          color: '#5d5d5d',
        },
        border: {
          color: 'rgba(17, 17, 17, 0.12)',
        },
      },
    },
  }));
</script>

<template>
  <PlatformChartFrame
    :test-id="chartTestId"
    :reduced-motion="reducedMotion"
    :eyebrow="eyebrow"
    :title="title"
    :description="description"
  >
    <div class="relative">
      <div class="h-72">
        <Line :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <template #footer>
      <PlatformPanel
        v-if="tooltip.visible"
        data-testid="trend-tooltip"
        tone="wash"
        shape="chip"
        class="px-4 py-4"
      >
        <p class="text-[10px] uppercase tracking-[0.24em] font-bold text-brand-muted/72">{{ tooltip.title }}</p>
        <div class="mt-3 space-y-2">
          <p v-for="line in tooltip.lines" :key="line" class="text-sm font-light tracking-[0.06em]">{{ line }}</p>
        </div>
      </PlatformPanel>
    </template>
  </PlatformChartFrame>
</template>
