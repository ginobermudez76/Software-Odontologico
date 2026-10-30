import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TreatmentPlansService } from './treatment-plans.service';
import { CommissionsService } from './commissions.service';
import { BadRequestException } from '@nestjs/common';

describe('TreatmentPlansService (Sprint 10 - Regla RN-04)', () => {
  let service: TreatmentPlansService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      patient: {
        findUnique: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
      treatmentPlan: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      treatmentPlanItem: {
        findUnique: vi.fn(),
        updateMany: vi.fn(),
        update: vi.fn(),
      },
      appointment: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(prismaMock)),
    };

    service = new TreatmentPlansService(prismaMock);
  });

  it('debe crear un presupuesto calculando exactamente 30 días de vigencia (Regla RN-04)', async () => {
    prismaMock.patient.findUnique.mockResolvedValue({ id: 'pat-1', isDeleted: false });
    prismaMock.user.findUnique.mockResolvedValue({ id: 'doc-1', isDeleted: false });
    prismaMock.treatmentPlan.create.mockImplementation(({ data }: any) => ({
      id: 'plan-1',
      ...data,
    }));

    const result = await service.createPlan({
      patientId: 'pat-1',
      doctorId: 'doc-1',
      title: 'Plan Integral de Prueba',
      phases: [
        {
          phaseNumber: 1,
          name: 'Fase 1: Higiene',
          items: [
            {
              procedureId: 'proc-1',
              quantity: 1,
              unitPrice: 100,
              discountPercent: 10,
              labCost: 0,
            },
          ],
        },
      ],
    });

    expect(result).toBeDefined();
    expect(result.planCode).toMatch(/^PRE-\d{4}-\d{4}$/);
    expect(result.status).toBe('EMITIDO');
    expect(result.totalAmount).toBe(90);

    // Verificar que expiresAt está a 30 días (+/- 1 minuto)
    const diffDays = Math.round(
      (result.expiresAt.getTime() - result.issuedAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    expect(diffDays).toBe(30);
  });

  it('debe rechazar la aprobación con ERR_TREATMENT_PLAN_EXPIRED si el presupuesto tiene más de 30 días (Regla RN-04)', async () => {
    const expiredDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000); // Expiró hace 5 días

    prismaMock.treatmentPlan.findUnique.mockResolvedValue({
      id: 'plan-1',
      status: 'EMITIDO',
      expiresAt: expiredDate,
      isDeleted: false,
    });

    await expect(
      service.updatePlanStatus('plan-1', { status: 'APROBADO' }),
    ).rejects.toThrow(BadRequestException);
  });
});

describe('CommissionsService (Sprint 10 - Regla RN-07)', () => {
  let service: CommissionsService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      user: {
        findUnique: vi.fn(),
      },
      doctorCommissionRule: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      appointment: {
        findMany: vi.fn(),
      },
      doctorCommissionSettlement: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      procedureCatalog: {
        findFirst: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(prismaMock)),
    };

    service = new CommissionsService(prismaMock);
  });

  it('debe deducir obligatoriamente el costo de laboratorio externo antes de liquidar el honorario (Regla RN-07)', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'doc-1',
      firstName: 'Carlos',
      lastName: 'Mendoza',
      isDeleted: false,
    });

    // Regla: 50% de comisión
    prismaMock.doctorCommissionRule.findMany.mockResolvedValue([
      {
        id: 'rule-1',
        doctorId: 'doc-1',
        procedureId: null,
        ruleType: 'PERCENTAGE_NET',
        percentage: 50.0,
        fixedAmount: null,
        isActive: true,
      },
    ]);

    // Cita atendida con procedimiento: Precio = $200, Costo Lab Dental = $60
    // Regla RN-07: Base comisionable = 200 - 60 = 140.
    // Honorario profesional (50%) = 140 * 0.50 = $70.
    prismaMock.appointment.findMany.mockResolvedValue([
      {
        id: 'app-1',
        status: 'ATENDIDO',
        startDateTime: new Date('2026-10-15T10:00:00Z'),
        invoices: [{ id: 'inv-1', total: 200 }],
        treatmentPlanItems: [
          {
            id: 'item-1',
            finalPrice: 200,
            labCost: 60,
            procedure: {
              id: 'proc-corona',
              code: 'PROT-001',
              name: 'Corona Metal Porcelana',
              suggestedLabCost: 60,
            },
          },
        ],
      },
    ]);

    const preview = await service.calculateSettlementPreview({
      doctorId: 'doc-1',
      periodStart: '2026-10-01',
      periodEnd: '2026-10-31',
    });

    expect(preview.grossAmount).toBe(200);
    expect(preview.totalLabCosts).toBe(60); // Costo laboratorio deducido
    expect(preview.netCommissionableBase).toBe(140); // 200 - 60
    expect(preview.netCommissionPaid).toBe(70); // 50% de 140
    expect(preview.items[0].doctorEarning).toBe(70);
  });
});
