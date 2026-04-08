import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Recipe } from "../types/recipe";
import { zustandMMKVStorage } from "../utils/storage";
import { cacheImage, deleteCachedImage } from "../utils/image-cache";

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
        set((state) => ({
          recipes: [
            ...state.recipes,
            localImageUri ? { ...recipe, localImageUri } : recipe,
          ],
        }));
      },
      updateRecipe: (id, updates) =>
        set((state) => ({
          recipes: state.recipes.map((r) =>
            r.id === id
              ? { ...r, ...updates, updatedAt: new Date().toISOString() }
              : r,
          ),
        })),
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
