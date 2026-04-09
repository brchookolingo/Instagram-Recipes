import { createMMKV } from "react-native-mmkv";

const storage = createMMKV({ id: "onboarding" });
const KEY = "onboarding_complete";

export function hasSeenOnboarding(): boolean {
  return storage.getBoolean(KEY) ?? false;
}

export function markOnboardingSeen(): void {
  storage.set(KEY, true);
}
