import * as VideoThumbnails from "expo-video-thumbnails";
import { readAsStringAsync, EncodingType } from "expo-file-system/legacy";
import Anthropic from "@anthropic-ai/sdk";
import { Recipe } from "../types/recipe";
import { CLAUDE_MODEL } from "../utils/constants";

export async function extractFrames(
  videoUri: string,
  frameCount: number = 6,
): Promise<string[]> {
  const frames: string[] = [];

  // Extract frames at evenly spaced intervals
  // Assume a rough duration; we extract at percentage-based time offsets
  const timeOffsets = Array.from({ length: frameCount }, (_, i) =>
    Math.round((i / (frameCount - 1)) * 30000),
  );

  for (const time of timeOffsets) {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time,
        quality: 0.7,
      });
      frames.push(uri);
    } catch {
      // Skip frames that fail to extract
    }
  }

  return frames;
}

const VISION_SYSTEM_PROMPT = `You are a recipe extraction assistant. You are given screenshots from a cooking/recipe video. Analyze ALL frames to extract recipe information visible in the video (text overlays, ingredient lists, step-by-step instructions, title cards).

Return ONLY a valid JSON object:
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
- Read text overlays, title cards, and ingredient lists visible in frames
- Infer cooking steps from visual context when text isn't visible
- Omit fields you cannot determine
- Return ONLY JSON, no markdown or explanation`;

export async function parseRecipeFromVideoFrames(
  frameUris: string[],
  apiKey: string,
): Promise<Partial<Recipe> | null> {
  if (frameUris.length === 0) return null;

  try {
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

    // Build image content blocks from frame URIs
    const imageBlocks: Anthropic.Messages.ContentBlockParam[] = [];

    for (const uri of frameUris) {
      const base64 = await readAsStringAsync(uri, {
        encoding: EncodingType.Base64,
      });

      imageBlocks.push({
        type: "image",
        source: {
          type: "base64",
          media_type: "image/jpeg",
          data: base64,
        },
      });
    }

    imageBlocks.push({
      type: "text",
      text: "Extract the recipe information from these video frames.",
    });

    const message = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      system: VISION_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: imageBlocks,
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
      extractionSource: "video",
    };
  } catch {
    return null;
  }
}
