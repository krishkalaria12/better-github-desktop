import { deleteMyToken, retrieveMyToken, secureMyToken } from '@/modules/auth/api/tauri-auth-api';
import {
  getRepoState,
  removeRepoFromView,
  setActiveRepo as setActiveRepoInStore,
} from '@/modules/repo/api/tauri-repo-api';
import { create } from 'zustand';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  last_opened_repo: string | null;
  opened_repos: string[];

  init: () => Promise<void>;
  setToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  setLastOpenedRepo: () => Promise<void>;
  setActiveRepo: (repoPath: string) => Promise<void>;
  removeRepo: (repoPath: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isAuthenticated: false,
  isLoading: true,
  last_opened_repo: null,
  opened_repos: [],

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
      set({ token: null, isAuthenticated: false, last_opened_repo: null, opened_repos: [] });
    } catch (err) {
      console.error("Failed to logout", err);
    }
  },

  setLastOpenedRepo: async () => {
    try {
      const repoState = await getRepoState();
      set({
        last_opened_repo: repoState.active_repo,
        opened_repos: repoState.repos,
      });
    } catch (err) {
      console.error("Failed to set last opened repo", err);
    }
  },

  setActiveRepo: async (repoPath: string) => {
    try {
      const repoState = await setActiveRepoInStore(repoPath);
      set({
        last_opened_repo: repoState.active_repo,
        opened_repos: repoState.repos,
      });
    } catch (err) {
      console.error("Failed to set active repo", err);
    }
  },

  removeRepo: async (repoPath: string) => {
    try {
      const repoState = await removeRepoFromView(repoPath);
      set({
        last_opened_repo: repoState.active_repo,
        opened_repos: repoState.repos,
      });
    } catch (err) {
      console.error("Failed to remove repo", err);
    }
  },
}));
