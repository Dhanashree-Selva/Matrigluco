/**
 * Safe Browser Storage Adapter for Non-Sensitive Preferences (Theme, UI state)
 * NOT for tokens or medical data.
 */
export const browserStorage = {
  getItem<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return fallback;
      return JSON.parse(item) as T;
    } catch {
      return fallback;
    }
  },

  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`Unable to persist key "${key}" to localStorage:`, err);
    }
  },

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.warn(`Unable to remove key "${key}" from localStorage:`, err);
    }
  },
};
