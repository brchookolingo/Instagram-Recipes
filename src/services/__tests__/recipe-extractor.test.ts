/**
 * Integration-style test: verify extractRecipeFromPost runs through tiers
 * in order and surfaces the right ParseResult for common scenarios.
 */

import type { RawPost } from "../../types/post";

jest.mock("../recipe-parser-ai", () => ({
  parseRecipeWithAI: jest.fn(),
  cleanupRecipeExtraction: jest.fn(async (recipe: unknown) => recipe),
  isExtractionSufficient: jest.fn(
    (r: any) =>
      Array.isArray(r?.ingredients) &&
      r.ingredients.length > 0 &&
      Array.isArray(r?.instructions) &&
      r.instructions.length > 0,
  ),
}));

jest.mock("../recipe-parser", () => ({
  parseRecipeFromCaption: jest.fn(() => ({
    title: "Regex Fallback",
    ingredients: [{ text: "x" }],
    instructions: [{ stepNumber: 1, text: "y" }],
  })),
  hasRecipeContent: jest.fn(() => false),
  extractUrlsFromCaption: jest.fn(() => []),
}));

jest.mock("../web-recipe-fetcher", () => ({
  fetchRecipeFromWebPage: jest.fn(),
}));

jest.mock("../../utils/env", () => ({
  env: { CLAUDE_API_KEY: "test", RAPIDAPI_KEY: "", FACEBOOK_APP_ID: "", FACEBOOK_CLIENT_TOKEN: "" },
}));

const { parseRecipeWithAI, cleanupRecipeExtraction } = jest.requireMock("../recipe-parser-ai");
const { extractUrlsFromCaption, hasRecipeContent, parseRecipeFromCaption } =
  jest.requireMock("../recipe-parser");
const { fetchRecipeFromWebPage } = jest.requireMock("../web-recipe-fetcher");

import { extractRecipeFromPost } from "../recipe-extractor";

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

const makePost = (overrides: Partial<RawPost> = {}): RawPost =>
  ({ platform: "instagram", ...overrides } as RawPost);

describe("extractRecipeFromPost — tier 0 (pre-extracted)", () => {
  test("short-circuits when post has partialRecipe", async () => {
    const post = makePost({
      partialRecipe: {
        title: "Pre",
        ingredients: [{ text: "a", checked: false }],
        instructions: [{ stepNumber: 1, text: "do a" }],
      },
    });

    const result = await extractRecipeFromPost(post);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.title).toBe("Pre");
    expect(parseRecipeWithAI).not.toHaveBeenCalled();
  });
});

describe("extractRecipeFromPost — tier 1 (AI caption)", () => {
  test("returns AI result + runs cleanup when caption AI extraction is sufficient", async () => {
    parseRecipeWithAI.mockResolvedValueOnce({
      ok: true,
      data: {
        title: "AI",
        ingredients: [{ text: "flour" }],
        instructions: [{ stepNumber: 1, text: "mix" }],
      },
    });

    const result = await extractRecipeFromPost(
      makePost({ caption: "some recipe caption" }),
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.title).toBe("AI");
    expect(parseRecipeWithAI).toHaveBeenCalledTimes(1);
    expect(cleanupRecipeExtraction).toHaveBeenCalledTimes(1);
  });
});

describe("extractRecipeFromPost — tier 2 (linked recipe page)", () => {
  test("uses schema.org JSON-LD from linked page when tier 1 is insufficient", async () => {
    parseRecipeWithAI.mockResolvedValueOnce({
      ok: true,
      data: { title: "AI insufficient", ingredients: [] },
    });
    extractUrlsFromCaption.mockReturnValueOnce(["https://recipes.example.com/x"]);
    fetchRecipeFromWebPage.mockResolvedValueOnce({
      partialRecipe: {
        title: "From Web",
        ingredients: [{ text: "tomato" }],
        instructions: [{ stepNumber: 1, text: "chop" }],
      },
    });

    const result = await extractRecipeFromPost(
      makePost({ caption: "link: https://recipes.example.com/x" }),
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.title).toBe("From Web");
  });

  test("falls back to AI on page text when linked page has no schema", async () => {
    parseRecipeWithAI
      .mockResolvedValueOnce({ ok: true, data: { ingredients: [] } })
      .mockResolvedValueOnce({
        ok: true,
        data: {
          title: "AI on page",
          ingredients: [{ text: "sugar" }],
          instructions: [{ stepNumber: 1, text: "stir" }],
        },
      });
    extractUrlsFromCaption.mockReturnValueOnce(["https://recipes.example.com/y"]);
    fetchRecipeFromWebPage.mockResolvedValueOnce({
      captionFallback: "long page text describing recipe",
    });

    const result = await extractRecipeFromPost(
      makePost({ caption: "see https://recipes.example.com/y" }),
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.title).toBe("AI on page");
    expect(parseRecipeWithAI).toHaveBeenCalledTimes(2);
  });
});

describe("extractRecipeFromPost — regex fallback", () => {
  test("falls through to regex parser when AI fails and hasRecipeContent is true", async () => {
    parseRecipeWithAI.mockResolvedValueOnce({ ok: true, data: { ingredients: [] } });
    hasRecipeContent.mockReturnValueOnce(true);

    const result = await extractRecipeFromPost(
      makePost({ caption: "simple structured caption" }),
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.title).toBe("Regex Fallback");
    expect(parseRecipeFromCaption).toHaveBeenCalled();
  });
});

describe("extractRecipeFromPost — error surfacing", () => {
  test("surfaces INVALID_API_KEY when all tiers fail and AI reported it", async () => {
    parseRecipeWithAI.mockResolvedValueOnce({
      ok: false,
      code: "INVALID_API_KEY",
      message: "bad key",
    });

    const result = await extractRecipeFromPost(makePost({ caption: "x" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("INVALID_API_KEY");
  });

  test("surfaces RATE_LIMITED critical error", async () => {
    parseRecipeWithAI.mockResolvedValueOnce({
      ok: false,
      code: "RATE_LIMITED",
      message: "slow down",
    });

    const result = await extractRecipeFromPost(makePost({ caption: "x" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("RATE_LIMITED");
  });

  test("returns PARSE_FAILED when AI returns non-critical PARSE_FAILED and no other tier matches", async () => {
    parseRecipeWithAI.mockResolvedValueOnce({
      ok: false,
      code: "PARSE_FAILED",
      message: "no recipe",
    });

    const result = await extractRecipeFromPost(makePost({ caption: "x" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("PARSE_FAILED");
  });

  test("returns PARSE_FAILED when no caption and no partialRecipe", async () => {
    const result = await extractRecipeFromPost(makePost());
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("PARSE_FAILED");
    expect(parseRecipeWithAI).not.toHaveBeenCalled();
  });
});
