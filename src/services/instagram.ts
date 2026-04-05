import { RawInstagramPost } from './instagram-oembed';
import { fetchViaScraper } from './instagram-scraper';
import { fetchViaOEmbed } from './instagram-oembed';

export type { RawInstagramPost } from './instagram-oembed';

export async function fetchInstagramPost(url: string): Promise<RawInstagramPost | null> {
  // Try scraper first (richer data: caption, video URL, full image)
  const scraperResult = await fetchViaScraper(url);
  if (scraperResult) return scraperResult;

  // Fall back to oEmbed (limited but more reliable)
  const oembedResult = await fetchViaOEmbed(url);
  if (oembedResult) return oembedResult;

  // Both failed
  return null;
}
