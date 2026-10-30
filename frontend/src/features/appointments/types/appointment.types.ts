export type AppointmentStatus =
  | 'PROGRAMADO'
  | 'CONFIRMADO'
  | 'EN_SALA'
  | 'EN_ATENCION'
  | 'ATENDIDO'
  | 'CANCELADO'
  | 'NO_SHOW';

export type CalendarViewMode = 'day' | 'week' | 'chair';

export interface DentalChair {
  id: string;
  branchId: string;
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  occupancyState?: 'DISPONIBLE' | 'OCUPADO' | 'RESERVADO' | 'MANTENIMIENTO';
}

export interface AppointmentPatient {
  id: string;
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  phone?: string | null;
}

export interface AppointmentDoctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Appointment {
  id: string;
  branchId: string;
  patientId: string;
  doctorId: string;
  chairId: string;
  startDateTime: string;
  endDateTime: string;
  status: AppointmentStatus;
  reason?: string | null;
  waitingMinutes: number;
  reminderSent48h: boolean;
  reminderSent24h: boolean;
  createdAt: string;
  updatedAt: string;
  patient: AppointmentPatient;
  doctor: AppointmentDoctor;
  chair: DentalChair;
}

export interface CreateAppointmentPayload {
  branchId: string;
  patientId: string;
  doctorId: string;
  chairId: string;
  startDateTime: string;
  endDateTime: string;
  reason?: string;
}

export interface UpdateAppointmentPayload {
  chairId?: string;
  doctorId?: string;
  startDateTime?: string;
  endDateTime?: string;
  status?: AppointmentStatus;
  reason?: string;
  waitingMinutes?: number;
}

export interface ChangeStatusPayload {
  status: AppointmentStatus;
  waitingMinutes?: number;
}
