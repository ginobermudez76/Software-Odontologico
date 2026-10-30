import React from 'react';
import { MaterialIcon } from '../../../../components/icons/MaterialIcon';
import { AppointmentStatusBadgeProps } from './AppointmentStatusBadge.types';
import styles from './AppointmentStatusBadge.module.css';
import { AppointmentStatus } from '../../types/appointment.types';

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; icon: string; className: string }
> = {
  PROGRAMADO: {
    label: 'Programado',
    icon: 'calendar_today',
    className: styles.statusProgramado,
  },
  CONFIRMADO: {
    label: 'Confirmado',
    icon: 'check_circle',
    className: styles.statusConfirmado,
  },
  EN_SALA: {
    label: 'En Sala de Espera',
    icon: 'hourglass_top',
    className: styles.statusEnSala,
  },
  EN_ATENCION: {
    label: 'En Atención',
    icon: 'dentistry',
    className: styles.statusEnAtencion,
  },
  ATENDIDO: {
    label: 'Atendido',
    icon: 'task_alt',
    className: styles.statusAtendido,
  },
  CANCELADO: {
    label: 'Cancelado',
    icon: 'cancel',
    className: styles.statusCancelado,
  },
  NO_SHOW: {
    label: 'No Asistió',
    icon: 'person_off',
    className: styles.statusNoShow,
  },
};

export const AppointmentStatusBadge: React.FC<AppointmentStatusBadgeProps> = ({
  status,
  showIcon = true,
  className = '',
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PROGRAMADO;

  return (
    <span className={`${styles.badge} ${config.className} ${className}`}>
      {showIcon && <MaterialIcon name={config.icon} className={styles.icon} />}
      <span>{config.label}</span>
    </span>
  );
};
