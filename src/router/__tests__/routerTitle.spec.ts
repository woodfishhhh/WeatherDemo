import { beforeEach, describe, expect, it, vi } from "vitest";

const loadFreshRouter = async () => {
  vi.resetModules();
  const module = await import("../index");
  return module.default;
};

describe("router title contract", () => {
  beforeEach(() => {
    document.title = "";
  });

  it("keeps the current page titles for top-level routes and city detail", async () => {
    const router = await loadFreshRouter();

    const cases = [
      {
        target: "/",
        expectedTitle: "Weather Forecast / 天气预报",
      },
      {
        target: "/weather/Beijing/Beijing",
        expectedTitle: "Beijing Weather / Beijing · Beijing天气",
      },
      {
        target: "/workspace",
        expectedTitle: "Workspace / 工作台",
      },
      {
        target: "/settings",
        expectedTitle: "Settings / 设置",
      },
      {
        target: "/missing-route",
        expectedTitle: "Page Missing / 页面未找到",
      },
    ] as const;

    for (const { target, expectedTitle } of cases) {
      await router.push(target);
      await router.isReady();
      expect(document.title).toBe(expectedTitle);
    }
  });
});
