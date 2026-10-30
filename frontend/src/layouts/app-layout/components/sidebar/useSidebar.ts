import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../../stores/authStore';
import { authApi } from '../../../../services/api';

export function useSidebar() {
  const location = useLocation();
  const { navigationTree, setNavigationTree } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadNavigation() {
      if (navigationTree.length === 0) {
        try {
          setIsLoading(true);
          const options = await authApi.getMyNavigation();
          setNavigationTree(options);
        } catch (err) {
          console.error('Error al cargar navegación dinámica:', err);
        } finally {
          setIsLoading(false);
        }
      }
    }

    loadNavigation();
  }, [navigationTree.length, setNavigationTree]);

  const isActive = (route: string) => location.pathname === route;

  return {
    navigationTree,
    isLoading,
    isActive,
  };
}

