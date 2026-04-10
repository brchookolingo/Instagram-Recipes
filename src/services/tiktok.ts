import { RawPost } from "../types/post";
import { fetchWithTimeout } from "../utils/fetch-with-timeout";

const TIKTOK_OEMBED_ENDPOINT = "https://www.tiktok.com/oembed";

export async function fetchTikTokPost(url: string): Promise<RawPost | null> {
  const params = new URLSearchParams({ url });
  const response = await fetchWithTimeout(`${TIKTOK_OEMBED_ENDPOINT}?${params}`, {}, 10_000);

  if (response.status === 429) {
    const err = new Error("Rate limited by TikTok oEmbed");
    (err as NodeJS.ErrnoException).code = "429";
    throw err;
  }

  if (!response.ok) return null;

  const data = await response.json();

  // Prefer @username extracted from author_url over the display name
  const authorUrlMatch = data.author_url?.match(/tiktok\.com\/(@[^/?]+)/i);
  const authorName = authorUrlMatch?.[1] ?? data.author_name ?? undefined;

  return {
    caption: data.title ?? undefined,
    authorName,
    thumbnailUrl: data.thumbnail_url ?? undefined,
    imageUrl: data.thumbnail_url ?? undefined,
    html: data.html ?? undefined,
    isVideoPost: true,
    platform: "tiktok",
  };
}
