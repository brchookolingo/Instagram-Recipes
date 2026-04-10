import { RawPost } from "../types/post";
import { fetchWithTimeout } from "../utils/fetch-with-timeout";
import {
  getPinterestDestinationUrl,
  fetchRecipeFromWebPage,
} from "./web-recipe-fetcher";

const PINTEREST_OEMBED_ENDPOINT = "https://www.pinterest.com/oembed.json";

export async function fetchPinterestPost(url: string): Promise<RawPost | null> {
  const params = new URLSearchParams({ url });
  const response = await fetchWithTimeout(`${PINTEREST_OEMBED_ENDPOINT}?${params}`, {}, 10_000);

  if (response.status === 429) {
    const err = new Error("Rate limited by Pinterest oEmbed");
    (err as NodeJS.ErrnoException).code = "429";
    throw err;
  }

  if (!response.ok) return null;

  const data = await response.json();

  const authorUrlMatch = data.author_url?.match(/pinterest\.[a-z]{2,3}\/([^/?]+)/i);
  const authorName = authorUrlMatch ? `@${authorUrlMatch[1]}` : (data.author_name ?? undefined);

  const base: RawPost = {
    authorName,
    thumbnailUrl: data.thumbnail_url ?? undefined,
    imageUrl: data.thumbnail_url ?? undefined,
    platform: "pinterest",
  };

  // Try to follow the destination link on the pin and extract the recipe
  const destinationUrl = await getPinterestDestinationUrl(url);
  if (destinationUrl) {
    const webResult = await fetchRecipeFromWebPage(destinationUrl);

    if (webResult?.partialRecipe) {
      // Schema.org JSON-LD found — use it directly; prefer recipe image over pin thumbnail
      return {
        ...base,
        imageUrl: webResult.partialRecipe.imageUrl ?? base.imageUrl,
        partialRecipe: webResult.partialRecipe,
      };
    }

    if (webResult?.captionFallback) {
      // No schema — pass page text as caption for AI parsing
      return { ...base, caption: webResult.captionFallback };
    }
  }

  // Fallback: use the pin description as caption (rarely has the full recipe)
  const pinDescription = data.description?.trim() || undefined;
  return { ...base, caption: pinDescription };
}
