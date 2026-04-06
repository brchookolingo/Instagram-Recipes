import { RawInstagramPost } from "./instagram-oembed";
import { fetchViaScraper } from "./instagram-scraper";
import { fetchViaOEmbed } from "./instagram-oembed";
import { withRetry } from "../utils/retry";

export type { RawInstagramPost } from "./instagram-oembed";

export async function fetchInstagramPost(
  url: string,
): Promise<RawInstagramPost | null> {
  const rapidApiKey = process.env.EXPO_PUBLIC_RAPIDAPI_KEY;
  const fbAppId = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID;
  console.log('[instagram] rapidApiKey present:', !!rapidApiKey);
  console.log('[instagram] fbAppId present:', !!fbAppId);

  // Try scraper first (richer data: caption, video URL, full image) with retry
  try {
    const scraperResult = await withRetry(() => fetchViaScraper(url), 3, 1000);
    if (scraperResult) return scraperResult;
    console.log('[instagram] scraper returned null');
  } catch (e) {
    console.log('[instagram] scraper threw:', e);
  }

  // Fall back to oEmbed (limited but more reliable) with retry
  try {
    const oembedResult = await withRetry(() => fetchViaOEmbed(url), 3, 1000);
    if (oembedResult) return oembedResult;
    console.log('[instagram] oembed returned null');
  } catch (e) {
    console.log('[instagram] oembed threw:', e);
  }

  // Both failed
  return null;
}
