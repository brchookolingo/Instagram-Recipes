import { fetchInstagramPost } from "./instagram";
import { fetchTikTokPost } from "./tiktok";
import { fetchPinterestPost } from "./pinterest";
import { withRetry } from "../utils/retry";
import { fetchWithTimeout, isTimeoutError } from "../utils/fetch-with-timeout";
import { FetchResult, FETCH_ERROR_MESSAGES } from "../types/result";

export type { RawPost } from "../types/post";
export type { FetchResult } from "../types/result";

export type Platform = "instagram" | "tiktok" | "pinterest" | "unknown";

const PLATFORM_PATTERNS: Array<{ platform: Platform; pattern: RegExp }> = [
  { platform: "instagram", pattern: /instagram\.com\/(p|reel)\//i },
  {
    platform: "tiktok",
    pattern: /(?:tiktok\.com\/@[^/]+\/video\/|vm\.tiktok\.com\/|vt\.tiktok\.com\/)/i,
  },
  {
    platform: "pinterest",
    pattern: /(?:pinterest\.[a-z]{2,3}\/pin\/|pin\.it\/)/i,
  },
];

export function detectPlatform(url: string): Platform {
  for (const { platform, pattern } of PLATFORM_PATTERNS) {
    if (pattern.test(url)) return platform;
  }
  return "unknown";
}

async function resolveShortUrl(url: string): Promise<string> {
  // Use GET instead of HEAD — HEAD redirect following is unreliable in React Native
  try {
    const response = await fetchWithTimeout(url, { method: "GET", redirect: "follow" }, 8_000);
    const resolved = response.url;
    if (resolved && resolved !== url) return resolved;
    // Fallback: check the Location header from the raw response
    const location = response.headers.get("location");
    return location ?? url;
  } catch (error) {
    console.error("[post-fetcher] resolveShortUrl failed:", error);
    return url;
  }
}

function isTikTokShortUrl(url: string): boolean {
  return /(?:vm|vt)\.tiktok\.com\//i.test(url);
}

function isPinItUrl(url: string): boolean {
  return /pin\.it\//i.test(url);
}

/**
 * Extracts the pin ID and returns a clean canonical Pinterest URL.
 * Handles country subdomains (ca.pinterest.com), /sent/ paths, and query params.
 * e.g. https://ca.pinterest.com/pin/68749871399/sent/?invite_code=... → https://www.pinterest.com/pin/68749871399/
 */
function normalizePinterestUrl(url: string): string | null {
  const match = url.match(/pinterest\.[a-z]{2,3}\/pin\/(\d+)/i);
  if (!match) return null;
  return `https://www.pinterest.com/pin/${match[1]}/`;
}

export async function fetchPost(url: string): Promise<FetchResult> {
  const platform = detectPlatform(url);

  if (platform === "unknown") {
    return {
      ok: false,
      code: "UNSUPPORTED_PLATFORM",
      message: FETCH_ERROR_MESSAGES.UNSUPPORTED_PLATFORM,
    };
  }

  try {
    let post = null;

    if (platform === "instagram") {
      post = await fetchInstagramPost(url);
    } else if (platform === "tiktok") {
      const resolvedUrl = isTikTokShortUrl(url) ? await resolveShortUrl(url) : url;
      post = await withRetry(() => fetchTikTokPost(resolvedUrl), 3, 1000);
    } else if (platform === "pinterest") {
      const resolvedUrl = isPinItUrl(url) ? await resolveShortUrl(url) : url;
      const cleanUrl = normalizePinterestUrl(resolvedUrl) ?? url;
      post = await withRetry(() => fetchPinterestPost(cleanUrl), 3, 1000);
    }

    if (!post) {
      return { ok: false, code: "NOT_FOUND", message: FETCH_ERROR_MESSAGES.NOT_FOUND };
    }

    return { ok: true, post };
  } catch (error) {
    console.error("[post-fetcher] fetchPost failed:", error);

    if (isTimeoutError(error)) {
      return { ok: false, code: "TIMEOUT", message: FETCH_ERROR_MESSAGES.TIMEOUT };
    }
    if ((error as NodeJS.ErrnoException)?.code === "429") {
      return { ok: false, code: "RATE_LIMITED", message: FETCH_ERROR_MESSAGES.RATE_LIMITED };
    }
    return { ok: false, code: "UNKNOWN", message: FETCH_ERROR_MESSAGES.UNKNOWN };
  }
}
