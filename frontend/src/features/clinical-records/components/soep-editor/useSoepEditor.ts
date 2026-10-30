import { useState, useEffect, useCallback } from 'react';
import {
  EvolutionNote,
  CreateEvolutionNotePayload,
  UpdateEvolutionNotePayload,
} from '../../types/evolution-note.types';
import { SoepFormData, AdendaModalState } from './SoepEditor.types';
import { clinicalRecordsApi } from '../../services/clinicalRecordsApi';

const INITIAL_FORM: SoepFormData = {
  subjective: '',
  objective: '',
  assessment: '',
  plan: '',
};

export const COMMON_CIE10_CODES = [
  { code: 'K02.1', label: 'Caries de la dentina' },
  { code: 'K04.0', label: 'Pulpitis reversible / irreversible' },
  { code: 'K04.7', label: 'Absceso periapical sin fístula' },
  { code: 'K05.1', label: 'Gingivitis crónica' },
  { code: 'K05.3', label: 'Periodontitis crónica' },
  { code: 'K08.1', label: 'Pérdida de dientes por traumatismo o caries' },
];

export const useSoepEditor = (
  patientId?: string,
  onNoteCreated?: (note: EvolutionNote) => void,
) => {
  const [notes, setNotes] = useState<EvolutionNote[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SoepFormData>(INITIAL_FORM);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [adendaModal, setAdendaModal] = useState<AdendaModalState>({
    isOpen: false,
    targetNoteId: null,
    targetNoteDate: null,
    clarificationText: '',
    reason: 'Aclaración de diagnóstico o plan',
  });

  const loadNotes = useCallback(async () => {
    if (!patientId) return;
    try {
      setIsLoading(true);
      const res = await clinicalRecordsApi.getEvolutionNotes(patientId);
      setNotes(res.notes || []);
    } catch (err: any) {
      console.warn('Error al cargar notas de evolución:', err);
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleFieldChange = (field: keyof SoepFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAppendCie10 = (code: string, label: string) => {
    const entry = `${code} ${label}`;
    setFormData((prev) => ({
      ...prev,
      assessment: prev.assessment ? `${prev.assessment}\n${entry}` : entry,
    }));
  };

  const startEditNote = (note: EvolutionNote) => {
    if (!note.isEditable) {
      setFeedback({
        type: 'error',
        message: 'No es posible editar una nota inmutable transcurridas 24 horas. Use una Adenda.',
      });
      return;
    }
    setEditingNoteId(note.id);
    setFormData({
      subjective: note.subjective,
      objective: note.objective,
      assessment: note.assessment,
      plan: note.plan,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
    setFormData(INITIAL_FORM);
  };

  const submitNote = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!patientId) {
      setFeedback({ type: 'error', message: 'Paciente no identificado.' });
      return;
    }

    if (
      !formData.subjective.trim() ||
      !formData.objective.trim() ||
      !formData.assessment.trim() ||
      !formData.plan.trim()
    ) {
      setFeedback({
        type: 'error',
        message: 'Todos los campos del formato SOEP son obligatorios.',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback(null);

      if (editingNoteId) {
        // Actualización dentro del período de 24 horas
        const payload: UpdateEvolutionNotePayload = {
          subjective: formData.subjective,
          objective: formData.objective,
          assessment: formData.assessment,
          plan: formData.plan,
        };
        const updated = await clinicalRecordsApi.updateEvolutionNote(editingNoteId, payload);
        setFeedback({
          type: 'success',
          message: 'Nota de evolución clínica actualizada exitosamente.',
        });
        setEditingNoteId(null);
        setFormData(INITIAL_FORM);
        await loadNotes();
      } else {
        // Creación de nueva nota SOEP
        const payload: CreateEvolutionNotePayload = {
          subjective: formData.subjective,
          objective: formData.objective,
          assessment: formData.assessment,
          plan: formData.plan,
        };
        const created = await clinicalRecordsApi.createEvolutionNote(patientId, payload);
        setFeedback({
          type: 'success',
          message: 'Nota de evolución SOEP registrada. Dispone de 24 horas para correcciones.',
        });
        setFormData(INITIAL_FORM);
        if (onNoteCreated) {
          onNoteCreated(created);
        }
        await loadNotes();
      }
    } catch (err: any) {
      const detail =
        err.response?.data?.detail ||
        err.message ||
        'Error al procesar la nota de evolución';
      setFeedback({ type: 'error', message: detail });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAdendaModal = (noteId: string, noteDate: string) => {
    setAdendaModal({
      isOpen: true,
      targetNoteId: noteId,
      targetNoteDate: noteDate,
      clarificationText: '',
      reason: 'Aclaración de hallazgo o diagnóstico',
    });
  };

  const closeAdendaModal = () => {
    setAdendaModal((prev) => ({ ...prev, isOpen: false, targetNoteId: null }));
  };

  const submitAdenda = async () => {
    if (!adendaModal.targetNoteId) return;
    if (!adendaModal.clarificationText.trim()) {
      setFeedback({
        type: 'error',
        message: 'El texto aclaratorio de la adenda no puede estar vacío.',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback(null);
      await clinicalRecordsApi.createAdenda(adendaModal.targetNoteId, {
        clarificationText: adendaModal.clarificationText,
        reason: adendaModal.reason,
      });
      setFeedback({
        type: 'success',
        message: 'Nota de Adenda / Aclaratoria registrada e incorporada legalmente.',
      });
      closeAdendaModal();
      await loadNotes();
    } catch (err: any) {
      const detail =
        err.response?.data?.detail ||
        err.message ||
        'Error al registrar la adenda médica';
      setFeedback({ type: 'error', message: detail });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    notes,
    isLoading,
    isSubmitting,
    editingNoteId,
    formData,
    feedback,
    adendaModal,
    setAdendaModal,
    handleFieldChange,
    handleAppendCie10,
    startEditNote,
    cancelEdit,
    submitNote,
    openAdendaModal,
    closeAdendaModal,
    submitAdenda,
    reload: loadNotes,
  };
};

