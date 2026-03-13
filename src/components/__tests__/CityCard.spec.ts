import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import CityCard from "@/components/CityCard.vue";

describe("CityCard", () => {
  it("renders normalized weather summary and emits delete", async () => {
    const wrapper = mount(CityCard, {
      props: {
        city: {
          id: "101010100",
          city: "北京",
          province: "北京市",
          weather: {
            temperature: "23",
            text: "晴",
            textBilingual: {
              en: "Sunny",
              zh: "晴",
            },
            icon: "100",
            humidity: "26",
            windScale: "3",
            province: "北京市",
          },
        },
      },
    });

    expect(wrapper.text()).toContain("北京");
    expect(wrapper.text()).toContain("晴");
    expect(wrapper.text()).toContain("Sunny");
    expect(wrapper.text()).toContain("23°");

    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("delete")).toEqual([["101010100"]]);
  });
});
