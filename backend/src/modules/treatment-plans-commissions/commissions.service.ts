import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigureCommissionRuleDto } from './dto/configure-commission-rule.dto';
import { GenerateSettlementDto } from './dto/generate-settlement.dto';

@Injectable()
export class CommissionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Configura o actualiza la regla de comisión de un odontólogo.
   */
  async configureRule(dto: ConfigureCommissionRuleDto) {
    const doctor = await this.prisma.user.findUnique({
      where: { id: dto.doctorId },
    });
    if (!doctor || doctor.isDeleted) {
      throw new NotFoundException({
        statusCode: 404,
        errorCode: 'ERR_DOCTOR_NOT_FOUND',
        detail: 'El odontólogo especificado no existe',
      });
    }

    if (dto.ruleType === 'PERCENTAGE_NET' && (dto.percentage === undefined || dto.percentage === null)) {
      throw new BadRequestException({
        statusCode: 400,
        errorCode: 'ERR_PERCENTAGE_REQUIRED',
        detail: 'Debe especificar el porcentaje comisionable para la regla porcentual',
      });
    }

    if (dto.ruleType === 'FIXED_AMOUNT' && (dto.fixedAmount === undefined || dto.fixedAmount === null)) {
      throw new BadRequestException({
        statusCode: 400,
        errorCode: 'ERR_FIXED_AMOUNT_REQUIRED',
        detail: 'Debe especificar el monto fijo para la regla por importe',
      });
    }

    // Buscar regla existente para este doctor y procedimiento
    const existingRule = await this.prisma.doctorCommissionRule.findFirst({
      where: {
        doctorId: dto.doctorId,
        procedureId: dto.procedureId ?? null,
      },
    });

    if (existingRule) {
      return this.prisma.doctorCommissionRule.update({
        where: { id: existingRule.id },
        data: {
          ruleType: dto.ruleType,
          percentage: dto.percentage,
          fixedAmount: dto.fixedAmount,
          isActive: dto.isActive ?? true,
        },
      });
    }

    return this.prisma.doctorCommissionRule.create({
      data: {
        doctorId: dto.doctorId,
        procedureId: dto.procedureId,
        ruleType: dto.ruleType,
        percentage: dto.percentage,
        fixedAmount: dto.fixedAmount,
        isActive: dto.isActive ?? true,
      },
    });
  }

  /**
   * Obtiene las reglas de comisión configuradas para un odontólogo.
   */
  async getDoctorRules(doctorId: string) {
    return this.prisma.doctorCommissionRule.findMany({
      where: { doctorId },
      include: { procedure: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Motor de liquidación: Previsualiza el cálculo de comisiones.
   * Regla Inviolable RN-07: Deducción previa y obligatoria de costos de laboratorio externo
   * antes de computar el porcentaje de comisión del odontólogo.
   */
  async calculateSettlementPreview(dto: GenerateSettlementDto) {
    const doctor = await this.prisma.user.findUnique({
      where: { id: dto.doctorId },
    });
    if (!doctor || doctor.isDeleted) {
      throw new NotFoundException({
        statusCode: 404,
        errorCode: 'ERR_DOCTOR_NOT_FOUND',
        detail: 'El odontólogo especificado no existe',
      });
    }

    const start = new Date(dto.periodStart);
    const end = new Date(dto.periodEnd);
    end.setHours(23, 59, 59, 999);

    // Obtener citas atendidas por el doctor en el periodo
    const attendedAppointments = await this.prisma.appointment.findMany({
      where: {
        doctorId: dto.doctorId,
        status: 'ATENDIDO',
        isDeleted: false,
        startDateTime: {
          gte: start,
          lte: end,
        },
      },
      include: {
        invoices: true,
        treatmentPlanItems: {
          include: {
            procedure: true,
          },
        },
      },
    });

    // Obtener reglas de comisión del profesional
    const doctorRules = await this.prisma.doctorCommissionRule.findMany({
      where: { doctorId: dto.doctorId, isActive: true },
    });

    const defaultRule = doctorRules.find((r) => !r.procedureId) || {
      ruleType: 'PERCENTAGE_NET',
      percentage: 40.0, // 40% estándar por defecto si no está especificado
      fixedAmount: null,
    };

    let grossTotal = 0;
    let totalLabCosts = 0;
    let netCommissionableTotal = 0;
    let doctorEarningsTotal = 0;

    const itemsToSettle: Array<{
      appointmentId: string;
      procedureId: string;
      procedureName: string;
      procedureCode: string;
      invoiceId?: string;
      procedurePrice: number;
      labCost: number;
      commissionableBase: number;
      commissionRate: number;
      ruleType: string;
      doctorEarning: number;
    }> = [];

    for (const app of attendedAppointments) {
      const invoiceId = app.invoices.length > 0 ? app.invoices[0].id : undefined;

      // Si tiene ítems de plan de tratamiento vinculados
      if (app.treatmentPlanItems.length > 0) {
        for (const planItem of app.treatmentPlanItems) {
          const proc = planItem.procedure;
          const procPrice = Number(planItem.finalPrice);
          const labCost = Number(planItem.labCost || proc.suggestedLabCost || 0);

          // REGLA INVIOLABLE RN-07: Deducción previa del costo de laboratorio dental externo
          const commissionableBase = Math.max(0, procPrice - labCost);

          // Buscar regla específica para este procedimiento o regla general
          const rule = doctorRules.find((r) => r.procedureId === proc.id) || defaultRule;

          let earning = 0;
          let rate = 0;

          if (rule.ruleType === 'PERCENTAGE_NET') {
            rate = Number(rule.percentage || 0);
            earning = Number(((commissionableBase * rate) / 100).toFixed(2));
          } else {
            rate = Number(rule.fixedAmount || 0);
            earning = Math.min(commissionableBase, rate);
          }

          grossTotal += procPrice;
          totalLabCosts += labCost;
          netCommissionableTotal += commissionableBase;
          doctorEarningsTotal += earning;

          itemsToSettle.push({
            appointmentId: app.id,
            procedureId: proc.id,
            procedureName: proc.name,
            procedureCode: proc.code,
            invoiceId,
            procedurePrice: procPrice,
            labCost,
            commissionableBase,
            commissionRate: rate,
            ruleType: rule.ruleType,
            doctorEarning: earning,
          });
        }
      } else {
        // En caso de cita directa con procedimientos facturados
        const invoice = app.invoices[0];
        const procPrice = invoice ? Number(invoice.total) : 50.0;
        const labCost = 0;
        const commissionableBase = procPrice;

        const rate = Number(defaultRule.percentage || 40.0);
        const earning = Number(((commissionableBase * rate) / 100).toFixed(2));

        grossTotal += procPrice;
        totalLabCosts += labCost;
        netCommissionableTotal += commissionableBase;
        doctorEarningsTotal += earning;

        // ID placeholder de catálogo general
        itemsToSettle.push({
          appointmentId: app.id,
          procedureId: '00000000-0000-0000-0000-000000000001',
          procedureName: app.reason || 'Consulta General Odontológica',
          procedureCode: 'CONS-GEN',
          invoiceId,
          procedurePrice: procPrice,
          labCost,
          commissionableBase,
          commissionRate: rate,
          ruleType: 'PERCENTAGE_NET',
          doctorEarning: earning,
        });
      }
    }

    return {
      doctorId: dto.doctorId,
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
      periodStart: dto.periodStart,
      periodEnd: dto.periodEnd,
      totalProceduresCount: itemsToSettle.length,
      grossAmount: Number(grossTotal.toFixed(2)),
      totalLabCosts: Number(totalLabCosts.toFixed(2)),
      netCommissionableBase: Number(netCommissionableTotal.toFixed(2)),
      netCommissionPaid: Number(doctorEarningsTotal.toFixed(2)),
      items: itemsToSettle,
    };
  }

  /**
   * Genera y persiste la liquidación formal de honorarios médicos.
   */
  async generateAndSaveSettlement(dto: GenerateSettlementDto) {
    const preview = await this.calculateSettlementPreview(dto);

    if (preview.totalProceduresCount === 0) {
      throw new BadRequestException({
        statusCode: 400,
        errorCode: 'ERR_NO_ATTENDED_PROCEDURES',
        detail:
          'No se encontraron procedimientos o citas en estado Atendido para este profesional en el periodo indicado.',
      });
    }

    const now = new Date();
    const year = now.getFullYear();
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const settlementCode = `LIQ-${year}-${randSuffix}`;

    const settlement = await this.prisma.$transaction(async (tx) => {
      // Buscar procedimiento fallback si no existe
      let fallbackProc = await tx.procedureCatalog.findFirst();
      if (!fallbackProc) {
        fallbackProc = await tx.procedureCatalog.create({
          data: {
            code: 'CONS-GEN',
            name: 'Consulta General Odontológica',
            category: 'Preventiva',
            basePrice: 50.0,
            suggestedLabCost: 0,
          },
        });
      }

      return tx.doctorCommissionSettlement.create({
        data: {
          settlementCode,
          doctorId: dto.doctorId,
          periodStart: new Date(dto.periodStart),
          periodEnd: new Date(dto.periodEnd),
          totalProceduresCount: preview.totalProceduresCount,
          grossAmount: preview.grossAmount,
          totalLabCosts: preview.totalLabCosts,
          netCommissionableBase: preview.netCommissionableBase,
          netCommissionPaid: preview.netCommissionPaid,
          status: 'PENDIENTE',
          notes: dto.notes,
          items: {
            create: preview.items.map((it) => ({
              appointmentId: it.appointmentId,
              procedureId: it.procedureId.startsWith('00000000-0000')
                ? fallbackProc!.id
                : it.procedureId,
              invoiceId: it.invoiceId,
              procedurePrice: it.procedurePrice,
              labCost: it.labCost,
              commissionableBase: it.commissionableBase,
              commissionRate: it.commissionRate,
              doctorEarning: it.doctorEarning,
            })),
          },
        },
        include: {
          doctor: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          items: {
            include: {
              procedure: true,
            },
          },
        },
      });
    });

    return settlement;
  }

  /**
   * Obtiene el listado de liquidaciones emitidas.
   */
  async findAllSettlements(doctorId?: string) {
    return this.prisma.doctorCommissionSettlement.findMany({
      where: {
        doctorId: doctorId || undefined,
        isDeleted: false,
      },
      include: {
        doctor: {
          select: { id: true, firstName: true, lastName: true },
        },
        items: {
          include: {
            procedure: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Marca una liquidación como PAGADA.
   */
  async markSettlementPaid(settlementId: string) {
    const settlement = await this.prisma.doctorCommissionSettlement.findUnique({
      where: { id: settlementId },
    });

    if (!settlement || settlement.isDeleted) {
      throw new NotFoundException({
        statusCode: 404,
        errorCode: 'ERR_SETTLEMENT_NOT_FOUND',
        detail: 'La liquidación no existe o ha sido eliminada',
      });
    }

    return this.prisma.doctorCommissionSettlement.update({
      where: { id: settlementId },
      data: {
        status: 'PAGADO',
        paidAt: new Date(),
      },
    });
  }
}
