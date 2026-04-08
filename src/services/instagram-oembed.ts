import { RawPost } from "../types/post";
import { fetchWithTimeout } from "../utils/fetch-with-timeout";

export type RawInstagramPost = RawPost;

const OEMBED_ENDPOINT = "https://graph.facebook.com/v22.0/instagram_oembed";

function extractCaptionFromHtml(html: string): string | undefined {
  const match = html.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);
  if (!match) return undefined;

  // Strip inner HTML tags and get text content
  const text = match[1]
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return text || undefined;
}

export async function fetchViaOEmbed(
  url: string,
): Promise<RawInstagramPost | null> {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  if (!appId || !appSecret) {
    return null;
  }

  const accessToken = `${appId}|${appSecret}`;

  try {
    const params = new URLSearchParams({
      url,
      access_token: accessToken,
      fields: "thumbnail_url,author_name",
    });

    const response = await fetchWithTimeout(`${OEMBED_ENDPOINT}?${params}`, {}, 10_000);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    const result: RawInstagramPost = {
      platform: "instagram",
      authorName: data.author_name,
      thumbnailUrl: data.thumbnail_url,
      imageUrl: data.thumbnail_url,
      html: data.html,
    };

    if (data.html) {
      result.caption = extractCaptionFromHtml(data.html);
    }

    return result;
  } catch (error) {
    console.error("[instagram-oembed] fetchViaOEmbed failed:", error);
    return null;
  }
}
