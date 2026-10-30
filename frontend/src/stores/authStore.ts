import { create } from 'zustand';
import { AuthUser, NavigationOption } from '../types/navigation.types';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  navigationTree: NavigationOption[];
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  setNavigationTree: (options: NavigationOption[]) => void;
  logout: () => void;
}

const getStorageItem = (key: string): string | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // Ignore storage errors in test / headless environments
  }
  return null;
};

const setStorageItem = (key: string, value: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {}
};

const removeStorageItem = (key: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {}
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: getStorageItem('sigo_access_token'),
  refreshToken: getStorageItem('sigo_refresh_token'),
  navigationTree: [],
  isAuthenticated: !!getStorageItem('sigo_access_token'),

  setAuth: (user, accessToken, refreshToken) => {
    setStorageItem('sigo_access_token', accessToken);
    setStorageItem('sigo_refresh_token', refreshToken);
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
    });
  },

  setNavigationTree: (navigationTree) => {
    set({ navigationTree });
  },

  logout: () => {
    removeStorageItem('sigo_access_token');
    removeStorageItem('sigo_refresh_token');
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      navigationTree: [],
      isAuthenticated: false,
    });
  },
}));

