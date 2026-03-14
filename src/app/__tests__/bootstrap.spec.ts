import { shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  appMock,
  createAppMock,
  createPiniaMock,
  hydrateMock,
  operationLog,
  piniaMock,
  routerMock,
  useSettingsStoreMock,
} = vi.hoisted(() => {
  const operations: string[] = [];
  const appInstance = {
    use: vi.fn(),
    mount: vi.fn(),
  };
  const piniaInstance = { name: "pinia-instance" };
  const routerInstance = { name: "router-instance" };

  appInstance.use.mockImplementation((plugin: unknown) => {
    operations.push(plugin === piniaInstance ? "use:pinia" : plugin === routerInstance ? "use:router" : "use:other");
    return appInstance;
  });
  appInstance.mount.mockImplementation(() => {
    operations.push("mount");
  });

  return {
    appMock: appInstance,
    createAppMock: vi.fn(() => appInstance),
    createPiniaMock: vi.fn(() => piniaInstance),
    hydrateMock: vi.fn(() => {
      operations.push("hydrate");
    }),
    operationLog: operations,
    piniaMock: piniaInstance,
    routerMock: routerInstance,
    useSettingsStoreMock: vi.fn(() => ({
      hydrate: vi.fn(),
    })),
  };
});

vi.mock("vue", async () => {
  const actual = await vi.importActual<typeof import("vue")>("vue");
  return {
    ...actual,
    createApp: createAppMock,
  };
});

vi.mock("pinia", async () => {
  const actual = await vi.importActual<typeof import("pinia")>("pinia");
  return {
    ...actual,
    createPinia: createPiniaMock,
    storeToRefs: (store: { reducedMotion: unknown }) => ({
      reducedMotion: store.reducedMotion,
    }),
  };
});

vi.mock("../../App.vue", () => ({
  default: { name: "AppStub" },
}));

vi.mock("../../router", () => ({
  default: routerMock,
}));

vi.mock("../../firebase", () => ({}));

vi.mock("../../components/SiteNavigation.vue", () => ({
  default: {
    name: "SiteNavigationStub",
    template: "<div />",
  },
}));

vi.mock("@/features/settings/stores/settings", () => ({
  useSettingsStore: useSettingsStoreMock,
}));

vi.mock("../../composables/useTheme", () => ({
  useTheme: () => ({
    theme: { value: "dark" },
    initializeTheme: vi.fn(),
    toggleTheme: vi.fn(),
  }),
}));

vi.mock("gsap", () => ({
  default: {
    registerPlugin: vi.fn(),
    set: vi.fn(),
    fromTo: vi.fn(),
    ticker: {
      add: vi.fn(),
      remove: vi.fn(),
      lagSmoothing: vi.fn(),
    },
    to: vi.fn(() => ({
      kill: vi.fn(),
      scrollTrigger: {
        kill: vi.fn(),
      },
    })),
  },
}));

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {
    update: vi.fn(),
  },
}));

vi.mock("lenis", () => ({
  default: class LenisMock {
    on() {}
    start() {}
    stop() {}
    raf() {}
    destroy() {}
  },
}));

describe("main bootstrap contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    operationLog.length = 0;
    appMock.use.mockImplementation((plugin: unknown) => {
      operationLog.push(plugin === piniaMock ? "use:pinia" : plugin === routerMock ? "use:router" : "use:other");
      return appMock;
    });
    appMock.mount.mockImplementation(() => {
      operationLog.push("mount");
    });
    hydrateMock.mockImplementation(() => {
      operationLog.push("hydrate");
    });
    useSettingsStoreMock.mockReturnValue({
      hydrate: hydrateMock,
    });
  });

  it("keeps main bootstrap order stable and hydrates before mount", async () => {
    await import("../../main");

    expect(createAppMock).toHaveBeenCalledTimes(1);
    expect(createPiniaMock).toHaveBeenCalledTimes(1);
    expect(appMock.use).toHaveBeenNthCalledWith(1, piniaMock);
    expect(appMock.use).toHaveBeenNthCalledWith(2, routerMock);
    expect(useSettingsStoreMock).toHaveBeenCalledWith(piniaMock);
    expect(hydrateMock).toHaveBeenCalledTimes(1);
    expect(appMock.mount).toHaveBeenCalledWith("#app");
    expect(operationLog).toEqual(["use:pinia", "use:router", "hydrate", "mount"]);
  });

  it("keeps the app shell hydration call in place as a guarded follow-up bootstrap surface", async () => {
    const { shallowRef } = await import("vue");

    useSettingsStoreMock.mockReturnValue({
      hydrate: hydrateMock,
      reducedMotion: shallowRef(null),
    });

    vi.doUnmock("../../App.vue");
    vi.resetModules();
    const App = (await import("../../App.vue")).default;

    const wrapper = shallowMount(App, {
      global: {
        stubs: {
          SiteNavigation: true,
          RouterView: {
            template: "<div />",
          },
          Transition: false,
        },
      },
    });

    expect(useSettingsStoreMock).toHaveBeenCalledTimes(1);
    expect(hydrateMock).toHaveBeenCalledTimes(1);

    wrapper.unmount();
  });
});
