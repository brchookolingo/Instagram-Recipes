import { Recipe } from "../types/recipe";
import { RawPost } from "../types/post";
import {
  parseRecipeWithAI,
  cleanupRecipeExtraction,
  isExtractionSufficient,
} from "./recipe-parser-ai";
import { parseRecipeFromCaption, hasRecipeContent } from "./recipe-parser";

export type ExtractionResult = Partial<Recipe> & { imageUrl?: string };

/**
 * Attempts to extract recipe data from a fetched post using a three-tier pipeline:
 *
 *  Tier 0 — Pre-extracted structured data (schema.org JSON-LD via web-recipe-fetcher).
 *           Used when the platform service already parsed the recipe (e.g. Pinterest).
 *
 *  Tier 1 — AI caption parsing via Claude. Preferred when a caption is available
 *           and the AI extracts a sufficiently complete result.
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

  // Tier 1 — AI extraction
  if (caption) {
    try {
      const aiResult = await parseRecipeWithAI(caption, "");
      if (aiResult && isExtractionSufficient(aiResult)) {
        const cleaned = await cleanupRecipeExtraction(aiResult, "");
        return cleaned;
      }
    } catch (error) {
      console.error("[recipe-extractor] AI extraction failed:", error);
    }
  }

  // Fallback — regex parser
  if (caption && hasRecipeContent(caption)) {
    return parseRecipeFromCaption(caption);
  }

  return null;
}
