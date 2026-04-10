import { Recipe } from "../types/recipe";
import { RawPost } from "../types/post";
import { ParseResult, ParseErrorCode, PARSE_ERROR_MESSAGES } from "../types/result";
import {
  parseRecipeWithAI,
  cleanupRecipeExtraction,
  isExtractionSufficient,
} from "./recipe-parser-ai";
import { parseRecipeFromCaption, hasRecipeContent, extractUrlsFromCaption } from "./recipe-parser";
import { fetchRecipeFromWebPage } from "./web-recipe-fetcher";

export type ExtractionResult = Partial<Recipe> & { imageUrl?: string };

// Error codes that represent a service-level failure worth surfacing to the user
// (as opposed to simply "no recipe found in this post").
const CRITICAL_CODES: ParseErrorCode[] = ["INVALID_API_KEY", "RATE_LIMITED", "NETWORK_ERROR"];

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
 * Returns a ParseResult — either extracted data or a typed error the UI can act on.
 */
export async function extractRecipeFromPost(
  post: RawPost,
): Promise<ParseResult<ExtractionResult>> {
  // Tier 0 — schema.org / pre-extracted structured data
  if (post.partialRecipe) {
    return { ok: true, data: post.partialRecipe };
  }

  const caption = post.caption;
  const apiKey = process.env.EXPO_PUBLIC_CLAUDE_API_KEY ?? "";

  // Track the most significant AI error seen across tiers so we can surface it
  // if no tier succeeds.
  let lastAiError: { code: ParseErrorCode; message: string } | null = null;

  // Tier 1 — AI extraction from caption
  if (caption) {
    const aiResult = await parseRecipeWithAI(caption, apiKey);
    if (aiResult.ok && isExtractionSufficient(aiResult.data)) {
      const cleaned = await cleanupRecipeExtraction(aiResult.data, apiKey);
      return { ok: true, data: cleaned };
    }
    if (!aiResult.ok) {
      lastAiError = { code: aiResult.code, message: aiResult.message };
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
          return { ok: true, data: webResult.partialRecipe };
        }

        // No schema, but we got page text — run AI on it
        if (webResult.captionFallback) {
          const aiResult = await parseRecipeWithAI(webResult.captionFallback, apiKey);
          if (aiResult.ok && isExtractionSufficient(aiResult.data)) {
            const cleaned = await cleanupRecipeExtraction(aiResult.data, apiKey);
            return { ok: true, data: cleaned };
          }
          if (!aiResult.ok && !lastAiError) {
            lastAiError = { code: aiResult.code, message: aiResult.message };
          }
        }
      } catch (error) {
        console.error(`[recipe-extractor] Web fetch failed for ${url}:`, error);
      }
    }
  }

  // Fallback — regex parser
  if (caption && hasRecipeContent(caption)) {
    return { ok: true, data: parseRecipeFromCaption(caption) };
  }

  // Surface a critical AI error (bad key, rate limit) if that's why all tiers failed
  if (lastAiError && CRITICAL_CODES.includes(lastAiError.code)) {
    return { ok: false, code: lastAiError.code, message: lastAiError.message };
  }

  return { ok: false, code: "PARSE_FAILED", message: PARSE_ERROR_MESSAGES.PARSE_FAILED };
}
