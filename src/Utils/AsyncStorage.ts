// storage.ts
import {MMKV} from 'react-native-mmkv';
// import { AsyncKeyStrings } from './AppStrings'; // keep using your keys as before

// Create a single storage instance
export const storage = new MMKV();

/**
 * Save any JSON-serializable data under a key.
 * (MMKV is sync; we keep async for compatibility with your existing calls.)
 */
export const setDataInAsync = async (key: string, data: unknown) => {
  try {
    if (data === undefined) {
      storage.delete(key);
      return;
    }
    storage.set(key, JSON.stringify(data));
  } catch (e) {
    console.log('Error storing userdata', e);
  }
};

/**
 * Read and JSON-parse data for a key.
 * Returns null if not found.
 */
export const getDataAsync = async <T = unknown>(
  key: string,
): Promise<T | null> => {
  try {
    const raw = storage.getString(key);
    return raw != null ? (JSON.parse(raw) as T) : null;
  } catch (e) {
    console.log('Error reading/parsing data', e);
    return null;
  }
};

/**
 * Clear everything.
 */
export const clearAllData = async () => {
  try {
    storage.clearAll();
  } catch (e) {
    console.log('Error clearing storage', e);
    return false;
  }
};

/**
 * Optional helper: remove a single key (if you need it).
 */
export const removeSingleData = async (key: string) => {
  try {
    storage.delete(key);
  } catch (e) {
    console.log('Error deleting key', e);
    return false;
  }
};
