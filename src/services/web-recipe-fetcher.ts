import { Recipe, Ingredient, Instruction } from "../types/recipe";
import { fetchWithTimeout } from "../utils/fetch-with-timeout";
import { generateId } from "../utils/uuid";

// Schema.org Recipe JSON-LD structure (partial)
interface SchemaRecipe {
  name?: string;
  description?: string;
  recipeIngredient?: string[];
  recipeInstructions?: Array<string | { text?: string; name?: string }>;
  image?: string | string[] | { url?: string };
  prepTime?: string; // ISO 8601 duration, e.g. "PT15M"
  cookTime?: string;
  recipeYield?: string | number;
  keywords?: string | string[];
}

function parseDuration(iso: string | undefined): number | undefined {
  if (!iso) return undefined;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/i);
  if (!match) return undefined;
  const hours = parseInt(match[1] ?? "0");
  const minutes = parseInt(match[2] ?? "0");
  return hours * 60 + minutes || undefined;
}

function extractJsonLdRecipe(html: string): SchemaRecipe | null {
  const scriptMatches = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );

  for (const match of scriptMatches) {
    try {
      const json = JSON.parse(match[1]);
      const candidates = Array.isArray(json)
        ? json
        : json["@graph"]
          ? json["@graph"]
          : [json];

      for (const item of candidates) {
        if (item["@type"] === "Recipe") return item as SchemaRecipe;
      }
    } catch {
      // malformed JSON, skip
    }
  }

  return null;
}

function mapSchemaToPartialRecipe(
  schema: SchemaRecipe,
): Partial<Recipe> & { imageUrl?: string } {
  const ingredients: Ingredient[] = (schema.recipeIngredient ?? []).map(
    (text) => ({ id: generateId(), text, checked: false }),
  );

  const instructions: Instruction[] = (schema.recipeInstructions ?? [])
    .map((item, idx) => ({
      stepNumber: idx + 1,
      text: typeof item === "string" ? item : (item.text ?? item.name ?? ""),
    }))
    .filter((s) => s.text.trim());

  const imageUrl = Array.isArray(schema.image)
    ? (schema.image[0] as string)
    : typeof schema.image === "object" && schema.image !== null
      ? schema.image.url
      : (schema.image as string | undefined);

  const tags = schema.keywords
    ? (Array.isArray(schema.keywords)
        ? schema.keywords
        : schema.keywords.split(",").map((t) => t.trim())
      ).slice(0, 10)
    : [];

  const servings = schema.recipeYield
    ? parseInt(String(schema.recipeYield))
    : undefined;

  return {
    title: schema.name,
    description: schema.description,
    ingredients,
    instructions,
    tags,
    prepTime: parseDuration(schema.prepTime),
    cookTime: parseDuration(schema.cookTime),
    servings: isNaN(servings ?? NaN) ? undefined : servings,
    extractionSource: "caption",
    imageUrl,
  };
}

/**
 * Extracts a condensed plain-text version of the page for AI fallback.
 * Strips scripts, styles, and tags, then limits length.
 */
function extractPageText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 8000);
}

/**
 * Fetches a recipe from an external web page URL.
 * Returns structured recipe data if schema.org JSON-LD is found,
 * or plain text content for AI parsing as a fallback.
 */
export async function fetchRecipeFromWebPage(url: string): Promise<{
  partialRecipe?: Partial<Recipe> & { imageUrl?: string };
  captionFallback?: string;
} | null> {
  try {
    const response = await fetchWithTimeout(
      url,
      { headers: { "User-Agent": "Mozilla/5.0 (compatible; RecipeBot/1.0)" } },
      15_000,
    );

    if (!response.ok) return null;

    const html = await response.text();

    const schema = extractJsonLdRecipe(html);
    if (schema && schema.recipeIngredient?.length) {
      return { partialRecipe: mapSchemaToPartialRecipe(schema) };
    }

    // No schema found — return page text for AI fallback
    const text = extractPageText(html);
    return text.length > 100 ? { captionFallback: text } : null;
  } catch (error) {
    console.error("[web-recipe-fetcher] fetchRecipeFromWebPage failed:", error);
    return null;
  }
}

/**
 * Extracts the outbound destination URL from a Pinterest pin page.
 * Pinterest embeds the pin data as JSON in the page HTML.
 */
export async function getPinterestDestinationUrl(
  pinUrl: string,
): Promise<string | null> {
  try {
    const response = await fetchWithTimeout(
      pinUrl,
      { headers: { "User-Agent": "Mozilla/5.0 (compatible; RecipeBot/1.0)" } },
      10_000,
    );

    if (!response.ok) return null;

    const html = await response.text();

    // Pinterest embeds pin data as JSON — look for the outbound link field
    const match = html.match(/"link"\s*:\s*"(https?:\/\/[^"]+)"/);
    return match?.[1] ?? null;
  } catch (error) {
    console.error("[web-recipe-fetcher] getPinterestDestinationUrl failed:", error);
    return null;
  }
}
