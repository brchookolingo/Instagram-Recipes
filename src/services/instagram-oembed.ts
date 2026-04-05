export interface RawInstagramPost {
  caption?: string;
  imageUrl?: string;
  authorName?: string;
  thumbnailUrl?: string;
  html?: string;
  videoUrl?: string;
  isVideoPost?: boolean;
}

const OEMBED_ENDPOINT = 'https://graph.facebook.com/v22.0/instagram_oembed';

function extractCaptionFromHtml(html: string): string | undefined {
  const match = html.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);
  if (!match) return undefined;

  // Strip inner HTML tags and get text content
  const text = match[1]
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return text || undefined;
}

export async function fetchViaOEmbed(url: string): Promise<RawInstagramPost | null> {
  const appId = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID;
  const appSecret = process.env.EXPO_PUBLIC_FACEBOOK_APP_SECRET;

  if (!appId || !appSecret) {
    return null;
  }

  const accessToken = `${appId}|${appSecret}`;

  try {
    const params = new URLSearchParams({
      url,
      access_token: accessToken,
      fields: 'thumbnail_url,author_name',
    });

    const response = await fetch(`${OEMBED_ENDPOINT}?${params}`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    const result: RawInstagramPost = {
      authorName: data.author_name,
      thumbnailUrl: data.thumbnail_url,
      imageUrl: data.thumbnail_url,
      html: data.html,
    };

    if (data.html) {
      result.caption = extractCaptionFromHtml(data.html);
    }

    return result;
  } catch {
    return null;
  }
}
