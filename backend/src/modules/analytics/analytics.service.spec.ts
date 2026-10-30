import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsService (Sprint 11 - BI y Auditoría Forense)', () => {
  let service: AnalyticsService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      appointment: {
        findMany: vi.fn(),
      },
      dentalChair: {
        count: vi.fn(),
      },
      invoice: {
        findMany: vi.fn(),
      },
      doctorCommissionSettlement: {
        findMany: vi.fn(),
      },
      treatmentPlanItem: {
        findMany: vi.fn(),
      },
      auditLog: {
        count: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
      },
    };

    service = new AnalyticsService(prismaMock);
  });

  it('debe calcular correctamente la tasa de ausentismo (No-Show rate) y el ticket promedio', async () => {
    // 10 citas en total: 2 No-Show, 7 Atendidas, 1 Cancelada -> 20.0% No-Show
    const now = new Date();
    prismaMock.appointment.findMany.mockResolvedValue([
      { id: '1', status: 'NO_SHOW', startDateTime: now, endDateTime: now, doctorId: 'd1', chairId: 'c1' },
      { id: '2', status: 'NO_SHOW', startDateTime: now, endDateTime: now, doctorId: 'd1', chairId: 'c1' },
      { id: '3', status: 'CANCELADO', startDateTime: now, endDateTime: now, doctorId: 'd1', chairId: 'c1' },
      { id: '4', status: 'ATENDIDO', startDateTime: new Date(now.getTime() - 3600000), endDateTime: now, doctorId: 'd1', chairId: 'c1' },
      { id: '5', status: 'ATENDIDO', startDateTime: new Date(now.getTime() - 3600000), endDateTime: now, doctorId: 'd1', chairId: 'c1' },
      { id: '6', status: 'ATENDIDO', startDateTime: new Date(now.getTime() - 3600000), endDateTime: now, doctorId: 'd1', chairId: 'c1' },
      { id: '7', status: 'ATENDIDO', startDateTime: new Date(now.getTime() - 3600000), endDateTime: now, doctorId: 'd1', chairId: 'c1' },
      { id: '8', status: 'ATENDIDO', startDateTime: new Date(now.getTime() - 3600000), endDateTime: now, doctorId: 'd1', chairId: 'c1' },
      { id: '9', status: 'ATENDIDO', startDateTime: new Date(now.getTime() - 3600000), endDateTime: now, doctorId: 'd1', chairId: 'c1' },
      { id: '10', status: 'ATENDIDO', startDateTime: new Date(now.getTime() - 3600000), endDateTime: now, doctorId: 'd1', chairId: 'c1' },
    ]);

    prismaMock.dentalChair.count.mockResolvedValue(2);

    // 2 facturas: $100 y $200 -> Total $300, Ticket Promedio $150
    prismaMock.invoice.findMany.mockResolvedValue([
      { id: 'inv-1', total: 100, subtotal: 82, tax: 18, createdAt: now },
      { id: 'inv-2', total: 200, subtotal: 164, tax: 36, createdAt: now },
    ]);

    prismaMock.doctorCommissionSettlement.findMany.mockResolvedValue([
      { grossAmount: 300, totalLabCosts: 50, netCommissionPaid: 100 },
    ]);

    prismaMock.treatmentPlanItem.findMany.mockResolvedValue([]);

    const kpis = await service.getDirectorKpis({
      startDate: '2026-10-01',
      endDate: '2026-10-31',
    });

    expect(kpis.appointments.total).toBe(10);
    expect(kpis.appointments.noShow).toBe(2);
    expect(kpis.appointments.noShowRate).toBe(20.0); // 2 de 10 = 20%
    expect(kpis.financials.totalRevenue).toBe(300.0);
    expect(kpis.financials.averageTicket).toBe(150.0); // 300 / 2 = 150
    expect(kpis.financials.totalLabCostsDeducted).toBe(50.0);
    expect(kpis.financials.grossMargin).toBe(150.0); // 300 - 50 - 100 = 150
  });

  it('debe registrar un evento de auditoría forense con hash criptográfico SHA-256 (ASVS Nivel 2)', async () => {
    prismaMock.auditLog.create.mockImplementation(({ data }: any) => ({
      id: 'log-1',
      ...data,
    }));

    const entry = await service.createAuditLogEntry({
      userId: '00000000-0000-0000-0000-000000000001',
      userRole: 'ADMINISTRADOR',
      action: 'READ',
      resource: 'EXPEDIENTE_CLINICO',
      resourceId: '00000000-0000-0000-0000-000000000099',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 Chrome',
      metadata: { reason: 'Auditoría médica periódica' },
    });

    expect(entry).toBeDefined();
    expect(entry.action).toBe('READ');
    expect(entry.integrityHash).toBeDefined();
    expect(entry.integrityHash).toHaveLength(64); // SHA-256 hex string tiene exactamente 64 caracteres
  });
});
