import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Odontogram2D } from './Odontogram2D';

// Mock permissions
const mockUseCurrentOptionPermissions = vi.fn();
vi.mock('../../../../hooks/useCurrentOptionPermissions', () => ({
  useCurrentOptionPermissions: () => mockUseCurrentOptionPermissions(),
}));

// Mock APIs
vi.mock('../../services/clinicalRecordsApi', () => ({
  clinicalRecordsApi: {
    getOdontogram: vi.fn().mockResolvedValue({
      recordId: 'cr-1',
      recordNumber: 'EXP-2026-0001',
      patient: { id: 'p1', firstName: 'Juan', lastName: 'Pérez' },
      initialOdontogram: {},
      evolutionaryOdontogram: {},
    }),
    updateOdontogram: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('../../../patients/services/patientsApi', () => ({
  patientsApi: {
    findAll: vi.fn().mockResolvedValue({
      data: [{ id: 'p1', firstName: 'Juan', lastName: 'Pérez', documentNumber: '1723456789' }],
      meta: { total: 1 },
    }),
  },
}));

describe('Odontogram2D Component', () => {
  it('debe mostrar el botón de Guardar cuando canWrite es true', () => {
    mockUseCurrentOptionPermissions.mockReturnValue({
      canRead: true,
      canWrite: true,
      canDelete: true,
    });

    render(<Odontogram2D initialPatientId="p1" />);

    expect(screen.getByText('Odontograma Anatómico 2D')).toBeDefined();
    expect(screen.getByTestId('btn-save-odontogram')).toBeDefined();
  });

  it('debe OCULTAR el botón de Guardar del DOM cuando canWrite es false', () => {
    mockUseCurrentOptionPermissions.mockReturnValue({
      canRead: true,
      canWrite: false,
      canDelete: false,
    });

    render(<Odontogram2D initialPatientId="p1" />);

    expect(screen.queryByTestId('btn-save-odontogram')).toBeNull();
  });

  it('debe permitir cambiar de notación FDI a Universal al hacer clic', async () => {
    mockUseCurrentOptionPermissions.mockReturnValue({
      canRead: true,
      canWrite: true,
      canDelete: true,
    });

    render(<Odontogram2D initialPatientId="p1" />);

    // Esperar a que termine de cargar el odontograma del paciente
    await screen.findByText('Maxilar Superior');

    const btnUniversal = screen.getByTestId('btn-notation-universal');
    fireEvent.click(btnUniversal);

    // En Universal, el diente 18 se rotula como '1'
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
  });
});
