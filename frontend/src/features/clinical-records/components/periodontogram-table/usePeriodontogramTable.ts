import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  PeriodontalTooth,
  PeriodontogramSummary,
  MAXILLARY_TEETH,
  MANDIBULAR_TEETH,
  createDefaultTooth,
} from '../../types/periodontogram.types';
import {
  PeriodontalArch,
  PeriodontalAspect,
} from './PeriodontogramTable.types';
import { clinicalRecordsApi } from '../../services/clinicalRecordsApi';

export const usePeriodontogramTable = (
  patientId?: string,
  onSaved?: () => void,
) => {
  const [activeArch, setActiveArch] = useState<PeriodontalArch>('MAXILLARY');
  const [activeAspect, setActiveAspect] = useState<PeriodontalAspect>('VESTIBULAR');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Inicializar estado con dentición permanente estándar (32 dientes)
  const [teeth, setTeeth] = useState<Record<string, PeriodontalTooth>>(() => {
    const initial: Record<string, PeriodontalTooth> = {};
    [...MAXILLARY_TEETH, ...MANDIBULAR_TEETH].forEach((num) => {
      initial[num.toString()] = createDefaultTooth(num);
    });
    return initial;
  });

  const loadPeriodontogram = useCallback(async () => {
    if (!patientId) return;
    try {
      setIsLoading(true);
      const data = await clinicalRecordsApi.getPeriodontogram(patientId);
      if (data && data.periodontogram && data.periodontogram.teeth) {
        setTeeth((prev) => {
          const merged = { ...prev };
          for (const [key, val] of Object.entries(data.periodontogram.teeth)) {
            merged[key] = {
              ...createDefaultTooth(Number(key)),
              ...val,
            };
          }
          return merged;
        });
        if (data.periodontogram.notes) {
          setNotes(data.periodontogram.notes);
        }
      }
    } catch (err: any) {
      console.warn('No se pudo cargar el periodontograma previo o no existe aún.', err);
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadPeriodontogram();
  }, [loadPeriodontogram]);

  // Actualizar un sitio específico (PS, MG, Sangrado, Supuración, Placa) con recálculo de NIC = PS + MG
  const updateSiteValue = useCallback(
    (
      toothNumber: number,
      aspect: 'vestibular' | 'lingual',
      site: 'distal' | 'middle' | 'mesial',
      field: 'probingDepth' | 'gingivalMargin' | 'bleeding' | 'suppuration' | 'plaque',
      value: any,
    ) => {
      setTeeth((prev) => {
        const key = toothNumber.toString();
        const tooth = prev[key] || createDefaultTooth(toothNumber);
        const aspectData = { ...tooth[aspect] };
        const currentSite = { ...aspectData[site] };

        if (field === 'probingDepth') {
          const numVal = Math.max(0, Math.min(15, parseInt(value, 10) || 0));
          currentSite.probingDepth = numVal;
          currentSite.clinicalAttachmentLevel = numVal + (currentSite.gingivalMargin || 0);
        } else if (field === 'gingivalMargin') {
          const numVal = Math.max(-10, Math.min(10, parseInt(value, 10) || 0));
          currentSite.gingivalMargin = numVal;
          currentSite.clinicalAttachmentLevel = (currentSite.probingDepth || 0) + numVal;
        } else {
          currentSite[field] = Boolean(value);
        }

        aspectData[site] = currentSite;

        return {
          ...prev,
          [key]: {
            ...tooth,
            [aspect]: aspectData,
          },
        };
      });
    },
    [],
  );

  const toggleToothMissing = useCallback((toothNumber: number) => {
    setTeeth((prev) => {
      const key = toothNumber.toString();
      const tooth = prev[key] || createDefaultTooth(toothNumber);
      return {
        ...prev,
        [key]: {
          ...tooth,
          isMissing: !tooth.isMissing,
        },
      };
    });
  }, []);

  const toggleToothImplant = useCallback((toothNumber: number) => {
    setTeeth((prev) => {
      const key = toothNumber.toString();
      const tooth = prev[key] || createDefaultTooth(toothNumber);
      return {
        ...prev,
        [key]: {
          ...tooth,
          isImplant: !tooth.isImplant,
        },
      };
    });
  }, []);

  const setToothMobility = useCallback((toothNumber: number, mobility: number) => {
    setTeeth((prev) => {
      const key = toothNumber.toString();
      const tooth = prev[key] || createDefaultTooth(toothNumber);
      return {
        ...prev,
        [key]: {
          ...tooth,
          mobility: Math.max(0, Math.min(3, mobility)),
        },
      };
    });
  }, []);

  const setToothFurcation = useCallback((toothNumber: number, furcation: number) => {
    setTeeth((prev) => {
      const key = toothNumber.toString();
      const tooth = prev[key] || createDefaultTooth(toothNumber);
      return {
        ...prev,
        [key]: {
          ...tooth,
          furcation: Math.max(0, Math.min(4, furcation)),
        },
      };
    });
  }, []);

  // Cálculo en tiempo real de métricas periodontales globales
  const summary: PeriodontogramSummary = useMemo(() => {
    let totalSites = 0;
    let plaqueSites = 0;
    let bleedingSites = 0;
    let pocketsCount = 0;
    let deepPocketsCount = 0;
    let evaluatedTeethCount = 0;

    for (const tooth of Object.values(teeth)) {
      if (tooth.isMissing) continue;
      evaluatedTeethCount++;

      const sitesList = [
        tooth.vestibular.distal,
        tooth.vestibular.middle,
        tooth.vestibular.mesial,
        tooth.lingual.distal,
        tooth.lingual.middle,
        tooth.lingual.mesial,
      ];

      for (const site of sitesList) {
        totalSites++;
        const ps = Number(site.probingDepth) || 0;
        if (site.plaque) plaqueSites++;
        if (site.bleeding) bleedingSites++;
        if (ps >= 6) {
          deepPocketsCount++;
          pocketsCount++;
        } else if (ps >= 4) {
          pocketsCount++;
        }
      }
    }

    const olearyPlaqueIndex =
      totalSites > 0 ? Number(((plaqueSites / totalSites) * 100).toFixed(1)) : 0;
    const bleedingOnProbingIndex =
      totalSites > 0 ? Number(((bleedingSites / totalSites) * 100).toFixed(1)) : 0;

    return {
      olearyPlaqueIndex,
      bleedingOnProbingIndex,
      periodontalPocketsCount: pocketsCount,
      deepPocketsCount,
      evaluatedTeethCount,
    };
  }, [teeth]);

  const savePeriodontogram = useCallback(async () => {
    if (!patientId) {
      setFeedback({
        type: 'error',
        message: 'No se puede guardar: paciente no especificado.',
      });
      return;
    }

    try {
      setIsSaving(true);
      setFeedback(null);
      await clinicalRecordsApi.updatePeriodontogram(patientId, teeth, notes);
      setFeedback({
        type: 'success',
        message: 'Periodontograma y cálculo de NIC guardados exitosamente.',
      });
      if (onSaved) {
        onSaved();
      }
    } catch (err: any) {
      const detail =
        err.response?.data?.detail ||
        err.message ||
        'Error desconocido al guardar el periodontograma';
      setFeedback({
        type: 'error',
        message: `Error al guardar: ${detail}`,
      });
    } finally {
      setIsSaving(false);
    }
  }, [patientId, teeth, notes, onSaved]);

  const activeTeethList = useMemo(() => {
    return activeArch === 'MAXILLARY' ? MAXILLARY_TEETH : MANDIBULAR_TEETH;
  }, [activeArch]);

  return {
    teeth,
    activeArch,
    setActiveArch,
    activeAspect,
    setActiveAspect,
    activeTeethList,
    notes,
    setNotes,
    isLoading,
    isSaving,
    feedback,
    summary,
    updateSiteValue,
    toggleToothMissing,
    toggleToothImplant,
    setToothMobility,
    setToothFurcation,
    savePeriodontogram,
    reload: loadPeriodontogram,
  };
};
