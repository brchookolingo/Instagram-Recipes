import Constants from "expo-constants";

/**
 * Resolves the base URL for server-side API routes.
 *
 * - Development: derives the URL from Expo's Metro server host so the native
 *   app can reach API routes running on the same machine.
 * - Production: reads EXPO_PUBLIC_API_URL which must be set in your EAS build
 *   configuration to point at your deployed server.
 */
function getApiBaseUrl(): string {
  // Explicit override always wins (e.g. EAS production URL)
  const explicitUrl = process.env.EXPO_PUBLIC_API_URL;
  if (explicitUrl) return explicitUrl.replace(/\/$/, "");

  // In development, Expo exposes the Metro host via the manifest
  if (__DEV__) {
    const hostUri =
      Constants.expoConfig?.hostUri ??
      Constants.manifest?.debuggerHost ??
      "localhost:8081";
    const host = hostUri.split(":")[0];
    return `http://${host}:8081`;
  }

  // Fallback — should not reach here in a properly configured production build
  return "http://localhost:8081";
}

/**
 * Makes a POST request to an Expo API route.
 * Throws on non-OK responses so callers can catch and classify errors.
 */
export async function apiPost<T>(path: string, body: object): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`API ${path} returned ${response.status}: ${text}`);
  }

  return response.json() as Promise<T>;
}
