import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PosCheckout } from './PosCheckout';

// Mock hook permissions
const mockUseCurrentOptionPermissions = vi.fn();
vi.mock('../../../../hooks/useCurrentOptionPermissions', () => ({
  useCurrentOptionPermissions: () => mockUseCurrentOptionPermissions(),
}));

// Mock auth store
vi.mock('../../../../stores/authStore', () => ({
  useAuthStore: vi.fn((selector) =>
    selector({
      user: {
        id: 'user-cajera',
        firstName: 'Elena',
        lastName: 'Ramos',
        branchId: '00000000-0000-0000-0000-000000000001',
      },
    }),
  ),
}));

// Mock billing & patients API
vi.mock('../../services/billingApi', () => ({
  billingApi: {
    getCurrentShift: vi.fn().mockResolvedValue({
      id: 'shift-1',
      openingBalance: 100,
      status: 'ABIERTA',
    }),
    createInvoice: vi.fn(),
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

describe('PosCheckout Component', () => {
  it('debe mostrar el botón de cobro cuando canWrite es true', () => {
    mockUseCurrentOptionPermissions.mockReturnValue({
      canRead: true,
      canWrite: true,
      canDelete: false,
    });

    render(<PosCheckout />);

    expect(screen.getByText('Punto de Venta Clínico (POS)')).toBeDefined();
    expect(screen.getByTestId('btn-emit-invoice')).toBeDefined();
  });

  it('debe OCULTAR el botón de cobro del DOM cuando canWrite es false', () => {
    mockUseCurrentOptionPermissions.mockReturnValue({
      canRead: true,
      canWrite: false,
      canDelete: false,
    });

    render(<PosCheckout />);

    expect(screen.queryByTestId('btn-emit-invoice')).toBeNull();
  });
});

