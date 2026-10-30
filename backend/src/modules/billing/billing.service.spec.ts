import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BillingService } from './billing.service';
import { BadRequestException, ConflictException } from '@nestjs/common';

describe('BillingService', () => {
  let service: BillingService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      cashShift: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
      },
      invoice: {
        count: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      paymentDetail: {
        findMany: vi.fn(),
        create: vi.fn(),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
      },
      appointment: {
        update: vi.fn(),
      },
      $transaction: vi.fn((callback) => callback(mockPrisma)),
    };

    service = new BillingService(mockPrisma);
  });

  it('debe permitir abrir un turno de caja con fondo fijo', async () => {
    mockPrisma.cashShift.findFirst.mockResolvedValueOnce(null);
    mockPrisma.cashShift.create.mockResolvedValueOnce({
      id: 'shift-1',
      branchId: 'b-1',
      cashierId: 'c-1',
      openingBalance: 100,
      status: 'ABIERTA',
    });

    const shift = await service.openShift(
      {
        branchId: 'b-1',
        openingBalance: 100,
        notes: 'Turno mañana',
      },
      'c-1',
    );

    expect(shift.id).toBe('shift-1');
    expect(shift.status).toBe('ABIERTA');
    expect(mockPrisma.auditLog.create).toHaveBeenCalled();
  });

  it('debe impedir abrir dos turnos simultáneos para el mismo cajero en la misma sede', async () => {
    mockPrisma.cashShift.findFirst.mockResolvedValueOnce({
      id: 'shift-active',
      status: 'ABIERTA',
    });

    await expect(
      service.openShift(
        {
          branchId: 'b-1',
          openingBalance: 50,
        },
        'c-1',
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('debe rechazar facturación si los pagos mixtos no cuadran con el total', async () => {
    mockPrisma.cashShift.findFirst.mockResolvedValueOnce({
      id: 'shift-1',
      status: 'ABIERTA',
    });

    const invalidInvoiceDto = {
      patientId: 'p-1',
      invoiceType: 'FACTURA',
      items: [
        { description: 'Consulta', quantity: 1, unitPrice: 50 },
        { description: 'Profilaxis', quantity: 1, unitPrice: 30 },
      ], // Total = 80
      paymentDetails: [
        { paymentMethod: 'EFECTIVO', amount: 50 },
        { paymentMethod: 'TARJETA', amount: 20 },
      ], // Suma = 70 (Faltan 10)
    };

    await expect(service.createInvoice(invalidInvoiceDto as any, 'c-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('debe calcular correctamente el arqueo ciego y registrar faltante/sobrante', async () => {
    mockPrisma.cashShift.findUnique.mockResolvedValueOnce({
      id: 'shift-1',
      cashierId: 'c-1',
      branchId: 'b-1',
      status: 'ABIERTA',
      openingTime: new Date(Date.now() - 28800000), // hace 8 horas
      openingBalance: 100.0,
      branch: { name: 'Sede Principal' },
      isDeleted: false,
    });

    // Simulamos que durante el turno se cobraron $150 en efectivo
    mockPrisma.paymentDetail.findMany.mockResolvedValueOnce([
      { amount: 50.0, paymentMethod: 'EFECTIVO' },
      { amount: 100.0, paymentMethod: 'EFECTIVO' },
    ]);
    // Pagos electrónicos ($80)
    mockPrisma.paymentDetail.findMany.mockResolvedValueOnce([
      { amount: 80.0, paymentMethod: 'TARJETA' },
    ]);

    // Teórico esperado en efectivo = 100 (apertura) + 150 (cobros) = 250.00
    // Cajero declara en físico a ciegas: 240.00 (Faltante de $10)
    mockPrisma.cashShift.update.mockResolvedValueOnce({
      id: 'shift-1',
      status: 'CERRADA_CIEGA',
      theoreticalBalance: 250.0,
      declaredPhysicalBalance: 240.0,
      discrepancy: -10.0,
      branchId: 'b-1',
    });

    const result = await service.closeBlindShift(
      'shift-1',
      { declaredPhysicalBalance: 240.0, notes: 'Faltante de $10 justificado' },
      'c-1',
    );

    expect(result.theoreticalCashBalance).toBe(250.0);
    expect(result.declaredPhysicalBalance).toBe(240.0);
    expect(result.discrepancy).toBe(-10.0);
    expect(result.discrepancyType).toBe('FALTANTE');
    expect(mockPrisma.auditLog.create).toHaveBeenCalled();
  });
});
