import React from 'react';
import styles from './MaterialIcon.module.css';
import { MaterialIconProps } from './MaterialIcon.types';

export const MaterialIcon: React.FC<MaterialIconProps> = ({
  name,
  size = 24,
  className = '',
  color,
}) => {
  return (
    <span
      className={`material-symbols-outlined ${styles.icon} ${className}`}
      style={{
        fontSize: typeof size === 'number' ? `${size}px` : size,
        color: color,
      }}
    >
      {name}
    </span>
  );
};

