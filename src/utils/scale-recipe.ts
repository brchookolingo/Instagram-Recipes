import { Ingredient } from "../types/recipe";

// Unicode vulgar fractions → decimal values
const VULGAR_TO_DECIMAL: Record<string, number> = {
  "½": 0.5,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "¼": 0.25,
  "¾": 0.75,
  "⅕": 0.2,
  "⅖": 0.4,
  "⅗": 0.6,
  "⅘": 0.8,
  "⅙": 1 / 6,
  "⅚": 5 / 6,
  "⅛": 0.125,
  "⅜": 0.375,
  "⅝": 0.625,
  "⅞": 0.875,
};

const VULGAR_CHARS = "½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞";

// Sorted by value for nearest-match lookup
const DECIMAL_TO_VULGAR: Array<[number, string]> = [
  [1 / 8, "⅛"],
  [1 / 6, "⅙"],
  [1 / 4, "¼"],
  [1 / 3, "⅓"],
  [3 / 8, "⅜"],
  [1 / 2, "½"],
  [5 / 8, "⅝"],
  [2 / 3, "⅔"],
  [3 / 4, "¾"],
  [5 / 6, "⅚"],
  [7 / 8, "⅞"],
];

const TOLERANCE = 0.04; // how close to a "nice" fraction before snapping

/** Format a positive decimal as a readable quantity string. */
function formatQuantity(value: number): string {
  if (value <= 0) return "0";

  const whole = Math.floor(value);
  const frac = value - whole;
  const snapped = DECIMAL_TO_VULGAR.find(([v]) => Math.abs(frac - v) <= TOLERANCE);

  if (whole === 0) {
    // Pure fraction
    return snapped ? snapped[1] : value.toFixed(1).replace(/\.0$/, "");
  }

  if (frac <= TOLERANCE) {
    // Whole number
    return String(whole);
  }

  if (snapped) {
    // Mixed number e.g. "1½"
    return `${whole}${snapped[1]}`;
  }

  // Decimal fallback
  return value.toFixed(1).replace(/\.0$/, "");
}

/**
 * Parse the leading quantity from an ingredient text string.
 * Tries patterns in priority order:
 *   1. Mixed number + slash fraction   "1 1/2 cups"
 *   2. Slash fraction only             "1/2 tsp"
 *   3. Whole + vulgar fraction char    "1½ oz"
 *   4. Vulgar fraction char only       "½ cup"
 *   5. Plain decimal / integer         "2 eggs" / "2.5 lb"
 *
 * Returns `{ value, rest }` or `null` if no numeric token found.
 */
function parseLeadingQuantity(
  text: string,
): { value: number; rest: string } | null {
  const t = text.trimStart();

  // 1. Mixed number "1 1/2"
  const mixed = t.match(new RegExp(`^(\\d+)\\s+(\\d+)\\/(\\d+)(.*)`,"s"));
  if (mixed) {
    return {
      value: parseInt(mixed[1], 10) + parseInt(mixed[2], 10) / parseInt(mixed[3], 10),
      rest: mixed[4],
    };
  }

  // 2. Slash fraction "1/2"
  const slash = t.match(/^(\d+)\/(\d+)(.*)/s);
  if (slash) {
    return {
      value: parseInt(slash[1], 10) / parseInt(slash[2], 10),
      rest: slash[3],
    };
  }

  // 3. Whole + vulgar "1½"
  const wholeVulgar = t.match(new RegExp(`^(\\d+)([${VULGAR_CHARS}])(.*)`,"s"));
  if (wholeVulgar) {
    return {
      value: parseInt(wholeVulgar[1], 10) + (VULGAR_TO_DECIMAL[wholeVulgar[2]] ?? 0),
      rest: wholeVulgar[3],
    };
  }

  // 4. Vulgar char only "½"
  const vulgar = t.match(new RegExp(`^([${VULGAR_CHARS}])(.*)`,"s"));
  if (vulgar) {
    return {
      value: VULGAR_TO_DECIMAL[vulgar[1]] ?? 0,
      rest: vulgar[2],
    };
  }

  // 5. Plain integer or decimal "2" / "2.5"
  const num = t.match(/^(\d+(?:\.\d+)?)(.*)/s);
  if (num) {
    return {
      value: parseFloat(num[1]),
      rest: num[2],
    };
  }

  return null;
}

/**
 * Scale a single ingredient text by `factor`.
 * Quantities embedded in the text (e.g. "2 cups", "1/2 tsp", "1½ oz")
 * are multiplied; purely descriptive text is returned unchanged.
 */
export function scaleIngredientText(text: string, factor: number): string {
  if (factor === 1) return text;

  const parsed = parseLeadingQuantity(text);
  if (!parsed) return text;

  const scaled = parsed.value * factor;
  return `${formatQuantity(scaled)}${parsed.rest}`;
}

/** Scale an array of ingredients by `factor`, returning new objects. */
export function scaleIngredients(
  ingredients: Ingredient[],
  factor: number,
): Ingredient[] {
  if (factor === 1) return ingredients;
  return ingredients.map((ing) => ({
    ...ing,
    text: scaleIngredientText(ing.text, factor),
  }));
}

/** Scale an optional numeric time (in minutes) by `factor`. */
export function scaleTime(
  minutes: number | undefined,
  factor: number,
): number | undefined {
  if (minutes === undefined) return undefined;
  return Math.round(minutes * factor);
}
