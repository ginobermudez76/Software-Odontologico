import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InventoryService } from './inventory.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('InventoryService', () => {
  let service: InventoryService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      clinicalSupply: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      supplyBatch: {
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      procedureCatalog: {
        findUnique: vi.fn(),
      },
      procedureRecipe: {
        findMany: vi.fn(),
        deleteMany: vi.fn(),
        create: vi.fn(),
      },
      inventoryDischarge: {
        create: vi.fn(),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
      },
      $transaction: vi.fn(async (cb) => cb(mockPrisma)),
    };

    service = new InventoryService(mockPrisma);
  });

  describe('Gestión de Insumos & Índice Parcial Único SKU', () => {
    it('debe crear un insumo clínico si el SKU no está repetido entre registros activos', async () => {
      mockPrisma.clinicalSupply.findFirst.mockResolvedValueOnce(null);
      mockPrisma.clinicalSupply.create.mockResolvedValueOnce({
        id: 'supply-1',
        sku: 'INS-ANES-01',
        name: 'Lidocaína 2%',
        unit: 'Cartucho',
        minStock: 20,
        currentStock: 0,
      });

      const result = await service.createSupply(
        {
          sku: 'ins-anes-01',
          name: 'Lidocaína 2%',
          unit: 'Cartucho',
          minStock: 20,
        },
        'user-1',
      );

      expect(result.id).toBe('supply-1');
      expect(result.sku).toBe('INS-ANES-01');
      expect(mockPrisma.clinicalSupply.create).toHaveBeenCalled();
      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });

    it('debe lanzar ConflictException si el SKU ya existe en un insumo activo (isDeleted = false)', async () => {
      mockPrisma.clinicalSupply.findFirst.mockResolvedValueOnce({
        id: 'supply-exist',
        sku: 'INS-ANES-01',
        isDeleted: false,
      });

      await expect(
        service.createSupply(
          {
            sku: 'INS-ANES-01',
            name: 'Otra Lidocaína',
            unit: 'Cartucho',
          },
          'user-1',
        ),
      ).rejects.toThrow(ConflictException);

      expect(mockPrisma.clinicalSupply.create).not.toHaveBeenCalled();
    });
  });

  describe('Ingreso de Lotes y Alertas de Vencimiento', () => {
    it('debe registrar un lote e incrementar atómicamente el stock del insumo', async () => {
      mockPrisma.clinicalSupply.findUnique.mockResolvedValueOnce({
        id: 'supply-1',
        currentStock: 10,
        isDeleted: false,
      });

      mockPrisma.supplyBatch.create.mockResolvedValueOnce({
        id: 'batch-1',
        supplyId: 'supply-1',
        batchNumber: 'LOT-99',
        availableQuantity: 50,
      });

      mockPrisma.clinicalSupply.update.mockResolvedValueOnce({
        id: 'supply-1',
        currentStock: 60,
      });

      const result = await service.addBatch(
        'supply-1',
        {
          batchNumber: 'lot-99',
          expirationDate: new Date('2027-12-31'),
          quantity: 50,
          unitCost: 1.2,
        },
        'user-1',
      );

      expect(result.newSupplyStock).toBe(60);
      expect(mockPrisma.supplyBatch.create).toHaveBeenCalled();
      expect(mockPrisma.clinicalSupply.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { currentStock: { increment: 50 } },
        }),
      );
    });

    it('debe clasificar correctamente los lotes según su fecha de vencimiento (urgente <=15 días, alerta <=30 días)', async () => {
      const now = new Date();

      const batchUrgente = {
        id: 'b-1',
        supplyId: 's-1',
        batchNumber: 'L1',
        availableQuantity: 10,
        expirationDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 días
        supply: { name: 'Anestesia', sku: 'A1', unit: 'Cartucho' },
      };

      const batchAlerta = {
        id: 'b-2',
        supplyId: 's-1',
        batchNumber: 'L2',
        availableQuantity: 20,
        expirationDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000), // 25 días
        supply: { name: 'Anestesia', sku: 'A1', unit: 'Cartucho' },
      };

      mockPrisma.supplyBatch.findMany.mockResolvedValueOnce([batchUrgente, batchAlerta]);

      const result = await service.getExpiringBatches(60);

      expect(result).toHaveLength(2);
      expect(result[0].alertLevel).toBe('URGENTE_15_DIAS');
      expect(result[1].alertLevel).toBe('ALERTA_30_DIAS');
    });
  });

  describe('Regla RN-06: Descargo Transaccional Atómico por Procedimiento (FEFO)', () => {
    it('debe descargar los insumos de la receta descontando primero del lote con vencimiento más próximo', async () => {
      // Receta de procedimiento: Requiere 2 cartuchos de anestesia
      mockPrisma.procedureRecipe.findMany.mockResolvedValueOnce([
        {
          id: 'recipe-1',
          procedureId: 'proc-exodoncia',
          supplyId: 'supply-anes',
          quantity: 2,
          supply: { id: 'supply-anes', name: 'Lidocaína 2%' },
        },
      ]);

      // Lotes disponibles: Lote 1 (vence pronto, quedan 1 unidad), Lote 2 (vence después, quedan 10 unidades)
      const batch1 = {
        id: 'batch-earlier',
        supplyId: 'supply-anes',
        availableQuantity: 1,
        expirationDate: new Date('2026-11-15'),
      };
      const batch2 = {
        id: 'batch-later',
        supplyId: 'supply-anes',
        availableQuantity: 10,
        expirationDate: new Date('2027-05-20'),
      };

      mockPrisma.supplyBatch.findMany.mockResolvedValueOnce([batch1, batch2]);
      mockPrisma.inventoryDischarge.create
        .mockResolvedValueOnce({ id: 'dis-1', quantity: 1, batchId: 'batch-earlier' })
        .mockResolvedValueOnce({ id: 'dis-2', quantity: 1, batchId: 'batch-later' });

      const result = await service.dischargeStockByProcedure(
        {
          procedureId: 'proc-exodoncia',
          appointmentId: 'apt-101',
          chairId: 'chair-1',
          reason: 'CONSUMO_PROCEDIMIENTO_RN06',
        },
        'doc-1',
      );

      expect(result.dischargedItemsCount).toBe(2);

      // Verificación de descargo en batch 1 (1 unidad agotada)
      expect(mockPrisma.supplyBatch.update).toHaveBeenCalledWith({
        where: { id: 'batch-earlier' },
        data: { availableQuantity: { decrement: 1 } },
      });

      // Verificación de descargo en batch 2 (1 unidad restante)
      expect(mockPrisma.supplyBatch.update).toHaveBeenCalledWith({
        where: { id: 'batch-later' },
        data: { availableQuantity: { decrement: 1 } },
      });

      // Verificación de deducción global en el insumo (2 unidades totales)
      expect(mockPrisma.clinicalSupply.update).toHaveBeenCalledWith({
        where: { id: 'supply-anes' },
        data: { currentStock: { decrement: 2 } },
      });

      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });
  });
});
