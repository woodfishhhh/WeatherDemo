import { computed, shallowRef } from "vue";
import { defineStore } from "pinia";

export type WorkspaceGroup = "all" | "favorites" | "recent";

const WORKSPACE_GROUPS: WorkspaceGroup[] = ["all", "favorites", "recent"];
export const WORKSPACE_STORAGE_KEY = "weather-workspace-state";
const STORAGE_VERSION = 1;
const MAX_COMPARE_LOCATIONS = 4;
const MAX_RECENT_LOCATIONS = 8;
const MAX_FAVORITE_LOCATIONS = 12;

type WorkspacePersistedState = {
  version: number;
  favoriteLocationIds: string[];
  recentLocationIds: string[];
  compareLocationIds: string[];
};

const defaultPersistedState = (): WorkspacePersistedState => ({
  version: STORAGE_VERSION,
  favoriteLocationIds: [],
  recentLocationIds: [],
  compareLocationIds: [],
});

const sanitizeLocationIds = (input: unknown, limit: number): string[] => {
  if (!Array.isArray(input)) {
    return [];
  }

  const nextIds: string[] = [];
  for (const item of input) {
    if (typeof item !== "string") {
      continue;
    }

    const normalizedId = item.trim();
    if (!normalizedId || nextIds.includes(normalizedId)) {
      continue;
    }

    nextIds.push(normalizedId);
    if (nextIds.length >= limit) {
      break;
    }
  }

  return nextIds;
};

const normalizeGroup = (group: WorkspaceGroup | string | null | undefined): WorkspaceGroup =>
  group === "favorites" || group === "recent" || group === "all" ? group : "all";

const normalizePersistedState = (input: unknown): WorkspacePersistedState => {
  if (!input || typeof input !== "object") {
    return defaultPersistedState();
  }

  const raw = input as Partial<WorkspacePersistedState>;

  return {
    version: STORAGE_VERSION,
    favoriteLocationIds: sanitizeLocationIds(raw.favoriteLocationIds, MAX_FAVORITE_LOCATIONS),
    recentLocationIds: sanitizeLocationIds(raw.recentLocationIds, MAX_RECENT_LOCATIONS),
    compareLocationIds: sanitizeLocationIds(raw.compareLocationIds, MAX_COMPARE_LOCATIONS),
  };
};

export const useWorkspaceStore = defineStore("workspace", () => {
  const selectedGroup = shallowRef<WorkspaceGroup>("all");
  const recentLocationIds = shallowRef<string[]>([]);
  const compareLocationIds = shallowRef<string[]>([]);
  const favoriteLocationIds = shallowRef<string[]>([]);
  const hasHydrated = shallowRef(false);

  const availableGroups = computed(() => WORKSPACE_GROUPS);

  const snapshot = (): WorkspacePersistedState => ({
    version: STORAGE_VERSION,
    favoriteLocationIds: favoriteLocationIds.value,
    recentLocationIds: recentLocationIds.value,
    compareLocationIds: compareLocationIds.value,
  });

  const applyPersistedState = (state: WorkspacePersistedState): void => {
    favoriteLocationIds.value = state.favoriteLocationIds;
    recentLocationIds.value = state.recentLocationIds;
    compareLocationIds.value = state.compareLocationIds;
  };

  const persist = (): void => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(snapshot()));
  };

  const hydrate = (): WorkspacePersistedState => {
    if (hasHydrated.value || typeof window === "undefined") {
      hasHydrated.value = true;
      return snapshot();
    }

    hasHydrated.value = true;
    const raw = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!raw) {
      applyPersistedState(defaultPersistedState());
      return snapshot();
    }

    try {
      const parsed = JSON.parse(raw);
      const normalized = normalizePersistedState(parsed);
      applyPersistedState(normalized);

      const requiresRewrite =
        !parsed ||
        typeof parsed !== "object" ||
        (parsed as WorkspacePersistedState).version !== STORAGE_VERSION;

      if (requiresRewrite) {
        persist();
      }
    } catch {
      applyPersistedState(defaultPersistedState());
      persist();
    }

    return snapshot();
  };

  const ensureHydrated = (): void => {
    if (!hasHydrated.value) {
      hydrate();
    }
  };

  const setSelectedGroup = (group: WorkspaceGroup | string | null | undefined): WorkspaceGroup => {
    selectedGroup.value = normalizeGroup(group);
    return selectedGroup.value;
  };

  const rememberRecentLocation = (locationId: string | undefined): string[] => {
    ensureHydrated();

    if (!locationId) {
      return recentLocationIds.value;
    }

    recentLocationIds.value = [
      locationId,
      ...recentLocationIds.value.filter((item) => item !== locationId),
    ].slice(0, MAX_RECENT_LOCATIONS);
    persist();

    return recentLocationIds.value;
  };

  const toggleCompareLocation = (locationId: string): string[] => {
    ensureHydrated();

    if (compareLocationIds.value.includes(locationId)) {
      compareLocationIds.value = compareLocationIds.value.filter((item) => item !== locationId);
      persist();
      return compareLocationIds.value;
    }

    compareLocationIds.value = [...compareLocationIds.value, locationId].slice(-MAX_COMPARE_LOCATIONS);
    persist();
    return compareLocationIds.value;
  };

  const syncCompareLocations = (locationIds: string[]): string[] => {
    ensureHydrated();
    compareLocationIds.value = sanitizeLocationIds(locationIds, MAX_COMPARE_LOCATIONS);
    persist();
    return compareLocationIds.value;
  };

  const toggleFavoriteLocation = (locationId: string): string[] => {
    ensureHydrated();

    if (favoriteLocationIds.value.includes(locationId)) {
      favoriteLocationIds.value = favoriteLocationIds.value.filter((item) => item !== locationId);
      persist();
      return favoriteLocationIds.value;
    }

    favoriteLocationIds.value = [locationId, ...favoriteLocationIds.value].slice(0, MAX_FAVORITE_LOCATIONS);
    persist();
    return favoriteLocationIds.value;
  };

  const pruneLocationIds = (validLocationIds: string[]): WorkspacePersistedState => {
    ensureHydrated();
    const validIdSet = new Set(sanitizeLocationIds(validLocationIds, Number.MAX_SAFE_INTEGER));
    favoriteLocationIds.value = favoriteLocationIds.value.filter((item) => validIdSet.has(item));
    recentLocationIds.value = recentLocationIds.value.filter((item) => validIdSet.has(item));
    compareLocationIds.value = compareLocationIds.value.filter((item) => validIdSet.has(item));
    persist();
    return snapshot();
  };

  const isFavoriteLocation = (locationId: string | undefined): boolean =>
    locationId ? favoriteLocationIds.value.includes(locationId) : false;

  const isCompareLocation = (locationId: string | undefined): boolean =>
    locationId ? compareLocationIds.value.includes(locationId) : false;

  return {
    selectedGroup,
    recentLocationIds,
    compareLocationIds,
    favoriteLocationIds,
    hasHydrated,
    availableGroups,
    hydrate,
    snapshot,
    setSelectedGroup,
    rememberRecentLocation,
    toggleCompareLocation,
    syncCompareLocations,
    toggleFavoriteLocation,
    pruneLocationIds,
    isFavoriteLocation,
    isCompareLocation,
  };
});
