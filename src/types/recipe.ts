export interface Ingredient {
  id: string;
  text: string;
  quantity?: string;
  unit?: string;
  checked: boolean;
}

export interface Instruction {
  stepNumber: number;
  text: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  localImageUri?: string;
  videoUrl?: string;
  sourceUrl: string;
  author: string;
  ingredients: Ingredient[];
  ingredientsHalf?: Ingredient[];
  ingredientsDouble?: Ingredient[];
  instructions: Instruction[];
  notes?: string;
  tags: string[];
  isFavourite?: boolean;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  extractionSource: "caption" | "manual";
  boardIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  id: string;
  name: string;
  recipeIds: string[];
  createdAt: string;
}
