import Anthropic from "@anthropic-ai/sdk";
import { Ingredient } from "../types/recipe";
import { GroceryItem, GrocerySection } from "../types/grocery";
import { CLAUDE_MODEL } from "../utils/constants";

const GROCERY_SYSTEM_PROMPT = `You are a grocery list organizer. Your job is to take a list of ingredients and organize them into logical grocery store sections.

If a "current list" is provided along with "new ingredients", first merge them intelligently:
- Combine duplicate items (e.g. "2 cups butter" + "1 cup butter" → "3 cups butter")
- Keep unique items as-is

Then group ALL items into grocery store sections. Use only the sections that are needed from this list:
- Meats & Seafood
- Vegetables & Herbs
- Fruits
- Dairy & Eggs
- Dry Goods & Pasta
- Canned & Jarred Goods
- Bakery
- Frozen
- Condiments & Sauces
- Spices & Seasonings
- Oils & Vinegars
- Beverages
- Other

Return ONLY valid JSON in exactly this format, no markdown, no explanation:
[{"section": "Dairy & Eggs", "items": [{"text": "butter", "quantity": "3", "unit": "cups"}, {"text": "eggs", "quantity": "2", "unit": ""}]}]

Rules:
- Every item must have "text", "quantity" (empty string if none), and "unit" (empty string if none)
- Only include sections that have items
- Return ONLY the JSON array`;

export async function consolidateAndGroupIngredients(
  existingSections: GrocerySection[],
  newIngredients: Ingredient[],
  apiKey: string,
): Promise<GrocerySection[]> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const newItems = newIngredients.map((ing) => ({
    text: ing.text,
    quantity: ing.quantity ?? "",
    unit: ing.unit ?? "",
  }));

  let userMessage: string;
  if (existingSections.length === 0) {
    userMessage = `New ingredients to organize:\n${JSON.stringify(newItems, null, 2)}`;
  } else {
    const existingItems = existingSections.flatMap((section) =>
      section.items.map((item) => ({
        text: item.text,
        quantity: item.quantity ?? "",
        unit: item.unit ?? "",
      })),
    );
    userMessage = `Current grocery list:\n${JSON.stringify(existingItems, null, 2)}\n\nNew ingredients to add and merge:\n${JSON.stringify(newItems, null, 2)}`;
  }

  const message = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system: GROCERY_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  const jsonText = textBlock.text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed: { section: string; items: { text: string; quantity: string; unit: string }[] }[] =
    JSON.parse(jsonText);

  return parsed.map((sectionData) => ({
    name: sectionData.section,
    items: sectionData.items.map((item, index) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}-${index}`,
      text: item.text,
      quantity: item.quantity || undefined,
      unit: item.unit || undefined,
      checked: false,
    })),
  }));
}
