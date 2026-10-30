import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { DoctorSettlementManager } from './DoctorSettlementManager';
import { treatmentPlansCommissionsApi } from '../../services/treatmentPlansCommissionsApi';
import { SettlementPreview } from '../../types/treatment-plans-commissions.types';

vi.mock('../../services/treatmentPlansCommissionsApi');

const mockPreview: SettlementPreview = {
  doctorId: '00000000-0000-0000-0000-000000000002',
  doctorName: 'Dr. Carlos Mendoza',
  periodStart: '2026-10-01',
  periodEnd: '2026-10-31',
  totalProceduresCount: 2,
  grossAmount: 350.0,
  totalLabCosts: 75.0, // Regla RN-07: Lab deducido
  netCommissionableBase: 275.0, // 350 - 75
  netCommissionPaid: 110.0, // 40% de 275
  items: [
    {
      procedureId: 'proc-1',
      procedureName: 'Profilaxis Dental',
      procedureCode: 'PRO-001',
      procedurePrice: 70.0,
      labCost: 0,
      commissionableBase: 70.0,
      commissionRate: 40.0,
      doctorEarning: 28.0,
    },
    {
      procedureId: 'proc-2',
      procedureName: 'Corona de Porcelana',
      procedureCode: 'PROT-001',
      procedurePrice: 280.0,
      labCost: 75.0,
      commissionableBase: 205.0,
      commissionRate: 40.0,
      doctorEarning: 82.0,
    },
  ],
};

describe('DoctorSettlementManager Component (Sprint 10 - Regla RN-07)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(treatmentPlansCommissionsApi, 'previewSettlement').mockResolvedValue(mockPreview);
    vi.spyOn(treatmentPlansCommissionsApi, 'getSettlements').mockResolvedValue([]);
    vi.spyOn(treatmentPlansCommissionsApi, 'generateSettlement').mockResolvedValue({
      id: 'settlement-1',
      settlementCode: 'LIQ-2026-8801',
      doctorId: '00000000-0000-0000-0000-000000000002',
      periodStart: '2026-10-01',
      periodEnd: '2026-10-31',
      totalProceduresCount: 2,
      grossAmount: 350.0,
      totalLabCosts: 75.0,
      netCommissionableBase: 275.0,
      netCommissionPaid: 110.0,
      status: 'PENDIENTE',
      createdAt: new Date().toISOString(),
      items: [],
    });
  });

  it('renders settlement dashboard with lab deduction notice (Regla RN-07)', async () => {
    render(<DoctorSettlementManager canWrite={true} />);

    expect(
      screen.getByText('Liquidación de Honorarios y Comisiones Médicas'),
    ).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText(/Regla Inviolable RN-07/i)).toBeDefined();
      expect(screen.getAllByText(/75\.00/).length).toBeGreaterThan(0); // Costo laboratorio deducido
      expect(screen.getByText(/\$275\.00/)).toBeDefined(); // Base comisionable neta
      expect(screen.getByText(/\$110\.00/)).toBeDefined(); // Honorario liquidado
    });
  });

  it('hides "Generar Liquidación Formal" button when canWrite is false (RBAC check)', async () => {
    render(<DoctorSettlementManager canWrite={false} />);

    await waitFor(() => {
      expect(screen.getByText(/Regla Inviolable RN-07/i)).toBeDefined();
    });

    expect(screen.queryByText('Generar Liquidación Formal')).toBeNull();
  });

  it('generates formal settlement when clicking button', async () => {
    render(<DoctorSettlementManager canWrite={true} />);

    await waitFor(() => {
      expect(screen.getByText('Generar Liquidación Formal')).toBeDefined();
    });

    const generateBtn = screen.getByText('Generar Liquidación Formal');
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(treatmentPlansCommissionsApi.generateSettlement).toHaveBeenCalled();
    });
  });
});
