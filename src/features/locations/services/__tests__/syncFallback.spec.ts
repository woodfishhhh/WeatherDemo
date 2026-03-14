import { beforeEach, describe, expect, it, vi } from "vitest";

const { docMock, getDocMock, serverTimestampMock, setDocMock } = vi.hoisted(() => ({
  docMock: vi.fn(() => "cities-doc-ref"),
  getDocMock: vi.fn(),
  setDocMock: vi.fn(),
  serverTimestampMock: vi.fn(() => "SERVER_TIMESTAMP"),
}));

vi.mock("@/firebase", () => ({
  db: {},
}));

vi.mock("firebase/firestore", () => ({
  doc: docMock,
  getDoc: getDocMock,
  setDoc: setDocMock,
  serverTimestamp: serverTimestampMock,
}));

import { loadSavedCitiesWithSync, saveSavedCities } from "@/features/locations/services/persistence";

describe("saved city sync fallback", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.cookie = "";
    vi.clearAllMocks();
  });

  it("keeps local data and surfaces a recoverable error when cloud loading fails", async () => {
    window.localStorage.setItem(
      "savedCities",
      JSON.stringify({
        version: 2,
        cities: [
          {
            id: "beijing",
            province: "北京市",
            city: "北京",
            adcode: "110000",
          },
        ],
      })
    );

    getDocMock.mockRejectedValue(new Error("Firestore offline"));

    const result = await loadSavedCitiesWithSync();

    expect(result).toMatchObject({
      cities: [
        expect.objectContaining({
          city: "北京",
          adcode: "110000",
        }),
      ],
      syncStatus: "recoverable-error",
      reason: "Firestore offline",
    });
  });

  it("persists locally even when cloud writes fail", async () => {
    setDocMock.mockRejectedValue(new Error("Write denied"));

    const result = await saveSavedCities([
      {
        id: "beijing",
        province: "北京市",
        city: "北京",
        adcode: "110000",
        locationId: "101010100",
      },
    ]);

    expect(result).toMatchObject({
      syncStatus: "recoverable-error",
      reason: "Write denied",
    });
    expect(JSON.parse(window.localStorage.getItem("savedCities") || "{}")).toMatchObject({
      version: 2,
      cities: [
        expect.objectContaining({
          adcode: "110000",
          locationId: "101010100",
        }),
      ],
    });
  });
});
