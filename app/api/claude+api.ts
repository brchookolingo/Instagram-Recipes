import {
  parseRecipeWithAI,
  cleanupRecipeExtraction,
} from "../../src/services/recipe-parser-ai";
import { consolidateAndGroupIngredients } from "../../src/services/grocery-service";

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.CLAUDE_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "Claude API key not configured on server" },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const { action } = body;

    if (action === "parse") {
      const { caption } = body;
      if (!caption || typeof caption !== "string") {
        return Response.json({ error: "Missing caption" }, { status: 400 });
      }
      const result = await parseRecipeWithAI(caption, apiKey);
      return Response.json({ result });
    }

    if (action === "cleanup") {
      const { recipe } = body;
      if (!recipe) {
        return Response.json({ error: "Missing recipe" }, { status: 400 });
      }
      const result = await cleanupRecipeExtraction(recipe, apiKey);
      return Response.json({ result });
    }

    if (action === "grocery") {
      const { existingSections, newIngredients } = body;
      if (!Array.isArray(newIngredients)) {
        return Response.json(
          { error: "Missing newIngredients" },
          { status: 400 },
        );
      }
      const result = await consolidateAndGroupIngredients(
        existingSections ?? [],
        newIngredients,
        apiKey,
      );
      return Response.json({ result });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("[api/claude] POST failed:", error);
    return Response.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
