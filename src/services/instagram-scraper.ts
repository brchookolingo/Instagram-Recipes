import { RawInstagramPost } from "./instagram-oembed";

const SCRAPER_HOST = "instagram-scraper21.p.rapidapi.com";

function extractShortcode(url: string): string | null {
  const match = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

export async function fetchViaScraper(
  url: string,
): Promise<RawInstagramPost | null> {
  const apiKey = process.env.EXPO_PUBLIC_RAPIDAPI_KEY;
  if (!apiKey) return null;

  const shortcode = extractShortcode(url);
  if (!shortcode) return null;

  try {
    const response = await fetch(
      `https://${SCRAPER_HOST}/api/v1/post-info?code=${shortcode}`,
      {
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": SCRAPER_HOST,
        },
      },
    );

    if (!response.ok) {
      console.log('[scraper] response not ok:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();

    const caption = data.caption_text ?? undefined;
    const imageUrl = data.image_urls?.[0] ?? undefined;
    const videoUrl = data.video_url ?? undefined;
    const isVideoPost = data.media_type === "VIDEO" || !!videoUrl;

    return {
      caption,
      imageUrl,
      thumbnailUrl: imageUrl,
      videoUrl,
      isVideoPost,
    };
  } catch {
    return null;
  }
}
