import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ActionPermissions } from '../types/navigation.types';

/**
 * Hook para determinar dinámicamente si los botones de acción (Nuevo, Editar, Eliminar)
 * deben mostrarse u ocultarse en la pantalla actual según los permisos booleanos en DB.
 */
export function useCurrentOptionPermissions(): ActionPermissions {
  const location = useLocation();
  const navigationTree = useAuthStore((state) => state.navigationTree);

  // Buscar la opción del menú correspondiente a la ruta actual
  const currentOption = navigationTree.find((opt) => opt.frontendRoute === location.pathname);

  if (!currentOption) {
    // Si no está en el árbol, por seguridad se deniegan escrituras y borrados
    return {
      canRead: true,
      canWrite: false,
      canDelete: false,
    };
  }

  return {
    canRead: currentOption.lectura,
    canWrite: currentOption.escritura,
    canDelete: currentOption.borrado,
  };
}

