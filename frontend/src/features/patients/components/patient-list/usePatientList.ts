import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsApi } from '../../services/patientsApi';
import { PatientListItem } from '../../types/patient.types';
import { useCurrentOptionPermissions } from '../../../../hooks/useCurrentOptionPermissions';

export function usePatientList() {
  const queryClient = useQueryClient();
  const permissions = useCurrentOptionPermissions();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientListItem | null>(null);

  // Consulta de pacientes con reactividad ante cambios de página o búsqueda
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['patients', search, page],
    queryFn: () => patientsApi.findAll(search, page, 10),
  });

  // Mutación de Borrado Lógico (Soft Delete)
  const deleteMutation = useMutation({
    mutationFn: (id: string) => patientsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || 'Error al eliminar paciente.');
    },
  });

  const handleOpenCreate = () => {
    setEditingPatient(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (patient: PatientListItem) => {
    setEditingPatient(patient);
    setIsModalOpen(true);
  };

  const handleDelete = (patient: PatientListItem) => {
    if (confirm(`¿Confirma el borrado lógico del paciente [${patient.fullName}]? El documento quedará liberado.`)) {
      deleteMutation.mutate(patient.id);
    }
  };

  return {
    patients: data?.data || [],
    meta: data?.meta,
    isLoading,
    isError,
    search,
    setSearch,
    page,
    setPage,
    isModalOpen,
    setIsModalOpen,
    editingPatient,
    handleOpenCreate,
    handleOpenEdit,
    handleDelete,
    refetch,
    // Permisos booleanos para renderizado condicional de botones:
    canWrite: permissions.canWrite,
    canDelete: permissions.canDelete,
  };
}

