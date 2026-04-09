import { Recipe, Ingredient, Instruction } from "../types/recipe";
import { generateId } from "../utils/uuid";

const MEASUREMENT_WORDS = [
  "cup",
  "cups",
  "tsp",
  "tbsp",
  "teaspoon",
  "teaspoons",
  "tablespoon",
  "tablespoons",
  "oz",
  "ounce",
  "ounces",
  "g",
  "gram",
  "grams",
  "kg",
  "ml",
  "liter",
  "liters",
  "lb",
  "lbs",
  "pound",
  "pounds",
  "pinch",
  "dash",
  "handful",
  "slice",
  "slices",
  "piece",
  "pieces",
  "clove",
  "cloves",
  "can",
  "cans",
  "bunch",
];

const RECIPE_KEYWORDS = [
  "ingredients",
  "instructions",
  "steps",
  "method",
  "directions",
  "recipe",
  "how to make",
  "preparation",
];

const MEASUREMENT_PATTERN = new RegExp(
  `\\b(\\d+[./]?\\d*)\\s*(${MEASUREMENT_WORDS.join("|")})\\b`,
  "i",
);

const BULLET_OR_NUMBER_PATTERN = /^[\s]*(?:[-•*]|\d+[.)]\s)/;

const SOCIAL_MEDIA_HOSTS = [
  "instagram.com",
  "tiktok.com",
  "twitter.com",
  "x.com",
  "facebook.com",
  "youtube.com",
  "youtu.be",
  "threads.net",
  "snapchat.com",
];

/**
 * Extracts HTTP(S) URLs from a social media caption, filtering out links
 * back to social media platforms (which won't contain recipe content).
 * Returns up to 3 candidate URLs to try.
 */
export function extractUrlsFromCaption(caption: string): string[] {
  const matches = caption.match(/https?:\/\/[^\s<>"{}|\\^`\[\]]+/g) ?? [];
  return matches
    .map((url) => url.replace(/[.,;:!?]+$/, "")) // strip trailing punctuation
    .filter((url) => {
      try {
        const host = new URL(url).hostname.replace(/^www\./, "");
        return !SOCIAL_MEDIA_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
      } catch {
        return false;
      }
    })
    .slice(0, 3);
}

export function hasRecipeContent(caption: string): boolean {
  const lower = caption.toLowerCase();
  const hasKeywords = RECIPE_KEYWORDS.some((kw) => lower.includes(kw));
  const hasMeasurements = MEASUREMENT_PATTERN.test(caption);
  return hasKeywords || hasMeasurements;
}

function extractTitle(lines: string[]): string {
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.length > 3 &&
      trimmed.length < 100 &&
      !BULLET_OR_NUMBER_PATTERN.test(trimmed) &&
      !MEASUREMENT_PATTERN.test(trimmed)
    ) {
      return trimmed
        .replace(/[🍕🍳🥗🍰🍲🥘🍜🍝🥙🍛🧁🥧🥞🍔🌮🍕🥩🍗🥑🧀]+/gu, "")
        .trim();
    }
  }
  return "Untitled Recipe";
}

function parseIngredientLine(line: string): Ingredient {
  const cleaned = line.replace(/^[\s]*[-•*]\s*/, "").trim();
  const match = cleaned.match(/^(\d+[./]?\d*)\s*(\w+)\s+(.+)/);

  if (match) {
    return {
      id: generateId(),
      text: cleaned,
      quantity: match[1],
      unit: MEASUREMENT_WORDS.includes(match[2].toLowerCase())
        ? match[2]
        : undefined,
      checked: false,
    };
  }

  return { id: generateId(), text: cleaned, checked: false };
}

function extractIngredients(lines: string[]): Ingredient[] {
  const ingredients: Ingredient[] = [];
  let inIngredientSection = false;

  for (const line of lines) {
    const lower = line.toLowerCase().trim();

    if (lower.includes("ingredient")) {
      inIngredientSection = true;
      continue;
    }
    if (
      lower.includes("instruction") ||
      lower.includes("step") ||
      lower.includes("method") ||
      lower.includes("direction")
    ) {
      inIngredientSection = false;
      continue;
    }

    if (inIngredientSection && line.trim()) {
      ingredients.push(parseIngredientLine(line));
    } else if (
      MEASUREMENT_PATTERN.test(line) &&
      BULLET_OR_NUMBER_PATTERN.test(line)
    ) {
      ingredients.push(parseIngredientLine(line));
    }
  }

  return ingredients;
}

function extractInstructions(lines: string[]): Instruction[] {
  const instructions: Instruction[] = [];
  let inInstructionSection = false;
  let stepNumber = 1;

  for (const line of lines) {
    const lower = line.toLowerCase().trim();

    if (
      lower.includes("instruction") ||
      lower.includes("step") ||
      lower.includes("method") ||
      lower.includes("direction")
    ) {
      inInstructionSection = true;
      continue;
    }
    if (inInstructionSection && lower.includes("ingredient")) {
      inInstructionSection = false;
      continue;
    }

    if (inInstructionSection && line.trim()) {
      const cleaned = line.replace(/^[\s]*(?:[-•*]|\d+[.)]\s*)\s*/, "").trim();
      if (cleaned) {
        instructions.push({ stepNumber: stepNumber++, text: cleaned });
      }
    }
  }

  // Fallback: numbered lines that look like steps
  if (instructions.length === 0) {
    stepNumber = 1;
    for (const line of lines) {
      if (/^\s*\d+[.)]\s/.test(line) && !MEASUREMENT_PATTERN.test(line)) {
        const cleaned = line.replace(/^\s*\d+[.)]\s*/, "").trim();
        if (cleaned.length > 10) {
          instructions.push({ stepNumber: stepNumber++, text: cleaned });
        }
      }
    }
  }

  return instructions;
}

export function parseRecipeFromCaption(caption: string): Partial<Recipe> {
  const lines = caption.split("\n");
  const title = extractTitle(lines);
  const ingredients = extractIngredients(lines);
  const instructions = extractInstructions(lines);

  return {
    title,
    ingredients,
    instructions,
    extractionSource: "caption",
  };
}
