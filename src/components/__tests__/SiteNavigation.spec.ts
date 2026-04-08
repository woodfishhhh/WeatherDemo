import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import SiteNavigation from "@/components/SiteNavigation.vue";

describe("SiteNavigation", () => {
  it("points the journal entry to the jdcloud blog", async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: "/", name: "home", component: { template: "<div />" } },
        { path: "/workspace", name: "workspace", component: { template: "<div />" } },
        { path: "/settings", name: "settings", component: { template: "<div />" } },
      ],
    });

    await router.push("/");
    await router.isReady();

    const wrapper = mount(SiteNavigation, {
      props: {
        theme: "dark",
      },
      global: {
        plugins: [router],
        stubs: {
          BaseModal: {
            template: "<div><slot /></div>",
          },
          BilingualStack: {
            template: "<div><slot /></div>",
          },
          LogoIcon: {
            template: "<div>Logo</div>",
          },
          Info: { template: "<span />" },
          MoonStar: { template: "<span />" },
          SunMedium: { template: "<span />" },
        },
      },
    });

    const journalLink = wrapper
      .findAll("a")
      .find((link) => link.text().includes("Visit The Journal"));

    expect(journalLink?.attributes("href")).toBe("http://36.151.148.198/newBlog/");
  });
});
