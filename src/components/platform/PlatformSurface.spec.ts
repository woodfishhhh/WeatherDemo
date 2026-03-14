import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import PlatformChartFrame from "@/components/platform/PlatformChartFrame.vue";
import PlatformEmptyState from "@/components/platform/PlatformEmptyState.vue";
import PlatformErrorState from "@/components/platform/PlatformErrorState.vue";
import PlatformPanel from "@/components/platform/PlatformPanel.vue";
import PlatformPanelSkeleton from "@/components/platform/PlatformPanelSkeleton.vue";

describe("platform surfaces", () => {
  it("renders shared panel chrome and slots", () => {
    const wrapper = mount(PlatformPanel, {
      props: {
        tone: "elevated",
        shape: "card",
      },
      slots: {
        default: "<p>Shared panel</p>",
      },
    });

    expect(wrapper.text()).toContain("Shared panel");
    expect(wrapper.classes()).toContain("border");
    expect(wrapper.classes()).toContain("rounded-[1.6rem]");
    expect(wrapper.classes()).toContain("bg-brand-accent/18");
  });

  it("renders shared empty and error states with stable test ids", () => {
    const emptyWrapper = mount(PlatformEmptyState, {
      props: {
        title: "Nothing here yet",
        description: "Add a city to continue.",
      },
    });
    const errorWrapper = mount(PlatformErrorState, {
      props: {
        title: "Trend data unavailable",
        description: "The upstream request failed.",
      },
    });

    expect(emptyWrapper.get('[data-testid="empty-state"]').text()).toContain("Nothing here yet");
    expect(errorWrapper.get('[data-testid="error-state"]').text()).toContain("Trend data unavailable");
  });

  it("renders chart frames and skeletons with motion metadata", () => {
    const chartWrapper = mount(PlatformChartFrame, {
      props: {
        eyebrow: "Trend",
        title: "Shared chart frame",
        description: "Reusable chart shell.",
        testId: "chart-frame",
        reducedMotion: true,
      },
      slots: {
        default: '<div class="chart-slot">Chart body</div>',
        footer: '<div class="chart-footer">Footer</div>',
      },
    });
    const skeletonWrapper = mount(PlatformPanelSkeleton, {
      props: {
        lines: 2,
        stats: 2,
      },
    });

    expect(chartWrapper.get('[data-testid="chart-frame"]').attributes("data-motion")).toBe("reduced");
    expect(chartWrapper.text()).toContain("Chart body");
    expect(chartWrapper.text()).toContain("Footer");
    expect(skeletonWrapper.get('[data-testid="platform-panel-skeleton"]').classes()).toContain("animate-pulse");
  });
});
