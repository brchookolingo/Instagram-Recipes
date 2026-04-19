/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  setupFiles: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/android/", "/ios/", "/.expo/"],
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?@?react-native|@react-native-community|@react-navigation|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-native-svg|nativewind|react-native-css-interop|react-native-safe-area-context|expo-modules-core|react-native-mmkv|react-native-nitro-modules|zustand|@anthropic-ai/sdk)",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
  ],
};
