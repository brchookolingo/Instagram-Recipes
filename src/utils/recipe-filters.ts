import { Recipe } from "../types/recipe";

export function totalMinutes(recipe: Recipe): number | null {
  if (recipe.prepTime === undefined && recipe.cookTime === undefined) return null;
  return (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);
}

function matchesTagsOrDescription(recipe: Recipe, term: string): boolean {
  const lower = term.toLowerCase();
  return (
    recipe.tags.some((t) => t.toLowerCase().includes(lower)) ||
    recipe.description.toLowerCase().includes(lower)
  );
}

function matchesTagsOrIngredients(recipe: Recipe, term: string): boolean {
  const lower = term.toLowerCase();
  return (
    recipe.tags.some((t) => t.toLowerCase().includes(lower)) ||
    recipe.ingredients.some((ing) => ing.text.toLowerCase().includes(lower))
  );
}

export function applyFilters(
  recipes: Recipe[],
  opts: {
    search: string;
    filterFavourites: boolean;
    filterDietary: string[];
    filterProtein: string[];
    filterPrep: string[];
  },
): Recipe[] {
  return recipes.filter((r) => {
    if (opts.search && !r.title.toLowerCase().includes(opts.search.toLowerCase()))
      return false;
    if (opts.filterFavourites && !r.isFavourite) return false;
    if (
      opts.filterDietary.length > 0 &&
      !opts.filterDietary.some((d) => matchesTagsOrDescription(r, d))
    )
      return false;
    if (
      opts.filterProtein.length > 0 &&
      !opts.filterProtein.some((p) => matchesTagsOrIngredients(r, p))
    )
      return false;
    if (opts.filterPrep.length > 0) {
      const passes = opts.filterPrep.some((prep) => {
        if (prep === "Under 30 min") {
          const t = totalMinutes(r);
          return t !== null && t <= 30;
        }
        if (prep === "Under 1 hour") {
          const t = totalMinutes(r);
          return t !== null && t <= 60;
        }
        if (prep === "Serves 6+") {
          return r.servings !== undefined && r.servings >= 6;
        }
        return false;
      });
      if (!passes) return false;
    }
    return true;
  });
}
