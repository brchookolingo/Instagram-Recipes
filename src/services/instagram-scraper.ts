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
      return null;
    }

    const data = await response.json();
    const post = data?.data?.post;
    if (!post) return null;

    const caption = post.edge_media_to_caption?.edges?.[0]?.node?.text ?? undefined;
    const imageUrl = post.display_url ?? post.thumbnail_src ?? undefined;
    const videoUrl = post.video_url ?? undefined;
    const isVideoPost = post.is_video === true || !!videoUrl;
    const authorName = post.owner?.username
      ? `@${post.owner.username}`
      : post.owner?.full_name ?? undefined;

    return {
      caption,
      imageUrl,
      thumbnailUrl: imageUrl,
      videoUrl,
      isVideoPost,
      authorName,
    };
  } catch {
    return null;
  }
}
