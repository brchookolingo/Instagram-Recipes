import { Ingredient } from "../types/recipe";
import { GrocerySection } from "../types/grocery";
import { apiPost } from "../utils/api-client";

export async function consolidateAndGroupIngredients(
  existingSections: GrocerySection[],
  newIngredients: Ingredient[],
  _apiKey: string, // kept for signature compatibility during transition; now handled server-side
): Promise<GrocerySection[]> {
  const { result } = await apiPost<{ result: GrocerySection[] }>("/api/claude", {
    action: "grocery",
    existingSections,
    newIngredients,
  });
  return result;
}
