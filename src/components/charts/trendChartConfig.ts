import type { ChartData } from "chart.js";
import type { HistoricalTrendPoint } from "@/features/weather/types";

export type TrendSeriesKey = "temperatureMax" | "temperatureMin" | "precipitation" | "windSpeed";

export type TrendSeriesDefinition = {
  key: TrendSeriesKey;
  label: string;
  color: string;
};

const toNumericValue = (value: string): number | null => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

export const buildTrendChartData = (
  points: HistoricalTrendPoint[],
  series: TrendSeriesDefinition[]
): ChartData<"line"> => ({
  labels: points.map((point) => point.date),
  datasets: series.map((definition) => ({
    label: definition.label,
    data: points.map((point) => toNumericValue(point[definition.key])),
    borderColor: definition.color,
    backgroundColor: definition.color,
    borderWidth: 2,
    pointRadius: 0,
    pointHoverRadius: 4,
    tension: 0.32,
    spanGaps: true,
  })),
});
