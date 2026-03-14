import { describe, expect, it } from "vitest";
import { buildTrendChartData } from "@/components/charts/trendChartConfig";
import type { HistoricalTrendPoint } from "@/features/weather/types";

const points: HistoricalTrendPoint[] = [
  {
    date: "2026-03-11",
    temperatureMax: "20",
    temperatureMin: "12",
    precipitation: "0.0",
    humidity: "42",
    windSpeed: "8",
    text: "晴",
    textBilingual: { en: "Sunny", zh: "晴" },
    icon: "100",
  },
  {
    date: "2026-03-12",
    temperatureMax: "22",
    temperatureMin: "13",
    precipitation: "1.2",
    humidity: "46",
    windSpeed: "11",
    text: "多云",
    textBilingual: { en: "Few Clouds", zh: "多云" },
    icon: "101",
  },
];

describe("buildTrendChartData", () => {
  it("maps historical points into Chart.js datasets", () => {
    const chartData = buildTrendChartData(points, [
      { key: "temperatureMax", label: "Max Temp", color: "#111111" },
      { key: "temperatureMin", label: "Min Temp", color: "#5f5f5f" },
    ]);

    expect(chartData.labels).toEqual(["2026-03-11", "2026-03-12"]);
    expect(chartData.datasets[0]?.data).toEqual([20, 22]);
    expect(chartData.datasets[1]?.data).toEqual([12, 13]);
  });
});
