import { Recipe } from "../types/recipe";
import { RawPost } from "../types/post";
import {
  parseRecipeWithAI,
  cleanupRecipeExtraction,
  isExtractionSufficient,
} from "./recipe-parser-ai";
import { parseRecipeFromCaption, hasRecipeContent, extractUrlsFromCaption } from "./recipe-parser";
import { fetchRecipeFromWebPage } from "./web-recipe-fetcher";

export type ExtractionResult = Partial<Recipe> & { imageUrl?: string };

/**
 * Attempts to extract recipe data from a fetched post using a four-tier pipeline:
 *
 *  Tier 0 — Pre-extracted structured data (schema.org JSON-LD via web-recipe-fetcher).
 *           Used when the platform service already parsed the recipe (e.g. Pinterest).
 *
 *  Tier 1 — AI caption parsing via Claude. Preferred when a caption is available
 *           and the AI extracts a sufficiently complete result.
 *
 *  Tier 2 — Linked recipe website. If the caption AI result was insufficient, extract
 *           URLs from the caption and try fetching the recipe from each linked page.
 *           Uses schema.org JSON-LD first, falls back to AI on page text.
 *
 *  Fallback — Regex-based caption parser. Catches simple structured captions that
 *             list ingredients/steps explicitly without needing AI.
 *
 * Returns a partial Recipe (always), or null if there is nothing to work with.
 */
export async function extractRecipeFromPost(
  post: RawPost,
): Promise<ExtractionResult | null> {
  // Tier 0 — schema.org / pre-extracted structured data
  if (post.partialRecipe) {
    return post.partialRecipe;
  }

  const caption = post.caption;
  const apiKey = process.env.EXPO_PUBLIC_CLAUDE_API_KEY ?? "";

  // Tier 1 — AI extraction from caption
  if (caption) {
    try {
      const aiResult = await parseRecipeWithAI(caption, apiKey);
      if (aiResult && isExtractionSufficient(aiResult)) {
        const cleaned = await cleanupRecipeExtraction(aiResult, apiKey);
        return cleaned;
      }
    } catch (error) {
      console.error("[recipe-extractor] AI extraction failed:", error);
    }
  }

  // Tier 2 — follow links in caption to recipe websites
  if (caption) {
    const urls = extractUrlsFromCaption(caption);
    for (const url of urls) {
      try {
        const webResult = await fetchRecipeFromWebPage(url);
        if (!webResult) continue;

        // Schema.org found on the linked page — use it directly
        if (webResult.partialRecipe && isExtractionSufficient(webResult.partialRecipe)) {
          return webResult.partialRecipe;
        }

        // No schema, but we got page text — run AI on it
        if (webResult.captionFallback) {
          const aiResult = await parseRecipeWithAI(webResult.captionFallback, apiKey);
          if (aiResult && isExtractionSufficient(aiResult)) {
            const cleaned = await cleanupRecipeExtraction(aiResult, apiKey);
            return cleaned;
          }
        }
      } catch (error) {
        console.error(`[recipe-extractor] Web fetch failed for ${url}:`, error);
      }
    }
  }

  // Fallback — regex parser
  if (caption && hasRecipeContent(caption)) {
    return parseRecipeFromCaption(caption);
  }

  return null;
}
