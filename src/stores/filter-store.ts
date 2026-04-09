import { create } from "zustand";

interface FilterState {
  search: string;
  filterFavourites: boolean;
  filterDietary: string[];
  filterProtein: string[];
  filterPrep: string[];
  filterMealType: string[];
  setSearch: (value: string) => void;
  setFilterFavourites: (value: boolean) => void;
  setFilterDietary: (value: string[]) => void;
  setFilterProtein: (value: string[]) => void;
  setFilterPrep: (value: string[]) => void;
  setFilterMealType: (value: string[]) => void;
  clearAll: () => void;
}

export const useFilterStore = create<FilterState>()((set) => ({
  search: "",
  filterFavourites: false,
  filterDietary: [],
  filterProtein: [],
  filterPrep: [],
  filterMealType: [],
  setSearch: (value) => set({ search: value }),
  setFilterFavourites: (value) => set({ filterFavourites: value }),
  setFilterDietary: (value) => set({ filterDietary: value }),
  setFilterProtein: (value) => set({ filterProtein: value }),
  setFilterPrep: (value) => set({ filterPrep: value }),
  setFilterMealType: (value) => set({ filterMealType: value }),
  clearAll: () =>
    set({
      filterFavourites: false,
      filterDietary: [],
      filterProtein: [],
      filterPrep: [],
      filterMealType: [],
    }),
}));
