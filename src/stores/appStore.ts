import { create } from 'zustand';
import type { User } from '../types';

interface AppState {
  currentUser: User | null;
  token: string | null;
  collapsed: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  toggleCollapsed: () => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  token: null,
  collapsed: false,
  setUser: (user) => set({ currentUser: user }),
  setToken: (token) => set({ token }),
  toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
  logout: () => set({ currentUser: null, token: null }),
}));
