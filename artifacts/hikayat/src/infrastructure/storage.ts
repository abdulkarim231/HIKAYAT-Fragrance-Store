/**
 * Safe localStorage adapter. Never throws: private mode, quota errors,
 * corrupted JSON and missing window all degrade to the fallback value.
 */
const PREFIX = 'hikayat:';

export interface KeyValueStore {
  read<T>(key: string, fallback: T, validate: (v: unknown) => v is T): T;
  write<T>(key: string, value: T): void;
}

function storage(): Storage | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export const localStore: KeyValueStore = {
  read(key, fallback, validate) {
    const s = storage();
    if (!s) return fallback;
    try {
      const raw = s.getItem(PREFIX + key);
      if (raw == null) return fallback;
      const parsed: unknown = JSON.parse(raw);
      return validate(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  },
  write(key, value) {
    const s = storage();
    if (!s) return;
    try {
      s.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* quota or privacy mode: keep in-memory state only */
    }
  },
};

export const STORAGE_KEYS = {
  cart: 'cart.v1',
  wishlist: 'wishlist.v1',
  locale: 'locale.v1',
} as const;
