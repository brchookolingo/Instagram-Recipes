import { createMMKV } from "react-native-mmkv";

export const storage = createMMKV({
  id: "instagram-recipes-storage",
});

export const zustandMMKVStorage = {
  getItem: (name: string): string | null => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string): void => {
    storage.set(name, value);
  },
  removeItem: (name: string): void => {
    storage.remove(name);
  },
};
