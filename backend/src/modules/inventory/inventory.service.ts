import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { AddBatchDto } from './dto/add-batch.dto';
import { ConfigureProcedureRecipeDto } from './dto/configure-recipe.dto';
import { DischargeProcedureStockDto } from './dto/discharge-stock.dto';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Listado de insumos clínicos con semáforo de stock (Óptimo, Bajo, Crítico)
   */
  async findAllSupplies(search?: string) {
    const where: any = { isDeleted: false };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    const supplies = await this.prisma.clinicalSupply.findMany({
      where,
      include: {
        batches: {
          where: { isDeleted: false, availableQuantity: { gt: 0 } },
          orderBy: { expirationDate: 'asc' },
          select: {
            id: true,
            batchNumber: true,
            expirationDate: true,
            availableQuantity: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const now = new Date();
    return supplies.map((supply) => {
      let stockStatus: 'OPTIMO' | 'BAJO' | 'CRITICO' = 'OPTIMO';
      if (supply.currentStock === 0) {
        stockStatus = 'CRITICO';
      } else if (supply.currentStock <= supply.minStock) {
        stockStatus = 'BAJO';
      }

      // Detectar lote más próximo a caducar
      const nextExpiringBatch = supply.batches[0] || null;
      let nextExpirationDays: number | null = null;
      if (nextExpiringBatch) {
        const diffMs = new Date(nextExpiringBatch.expirationDate).getTime() - now.getTime();
        nextExpirationDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      }

      return {
        id: supply.id,
        sku: supply.sku,
        name: supply.name,
        brand: supply.brand,
        unit: supply.unit,
        minStock: supply.minStock,
        currentStock: supply.currentStock,
        stockStatus,
        activeBatchesCount: supply.batches.length,
        nextExpiringBatch,
        nextExpirationDays,
        updatedAt: supply.updatedAt,
      };
    });
  }

  /**
   * Registro de nuevo insumo clínico con validación de SKU único parcial (WHERE is_deleted = false)
   */
  async createSupply(dto: CreateSupplyDto, userId?: string) {
    // Validar índice parcial único: SKU no debe repetirse entre registros activos
    const existing = await this.prisma.clinicalSupply.findFirst({
      where: {
        sku: dto.sku.trim().toUpperCase(),
        isDeleted: false,
      },
    });

    if (existing) {
      throw new ConflictException({
        errorCode: 'ERR_SKU_ALREADY_EXISTS',
        detail: `Ya existe un insumo clínico activo con el código SKU '${dto.sku}'`,
      });
    }

    const supply = await this.prisma.clinicalSupply.create({
      data: {
        sku: dto.sku.trim().toUpperCase(),
        name: dto.name.trim(),
        brand: dto.brand?.trim(),
        unit: dto.unit.trim(),
        minStock: dto.minStock ?? 10,
        currentStock: 0,
      },
    });

    // Auditoría forense
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        resource: 'clinical_supplies',
        resourceId: supply.id,
        metadata: {
          action: 'CREATE_SUPPLY',
          sku: supply.sku,
          name: supply.name,
        },
      },
    });

    return supply;
  }

  /**
   * Ingreso de nuevo lote de insumo con fecha de caducidad e incremento atómico de stock
   */
  async addBatch(supplyId: string, dto: AddBatchDto, userId?: string) {
    const supply = await this.prisma.clinicalSupply.findUnique({
      where: { id: supplyId },
    });

    if (!supply || supply.isDeleted) {
      throw new NotFoundException({
        errorCode: 'ERR_SUPPLY_NOT_FOUND',
        detail: `No se encontró el insumo clínico con ID ${supplyId}`,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Crear el lote
      const batch = await tx.supplyBatch.create({
        data: {
          supplyId,
          batchNumber: dto.batchNumber.trim().toUpperCase(),
          expirationDate: new Date(dto.expirationDate),
          initialQuantity: dto.quantity,
          availableQuantity: dto.quantity,
          unitCost: dto.unitCost,
        },
      });

      // 2. Incrementar el stock consolidado del insumo
      const updatedSupply = await tx.clinicalSupply.update({
        where: { id: supplyId },
        data: {
          currentStock: { increment: dto.quantity },
        },
      });

      // 3. Auditoría forense
      await tx.auditLog.create({
        data: {
          userId,
          action: 'CREATE',
          resource: 'supply_batches',
          resourceId: batch.id,
          metadata: {
            action: 'ADD_BATCH',
            supplyId,
            batchNumber: batch.batchNumber,
            quantity: dto.quantity,
            newTotalStock: updatedSupply.currentStock,
          },
        },
      });

      return {
        batch,
        newSupplyStock: updatedSupply.currentStock,
      };
    });
  }

  /**
   * Reporte y alertas de lotes próximos a vencer o caducados (umbrales 60, 30, 15 días)
   */
  async getExpiringBatches(daysAhead = 60) {
    const now = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysAhead);

    const batches = await this.prisma.supplyBatch.findMany({
      where: {
        isDeleted: false,
        availableQuantity: { gt: 0 },
        expirationDate: { lte: thresholdDate },
      },
      include: {
        supply: {
          select: {
            id: true,
            sku: true,
            name: true,
            unit: true,
          },
        },
      },
      orderBy: { expirationDate: 'asc' },
    });

    return batches.map((batch) => {
      const diffMs = new Date(batch.expirationDate).getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      let alertLevel: 'CADUCADO' | 'URGENTE_15_DIAS' | 'ALERTA_30_DIAS' | 'PREVENTIVO_60_DIAS' =
        'PREVENTIVO_60_DIAS';

      if (daysRemaining < 0) {
        alertLevel = 'CADUCADO';
      } else if (daysRemaining <= 15) {
        alertLevel = 'URGENTE_15_DIAS';
      } else if (daysRemaining <= 30) {
        alertLevel = 'ALERTA_30_DIAS';
      }

      return {
        id: batch.id,
        supplyId: batch.supplyId,
        supplyName: batch.supply.name,
        supplySku: batch.supply.sku,
        unit: batch.supply.unit,
        batchNumber: batch.batchNumber,
        availableQuantity: batch.availableQuantity,
        expirationDate: batch.expirationDate,
        daysRemaining,
        alertLevel,
      };
    });
  }

  /**
   * Configuración de la receta clínica estándar de insumos por procedimiento
   */
  async configureProcedureRecipe(
    procedureId: string,
    dto: ConfigureProcedureRecipeDto,
    userId?: string,
  ) {
    const procedure = await this.prisma.procedureCatalog.findUnique({
      where: { id: procedureId },
    });

    if (!procedure || procedure.isDeleted) {
      throw new NotFoundException({
        errorCode: 'ERR_PROCEDURE_NOT_FOUND',
        detail: `No se encontró el procedimiento clínico con ID ${procedureId}`,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      // Eliminar receta previa para reemplazo limpio
      await tx.procedureRecipe.deleteMany({
        where: { procedureId },
      });

      // Crear nuevos ítems de consumo estándar
      const createdItems = await Promise.all(
        dto.supplies.map((item) =>
          tx.procedureRecipe.create({
            data: {
              procedureId,
              supplyId: item.supplyId,
              quantity: item.quantity,
            },
            include: {
              supply: {
                select: {
                  id: true,
                  name: true,
                  unit: true,
                },
              },
            },
          }),
        ),
      );

      // Auditoría forense
      await tx.auditLog.create({
        data: {
          userId,
          action: 'UPDATE',
          resource: 'procedure_recipes',
          resourceId: procedureId,
          metadata: {
            action: 'CONFIGURE_RECIPE',
            itemsCount: createdItems.length,
          },
        },
      });

      return {
        procedureId,
        procedureName: procedure.name,
        recipeItems: createdItems,
      };
    });
  }

  /**
   * Obtiene la receta de insumos de un procedimiento
   */
  async getProcedureRecipe(procedureId: string) {
    const procedure = await this.prisma.procedureCatalog.findUnique({
      where: { id: procedureId },
      include: {
        recipes: {
          include: {
            supply: {
              select: {
                id: true,
                sku: true,
                name: true,
                unit: true,
                currentStock: true,
              },
            },
          },
        },
      },
    });

    if (!procedure || procedure.isDeleted) {
      throw new NotFoundException({
        errorCode: 'ERR_PROCEDURE_NOT_FOUND',
        detail: `No se encontró el procedimiento clínico con ID ${procedureId}`,
      });
    }

    return {
      procedureId: procedure.id,
      code: procedure.code,
      name: procedure.name,
      category: procedure.category,
      basePrice: procedure.basePrice,
      recipe: procedure.recipes.map((r) => ({
        id: r.id,
        supplyId: r.supplyId,
        supplyName: r.supply.name,
        supplySku: r.supply.sku,
        unit: r.supply.unit,
        currentStock: r.supply.currentStock,
        standardQuantity: Number(r.quantity),
      })),
    };
  }

  /**
   * REGLA INVIOLABLE RN-06 / DESCARGO TRANSACCIONAL ATÓMICO:
   * Al marcar una cita en estado 'Atendido', descuenta automáticamente los insumos
   * del sillón/consultorio según la receta del procedimiento utilizando lógica FEFO
   * (First Expired, First Out - consumo del lote más próximo a caducar).
   */
  async dischargeStockByProcedure(dto: DischargeProcedureStockDto, userId?: string) {
    const recipe = await this.prisma.procedureRecipe.findMany({
      where: { procedureId: dto.procedureId },
      include: {
        supply: true,
      },
    });

    if (recipe.length === 0) {
      this.logger.log(
        `Procedimiento ${dto.procedureId} no tiene receta de insumos configurada. No se requirió descargo.`,
      );
      return { dischargedItemsCount: 0, discharges: [] };
    }

    return this.prisma.$transaction(async (tx) => {
      const discharges = [];

      for (const recipeItem of recipe) {
        let remainingToDischarge = Number(recipeItem.quantity);
        const supplyId = recipeItem.supplyId;

        // Obtener lotes activos con stock disponible ordenados por caducidad (FEFO)
        const batches = await tx.supplyBatch.findMany({
          where: {
            supplyId,
            availableQuantity: { gt: 0 },
            isDeleted: false,
          },
          orderBy: { expirationDate: 'asc' },
        });

        for (const batch of batches) {
          if (remainingToDischarge <= 0) break;

          const dischargeFromBatch = Math.min(batch.availableQuantity, remainingToDischarge);

          // 1. Deducir del lote
          await tx.supplyBatch.update({
            where: { id: batch.id },
            data: {
              availableQuantity: { decrement: dischargeFromBatch },
            },
          });

          // 2. Registrar el descargo
          const dischargeRecord = await tx.inventoryDischarge.create({
            data: {
              appointmentId: dto.appointmentId,
              chairId: dto.chairId,
              procedureId: dto.procedureId,
              supplyId,
              batchId: batch.id,
              quantity: dischargeFromBatch,
              reason: dto.reason || 'CONSUMO_PROCEDIMIENTO_RN06',
            },
          });

          discharges.push(dischargeRecord);
          remainingToDischarge -= dischargeFromBatch;
        }

        // 3. Deducir del stock global del insumo
        const totalDeducted = Number(recipeItem.quantity) - Math.max(0, remainingToDischarge);
        await tx.clinicalSupply.update({
          where: { id: supplyId },
          data: {
            currentStock: { decrement: totalDeducted },
          },
        });
      }

      // Auditoría forense LOPDP
      await tx.auditLog.create({
        data: {
          userId,
          action: 'CREATE',
          resource: 'inventory_discharges',
          metadata: {
            action: 'DISCHARGE_STOCK_PROCEDURE_RN06',
            procedureId: dto.procedureId,
            appointmentId: dto.appointmentId,
            dischargesCount: discharges.length,
          },
        },
      });

      return {
        dischargedItemsCount: discharges.length,
        discharges,
      };
    });
  }
}
