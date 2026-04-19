// Polyfills and mocks for the Jest test environment.

// expo-secure-store uses native keychain — mock to an in-memory map.
jest.mock("expo-secure-store", () => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    deleteItemAsync: async (key: string) => {
      store.delete(key);
    },
  };
});

// expo-crypto — deterministic bytes so tests don't differ between runs.
jest.mock("expo-crypto", () => ({
  getRandomBytes: (len: number) => {
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = i;
    return bytes;
  },
}));

// react-native-mmkv — in-memory shim.
jest.mock("react-native-mmkv", () => {
  class MockMMKV {
    private store = new Map<string, string>();
    set(key: string, value: string) {
      this.store.set(key, value);
    }
    getString(key: string) {
      return this.store.get(key);
    }
    delete(key: string) {
      this.store.delete(key);
    }
    getAllKeys() {
      return Array.from(this.store.keys());
    }
    clearAll() {
      this.store.clear();
    }
    recrypt(_key: string) {
      /* no-op */
    }
  }
  return {
    MMKV: MockMMKV,
    createMMKV: () => new MockMMKV(),
  };
});

// expo-file-system — minimal shim for image-cache tests.
jest.mock("expo-file-system/legacy", () => ({
  documentDirectory: "/tmp/doc/",
  cacheDirectory: "/tmp/cache/",
  readDirectoryAsync: async () => [],
  getInfoAsync: async () => ({ exists: false }),
  makeDirectoryAsync: async () => {},
  deleteAsync: async () => {},
  downloadAsync: async () => ({ uri: "" }),
}));
