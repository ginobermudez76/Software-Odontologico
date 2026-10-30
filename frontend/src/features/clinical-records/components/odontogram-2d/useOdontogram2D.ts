import { useState, useEffect, useCallback } from 'react';
import { useCurrentOptionPermissions } from '../../../../hooks/useCurrentOptionPermissions';
import { clinicalRecordsApi } from '../../services/clinicalRecordsApi';
import { patientsApi } from '../../../patients/services/patientsApi';
import { PatientListItem } from '../../../patients/types/patient.types';
import {
  DentitionType,
  OdontogramMode,
  OdontogramNotation,
  ToothCondition,
  ToothFinding,
  ToothSurface,
} from '../../types/odontogram.types';

export const useOdontogram2D = (initialPatientId?: string) => {
  const { canWrite } = useCurrentOptionPermissions();

  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId || '');
  const [patientRecord, setPatientRecord] = useState<any | null>(null);

  const [activeNotation, setActiveNotation] = useState<OdontogramNotation>('FDI');
  const [activeDentition, setActiveDentition] = useState<DentitionType>('PERMANENT');
  const [activeMode, setActiveMode] = useState<OdontogramMode>('EVOLUTIONARY');

  const [selectedCondition, setSelectedCondition] = useState<ToothCondition>('CARIES');
  const [applyMode, setApplyMode] = useState<'SURFACE' | 'TOOTH'>('SURFACE');

  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [teeth, setTeeth] = useState<Record<string, ToothFinding>>({});

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cargar lista de pacientes
  useEffect(() => {
    patientsApi
      .findAll('', 1, 100)
      .then((res) => {
        setPatients(res.data);
        if (!selectedPatientId && res.data.length > 0) {
          setSelectedPatientId(res.data[0].id);
        }
      })
      .catch(() => setPatients([]));
  }, [selectedPatientId]);

  // Cargar Odontograma del paciente seleccionado
  const loadOdontogram = useCallback(async () => {
    if (!selectedPatientId) return;
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await clinicalRecordsApi.getOdontogram(selectedPatientId);
      setPatientRecord(res);

      const targetOdontogram =
        activeMode === 'INITIAL' ? res.initialOdontogram : res.evolutionaryOdontogram;
      setTeeth(targetOdontogram || {});
    } catch {
      setTeeth({});
      setPatientRecord(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPatientId, activeMode]);

  useEffect(() => {
    loadOdontogram();
  }, [loadOdontogram]);

  // Al cambiar entre modo Inicial vs. Evolutivo
  const handleModeChange = (mode: OdontogramMode) => {
    setActiveMode(mode);
    if (patientRecord) {
      const target =
        mode === 'INITIAL'
          ? patientRecord.initialOdontogram
          : patientRecord.evolutionaryOdontogram;
      setTeeth(target || {});
    }
  };

  // Clic en una superficie de un diente
  const handleSurfaceClick = (fdiNumber: number, surface: ToothSurface) => {
    const key = String(fdiNumber);
    setSelectedTooth(fdiNumber);

    setTeeth((prev) => {
      const currentTooth = prev[key] || {
        toothId: key,
        state: 'HEALTHY',
        surfaces: {},
      };

      if (applyMode === 'TOOTH') {
        return {
          ...prev,
          [key]: {
            ...currentTooth,
            state: selectedCondition,
          },
        };
      } else {
        const updatedSurfaces = {
          ...(currentTooth.surfaces || {}),
          [surface]: selectedCondition,
        };

        return {
          ...prev,
          [key]: {
            ...currentTooth,
            surfaces: updatedSurfaces,
          },
        };
      }
    });
  };

  // Clic en la pieza completa
  const handleSelectTooth = (fdiNumber: number) => {
    setSelectedTooth(fdiNumber);
    const key = String(fdiNumber);

    if (applyMode === 'TOOTH') {
      setTeeth((prev) => {
        const currentTooth = prev[key] || {
          toothId: key,
          state: 'HEALTHY',
          surfaces: {},
        };

        return {
          ...prev,
          [key]: {
            ...currentTooth,
            state: selectedCondition,
          },
        };
      });
    }
  };

  // Actualizar notas de la pieza seleccionada
  const handleToothNotesChange = (notes: string) => {
    if (!selectedTooth) return;
    const key = String(selectedTooth);
    setTeeth((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || { toothId: key, state: 'HEALTHY' }),
        notes,
      },
    }));
  };

  // Guardar Odontograma en backend
  const handleSaveOdontogram = async () => {
    if (!selectedPatientId) return;
    setIsSaving(true);
    setMessage(null);
    try {
      await clinicalRecordsApi.updateOdontogram(selectedPatientId, activeMode, teeth);
      setMessage({
        type: 'success',
        text: `Odontograma ${activeMode === 'INITIAL' ? 'Inicial' : 'Evolutivo'} guardado y auditado con éxito.`,
      });
      await loadOdontogram();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.response?.data?.detail || 'Error al guardar el odontograma.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    patients,
    selectedPatientId,
    setSelectedPatientId,
    patientRecord,
    activeNotation,
    setActiveNotation,
    activeDentition,
    setActiveDentition,
    activeMode,
    handleModeChange,
    selectedCondition,
    setSelectedCondition,
    applyMode,
    setApplyMode,
    selectedTooth,
    setSelectedTooth,
    teeth,
    isLoading,
    isSaving,
    message,
    canWrite,
    handleSurfaceClick,
    handleSelectTooth,
    handleToothNotesChange,
    handleSaveOdontogram,
  };
};

