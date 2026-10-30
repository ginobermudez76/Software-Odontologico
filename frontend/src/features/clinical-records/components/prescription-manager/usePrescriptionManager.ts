import { useState, useEffect, useCallback } from 'react';
import {
  Prescription,
  MedicationItem,
  CreatePrescriptionPayload,
} from '../../types/consent-prescription.types';
import { AllergyConflictModalState } from './PrescriptionManager.types';
import { clinicalRecordsApi } from '../../services/clinicalRecordsApi';

export const COMMON_DENTAL_MEDICATIONS: MedicationItem[] = [
  {
    name: 'Amoxicilina 500mg Cápsulas',
    dose: '500 mg',
    frequency: 'Cada 8 horas',
    duration: 'Por 7 días',
    indications: 'Tomar con abundante agua después de las comidas.',
  },
  {
    name: 'Amoxicilina + Ácido Clavulánico 875/125mg',
    dose: '875 / 125 mg',
    frequency: 'Cada 12 horas',
    duration: 'Por 7 días',
    indications: 'Ingerir al inicio de una comida principal.',
  },
  {
    name: 'Ibuprofeno 600mg Tabletas',
    dose: '600 mg',
    frequency: 'Cada 8 horas',
    duration: 'Por 3 a 5 días',
    indications: 'En caso de dolor o inflamación moderada, con alimentos.',
  },
  {
    name: 'Paracetamol 500mg Tabletas',
    dose: '500 mg',
    frequency: 'Cada 6 u 8 horas',
    duration: 'Por 3 días',
    indications: 'Analgésico antipirético de primera línea.',
  },
  {
    name: 'Clindamicina 300mg Cápsulas',
    dose: '300 mg',
    frequency: 'Cada 8 horas',
    duration: 'Por 7 días',
    indications: 'Indicado especialmente en pacientes alérgicos a betalactámicos.',
  },
  {
    name: 'Clorhexidina 0.12% Colutorio',
    dose: '15 ml',
    frequency: 'Cada 12 horas',
    duration: 'Por 10 días',
    indications: 'Enjuagar sin tragar durante 60 segundos después del cepillado.',
  },
];

export const usePrescriptionManager = (
  patientId?: string,
  onPrescriptionCreated?: (prescription: Prescription) => void,
) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);

  const [items, setItems] = useState<MedicationItem[]>([]);
  const [instructions, setInstructions] = useState<string>('');
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);

  const [allergyModal, setAllergyModal] = useState<AllergyConflictModalState>({
    isOpen: false,
    warningDetail: '',
  });

  const loadPrescriptions = useCallback(async () => {
    if (!patientId) return;
    try {
      setIsLoading(true);
      const res = await clinicalRecordsApi.getPrescriptions(patientId);
      setPrescriptions(res.prescriptions || []);
    } catch (err: any) {
      console.warn('Error al cargar recetas:', err);
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadPrescriptions();
  }, [loadPrescriptions]);

  const addMedication = (med: MedicationItem) => {
    setItems((prev) => [...prev, { ...med }]);
  };

  const removeMedication = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: keyof MedicationItem, value: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const openNewPrescriptionModal = () => {
    setItems([]);
    setInstructions('');
    setIsNewModalOpen(true);
  };

  const closeNewPrescriptionModal = () => {
    setIsNewModalOpen(false);
  };

  const submitPrescription = async (bypassAllergyWarning = false) => {
    if (!patientId) {
      setFeedback({ type: 'error', message: 'Paciente no identificado.' });
      return;
    }

    if (items.length === 0) {
      setFeedback({
        type: 'error',
        message: 'Debe incluir al menos un fármaco en la prescripción.',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback(null);
      const payload: CreatePrescriptionPayload = {
        items,
        instructions,
        bypassAllergyWarning,
      };

      const created = await clinicalRecordsApi.createPrescription(patientId, payload);
      setFeedback({
        type: 'success',
        message: `Receta emitida con éxito. Código QR generado: ${created.qrVerificationCode}`,
      });
      setIsNewModalOpen(false);
      setAllergyModal({ isOpen: false, warningDetail: '' });
      if (onPrescriptionCreated) {
        onPrescriptionCreated(created);
      }
      await loadPrescriptions();
    } catch (err: any) {
      const errData = err.response?.data;
      if (errData?.errorCode === 'ERR_ALLERGY_CONFLICT_DETECTED') {
        // Alerta de conflicto de alergia disparada
        setAllergyModal({
          isOpen: true,
          warningDetail: errData.detail || 'Conflicto de alergia detectado con el fármaco prescrito.',
        });
      } else {
        setFeedback({
          type: 'error',
          message: errData?.detail || err.message || 'Error al emitir la receta médica',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    prescriptions,
    isLoading,
    isSubmitting,
    feedback,
    items,
    instructions,
    setInstructions,
    isNewModalOpen,
    allergyModal,
    setAllergyModal,
    addMedication,
    removeMedication,
    updateMedication,
    openNewPrescriptionModal,
    closeNewPrescriptionModal,
    submitPrescription,
    reload: loadPrescriptions,
  };
};

