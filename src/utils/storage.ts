import { createMMKV } from "react-native-mmkv";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";

const ENCRYPTION_KEY_ID = "recigrams.mmkv-encryption-key";
const MIGRATION_FLAG_ID = "recigrams.mmkv-migrated-v1";
const STORAGE_ID = "instagram-recipes-storage";

function getOrCreateEncryptionKey(): string {
  const existing = SecureStore.getItem(ENCRYPTION_KEY_ID);
  if (existing) return existing;
  const bytes = Crypto.getRandomBytes(32);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  SecureStore.setItem(ENCRYPTION_KEY_ID, hex);
  return hex;
}

function openEncryptedStorage() {
  const encryptionKey = getOrCreateEncryptionKey();
  const migrated = SecureStore.getItem(MIGRATION_FLAG_ID) === "true";

  if (migrated) {
    return createMMKV({ id: STORAGE_ID, encryptionKey });
  }

  const instance = createMMKV({ id: STORAGE_ID });
  instance.recrypt(encryptionKey);
  SecureStore.setItem(MIGRATION_FLAG_ID, "true");
  return instance;
}

export const storage = openEncryptedStorage();

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
