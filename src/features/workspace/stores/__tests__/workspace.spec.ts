import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useWorkspaceStore } from "@/features/workspace/stores/workspace";

describe("useWorkspaceStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    window.localStorage.clear();
  });

  it("hydrates persisted favorites, recents, and compare selections", () => {
    window.localStorage.setItem(
      "weather-workspace-state",
      JSON.stringify({
        version: 1,
        favoriteLocationIds: ["101010100", "", "101010100", "101020100"],
        recentLocationIds: ["101020100"],
        compareLocationIds: ["101010100", "101020100", "101280101", "101280601", "101280800"],
      })
    );

    const store = useWorkspaceStore();
    store.hydrate();
    store.setSelectedGroup("invalid");

    expect(store.favoriteLocationIds).toEqual(["101010100", "101020100"]);
    expect(store.recentLocationIds).toEqual(["101020100"]);
    expect(store.compareLocationIds).toEqual(["101010100", "101020100", "101280101", "101280601"]);
    expect(store.selectedGroup).toBe("all");
  });

  it("persists toggles and prunes invalid location ids", () => {
    const store = useWorkspaceStore();
    store.hydrate();

    store.setSelectedGroup("recent");
    store.toggleFavoriteLocation("101010100");
    store.toggleCompareLocation("101010100");
    store.rememberRecentLocation("101020100");
    store.pruneLocationIds(["101020100"]);

    expect(store.selectedGroup).toBe("recent");
    expect(store.favoriteLocationIds).toEqual([]);
    expect(store.recentLocationIds).toEqual(["101020100"]);
    expect(store.compareLocationIds).toEqual([]);

    expect(JSON.parse(window.localStorage.getItem("weather-workspace-state") || "{}")).toMatchObject({
      favoriteLocationIds: [],
      recentLocationIds: ["101020100"],
      compareLocationIds: [],
    });
  });
});
