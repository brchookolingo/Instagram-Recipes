import { RawInstagramPost } from './instagram-oembed';

const SCRAPER_HOST = 'instagram-scraper-api2.p.rapidapi.com';

function extractShortcode(url: string): string | null {
  const match = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

export async function fetchViaScraper(url: string): Promise<RawInstagramPost | null> {
  const apiKey = process.env.EXPO_PUBLIC_RAPIDAPI_KEY;
  if (!apiKey) return null;

  const shortcode = extractShortcode(url);
  if (!shortcode) return null;

  try {
    const response = await fetch(
      `https://${SCRAPER_HOST}/v1/post_info?code_or_id_or_url=${encodeURIComponent(url)}`,
      {
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': SCRAPER_HOST,
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();

    const caption = data.data?.caption?.text ?? data.caption?.text ?? undefined;
    const imageUrl =
      data.data?.image_versions?.items?.[0]?.url ??
      data.data?.thumbnail_url ??
      undefined;
    const videoUrl =
      data.data?.video_versions?.[0]?.url ??
      data.data?.video_url ??
      undefined;
    const authorName =
      data.data?.user?.username ??
      data.data?.owner?.username ??
      undefined;
    const isVideoPost =
      data.data?.media_type === 2 ||
      data.data?.is_video === true ||
      !!videoUrl;

    return {
      caption,
      imageUrl,
      thumbnailUrl: imageUrl,
      videoUrl,
      authorName,
      isVideoPost,
    };
  } catch {
    return null;
  }
}
