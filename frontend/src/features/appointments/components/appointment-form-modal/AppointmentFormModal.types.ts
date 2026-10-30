import { Appointment, DentalChair } from '../../types/appointment.types';

export interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialAppointment?: Appointment | null;
  chairs: DentalChair[];
  branchId: string;
}

export interface AppointmentFormData {
  patientId: string;
  doctorId: string;
  chairId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}
