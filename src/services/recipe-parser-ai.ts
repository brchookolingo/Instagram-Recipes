import Anthropic from "@anthropic-ai/sdk";
import { Recipe } from "../types/recipe";
import { ParseResult, PARSE_ERROR_MESSAGES } from "../types/result";
import { CLAUDE_MODEL } from "../utils/constants";
import { generateId } from "../utils/uuid";

const SYSTEM_PROMPT = `You are a recipe extraction assistant. Given an Instagram post caption, extract recipe information and return ONLY a valid JSON object with no additional text.

Return this exact JSON structure:
{
  "title": "Recipe title",
  "description": "Brief appetizing description of the dish, max 300 characters",
  "ingredients": [
    { "text": "full ingredient line", "quantity": "1", "unit": "cup", "checked": false }
  ],
  "instructions": [
    { "stepNumber": 1, "text": "Step description" }
  ],
  "tags": ["chicken", "gluten free", "quick"],
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4
}

Rules:
- Extract all ingredients with quantities and units when available
- Number instructions sequentially
- Handle emoji-heavy captions, multi-language text, and informal formatting
- Return ONLY the JSON object, no markdown, no explanation

Required fields — always include these, inferring from context if not explicitly stated:
- "description": Write a short appetizing summary of the dish based on the caption. Maximum 300 characters. Never omit this.
- "prepTime": Estimate from the instructions (e.g. chopping, mixing, marinating). Return as a whole number of minutes (e.g. 15). If a range like "25-30", use the higher value (30). Never use strings or units.
- "cookTime": Estimate from cooking steps (e.g. baking, simmering, frying times). Return as a whole number of minutes (e.g. 30). If a range, use the higher value. Never use strings or units.
- "servings": Estimate from ingredient quantities or dish type. Return as a whole number (e.g. 4). If a range like "5-6", use the higher value (6). Never use strings or units.

Tags rules — maximum 10 tags total:
- FIRST, include any applicable dietary tags from: vegetarian, vegan, gluten free
- SECOND, include the primary protein(s) from: beef, chicken, pork, lamb, fish, shellfish
- THEN add other relevant tags (cuisine type, cooking method, occasion, etc.) up to the 10 tag limit
- All tags lowercase`;

export async function parseRecipeWithAI(
  caption: string,
  apiKey: string,
): Promise<ParseResult<Partial<Recipe>>> {
  try {
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

    const message = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Extract the recipe from this Instagram caption:\n\n${caption}`,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { ok: false, code: "PARSE_FAILED", message: PARSE_ERROR_MESSAGES.PARSE_FAILED };
    }

    const jsonText = textBlock.text
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    const parsed = JSON.parse(jsonText);

    const toNum = (v: unknown): number | undefined => {
      const n = parseInt(String(v ?? ""), 10);
      return Number.isFinite(n) && n > 0 ? n : undefined;
    };

    return {
      ok: true,
      data: {
        title: parsed.title,
        description: parsed.description,
        ingredients: Array.isArray(parsed.ingredients)
          ? parsed.ingredients.map((ing: object) => ({ ...ing, id: generateId() }))
          : parsed.ingredients,
        instructions: parsed.instructions,
        tags: parsed.tags,
        prepTime: toNum(parsed.prepTime),
        cookTime: toNum(parsed.cookTime),
        servings: toNum(parsed.servings),
        extractionSource: "caption",
      },
    };
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return { ok: false, code: "INVALID_API_KEY", message: PARSE_ERROR_MESSAGES.INVALID_API_KEY };
    }
    if (error instanceof Anthropic.RateLimitError) {
      return { ok: false, code: "RATE_LIMITED", message: PARSE_ERROR_MESSAGES.RATE_LIMITED };
    }
    if (error instanceof Anthropic.APIConnectionError || error instanceof Anthropic.APIConnectionTimeoutError) {
      return { ok: false, code: "NETWORK_ERROR", message: PARSE_ERROR_MESSAGES.NETWORK_ERROR };
    }
    console.error("[recipe-parser-ai] parseRecipeWithAI failed:", error);
    return { ok: false, code: "UNKNOWN", message: PARSE_ERROR_MESSAGES.UNKNOWN };
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

const CLEANUP_PROMPT = `You are a recipe data validator. You will receive a recipe JSON that may have misclassified items — cooking steps accidentally placed in the ingredients list, or ingredients accidentally placed in the instructions list.

Your job is to fix the ingredients and instructions arrays only. Return the corrected recipe as ONLY a valid JSON object with no additional text, preserving all other fields exactly as provided.

Rules for ingredients:
- Must be actual food items, spices, liquids, or cooking components with quantities
- Must NOT contain cooking actions, method descriptions, or temperature/time instructions

Rules for instructions:
- Must be actual cooking steps describing actions (e.g. "Heat oil in pan...", "Mix together...")
- Must NOT contain standalone ingredient lines

If an item is in the wrong array, move it to the correct one. Re-number instructions sequentially after any changes. Return ONLY the corrected JSON object.`;

export async function cleanupRecipeExtraction(
  recipe: Partial<Recipe>,
  apiKey: string,
): Promise<Partial<Recipe>> {
  try {
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

    const message = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      system: CLEANUP_PROMPT,
      messages: [
        {
          role: "user",
          content: `Clean up this recipe JSON, fixing any misclassified ingredients or instructions:\n\n${JSON.stringify(recipe, null, 2)}`,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") return recipe;

    const parsed = JSON.parse(textBlock.text.trim());

    return {
      ...recipe,
      ingredients: parsed.ingredients ?? recipe.ingredients,
      instructions: parsed.instructions ?? recipe.instructions,
    };
  } catch {
    // If cleanup fails, return the original extraction unchanged
    return recipe;
  }
}
