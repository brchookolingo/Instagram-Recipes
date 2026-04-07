export interface GroceryItem {
  id: string;
  text: string;
  quantity?: string;
  unit?: string;
  checked: boolean;
}

export interface GrocerySection {
  name: string;
  items: GroceryItem[];
}

export interface RecipeRef {
  id: string;
  title: string;
}
