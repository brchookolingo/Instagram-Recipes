/**
 * Centralised access to the EXPO_PUBLIC_* environment variables the app needs.
 *
 * Read once at module load so all services share the same values, and log a
 * clear console warning for any missing key. Callers should treat each value
 * as optional — services degrade gracefully when a key is absent rather than
 * crashing the app at boot.
 *
 * Longer-term these should come from a BYOK settings screen (see plan) rather
 * than bundled .env values.
 */

const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY ?? "";
const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY ?? "";
const FACEBOOK_APP_ID = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID ?? "";
const FACEBOOK_CLIENT_TOKEN = process.env.EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN ?? "";

const missing: string[] = [];
if (!CLAUDE_API_KEY) missing.push("EXPO_PUBLIC_CLAUDE_API_KEY");
if (!RAPIDAPI_KEY) missing.push("EXPO_PUBLIC_RAPIDAPI_KEY");
if (!FACEBOOK_APP_ID) missing.push("EXPO_PUBLIC_FACEBOOK_APP_ID");
if (!FACEBOOK_CLIENT_TOKEN) missing.push("EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN");

if (missing.length > 0 && __DEV__) {
  console.warn(
    `[env] Missing environment variables: ${missing.join(", ")}. ` +
      "See .env.example for the required keys. Recipe extraction features will be degraded until these are set.",
  );
}

export const env = {
  CLAUDE_API_KEY,
  RAPIDAPI_KEY,
  FACEBOOK_APP_ID,
  FACEBOOK_CLIENT_TOKEN,
};
