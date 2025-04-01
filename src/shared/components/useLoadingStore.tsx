import { create } from "zustand";

interface useLoadingStore {
  loading: boolean;
  setLoading: (value: boolean) => void;
}

export const useStore = create<useLoadingStore>((set) => ({
  loading: false,
  setLoading: (value) => set({ loading: value }),
}));