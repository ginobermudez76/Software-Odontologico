import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenCashShiftDto } from './dto/open-cash-shift.dto';
import { CloseBlindCashShiftDto } from './dto/close-cash-shift.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { QueryInvoiceDto } from './dto/query-invoice.dto';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Apertura de turno de caja con fondo fijo inicial
   */
  async openShift(dto: OpenCashShiftDto, cashierId: string) {
    // 1. Validar que no exista un turno ya abierto para este cajero en la sede
    const activeShift = await this.prisma.cashShift.findFirst({
      where: {
        branchId: dto.branchId,
        cashierId,
        status: 'ABIERTA',
        isDeleted: false,
      },
    });

    if (activeShift) {
      throw new ConflictException({
        errorCode: 'ERR_ACTIVE_SHIFT_EXISTS',
        detail: 'Ya posee un turno de caja abierto en esta sede. Realice el cierre ciego antes de iniciar otro.',
      });
    }

    const shift = await this.prisma.cashShift.create({
      data: {
        branchId: dto.branchId,
        cashierId,
        openingBalance: dto.openingBalance,
        status: 'ABIERTA',
        notes: dto.notes,
      },
      include: {
        branch: { select: { name: true, code: true } },
        cashier: { select: { firstName: true, lastName: true } },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: cashierId,
        action: 'WRITE',
        resource: 'cash_shifts',
        resourceId: shift.id,
        metadata: {
          openingBalance: dto.openingBalance,
          branchId: dto.branchId,
        },
      },
    });

    return shift;
  }

  /**
   * Obtiene el turno activo del cajero SIN exponer el saldo teórico (Principio de Arqueo Ciego)
   */
  async getCurrentShift(cashierId: string, branchId?: string) {
    const shift = await this.prisma.cashShift.findFirst({
      where: {
        cashierId,
        branchId: branchId || undefined,
        status: 'ABIERTA',
        isDeleted: false,
      },
      include: {
        branch: { select: { id: true, name: true, code: true } },
      },
    });

    if (!shift) {
      return null;
    }

    // Retornar información sin filtrar montos teóricos de cobro
    return {
      id: shift.id,
      branchId: shift.branchId,
      branchName: shift.branch.name,
      openingTime: shift.openingTime,
      openingBalance: Number(shift.openingBalance),
      status: shift.status,
      notes: shift.notes,
    };
  }

  /**
   * Arqueo y Cierre Ciego de Caja:
   * El cajero envía su conteo físico sin haber visto el total teórico del sistema.
   * El sistema calcula las diferencias y genera el Acta Inmutable de Cierre.
   */
  async closeBlindShift(shiftId: string, dto: CloseBlindCashShiftDto, cashierId: string) {
    const shift = await this.prisma.cashShift.findUnique({
      where: { id: shiftId },
      include: { branch: true },
    });

    if (!shift || shift.isDeleted) {
      throw new NotFoundException({
        errorCode: 'ERR_SHIFT_NOT_FOUND',
        detail: `No se encontró el turno de caja con ID ${shiftId}`,
      });
    }

    if (shift.status !== 'ABIERTA') {
      throw new BadRequestException({
        errorCode: 'ERR_SHIFT_ALREADY_CLOSED',
        detail: 'Este turno de caja ya ha sido cerrado.',
      });
    }

    if (shift.cashierId !== cashierId) {
      throw new BadRequestException({
        errorCode: 'ERR_UNAUTHORIZED_SHIFT_CLOSE',
        detail: 'Solo el cajero titular o un supervisor autorizado puede cerrar este turno.',
      });
    }

    const closingTime = new Date();

    // 1. Calcular pagos recibidos en EFECTIVO durante este turno
    const cashPayments = await this.prisma.paymentDetail.findMany({
      where: {
        paymentMethod: 'EFECTIVO',
        isDeleted: false,
        invoice: {
          cashierId,
          createdAt: {
            gte: shift.openingTime,
            lte: closingTime,
          },
          isDeleted: false,
        },
      },
    });

    // 2. Calcular pagos por otros métodos (Tarjeta, Transferencia) para conciliación contable
    const electronicPayments = await this.prisma.paymentDetail.findMany({
      where: {
        paymentMethod: { in: ['TARJETA', 'TRANSFERENCIA'] },
        isDeleted: false,
        invoice: {
          cashierId,
          createdAt: {
            gte: shift.openingTime,
            lte: closingTime,
          },
          isDeleted: false,
        },
      },
    });

    const totalCashCollected = cashPayments.reduce((acc, p) => acc + Number(p.amount), 0);
    const totalElectronicCollected = electronicPayments.reduce((acc, p) => acc + Number(p.amount), 0);

    const theoreticalCashBalance = Number(shift.openingBalance) + totalCashCollected;
    const declaredPhysicalBalance = Number(dto.declaredPhysicalBalance);
    const discrepancy = Number((declaredPhysicalBalance - theoreticalCashBalance).toFixed(2));

    // 3. Actualizar el turno registrando el cierre ciego y discrepancias
    const closedShift = await this.prisma.cashShift.update({
      where: { id: shiftId },
      data: {
        status: 'CERRADA_CIEGA',
        closingTime,
        theoreticalBalance: theoreticalCashBalance,
        declaredPhysicalBalance,
        discrepancy,
        notes: dto.notes ? `${shift.notes || ''} | Cierre: ${dto.notes}` : shift.notes,
      },
    });

    // 4. Registro forense de auditoría inmutable
    await this.prisma.auditLog.create({
      data: {
        userId: cashierId,
        action: 'UPDATE',
        resource: 'cash_shifts',
        resourceId: shiftId,
        metadata: {
          status: 'CERRADA_CIEGA',
          declaredPhysicalBalance,
          theoreticalBalance: theoreticalCashBalance,
          discrepancy,
          discrepancyType: discrepancy === 0 ? 'EXACTO' : discrepancy > 0 ? 'SOBRANTE' : 'FALTANTE',
        },
      },
    });

    return {
      shiftId: closedShift.id,
      branchId: closedShift.branchId,
      branchName: shift.branch.name,
      openingTime: shift.openingTime,
      closingTime,
      openingBalance: Number(shift.openingBalance),
      totalCashCollected,
      totalElectronicCollected,
      theoreticalCashBalance,
      declaredPhysicalBalance,
      discrepancy,
      discrepancyType: discrepancy === 0 ? 'CONCILIADO_EXACTO' : discrepancy > 0 ? 'SOBRANTE' : 'FALTANTE',
      notes: closedShift.notes,
    };
  }

  /**
   * Emisión de Factura / Boleta con desglose de pagos mixtos (Efectivo, Tarjeta, Transferencia)
   */
  async createInvoice(dto: CreateInvoiceDto, cashierId: string) {
    // 1. Verificar que el cajero tenga un turno de caja abierto
    const activeShift = await this.prisma.cashShift.findFirst({
      where: {
        cashierId,
        status: 'ABIERTA',
        isDeleted: false,
      },
    });

    if (!activeShift) {
      throw new BadRequestException({
        errorCode: 'ERR_NO_OPEN_SHIFT',
        detail: 'No tiene un turno de caja abierto. Debe abrir caja antes de registrar cobros y facturación.',
      });
    }

    // 2. Calcular montos de la factura
    const subtotal = Number(
      dto.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0).toFixed(2),
    );
    const tax = 0; // Exento de IVA para servicios médicos según normativa sanitaria
    const total = Number((subtotal + tax).toFixed(2));

    // 3. Validar que la suma de los pagos mixtos cuadre exactamente con el total
    const totalPaid = Number(
      dto.paymentDetails.reduce((sum, p) => sum + p.amount, 0).toFixed(2),
    );

    if (Math.abs(totalPaid - total) > 0.01) {
      throw new BadRequestException({
        errorCode: 'ERR_PAYMENT_MISMATCH',
        detail: `La suma de pagos mixtos ($${totalPaid.toFixed(2)}) no coincide con el total de la factura ($${total.toFixed(2)}).`,
      });
    }

    // 4. Generación de número de serie fiscal único
    const prefix = dto.invoiceType === 'FACTURA' ? 'F001' : 'B001';
    const count = await this.prisma.invoice.count({
      where: { invoiceType: dto.invoiceType },
    });
    const seriesNumber = `${prefix}-${String(count + 1).padStart(8, '0')}`;

    // 5. Creación atómica transaccional de Factura y Desglose de Pagos
    const invoice = await this.prisma.$transaction(async (tx) => {
      const createdInvoice = await tx.invoice.create({
        data: {
          patientId: dto.patientId,
          appointmentId: dto.appointmentId || null,
          cashierId,
          invoiceType: dto.invoiceType,
          seriesNumber,
          subtotal,
          tax,
          total,
          fiscalStatus: 'EMITIDO',
          pdfUrl: `/api/v1/billing/invoices/${seriesNumber}/pdf`,
        },
      });

      // Crear detalles de pago
      await Promise.all(
        dto.paymentDetails.map((pd) =>
          tx.paymentDetail.create({
            data: {
              invoiceId: createdInvoice.id,
              paymentMethod: pd.paymentMethod,
              amount: pd.amount,
              voucherReference: pd.voucherReference || null,
            },
          }),
        ),
      );

      // Si estaba vinculada a una cita, marcarla como ATENDIDO si aún estaba en atención
      if (dto.appointmentId) {
        await tx.appointment.update({
          where: { id: dto.appointmentId },
          data: { status: 'ATENDIDO' },
        });
      }

      return createdInvoice;
    });

    // 6. Registro de Auditoría
    await this.prisma.auditLog.create({
      data: {
        userId: cashierId,
        action: 'WRITE',
        resource: 'invoices',
        resourceId: invoice.id,
        metadata: {
          seriesNumber: invoice.seriesNumber,
          total,
          payments: dto.paymentDetails as any,
        },
      },
    });

    return this.findInvoiceById(invoice.id);
  }

  /**
   * Consulta paginada de facturas
   */
  async findAllInvoices(query: QueryInvoiceDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { isDeleted: false };
    if (query.patientId) where.patientId = query.patientId;
    if (query.cashierId) where.cashierId = query.cashierId;
    if (query.invoiceType) where.invoiceType = query.invoiceType;

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const [total, invoices] = await Promise.all([
      this.prisma.invoice.count({ where }),
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              documentType: true,
              documentNumber: true,
            },
          },
          cashier: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          paymentDetails: true,
        },
      }),
    ]);

    return {
      data: invoices,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtiene detalle completo de una factura
   */
  async findInvoiceById(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        patient: true,
        cashier: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        paymentDetails: true,
        appointment: {
          include: { chair: true, doctor: true },
        },
      },
    });

    if (!invoice || invoice.isDeleted) {
      throw new NotFoundException({
        errorCode: 'ERR_INVOICE_NOT_FOUND',
        detail: `No se encontró el comprobante con ID ${id}`,
      });
    }

    return invoice;
  }

  /**
   * Historial de turnos de caja para auditoría contable
   */
  async getShiftHistory(branchId: string, limit: number = 30) {
    return this.prisma.cashShift.findMany({
      where: { branchId, isDeleted: false },
      take: limit,
      orderBy: { openingTime: 'desc' },
      include: {
        cashier: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }
}
