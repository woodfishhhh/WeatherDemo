import { afterEach, describe, expect, it } from "vitest";
import {
  __resetSystemReducedMotionPreferenceForTests,
  useSystemReducedMotionPreference,
} from "@/features/settings/composables/useSystemReducedMotionPreference";

describe("useSystemReducedMotionPreference", () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    __resetSystemReducedMotionPreferenceForTests();
  });

  it("tracks browser reduced-motion changes through one shared reactive source", () => {
    let changeListener: ((event: MediaQueryListEvent) => void) | undefined;

    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
        changeListener = listener;
      },
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;

    const preference = useSystemReducedMotionPreference();

    expect(preference.value).toBe(false);

    changeListener?.({
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
    } as MediaQueryListEvent);

    expect(preference.value).toBe(true);
  });
});
