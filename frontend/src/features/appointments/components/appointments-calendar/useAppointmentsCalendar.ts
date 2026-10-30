import { useState, useEffect, useCallback } from 'react';
import { useCurrentOptionPermissions } from '../../../../hooks/useCurrentOptionPermissions';
import { useAuthStore } from '../../../../stores/authStore';
import { appointmentsApi } from '../../services/appointmentsApi';
import {
  Appointment,
  AppointmentStatus,
  CalendarViewMode,
  DentalChair,
} from '../../types/appointment.types';

export const useAppointmentsCalendar = (initialDate?: string) => {
  const { canWrite, canDelete } = useCurrentOptionPermissions();
  const user = useAuthStore((state) => state.user);
  const branchId = user?.branchId || '00000000-0000-0000-0000-000000000001';

  const [viewMode, setViewMode] = useState<CalendarViewMode>('day');
  const [currentDate, setCurrentDate] = useState<string>(
    initialDate || new Date().toISOString().split('T')[0],
  );
  const [chairFilter, setChairFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [chairs, setChairs] = useState<DentalChair[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Carga de sillones
  const fetchChairs = useCallback(async () => {
    try {
      const data = await appointmentsApi.getChairsLiveStatus(branchId);
      setChairs(data);
    } catch {
      // Mock de respaldo para demo
      setChairs([
        { id: '22222222-2222-2222-2222-222222222201', branchId, code: 'SIL-01', name: 'Sillón Principal A', isActive: true, occupancyState: 'DISPONIBLE' },
        { id: '22222222-2222-2222-2222-222222222202', branchId, code: 'SIL-02', name: 'Sillón Quirúrgico B', isActive: true, occupancyState: 'DISPONIBLE' },
        { id: '22222222-2222-2222-2222-222222222203', branchId, code: 'SIL-03', name: 'Sillón Odontopediatría', isActive: true, occupancyState: 'DISPONIBLE' },
      ]);
    }
  }, [branchId]);

  // Carga de citas según filtros
  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const startOfDay = `${currentDate}T00:00:00.000Z`;
      const endOfDay = `${currentDate}T23:59:59.999Z`;

      const res = await appointmentsApi.getAppointments({
        branchId,
        chairId: chairFilter !== 'ALL' ? chairFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        startDate: startOfDay,
        endDate: endOfDay,
        limit: 100,
      });

      setAppointments(res.data);
    } catch {
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, [branchId, currentDate, chairFilter, statusFilter]);

  useEffect(() => {
    fetchChairs();
    fetchAppointments();
  }, [fetchChairs, fetchAppointments]);

  // Refresco de tiempo de espera dinámico cada 30 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      fetchAppointments();
    }, 30000);
    return () => clearInterval(timer);
  }, [fetchAppointments]);

  // Navegación de fecha
  const navigateDate = (days: number) => {
    const current = new Date(`${currentDate}T12:00:00`);
    current.setDate(current.getDate() + days);
    setCurrentDate(current.toISOString().split('T')[0]);
  };

  const setToday = () => {
    setCurrentDate(new Date().toISOString().split('T')[0]);
  };

  // Cambio rápido de estado
  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    try {
      await appointmentsApi.changeStatus(id, { status: newStatus });
      await fetchAppointments();
      await fetchChairs();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Error al cambiar estado de la cita');
    }
  };

  // Eliminación (Soft delete)
  const handleDeleteAppointment = async (id: string) => {
    if (!window.confirm('¿Confirma que desea cancelar y eliminar esta cita del cronograma?')) {
      return;
    }
    try {
      await appointmentsApi.deleteAppointment(id);
      await fetchAppointments();
      await fetchChairs();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Error al eliminar cita');
    }
  };

  const handleOpenNewModal = () => {
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleModalSuccess = () => {
    fetchAppointments();
    fetchChairs();
  };

  return {
    branchId,
    viewMode,
    setViewMode,
    currentDate,
    chairFilter,
    setChairFilter,
    statusFilter,
    setStatusFilter,
    appointments,
    chairs,
    isLoading,
    isModalOpen,
    selectedAppointment,
    canWrite,
    canDelete,
    navigateDate,
    setToday,
    handleStatusChange,
    handleDeleteAppointment,
    handleOpenNewModal,
    handleOpenEditModal,
    handleModalClose,
    handleModalSuccess,
  };
};
