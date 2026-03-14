import { beforeEach, describe, expect, it, vi } from "vitest";

const { docMock, getDocMock, hasFirebaseConfigMock, serverTimestampMock, setDocMock } = vi.hoisted(() => ({
  docMock: vi.fn(() => "cities-doc-ref"),
  getDocMock: vi.fn(),
  hasFirebaseConfigMock: vi.fn(() => true),
  setDocMock: vi.fn(),
  serverTimestampMock: vi.fn(() => "SERVER_TIMESTAMP"),
}));

vi.mock("@/firebase", () => ({
  db: {},
  hasFirebaseConfig: hasFirebaseConfigMock,
}));

vi.mock("firebase/firestore", () => ({
  doc: docMock,
  getDoc: getDocMock,
  setDoc: setDocMock,
  serverTimestamp: serverTimestampMock,
}));

import { getSavedCitiesSnapshot } from "@/features/locations/services/persistence";

describe("saved city migration", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.cookie = "";
    vi.clearAllMocks();
  });

  it("upgrades legacy localStorage arrays into the versioned envelope without losing locations", () => {
    window.localStorage.setItem(
      "savedCities",
      JSON.stringify([
        {
          province: "北京市",
          city: "北京",
          qweatherId: "101010100",
          adcode: "110000",
          latitude: "39.90499",
          longitude: "116.40529",
        },
      ])
    );

    const snapshot = getSavedCitiesSnapshot();

    expect(snapshot).toEqual([
      expect.objectContaining({
        province: "北京市",
        city: "北京",
        locationId: "101010100",
        adcode: "110000",
        latitude: "39.90499",
        longitude: "116.40529",
      }),
    ]);

    expect(JSON.parse(window.localStorage.getItem("savedCities") || "{}")).toMatchObject({
      version: 2,
      cities: [
        expect.objectContaining({
          locationId: "101010100",
          adcode: "110000",
        }),
      ],
    });
  });

  it("falls back safely when persisted localStorage data is malformed JSON", () => {
    window.localStorage.setItem("savedCities", "{ invalid-json");

    const snapshot = getSavedCitiesSnapshot();

    expect(snapshot).toEqual([]);
    expect(window.localStorage.getItem("savedCities")).toBe("{ invalid-json");
  });
});
