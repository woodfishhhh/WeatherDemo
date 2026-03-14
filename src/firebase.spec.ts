import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAnalyticsMock, getFirestoreMock, initializeAppMock, isSupportedMock } = vi.hoisted(() => ({
  getAnalyticsMock: vi.fn(() => ({ name: "analytics" })),
  getFirestoreMock: vi.fn(() => ({ name: "firestore" })),
  initializeAppMock: vi.fn(() => ({ name: "app" })),
  isSupportedMock: vi.fn(() => Promise.resolve(true)),
}));

vi.mock("firebase/app", () => ({
  initializeApp: initializeAppMock,
}));

vi.mock("firebase/analytics", () => ({
  getAnalytics: getAnalyticsMock,
  isSupported: isSupportedMock,
}));

vi.mock("firebase/firestore", () => ({
  getFirestore: getFirestoreMock,
}));

describe("firebase bootstrap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("avoids initializing Firebase services when required config is missing", async () => {
    vi.doMock("@/config/env", () => ({
      appEnv: {
        firebase: {
          apiKey: "",
          authDomain: "",
          projectId: "",
          storageBucket: "",
          messagingSenderId: "",
          appId: "",
          measurementId: undefined,
        },
      },
      hasFirebaseConfig: () => false,
      isPlaceholderFirebaseValue: () => false,
    }));

    const firebaseModule = await import("@/firebase");

    expect(firebaseModule.hasFirebaseConfig()).toBe(false);
    expect(firebaseModule.firebaseApp).toBeNull();
    expect(firebaseModule.db).toBeNull();
    await expect(firebaseModule.firebaseAnalytics).resolves.toBeNull();
    expect(initializeAppMock).not.toHaveBeenCalled();
    expect(getFirestoreMock).not.toHaveBeenCalled();
    expect(isSupportedMock).not.toHaveBeenCalled();
    expect(getAnalyticsMock).not.toHaveBeenCalled();
  });

  it("treats example placeholder Firebase values as unavailable", async () => {
    vi.doMock("@/config/env", () => ({
      appEnv: {
        firebase: {
          apiKey: "your-firebase-api-key",
          authDomain: "your-project.firebaseapp.com",
          projectId: "your-project-id",
          storageBucket: "your-project.appspot.com",
          messagingSenderId: "your-messaging-sender-id",
          appId: "your-firebase-app-id",
          measurementId: undefined,
        },
      },
      hasFirebaseConfig: () => true,
      isPlaceholderFirebaseValue: (value: string | undefined) => value?.startsWith("your-") ?? false,
    }));

    const firebaseModule = await import("@/firebase");

    expect(firebaseModule.hasFirebaseConfig()).toBe(false);
    expect(firebaseModule.firebaseApp).toBeNull();
    expect(firebaseModule.db).toBeNull();
    await expect(firebaseModule.firebaseAnalytics).resolves.toBeNull();
    expect(initializeAppMock).not.toHaveBeenCalled();
    expect(getFirestoreMock).not.toHaveBeenCalled();
    expect(isSupportedMock).not.toHaveBeenCalled();
    expect(getAnalyticsMock).not.toHaveBeenCalled();
  });
});
