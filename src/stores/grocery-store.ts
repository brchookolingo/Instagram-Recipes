import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Ingredient } from "../types/recipe";
import { GrocerySection, RecipeRef } from "../types/grocery";
import { zustandMMKVStorage } from "../utils/storage";
import { consolidateAndGroupIngredients } from "../services/grocery-service";

interface GroceryState {
  sections: GrocerySection[];
  recipeRefs: RecipeRef[];
  isLoading: boolean;
  addRecipeIngredients: (
    recipeId: string,
    recipeTitle: string,
    ingredients: Ingredient[],
    apiKey: string,
  ) => Promise<void>;
  toggleItem: (sectionName: string, itemId: string) => void;
  addItem: (sectionName: string, text: string) => void;
  removeItem: (sectionName: string, itemId: string) => void;
  updateItem: (sectionName: string, itemId: string, text: string) => void;
  clearAll: () => void;
  clearChecked: () => void;
}

export const useGroceryStore = create<GroceryState>()(
  persist(
    (set, get) => ({
      sections: [],
      recipeRefs: [],
      isLoading: false,

      addRecipeIngredients: async (recipeId, recipeTitle, ingredients, apiKey) => {
        set({ isLoading: true });
        try {
          const { sections } = get();
          const newSections = await consolidateAndGroupIngredients(
            sections,
            ingredients,
            apiKey,
          );
          set((state) => ({
            sections: newSections,
            recipeRefs: state.recipeRefs.some((r) => r.id === recipeId)
              ? state.recipeRefs
              : [...state.recipeRefs, { id: recipeId, title: recipeTitle }],
            isLoading: false,
          }));
        } catch {
          set({ isLoading: false });
          throw new Error("Failed to organize grocery list");
        }
      },

      toggleItem: (sectionName, itemId) =>
        set((state) => ({
          sections: state.sections.map((section) =>
            section.name === sectionName
              ? {
                  ...section,
                  items: section.items.map((item) =>
                    item.id === itemId
                      ? { ...item, checked: !item.checked }
                      : item,
                  ),
                }
              : section,
          ),
        })),

      addItem: (sectionName, text) =>
        set((state) => {
          const newItem = {
            id: crypto.randomUUID(),
            text: text.trim(),
            checked: false,
          };
          const sectionExists = state.sections.some((s) => s.name === sectionName);
          if (sectionExists) {
            return {
              sections: state.sections.map((section) =>
                section.name === sectionName
                  ? { ...section, items: [...section.items, newItem] }
                  : section,
              ),
            };
          }
          // Create the section if it doesn't exist yet
          return {
            sections: [...state.sections, { name: sectionName, items: [newItem] }],
          };
        }),

      removeItem: (sectionName, itemId) =>
        set((state) => ({
          sections: state.sections
            .map((section) =>
              section.name === sectionName
                ? {
                    ...section,
                    items: section.items.filter((item) => item.id !== itemId),
                  }
                : section,
            )
            .filter((section) => section.items.length > 0),
        })),

      updateItem: (sectionName, itemId, text) =>
        set((state) => ({
          sections: state.sections.map((section) =>
            section.name === sectionName
              ? {
                  ...section,
                  items: section.items.map((item) =>
                    item.id === itemId ? { ...item, text } : item,
                  ),
                }
              : section,
          ),
        })),

      clearAll: () => set({ sections: [], recipeRefs: [] }),

      clearChecked: () =>
        set((state) => ({
          sections: state.sections
            .map((section) => ({
              ...section,
              items: section.items.filter((item) => !item.checked),
            }))
            .filter((section) => section.items.length > 0),
        })),
    }),
    {
      name: "grocery-store",
      storage: createJSONStorage(() => zustandMMKVStorage),
      partialize: (state) => ({ sections: state.sections, recipeRefs: state.recipeRefs }),
    },
  ),
);
