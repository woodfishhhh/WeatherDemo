import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './msw/server';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  document.cookie = 'weather_client_id=; path=/; max-age=0';
});

afterAll(() => {
  server.close();
});
