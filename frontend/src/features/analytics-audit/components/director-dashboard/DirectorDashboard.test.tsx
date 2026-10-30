import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { DirectorDashboard } from './DirectorDashboard';
import { analyticsApi } from '../../services/analyticsApi';
import { DirectorKpisResponse } from '../../types/analytics-audit.types';

vi.mock('../../services/analyticsApi');

const mockKpis: DirectorKpisResponse = {
  period: { start: '2026-10-01', end: '2026-10-31' },
  appointments: {
    total: 100,
    attended: 80,
    noShow: 10,
    cancelled: 10,
    noShowRate: 10.0,
    chairOccupancyRate: 85.0,
  },
  financials: {
    totalRevenue: 25000.0,
    invoiceCount: 150,
    averageTicket: 166.67,
    totalLabCostsDeducted: 3500.0,
    totalCommissionsPaid: 8000.0,
    grossMargin: 13500.0,
  },
  topProcedures: [
    {
      code: 'PROT-001',
      name: 'Corona Cerámica sobre Metal',
      count: 20,
      totalBilled: 5600.0,
    },
  ],
};

describe('DirectorDashboard Component (Sprint 11 - BI)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(analyticsApi, 'getDirectorKpis').mockResolvedValue(mockKpis);
  });

  it('renders director KPI cards correctly', async () => {
    render(<DirectorDashboard />);

    expect(screen.getByText('Tablero de Control Directivo (BI)')).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('Tasa de Ausentismo (No-Show)')).toBeDefined();
      expect(screen.getByText('10%')).toBeDefined();
      expect(screen.getByText('85%')).toBeDefined(); // Chair occupancy
      expect(screen.getByText(/\$166\.67/)).toBeDefined(); // Average ticket
      expect(screen.getByText('Corona Cerámica sobre Metal')).toBeDefined();
    });
  });
});
