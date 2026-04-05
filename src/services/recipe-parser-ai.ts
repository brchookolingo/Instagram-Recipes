import Anthropic from "@anthropic-ai/sdk";
import { Recipe } from "../types/recipe";
import { CLAUDE_MODEL } from "../utils/constants";

const SYSTEM_PROMPT = `You are a recipe extraction assistant. Given an Instagram post caption, extract recipe information and return ONLY a valid JSON object with no additional text.

Return this exact JSON structure:
{
  "title": "Recipe title",
  "description": "Brief description",
  "ingredients": [
    { "text": "full ingredient line", "quantity": "1", "unit": "cup", "checked": false }
  ],
  "instructions": [
    { "stepNumber": 1, "text": "Step description" }
  ],
  "tags": ["tag1", "tag2"],
  "prepTime": "15 min",
  "cookTime": "30 min",
  "servings": "4"
}

Rules:
- Extract all ingredients with quantities and units when available
- Number instructions sequentially
- If a field is not found in the caption, omit it from the JSON
- Handle emoji-heavy captions, multi-language text, and informal formatting
- Return ONLY the JSON object, no markdown, no explanation`;

export async function parseRecipeWithAI(
  caption: string,
  apiKey: string,
): Promise<Partial<Recipe> | null> {
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
    if (!textBlock || textBlock.type !== "text") return null;

    const jsonText = textBlock.text.trim();
    const parsed = JSON.parse(jsonText);

    return {
      title: parsed.title,
      description: parsed.description,
      ingredients: parsed.ingredients,
      instructions: parsed.instructions,
      tags: parsed.tags,
      prepTime: parsed.prepTime,
      cookTime: parsed.cookTime,
      servings: parsed.servings,
      extractionSource: "caption",
    };
  } catch {
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
