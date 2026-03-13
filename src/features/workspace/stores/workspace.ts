import { computed, shallowRef } from "vue";
import { defineStore } from "pinia";

export type WorkspaceGroup = "all" | "favorites" | "recent";

const WORKSPACE_GROUPS: WorkspaceGroup[] = ["all", "favorites", "recent"];

export const useWorkspaceStore = defineStore("workspace", () => {
  const selectedGroup = shallowRef<WorkspaceGroup>("all");
  const recentLocationIds = shallowRef<string[]>([]);
  const compareLocationIds = shallowRef<string[]>([]);

  const availableGroups = computed(() => WORKSPACE_GROUPS);

  const setSelectedGroup = (group: WorkspaceGroup): WorkspaceGroup => {
    selectedGroup.value = WORKSPACE_GROUPS.includes(group) ? group : "all";
    return selectedGroup.value;
  };

  const rememberRecentLocation = (locationId: string | undefined): string[] => {
    if (!locationId) {
      return recentLocationIds.value;
    }

    recentLocationIds.value = [
      locationId,
      ...recentLocationIds.value.filter((item) => item !== locationId),
    ].slice(0, 8);

    return recentLocationIds.value;
  };

  const toggleCompareLocation = (locationId: string): string[] => {
    if (compareLocationIds.value.includes(locationId)) {
      compareLocationIds.value = compareLocationIds.value.filter((item) => item !== locationId);
      return compareLocationIds.value;
    }

    compareLocationIds.value = [...compareLocationIds.value, locationId].slice(-4);
    return compareLocationIds.value;
  };

  return {
    selectedGroup,
    recentLocationIds,
    compareLocationIds,
    availableGroups,
    setSelectedGroup,
    rememberRecentLocation,
    toggleCompareLocation,
  };
});
