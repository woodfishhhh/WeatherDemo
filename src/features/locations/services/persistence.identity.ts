const COOKIE_KEY = "weather_client_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 2;

const parseCookie = (name: string): string | null => {
  const prefix = name + "=";
  const parts = document.cookie.split(";");

  for (const part of parts) {
    const value = part.trim();
    if (value.startsWith(prefix)) {
      return decodeURIComponent(value.slice(prefix.length));
    }
  }

  return null;
};

export const createPersistenceId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return "cid_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
};

export const getOrCreateClientId = (): string => {
  const current = parseCookie(COOKIE_KEY);
  if (current) {
    return current;
  }

  const clientId = createPersistenceId();
  document.cookie = COOKIE_KEY + "=" + encodeURIComponent(clientId) + "; path=/; max-age=" + COOKIE_MAX_AGE + "; samesite=lax";
  return clientId;
};
