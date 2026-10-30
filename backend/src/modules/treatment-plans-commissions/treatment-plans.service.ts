import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTreatmentPlanDto,
} from './dto/create-treatment-plan.dto';
import { UpdatePlanStatusDto } from './dto/update-plan-status.dto';
import { ConvertPlanItemToAppointmentDto } from './dto/convert-plan-item.dto';

@Injectable()
export class TreatmentPlansService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un presupuesto clínico estructurado por fases.
   * Regla Inviolable RN-04: Todo presupuesto tiene una validez estricta de 30 días calendario.
   */
  async createPlan(dto: CreateTreatmentPlanDto) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    });
    if (!patient || patient.isDeleted) {
      throw new NotFoundException({
        statusCode: 404,
        errorCode: 'ERR_PATIENT_NOT_FOUND',
        detail: 'El paciente especificado no existe o ha sido eliminado',
      });
    }

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

    const now = new Date();
    // Regla RN-04: Validez estricta de 30 días calendario
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const year = now.getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const planCode = `PRE-${year}-${randomSuffix}`;

    // Calcular montos de ítems y fases
    let totalPlanAmount = 0;
    const computedPhases = dto.phases.map((phase) => {
      let phaseSubtotal = 0;
      const computedItems = phase.items.map((item, idx) => {
        const discount = item.discountPercent || 0;
        const discountMultiplier = (100 - discount) / 100;
        const finalPrice = Number(
          (item.quantity * item.unitPrice * discountMultiplier).toFixed(2),
        );
        phaseSubtotal += finalPrice;

        return {
          procedureId: item.procedureId,
          toothNumber: item.toothNumber,
          surface: item.surface,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercent: discount,
          labCost: item.labCost || 0,
          finalPrice,
          status: 'PENDIENTE',
          orderIndex: idx + 1,
        };
      });

      totalPlanAmount += phaseSubtotal;

      return {
        phaseNumber: phase.phaseNumber,
        name: phase.name,
        status: 'PENDIENTE',
        subtotal: phaseSubtotal,
        orderIndex: phase.phaseNumber,
        items: computedItems,
      };
    });

    const createdPlan = await this.prisma.$transaction(async (tx) => {
      const plan = await tx.treatmentPlan.create({
        data: {
          patientId: dto.patientId,
          doctorId: dto.doctorId,
          planCode,
          title: dto.title,
          description: dto.description,
          status: 'EMITIDO',
          isAlternative: dto.isAlternative ?? false,
          totalAmount: totalPlanAmount,
          issuedAt: now,
          expiresAt,
          phases: {
            create: computedPhases.map((cp) => ({
              phaseNumber: cp.phaseNumber,
              name: cp.name,
              status: cp.status,
              orderIndex: cp.orderIndex,
              subtotal: cp.subtotal,
              items: {
                create: cp.items.map((ci) => ({
                  procedureId: ci.procedureId,
                  toothNumber: ci.toothNumber,
                  surface: ci.surface,
                  quantity: ci.quantity,
                  unitPrice: ci.unitPrice,
                  discountPercent: ci.discountPercent,
                  labCost: ci.labCost,
                  finalPrice: ci.finalPrice,
                  status: ci.status,
                  orderIndex: ci.orderIndex,
                })),
              },
            })),
          },
        },
        include: {
          phases: {
            include: {
              items: {
                include: {
                  procedure: true,
                },
              },
            },
          },
        },
      });

      return plan;
    });

    return createdPlan;
  }

  /**
   * Obtiene todos los presupuestos de un paciente con verificación de expiración en tiempo real.
   */
  async findAllByPatient(patientId: string) {
    const plans = await this.prisma.treatmentPlan.findMany({
      where: { patientId, isDeleted: false },
      include: {
        doctor: {
          select: { id: true, firstName: true, lastName: true },
        },
        phases: {
          orderBy: { phaseNumber: 'asc' },
          include: {
            items: {
              orderBy: { orderIndex: 'asc' },
              include: {
                procedure: true,
                appointment: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    return plans.map((plan) => {
      // Regla RN-04: Expiración tras 30 días
      let displayStatus = plan.status;
      if (plan.status === 'EMITIDO' && now > plan.expiresAt) {
        displayStatus = 'VENCIDO';
      }
      return {
        ...plan,
        status: displayStatus,
        isExpired: now > plan.expiresAt,
        daysRemaining: Math.ceil(
          (plan.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        ),
      };
    });
  }

  /**
   * Obtiene un presupuesto por su ID.
   */
  async findOne(id: string) {
    const plan = await this.prisma.treatmentPlan.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: {
          select: { id: true, firstName: true, lastName: true },
        },
        phases: {
          orderBy: { phaseNumber: 'asc' },
          include: {
            items: {
              orderBy: { orderIndex: 'asc' },
              include: {
                procedure: true,
                appointment: true,
              },
            },
          },
        },
      },
    });

    if (!plan || plan.isDeleted) {
      throw new NotFoundException({
        statusCode: 404,
        errorCode: 'ERR_TREATMENT_PLAN_NOT_FOUND',
        detail: 'El presupuesto especificado no existe o ha sido eliminado',
      });
    }

    const now = new Date();
    let displayStatus = plan.status;
    if (plan.status === 'EMITIDO' && now > plan.expiresAt) {
      displayStatus = 'VENCIDO';
    }

    return {
      ...plan,
      status: displayStatus,
      isExpired: now > plan.expiresAt,
      daysRemaining: Math.ceil(
        (plan.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      ),
    };
  }

  /**
   * Actualiza el estado del presupuesto (Aprobado, Rechazado o Vencido).
   * Regla Inviolable RN-04: Si el presupuesto ya expiró, no se permite su aprobación.
   */
  async updatePlanStatus(id: string, dto: UpdatePlanStatusDto) {
    const plan = await this.prisma.treatmentPlan.findUnique({
      where: { id },
    });

    if (!plan || plan.isDeleted) {
      throw new NotFoundException({
        statusCode: 404,
        errorCode: 'ERR_TREATMENT_PLAN_NOT_FOUND',
        detail: 'El presupuesto especificado no existe',
      });
    }

    const now = new Date();

    // Regla Inviolable RN-04: Rechazo si intenta aprobar presupuesto vencido
    if (dto.status === 'APROBADO' && now > plan.expiresAt) {
      throw new BadRequestException({
        statusCode: 400,
        errorCode: 'ERR_TREATMENT_PLAN_EXPIRED',
        title: 'Presupuesto Vencido (Regla RN-04)',
        detail:
          'El presupuesto ha superado su vigencia legal de 30 días calendario y no puede ser aprobado sin revalidación previa de precios y diagnósticos.',
      });
    }

    const updated = await this.prisma.treatmentPlan.update({
      where: { id },
      data: {
        status: dto.status,
        approvedAt: dto.status === 'APROBADO' ? now : undefined,
        rejectionReason: dto.rejectionReason,
      },
      include: {
        phases: {
          include: {
            items: true,
          },
        },
      },
    });

    // Si se aprueba el presupuesto, todos sus ítems pendientes pasan a APROBADO
    if (dto.status === 'APROBADO') {
      await this.prisma.treatmentPlanItem.updateMany({
        where: {
          phase: { planId: id },
          status: 'PENDIENTE',
        },
        data: {
          status: 'APROBADO',
        },
      });
    }

    return updated;
  }

  /**
   * Conversión directa de un ítem aprobado del presupuesto en una cita clínica agendada.
   * Valida vigencia (RN-04) e impide citas duplicadas sobre el mismo ítem.
   */
  async convertItemToAppointment(
    planId: string,
    itemId: string,
    dto: ConvertPlanItemToAppointmentDto,
  ) {
    const plan = await this.prisma.treatmentPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || plan.isDeleted) {
      throw new NotFoundException({
        statusCode: 404,
        errorCode: 'ERR_TREATMENT_PLAN_NOT_FOUND',
        detail: 'El presupuesto no existe',
      });
    }

    const now = new Date();
    // Regla RN-04
    if (now > plan.expiresAt) {
      throw new BadRequestException({
        statusCode: 400,
        errorCode: 'ERR_TREATMENT_PLAN_EXPIRED',
        detail:
          'No se pueden agendar citas de un presupuesto vencido (>30 días - Regla RN-04)',
      });
    }

    const item = await this.prisma.treatmentPlanItem.findUnique({
      where: { id: itemId },
      include: {
        procedure: true,
        phase: true,
      },
    });

    if (!item || item.phase.planId !== planId) {
      throw new NotFoundException({
        statusCode: 404,
        errorCode: 'ERR_PLAN_ITEM_NOT_FOUND',
        detail: 'El ítem de tratamiento no existe en este presupuesto',
      });
    }

    if (item.status === 'AGENDADO' || item.appointmentId) {
      throw new ConflictException({
        statusCode: 409,
        errorCode: 'ERR_ITEM_ALREADY_SCHEDULED',
        detail: 'Este procedimiento del presupuesto ya ha sido agendado previamente',
      });
    }

    // Comprobar colisión en sillón dental
    const start = new Date(dto.startDateTime);
    const end = new Date(dto.endDateTime);

    const collision = await this.prisma.appointment.findFirst({
      where: {
        chairId: dto.chairId,
        isDeleted: false,
        status: { notIn: ['CANCELADO', 'NO_SHOW'] },
        OR: [
          {
            startDateTime: { lte: start },
            endDateTime: { gt: start },
          },
          {
            startDateTime: { lt: end },
            endDateTime: { gte: end },
          },
          {
            startDateTime: { gte: start },
            endDateTime: { lte: end },
          },
        ],
      },
    });

    if (collision) {
      throw new ConflictException({
        statusCode: 409,
        errorCode: 'ERR_CHAIR_TIME_COLLISION',
        detail: 'El sillón dental seleccionado se encuentra ocupado en ese horario',
      });
    }

    // Transacción: crear cita y vincularla al ítem
    const result = await this.prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.create({
        data: {
          branchId: dto.branchId,
          patientId: plan.patientId,
          doctorId: plan.doctorId,
          chairId: dto.chairId,
          startDateTime: start,
          endDateTime: end,
          status: 'PROGRAMADO',
          reason:
            dto.reason ||
            `Presupuesto ${plan.planCode}: ${item.procedure.name}${
              item.toothNumber ? ` (Pieza ${item.toothNumber})` : ''
            }`,
        },
      });

      const updatedItem = await tx.treatmentPlanItem.update({
        where: { id: itemId },
        data: {
          appointmentId: appointment.id,
          status: 'AGENDADO',
        },
      });

      return {
        appointment,
        item: updatedItem,
      };
    });

    return result;
  }
}
