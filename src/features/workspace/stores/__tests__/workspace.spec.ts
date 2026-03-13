import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useWorkspaceStore } from "@/features/workspace/stores/workspace";

describe("useWorkspaceStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("tracks selected group and recent locations", () => {
    const store = useWorkspaceStore();

    store.setSelectedGroup("recent");
    store.rememberRecentLocation("101010100");
    store.rememberRecentLocation("101020100");
    store.toggleCompareLocation("101010100");

    expect(store.selectedGroup).toBe("recent");
    expect(store.recentLocationIds).toEqual(["101020100", "101010100"]);
    expect(store.compareLocationIds).toEqual(["101010100"]);
  });
});
