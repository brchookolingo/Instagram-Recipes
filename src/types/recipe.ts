export interface Ingredient {
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
  instructions: Instruction[];
  tags: string[];
  prepTime?: string;
  cookTime?: string;
  servings?: string;
  extractionSource: "caption" | "video" | "manual";
  boardIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  id: string;
  name: string;
  coverImageUri?: string;
  recipeIds: string[];
  createdAt: string;
}
