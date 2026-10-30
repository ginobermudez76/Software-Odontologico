import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppointmentsCalendar } from './AppointmentsCalendar';

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
        id: 'user-1',
        firstName: 'Test',
        lastName: 'Admin',
        branchId: '00000000-0000-0000-0000-000000000001',
      },
    }),
  ),
}));

// Mock API
vi.mock('../../services/appointmentsApi', () => ({
  appointmentsApi: {
    getAppointments: vi.fn().mockResolvedValue({ data: [], meta: { total: 0 } }),
    getChairsLiveStatus: vi.fn().mockResolvedValue([
      { id: 'c1', name: 'Sillón 1', code: 'S1', isActive: true, occupancyState: 'DISPONIBLE' },
    ]),
    createAppointment: vi.fn(),
    updateAppointment: vi.fn(),
    changeStatus: vi.fn(),
    deleteAppointment: vi.fn(),
  },
}));

describe('AppointmentsCalendar Component', () => {
  it('debe mostrar el botón [Nueva Cita] cuando canWrite es true', () => {
    mockUseCurrentOptionPermissions.mockReturnValue({
      canRead: true,
      canWrite: true,
      canDelete: true,
    });

    render(<AppointmentsCalendar initialDate="2026-11-01" />);

    expect(screen.getByText('Agenda Clínica Multirrecinto')).toBeDefined();
    expect(screen.getByTestId('btn-new-appointment')).toBeDefined();
  });

  it('debe OCULTAR del DOM el botón [Nueva Cita] cuando canWrite es false', () => {
    mockUseCurrentOptionPermissions.mockReturnValue({
      canRead: true,
      canWrite: false,
      canDelete: false,
    });

    render(<AppointmentsCalendar initialDate="2026-11-01" />);

    expect(screen.queryByTestId('btn-new-appointment')).toBeNull();
  });
});
