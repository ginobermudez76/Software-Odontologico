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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem('sigo_access_token'),
  refreshToken: localStorage.getItem('sigo_refresh_token'),
  navigationTree: [],
  isAuthenticated: !!localStorage.getItem('sigo_access_token'),

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('sigo_access_token', accessToken);
    localStorage.setItem('sigo_refresh_token', refreshToken);
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
    localStorage.removeItem('sigo_access_token');
    localStorage.removeItem('sigo_refresh_token');
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      navigationTree: [],
      isAuthenticated: false,
    });
  },
}));

