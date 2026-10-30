import { useCurrentOptionPermissions } from '../../../hooks/useCurrentOptionPermissions';
import { useAuthStore } from '../../../stores/authStore';

export function useDashboardView() {
  const { user } = useAuthStore();
  const permissions = useCurrentOptionPermissions();

  const handleCreateAppointment = () => {
    alert('Acción autorizada por permiso ESCRITURA: Apertura de modal de agendamiento');
  };

  const handleEmergencyAction = () => {
    alert('Acción autorizada por permiso BORRADO: Cancelación de turno de emergencia');
  };

  return {
    user,
    canWrite: permissions.canWrite,
    canDelete: permissions.canDelete,
    handleCreateAppointment,
    handleEmergencyAction,
  };
}

