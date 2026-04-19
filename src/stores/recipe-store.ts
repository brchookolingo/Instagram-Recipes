import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Recipe } from "../types/recipe";
import { zustandMMKVStorage } from "../utils/storage";
import { cacheImage, deleteCachedImage } from "../utils/image-cache";
import { scaleIngredients } from "../utils/scale-recipe";

// In-flight save dedup: protects against the race where two concurrent
// addRecipe() calls for the same sourceUrl both pass a findBySourceUrl()
// check, then both await cacheImage(), then both set() — producing duplicates.
const pendingSourceUrls = new Set<string>();

interface RecipeState {
  recipes: Recipe[];
  addRecipe: (recipe: Recipe) => Promise<void>;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  getRecipeById: (id: string) => Recipe | undefined;
  findBySourceUrl: (url: string) => Recipe | undefined;
  clearAll: () => void;
}

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set, get) => ({
      recipes: [],
      addRecipe: async (recipe) => {
        if (recipe.sourceUrl) {
          if (pendingSourceUrls.has(recipe.sourceUrl)) return;
          pendingSourceUrls.add(recipe.sourceUrl);
        }
        try {
          // Cache the image before persisting so the recipe is stored atomically
          // with a local URI — eliminating the window where a recipe exists without
          // a cached image. If caching fails, fall back to the remote URL.
          let localImageUri = recipe.localImageUri;
          if (!localImageUri && recipe.imageUrl) {
            try {
              localImageUri = await cacheImage(recipe.imageUrl, recipe.id);
            } catch {
              // Silently fail — remote URL still works
            }
          }
          const ingredientsHalf = scaleIngredients(recipe.ingredients, 0.5);
          const ingredientsDouble = scaleIngredients(recipe.ingredients, 2);
          const finalRecipe = {
            ...recipe,
            ingredientsHalf,
            ingredientsDouble,
            ...(localImageUri ? { localImageUri } : {}),
          };
          set((state) => ({
            recipes: [...state.recipes, finalRecipe],
          }));
        } finally {
          if (recipe.sourceUrl) pendingSourceUrls.delete(recipe.sourceUrl);
        }
      },
      updateRecipe: (id, updates) => {
        if (updates.ingredients) {
          updates.ingredientsHalf = scaleIngredients(updates.ingredients, 0.5);
          updates.ingredientsDouble = scaleIngredients(updates.ingredients, 2);
        }
        set((state) => ({
          recipes: state.recipes.map((r) =>
            r.id === id
              ? { ...r, ...updates, updatedAt: new Date().toISOString() }
              : r,
          ),
        }));
      },
      deleteRecipe: (id) => {
        set((state) => ({
          recipes: state.recipes.filter((r) => r.id !== id),
        }));
        // Evict the cached image in the background — fire and forget
        deleteCachedImage(id).catch(() => {});
      },
      getRecipeById: (id) => get().recipes.find((r) => r.id === id),
      findBySourceUrl: (url) =>
        get().recipes.find((r) => r.sourceUrl && r.sourceUrl === url),
      clearAll: () => set({ recipes: [] }),
    }),
    {
      name: "recipe-store",
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
