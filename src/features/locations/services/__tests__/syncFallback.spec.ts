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

import { loadSavedCitiesWithSync, saveSavedCities } from "@/features/locations/services/persistence";

describe("saved city sync fallback", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.cookie = "";
    vi.clearAllMocks();
    hasFirebaseConfigMock.mockReturnValue(true);
  });

  it("skips cloud loading when Firebase config is unavailable", async () => {
    hasFirebaseConfigMock.mockReturnValue(false);
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

    const result = await loadSavedCitiesWithSync();

    expect(result).toMatchObject({
      cities: [
        expect.objectContaining({
          city: "北京",
          adcode: "110000",
        }),
      ],
      syncStatus: "ready",
    });
    expect(getDocMock).not.toHaveBeenCalled();
    expect(setDocMock).not.toHaveBeenCalled();
  });

  it("skips cloud writes when Firebase config is unavailable", async () => {
    hasFirebaseConfigMock.mockReturnValue(false);

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
      syncStatus: "ready",
      cities: [
        expect.objectContaining({
          adcode: "110000",
          locationId: "101010100",
        }),
      ],
    });
    expect(getDocMock).not.toHaveBeenCalled();
    expect(setDocMock).not.toHaveBeenCalled();
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

  it("omits undefined optional fields from the Firestore payload", async () => {
    await saveSavedCities([
      {
        id: "beijing",
        province: "北京市",
        city: "北京",
        adcode: undefined,
        locationId: "101010100",
        latitude: undefined,
        longitude: undefined,
        timezone: undefined,
        country: undefined,
        countryCode: undefined,
      },
    ]);

    const payload = setDocMock.mock.calls[0]?.[1] as {
      version: number;
      cities: Array<Record<string, unknown>>;
      updatedAt: string;
    };

    expect(payload).toMatchObject({
      version: 2,
      cities: [
        {
          id: "beijing",
          province: "北京市",
          city: "北京",
          locationId: "101010100",
        },
      ],
      updatedAt: "SERVER_TIMESTAMP",
    });

    const firestoreCity = payload.cities[0];
    expect(firestoreCity).not.toHaveProperty("adcode");
    expect(firestoreCity).not.toHaveProperty("latitude");
    expect(firestoreCity).not.toHaveProperty("longitude");
    expect(firestoreCity).not.toHaveProperty("timezone");
    expect(firestoreCity).not.toHaveProperty("country");
    expect(firestoreCity).not.toHaveProperty("countryCode");
  });
});
