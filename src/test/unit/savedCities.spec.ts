import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({ id: 'mock-doc' })),
  getDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
  setDoc: vi.fn(),
}));

vi.mock('@/firebase', () => ({
  db: {},
}));

import {
  getOrCreateClientId,
  readLocalSavedCities,
  writeLocalSavedCities,
} from '@/services/savedCities';

describe('savedCities service', () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = 'weather_client_id=; path=/; max-age=0';
  });

  it('normalizes duplicates before persisting cities locally', () => {
    writeLocalSavedCities([
      { id: '1', province: 'Shanghai', city: 'Shanghai', adcode: '310000' },
      { id: '2', province: 'Shanghai', city: 'Shanghai', adcode: '310000' },
      { id: '3', province: 'Zhejiang', city: 'Hangzhou' },
    ]);

    expect(readLocalSavedCities()).toEqual([
      { id: '1', province: 'Shanghai', city: 'Shanghai', adcode: '310000' },
      { id: '3', province: 'Zhejiang', city: 'Hangzhou', adcode: undefined },
    ]);
  });

  it('creates and reuses a persistent client cookie', () => {
    const firstId = getOrCreateClientId();
    const secondId = getOrCreateClientId();

    expect(firstId).toBeTruthy();
    expect(secondId).toBe(firstId);
    expect(document.cookie).toContain(`weather_client_id=${encodeURIComponent(firstId)}`);
  });
});
