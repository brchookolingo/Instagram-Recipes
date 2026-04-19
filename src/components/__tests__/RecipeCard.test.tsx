import { render, fireEvent } from "@testing-library/react-native";
import { RecipeCard } from "../RecipeCard";
import { Recipe } from "../../types/recipe";

const baseRecipe: Recipe = {
  id: "r1",
  title: "Pasta Carbonara",
  description: "Classic Roman pasta",
  imageUrl: "",
  sourceUrl: "",
  author: "Chef",
  ingredients: [],
  instructions: [],
  tags: [],
  extractionSource: "caption",
  boardIds: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("RecipeCard", () => {
  test("renders the title", () => {
    const { getByText } = render(
      <RecipeCard recipe={baseRecipe} onPress={() => {}} />,
    );
    expect(getByText("Pasta Carbonara")).toBeTruthy();
  });

  test("renders author byline when author is present", () => {
    const { getByText } = render(
      <RecipeCard recipe={baseRecipe} onPress={() => {}} />,
    );
    expect(getByText("by Chef")).toBeTruthy();
  });

  test("renders prep and cook time chips when provided", () => {
    const { getByText } = render(
      <RecipeCard
        recipe={{ ...baseRecipe, prepTime: 15, cookTime: 30 }}
        onPress={() => {}}
      />,
    );
    expect(getByText("Prep: 15 min")).toBeTruthy();
    expect(getByText("Cook: 30 min")).toBeTruthy();
  });

  test("exposes an accessible button with a descriptive label", () => {
    const { getByRole } = render(
      <RecipeCard
        recipe={{ ...baseRecipe, prepTime: 15, cookTime: 30 }}
        onPress={() => {}}
      />,
    );
    const button = getByRole("button");
    expect(button.props.accessibilityLabel).toContain("Pasta Carbonara");
    expect(button.props.accessibilityLabel).toContain("by Chef");
    expect(button.props.accessibilityLabel).toContain("prep 15 minutes");
    expect(button.props.accessibilityLabel).toContain("cook 30 minutes");
    expect(button.props.accessibilityHint).toBeTruthy();
  });

  test("invokes onPress when pressed", () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <RecipeCard recipe={baseRecipe} onPress={onPress} />,
    );
    fireEvent.press(getByRole("button"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
