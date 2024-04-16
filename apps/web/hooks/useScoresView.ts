import { create } from "zustand";

interface ScoresView {
  expandState: boolean;
  setExpandState: (expandState: boolean) => void;
}

export const useScoresView = create<ScoresView>((set) => ({
  expandState: false,
  setExpandState: (expandState: boolean) => set({ expandState }),
}));
