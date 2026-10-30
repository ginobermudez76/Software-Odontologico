import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MedicalAlertBadge } from './MedicalAlertBadge';

describe('MedicalAlertBadge Component', () => {
  it('no debe renderizar nada si la lista de alertas está vacía', () => {
    const { container } = render(<MedicalAlertBadge alerts={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('debe renderizar los badges médicos en color de advertencia con sus etiquetas legibles', () => {
    render(<MedicalAlertBadge alerts={['ALERGIA_PENICILINA', 'ANTICOAGULADO']} />);

    expect(screen.getByText('Alérgico a Penicilina')).toBeDefined();
    expect(screen.getByText('Paciente Anticoagulado')).toBeDefined();
  });
});

