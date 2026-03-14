import { shallowRef } from "vue";

const systemReducedMotion = shallowRef(false);

let hasStartedTracking = false;

const startTracking = (): void => {
  if (hasStartedTracking || typeof window === "undefined") {
    return;
  }

  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  systemReducedMotion.value = mediaQuery.matches;
  mediaQuery.addEventListener("change", (event) => {
    systemReducedMotion.value = event.matches;
  });
  hasStartedTracking = true;
};

export const useSystemReducedMotionPreference = () => {
  startTracking();
  return systemReducedMotion;
};

export const __resetSystemReducedMotionPreferenceForTests = (): void => {
  systemReducedMotion.value = false;
  hasStartedTracking = false;
};
