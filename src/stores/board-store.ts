import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Board } from "../types/recipe";
import { zustandMMKVStorage } from "../utils/storage";

interface BoardState {
  boards: Board[];
  addBoard: (board: Board) => void;
  updateBoard: (id: string, updates: Partial<Board>) => void;
  deleteBoard: (id: string) => void;
  addRecipeToBoard: (boardId: string, recipeId: string) => void;
  removeRecipeFromBoard: (boardId: string, recipeId: string) => void;
  clearAll: () => void;
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set) => ({
      boards: [],
      addBoard: (board) =>
        set((state) => ({ boards: [...state.boards, board] })),
      updateBoard: (id, updates) =>
        set((state) => ({
          boards: state.boards.map((b) =>
            b.id === id ? { ...b, ...updates } : b,
          ),
        })),
      deleteBoard: (id) =>
        set((state) => ({
          boards: state.boards.filter((b) => b.id !== id),
        })),
      addRecipeToBoard: (boardId, recipeId) =>
        set((state) => ({
          boards: state.boards.map((b) =>
            b.id === boardId && !b.recipeIds.includes(recipeId)
              ? { ...b, recipeIds: [...b.recipeIds, recipeId] }
              : b,
          ),
        })),
      removeRecipeFromBoard: (boardId, recipeId) =>
        set((state) => ({
          boards: state.boards.map((b) =>
            b.id === boardId
              ? { ...b, recipeIds: b.recipeIds.filter((id) => id !== recipeId) }
              : b,
          ),
        })),
      clearAll: () => set({ boards: [] }),
    }),
    {
      name: "board-store",
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
