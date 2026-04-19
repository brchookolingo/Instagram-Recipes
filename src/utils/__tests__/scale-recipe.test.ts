import { scaleIngredientText, scaleIngredients, scaleTime } from "../scale-recipe";
import { Ingredient } from "../../types/recipe";

describe("scaleIngredientText", () => {
  test("factor of 1 returns unchanged text", () => {
    expect(scaleIngredientText("2 cups flour", 1)).toBe("2 cups flour");
  });

  test("doubles a simple whole quantity", () => {
    expect(scaleIngredientText("2 cups flour", 2)).toBe("4 cups flour");
  });

  test("halves a simple whole quantity", () => {
    expect(scaleIngredientText("2 cups flour", 0.5)).toBe("1 cups flour");
  });

  test("scales a slash fraction", () => {
    expect(scaleIngredientText("1/2 tsp salt", 2)).toBe("1 tsp salt");
  });

  test("halves a slash fraction", () => {
    expect(scaleIngredientText("1/2 tsp salt", 0.5)).toBe("¼ tsp salt");
  });

  test("scales a vulgar fraction character", () => {
    expect(scaleIngredientText("½ cup milk", 2)).toBe("1 cup milk");
  });

  test("scales a mixed number (whole + vulgar)", () => {
    expect(scaleIngredientText("1½ oz sugar", 2)).toBe("3 oz sugar");
  });

  test("scales a mixed number (whole + slash)", () => {
    expect(scaleIngredientText("1 1/2 cups water", 2)).toBe("3 cups water");
  });

  test("scales a decimal", () => {
    expect(scaleIngredientText("2.5 lb chicken", 2)).toBe("5 lb chicken");
  });

  test("produces mixed number for 1.5x scaling", () => {
    expect(scaleIngredientText("1 cup butter", 1.5)).toBe("1½ cup butter");
  });

  test("preserves unit with no quantity", () => {
    expect(scaleIngredientText("pinch of salt", 2)).toBe("pinch of salt");
  });

  test("factor of 0 returns unchanged text (guard)", () => {
    expect(scaleIngredientText("2 cups flour", 0)).toBe("2 cups flour");
  });

  test("negative factor returns unchanged text", () => {
    expect(scaleIngredientText("2 cups flour", -1)).toBe("2 cups flour");
  });

  test("NaN factor returns unchanged text", () => {
    expect(scaleIngredientText("2 cups flour", NaN)).toBe("2 cups flour");
  });

  test("Infinity factor returns unchanged text", () => {
    expect(scaleIngredientText("2 cups flour", Infinity)).toBe("2 cups flour");
  });
});

describe("scaleIngredients", () => {
  const sample: Ingredient[] = [
    { id: "a", text: "2 cups flour", checked: false },
    { id: "b", text: "1/2 tsp salt", checked: false },
    { id: "c", text: "pinch of pepper", checked: false },
  ];

  test("factor 1 returns same array reference", () => {
    expect(scaleIngredients(sample, 1)).toBe(sample);
  });

  test("factor 0 returns same array reference (guard)", () => {
    expect(scaleIngredients(sample, 0)).toBe(sample);
  });

  test("negative factor returns same array reference", () => {
    expect(scaleIngredients(sample, -2)).toBe(sample);
  });

  test("doubles every ingredient and preserves other fields", () => {
    const out = scaleIngredients(sample, 2);
    expect(out).toHaveLength(3);
    expect(out[0].text).toBe("4 cups flour");
    expect(out[0].id).toBe("a");
    expect(out[0].checked).toBe(false);
    expect(out[1].text).toBe("1 tsp salt");
    expect(out[2].text).toBe("pinch of pepper");
  });

  test("does not mutate the input array", () => {
    const original = [...sample];
    scaleIngredients(sample, 2);
    expect(sample).toEqual(original);
  });
});

describe("scaleTime", () => {
  test("undefined returns undefined", () => {
    expect(scaleTime(undefined, 2)).toBeUndefined();
  });

  test("doubles a time", () => {
    expect(scaleTime(30, 2)).toBe(60);
  });

  test("halves a time", () => {
    expect(scaleTime(30, 0.5)).toBe(15);
  });

  test("rounds to the nearest whole minute", () => {
    expect(scaleTime(10, 0.5)).toBe(5);
    expect(scaleTime(11, 0.5)).toBe(6);
  });

  test("negative factor returns original", () => {
    expect(scaleTime(30, -1)).toBe(30);
  });

  test("zero factor returns original", () => {
    expect(scaleTime(30, 0)).toBe(30);
  });
});
