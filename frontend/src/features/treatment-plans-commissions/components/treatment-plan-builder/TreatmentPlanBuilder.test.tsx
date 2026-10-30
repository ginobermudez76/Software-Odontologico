import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { TreatmentPlanBuilder } from './TreatmentPlanBuilder';
import { treatmentPlansCommissionsApi } from '../../services/treatmentPlansCommissionsApi';
import { TreatmentPlan } from '../../types/treatment-plans-commissions.types';

vi.mock('../../services/treatmentPlansCommissionsApi');

const mockPlans: TreatmentPlan[] = [
  {
    id: 'plan-1',
    patientId: 'pat-1',
    doctorId: 'doc-1',
    planCode: 'PRE-2026-9901',
    title: 'Plan Integral de Prueba',
    description: 'Descripción de prueba',
    status: 'EMITIDO',
    isAlternative: false,
    totalAmount: 180.0,
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    daysRemaining: 25,
    isExpired: false,
    phases: [
      {
        id: 'phase-1',
        planId: 'plan-1',
        phaseNumber: 1,
        name: 'Fase 1: Higiene',
        status: 'PENDIENTE',
        orderIndex: 1,
        subtotal: 180.0,
        items: [
          {
            id: 'item-1',
            phaseId: 'phase-1',
            procedureId: 'proc-1',
            procedure: {
              id: 'proc-1',
              code: 'PRO-001',
              name: 'Profilaxis Dental',
              category: 'Preventiva',
            },
            quantity: 1,
            unitPrice: 180.0,
            discountPercent: 0,
            labCost: 0,
            finalPrice: 180.0,
            status: 'PENDIENTE',
            orderIndex: 1,
          },
        ],
      },
    ],
    createdAt: new Date().toISOString(),
  },
];

describe('TreatmentPlanBuilder Component (Sprint 10)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(treatmentPlansCommissionsApi, 'getPatientTreatmentPlans').mockResolvedValue(mockPlans);
    vi.spyOn(treatmentPlansCommissionsApi, 'updatePlanStatus').mockResolvedValue({
      ...mockPlans[0],
      status: 'APROBADO',
    });
  });

  it('renders title and treatment plan card with 30-day validity alert (Regla RN-04)', async () => {
    render(<TreatmentPlanBuilder canWrite={true} />);

    expect(screen.getByText('Presupuestos Odontológicos Multinivel')).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('PRE-2026-9901')).toBeDefined();
      expect(screen.getByText('Plan Integral de Prueba')).toBeDefined();
      expect(screen.getByText(/Regla Inviolable RN-04/i)).toBeDefined();
    });
  });

  it('hides "Nuevo Presupuesto" and "Aprobar Presupuesto" buttons when canWrite is false (RBAC check)', async () => {
    render(<TreatmentPlanBuilder canWrite={false} />);

    await waitFor(() => {
      expect(screen.getByText('PRE-2026-9901')).toBeDefined();
    });

    expect(screen.queryByText('Nuevo Presupuesto')).toBeNull();
    expect(screen.queryByText('Aprobar Presupuesto')).toBeNull();
  });

  it('allows approving a plan when canWrite is true', async () => {
    render(<TreatmentPlanBuilder canWrite={true} />);

    await waitFor(() => {
      expect(screen.getByText('Aprobar Presupuesto')).toBeDefined();
    });

    const approveBtn = screen.getByText('Aprobar Presupuesto');
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(treatmentPlansCommissionsApi.updatePlanStatus).toHaveBeenCalledWith(
        'plan-1',
        'APROBADO',
      );
    });
  });
});
