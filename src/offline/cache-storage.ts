import AsyncStorage from "@react-native-async-storage/async-storage";

export class CacheStorageError extends Error {
  readonly key: string;
  readonly causeValue: unknown;

  constructor(
    message: string,
    key: string,
    causeValue: unknown,
  ) {
    super(message);
    this.name = "CacheStorageError";
    this.key = key;
    this.causeValue = causeValue;
  }
}

export const CacheStorage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const serializedValue =
        await AsyncStorage.getItem(key);

      if (serializedValue === null) {
        return null;
      }

      return JSON.parse(serializedValue) as T;
    } catch (error) {
      throw new CacheStorageError(
        `Failed to read local cache key "${key}".`,
        key,
        error,
      );
    }
  },

  async set<T>(
    key: string,
    value: T,
  ): Promise<void> {
    try {
      const serializedValue =
        JSON.stringify(value);

      await AsyncStorage.setItem(
        key,
        serializedValue,
      );
    } catch (error) {
      throw new CacheStorageError(
        `Failed to write local cache key "${key}".`,
        key,
        error,
      );
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      throw new CacheStorageError(
        `Failed to remove local cache key "${key}".`,
        key,
        error,
      );
    }
  },
};
