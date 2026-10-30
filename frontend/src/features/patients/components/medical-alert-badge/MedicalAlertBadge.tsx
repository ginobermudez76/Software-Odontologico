import React from 'react';
import styles from './MedicalAlertBadge.module.css';
import { MedicalAlertBadgeProps } from './MedicalAlertBadge.types';
import { MaterialIcon } from '../../../../components/icons/MaterialIcon';

export const MedicalAlertBadge: React.FC<MedicalAlertBadgeProps> = ({
  alerts = [],
  className = '',
  size = 'sm',
}) => {
  if (!alerts || alerts.length === 0) return null;

  const formatAlertLabel = (alertKey: string) => {
    switch (alertKey) {
      case 'ALERGIA_PENICILINA':
        return 'Alérgico a Penicilina';
      case 'ANTICOAGULADO':
        return 'Paciente Anticoagulado';
      case 'HIPERTENSION':
        return 'Hipertensión Arterial';
      case 'DIABETES':
        return 'Diabetes Mellitus';
      case 'CARDIOPATIA':
        return 'Cardiopatía de Riesgo';
      case 'INMUNOSUPRIMIDO':
        return 'Inmunosupresión';
      default:
        return alertKey.replace(/_/g, ' ');
    }
  };

  return (
    <div className={`${styles.badgeContainer} ${className}`}>
      {alerts.map((alert, idx) => (
        <span
          key={idx}
          className={`${styles.badge} ${size === 'md' ? styles.badgeMd : ''}`}
          title="Alerta médica crítica registrada en el expediente"
        >
          <MaterialIcon name="warning" size={size === 'md' ? 16 : 14} className={styles.icon} />
          {formatAlertLabel(alert)}
        </span>
      ))}
    </div>
  );
};

