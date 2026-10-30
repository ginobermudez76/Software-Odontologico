import { AppointmentStatus } from '../../types/appointment.types';

export interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
  showIcon?: boolean;
  className?: string;
}

