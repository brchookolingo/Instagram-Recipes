import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Recipe } from '../types/recipe';
import { zustandMMKVStorage } from '../utils/storage';

interface RecipeState {
  recipes: Recipe[];
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  getRecipeById: (id: string) => Recipe | undefined;
}

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set, get) => ({
      recipes: [],
      addRecipe: (recipe) =>
        set((state) => ({ recipes: [...state.recipes, recipe] })),
      updateRecipe: (id, updates) =>
        set((state) => ({
          recipes: state.recipes.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
          ),
        })),
      deleteRecipe: (id) =>
        set((state) => ({
          recipes: state.recipes.filter((r) => r.id !== id),
        })),
      getRecipeById: (id) => get().recipes.find((r) => r.id === id),
    }),
    {
      name: 'recipe-store',
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);
