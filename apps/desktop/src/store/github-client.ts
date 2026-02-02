import { deleteMyToken, retrieveMyToken, secureMyToken } from '@/modules/auth/api/tauri-auth-api';
import { create } from 'zustand';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  init: () => Promise<void>;
  setToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isAuthenticated: false,
  isLoading: true,

  init: async () => {
    try {
      set({ isLoading: true });
      const token = await retrieveMyToken();
      if (token) {
        set({ token, isAuthenticated: true, isLoading: false });
        return;
      }
      set({ token: null, isAuthenticated: false, isLoading: false });
    } catch {
      set({ token: null, isAuthenticated: false, isLoading: false });
    }
  },

  setToken: async (newToken: string) => {
    try {
      set({ token: newToken, isAuthenticated: true });
      await secureMyToken(newToken);
    } catch (err) {
      console.error("Failed to save token to system", err);
    }
  },

  logout: async () => {
    try {
      await deleteMyToken();
      set({ token: null, isAuthenticated: false });
    } catch (err) {
      console.error("Failed to logout", err);
    }
  }
}));
