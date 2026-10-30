import { useState, useEffect } from 'react';
import { AppointmentFormData, AppointmentFormModalProps } from './AppointmentFormModal.types';
import { appointmentsApi } from '../../services/appointmentsApi';
import { patientsApi } from '../../../patients/services/patientsApi';
import { PatientListItem } from '../../../patients/types/patient.types';

export const useAppointmentFormModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialAppointment,
  chairs,
  branchId,
}: AppointmentFormModalProps) => {
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientId: '',
    doctorId: '',
    chairId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    reason: '',
  });

  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [doctors] = useState([
    { id: '11111111-1111-1111-1111-111111111101', name: 'Dr. Roberto Vargas (Director Médico)' },
    { id: '11111111-1111-1111-1111-111111111102', name: 'Dra. María Elena Paredes (Odontóloga)' },
  ]);

  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cargar lista de pacientes al abrir modal
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      loadPatients();

      if (initialAppointment) {
        const start = new Date(initialAppointment.startDateTime);
        const end = new Date(initialAppointment.endDateTime);
        const dateStr = start.toISOString().split('T')[0];
        const startStr = start.toTimeString().slice(0, 5);
        const endStr = end.toTimeString().slice(0, 5);

        setFormData({
          patientId: initialAppointment.patientId,
          doctorId: initialAppointment.doctorId,
          chairId: initialAppointment.chairId,
          date: dateStr,
          startTime: startStr,
          endTime: endStr,
          reason: initialAppointment.reason || '',
        });
      } else {
        setFormData({
          patientId: '',
          doctorId: doctors[1]?.id || doctors[0]?.id || '',
          chairId: chairs[0]?.id || '',
          date: new Date().toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '10:00',
          reason: '',
        });
      }
    }
  }, [isOpen, initialAppointment, chairs]);

  const loadPatients = async () => {
    setIsLoadingPatients(true);
    try {
      const res = await patientsApi.findAll('', 1, 100);
      setPatients(res.data);
    } catch {
      // Mock fallback si backend no tiene pacientes
    } finally {
      setIsLoadingPatients(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.patientId || !formData.doctorId || !formData.chairId) {
      setErrorMessage('Por favor seleccione paciente, odontólogo y sillón dental.');
      return;
    }

    const startDateTime = new Date(`${formData.date}T${formData.startTime}:00`).toISOString();
    const endDateTime = new Date(`${formData.date}T${formData.endTime}:00`).toISOString();

    if (new Date(startDateTime) >= new Date(endDateTime)) {
      setErrorMessage('La hora de inicio debe ser anterior a la hora de finalización.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialAppointment) {
        await appointmentsApi.updateAppointment(initialAppointment.id, {
          chairId: formData.chairId,
          doctorId: formData.doctorId,
          startDateTime,
          endDateTime,
          reason: formData.reason,
        });
      } else {
        await appointmentsApi.createAppointment({
          branchId,
          patientId: formData.patientId,
          doctorId: formData.doctorId,
          chairId: formData.chairId,
          startDateTime,
          endDateTime,
          reason: formData.reason,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const rfcProblem = err?.response?.data;
      if (rfcProblem?.detail) {
        setErrorMessage(rfcProblem.detail);
      } else {
        setErrorMessage('Ocurrió un error al procesar la cita. Revise la disponibilidad e intente nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    patients,
    doctors,
    isLoadingPatients,
    isSubmitting,
    errorMessage,
    handleChange,
    handleSubmit,
  };
};
