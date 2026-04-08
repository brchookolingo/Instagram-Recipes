import { Recipe } from "../types/recipe";
import { apiPost } from "../utils/api-client";

export async function parseRecipeWithAI(
  caption: string,
  _apiKey: string, // kept for signature compatibility during transition; now handled server-side
): Promise<Partial<Recipe> | null> {
  try {
    const { result } = await apiPost<{ result: Partial<Recipe> | null }>(
      "/api/claude",
      { action: "parse", caption },
    );
    return result;
  } catch (error) {
    console.error("[recipe-parser-ai] parseRecipeWithAI failed:", error);
    return null;
  }
}

export function isExtractionSufficient(partial: Partial<Recipe>): boolean {
  return (
    Array.isArray(partial.ingredients) &&
    partial.ingredients.length > 0 &&
    Array.isArray(partial.instructions) &&
    partial.instructions.length > 0
  );
}

export async function cleanupRecipeExtraction(
  recipe: Partial<Recipe>,
  _apiKey: string, // kept for signature compatibility during transition; now handled server-side
): Promise<Partial<Recipe>> {
  try {
    const { result } = await apiPost<{ result: Partial<Recipe> }>(
      "/api/claude",
      { action: "cleanup", recipe },
    );
    return result ?? recipe;
  } catch (error) {
    console.error("[recipe-parser-ai] cleanupRecipeExtraction failed:", error);
    // If cleanup fails, return the original extraction unchanged
    return recipe;
  }
}
