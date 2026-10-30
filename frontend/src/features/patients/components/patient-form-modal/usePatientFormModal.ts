import { useState, useEffect } from 'react';
import { patientsApi } from '../../services/patientsApi';
import { PatientListItem, PatientFormData } from '../../types/patient.types';

export function usePatientFormModal(
  initialData: PatientListItem | null | undefined,
  onSuccess: () => void,
  onClose: () => void,
) {
  const [formData, setFormData] = useState<PatientFormData>({
    documentType: 'DNI',
    documentNumber: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: 'FEMENINO',
    email: '',
    phone: '',
    address: '',
    emergencyData: {
      contactName: '',
      phone: '',
      relationship: '',
    },
    legalTutorData: {
      tutorName: '',
      documentNumber: '',
      phone: '',
      relationship: '',
    },
    insuranceData: {
      companyName: '',
      policyNumber: '',
      coveragePercentage: 100,
    },
    pathologies: '',
    allergies: '',
    criticalAlerts: [],
  });

  const [isMinor, setIsMinor] = useState(false);
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Inicialización de datos para modo edición
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        documentType: initialData.documentType,
        documentNumber: initialData.documentNumber,
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        birthDate: initialData.birthDate ? initialData.birthDate.split('T')[0] : '',
        gender: initialData.gender,
        email: initialData.email || '',
        phone: initialData.phone || '',
        criticalAlerts: initialData.visibleAlerts || [],
      }));
    }
  }, [initialData]);

  // Cálculo reactivo de edad para validar condición de menor de 18 años
  useEffect(() => {
    if (formData.birthDate) {
      const birth = new Date(formData.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      setCalculatedAge(age);
      setIsMinor(age < 18);
    } else {
      setCalculatedAge(null);
      setIsMinor(false);
    }
  }, [formData.birthDate]);

  const handleInputChange = (field: keyof PatientFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (
    group: 'emergencyData' | 'legalTutorData' | 'insuranceData',
    field: string,
    value: any,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [group]: {
        ...(prev[group] as any),
        [field]: value,
      },
    }));
  };

  const handleAlertToggle = (alertKey: string) => {
    setFormData((prev) => {
      const exists = prev.criticalAlerts.includes(alertKey);
      return {
        ...prev,
        criticalAlerts: exists
          ? prev.criticalAlerts.filter((a) => a !== alertKey)
          : [...prev.criticalAlerts, alertKey],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validación obligatoria de tutor si es menor de 18 años
    if (isMinor) {
      if (!formData.legalTutorData?.tutorName || !formData.legalTutorData?.phone) {
        setErrorMessage(
          `El paciente tiene ${calculatedAge} años (menor de edad). Debe completar obligatoriamente el nombre y teléfono del tutor legal.`,
        );
        return;
      }
    }

    try {
      setIsSubmitting(true);
      if (initialData?.id) {
        await patientsApi.update(initialData.id, formData);
      } else {
        await patientsApi.create(formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      const detail =
        err.response?.data?.detail || 'Ocurrió un error al procesar el registro del paciente.';
      setErrorMessage(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    isMinor,
    calculatedAge,
    isSubmitting,
    errorMessage,
    handleInputChange,
    handleNestedChange,
    handleAlertToggle,
    handleSubmit,
  };
}

