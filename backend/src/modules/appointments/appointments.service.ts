import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { QueryAppointmentDto } from './dto/query-appointment.dto';
import { ChangeAppointmentStatusDto } from './dto/change-status.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Crea una nueva cita validando anti-colisión de sillón y horario del profesional
   */
  async create(dto: CreateAppointmentDto, actorUserId?: string) {
    const start = new Date(dto.startDateTime);
    const end = new Date(dto.endDateTime);

    if (start >= end) {
      throw new BadRequestException({
        errorCode: 'ERR_INVALID_APPOINTMENT_TIME',
        detail: 'La hora de inicio de la cita debe ser estrictamente anterior a la hora de finalización.',
      });
    }

    // 1. Verificación estricta de colisión física en sillón dental
    await this.validateChairAvailability(dto.chairId, start, end);

    // 2. Verificación de disponibilidad del profesional odontólogo
    await this.validateDoctorAvailability(dto.doctorId, start, end);

    // 3. Creación transaccional de la cita
    const appointment = await this.prisma.appointment.create({
      data: {
        branchId: dto.branchId,
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        chairId: dto.chairId,
        startDateTime: start,
        endDateTime: end,
        reason: dto.reason,
        status: 'PROGRAMADO',
      },
      include: {
        patient: true,
        doctor: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        chair: true,
        branch: true,
      },
    });

    // 4. Registro forense de auditoría
    await this.prisma.auditLog.create({
      data: {
        userId: actorUserId,
        action: 'WRITE',
        resource: 'appointments',
        resourceId: appointment.id,
        metadata: {
          chairId: dto.chairId,
          doctorId: dto.doctorId,
          patientId: dto.patientId,
          startDateTime: dto.startDateTime,
          endDateTime: dto.endDateTime,
          status: 'PROGRAMADO',
        },
      },
    });

    // 5. Envío asíncrono de confirmación multicanal al paciente
    if (appointment.patient.phone) {
      this.notificationsService
        .sendAppointmentBookingNotification({
          recipientPhone: appointment.patient.phone,
          recipientEmail: appointment.patient.email || undefined,
          patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
          doctorName: `${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
          appointmentDateTime: appointment.startDateTime,
          chairName: appointment.chair.name,
          branchName: appointment.branch.name,
          appointmentId: appointment.id,
        })
        .catch((err) => this.logger.error(`Error enviando notificación WhatsApp: ${err.message}`));
    }

    return appointment;
  }

  /**
   * Consulta citas con filtros de rango de fechas, sede, sillón y profesional
   */
  async findAll(query: QueryAppointmentDto) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {
      isDeleted: false,
    };

    if (query.branchId) where.branchId = query.branchId;
    if (query.chairId) where.chairId = query.chairId;
    if (query.doctorId) where.doctorId = query.doctorId;
    if (query.patientId) where.patientId = query.patientId;
    if (query.status) where.status = query.status;

    if (query.startDate || query.endDate) {
      where.startDateTime = {};
      if (query.startDate) where.startDateTime.gte = new Date(query.startDate);
      if (query.endDate) where.startDateTime.lte = new Date(query.endDate);
    }

    const [total, appointments] = await Promise.all([
      this.prisma.appointment.count({ where }),
      this.prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDateTime: 'asc' },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              documentType: true,
              documentNumber: true,
              phone: true,
            },
          },
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          chair: {
            select: {
              id: true,
              code: true,
              name: true,
              description: true,
            },
          },
        },
      }),
    ]);

    // Calcular tiempo de espera dinámico si están en sala
    const now = Date.now();
    const enrichedAppointments = appointments.map((apt) => {
      let dynamicWaitingMinutes = apt.waitingMinutes;
      if (apt.status === 'EN_SALA') {
        const waitingSince = apt.updatedAt.getTime();
        dynamicWaitingMinutes = Math.max(0, Math.floor((now - waitingSince) / 60000));
      }
      return {
        ...apt,
        waitingMinutes: dynamicWaitingMinutes,
      };
    });

    return {
      data: enrichedAppointments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtiene una cita por su identificador UUID
   */
  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
        chair: true,
        branch: true,
      },
    });

    if (!appointment || appointment.isDeleted) {
      throw new NotFoundException({
        errorCode: 'ERR_APPOINTMENT_NOT_FOUND',
        detail: `No se encontró la cita con ID ${id}`,
      });
    }

    return appointment;
  }

  /**
   * Actualiza o reprograma una cita con chequeo de colisión
   */
  async update(id: string, dto: UpdateAppointmentDto, actorUserId?: string) {
    const current = await this.findOne(id);

    const targetChairId = dto.chairId || current.chairId;
    const targetDoctorId = dto.doctorId || current.doctorId;
    const targetStart = dto.startDateTime ? new Date(dto.startDateTime) : current.startDateTime;
    const targetEnd = dto.endDateTime ? new Date(dto.endDateTime) : current.endDateTime;

    if (targetStart >= targetEnd) {
      throw new BadRequestException({
        errorCode: 'ERR_INVALID_APPOINTMENT_TIME',
        detail: 'La hora de inicio de la cita debe ser estrictamente anterior a la hora de finalización.',
      });
    }

    // Verificar colisión solo si cambió de horario o sillón
    if (dto.chairId || dto.startDateTime || dto.endDateTime) {
      await this.validateChairAvailability(targetChairId, targetStart, targetEnd, id);
    }

    // Verificar colisión solo si cambió de horario o doctor
    if (dto.doctorId || dto.startDateTime || dto.endDateTime) {
      await this.validateDoctorAvailability(targetDoctorId, targetStart, targetEnd, id);
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        chairId: dto.chairId,
        doctorId: dto.doctorId,
        startDateTime: dto.startDateTime ? targetStart : undefined,
        endDateTime: dto.endDateTime ? targetEnd : undefined,
        status: dto.status,
        reason: dto.reason,
        waitingMinutes: dto.waitingMinutes,
      },
      include: {
        patient: true,
        doctor: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        chair: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: actorUserId,
        action: 'UPDATE',
        resource: 'appointments',
        resourceId: id,
        metadata: {
          oldData: {
            chairId: current.chairId,
            startDateTime: current.startDateTime.toISOString(),
            endDateTime: current.endDateTime.toISOString(),
            status: current.status,
          },
          newData: { ...dto } as any,
        },
      },
    });

    return updated;
  }

  /**
   * Cambio rápido de estado del turno (Programado -> Confirmado -> En Sala -> En Atención -> Atendido / Cancelado / No-Show)
   */
  async changeStatus(id: string, dto: ChangeAppointmentStatusDto, actorUserId?: string) {
    const current = await this.findOne(id);

    let updatedWaitingMinutes = current.waitingMinutes;
    if (dto.status === 'EN_ATENCION' && current.status === 'EN_SALA') {
      const waitTimeMs = Date.now() - current.updatedAt.getTime();
      updatedWaitingMinutes = Math.max(0, Math.floor(waitTimeMs / 60000));
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: dto.status,
        waitingMinutes: dto.waitingMinutes !== undefined ? dto.waitingMinutes : updatedWaitingMinutes,
      },
      include: {
        patient: true,
        doctor: { select: { firstName: true, lastName: true } },
        chair: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: actorUserId,
        action: 'UPDATE',
        resource: 'appointments',
        resourceId: id,
        metadata: {
          oldStatus: current.status,
          newStatus: dto.status,
          waitingMinutes: updated.waitingMinutes,
        },
      },
    });

    return updated;
  }

  /**
   * Eliminación lógica (Soft delete) liberando el espacio en el sillón
   */
  async remove(id: string, actorUserId?: string) {
    const current = await this.findOne(id);

    await this.prisma.appointment.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: actorUserId,
        action: 'SOFT_DELETE',
        resource: 'appointments',
        resourceId: id,
        metadata: {
          chairId: current.chairId,
          status: current.status,
        },
      },
    });

    return { success: true, message: 'Cita eliminada correctamente del cronograma.' };
  }

  /**
   * Resumen en tiempo real del estado de los sillones físicos de una sede
   */
  async getChairsLiveStatus(branchId: string) {
    const chairs = await this.prisma.dentalChair.findMany({
      where: { branchId, isDeleted: false },
      orderBy: { code: 'asc' },
    });

    const now = new Date();

    const chairsWithStatus = await Promise.all(
      chairs.map(async (chair) => {
        const activeAppointment = await this.prisma.appointment.findFirst({
          where: {
            chairId: chair.id,
            isDeleted: false,
            status: { in: ['EN_ATENCION', 'EN_SALA', 'CONFIRMADO', 'PROGRAMADO'] },
            startDateTime: { lte: now },
            endDateTime: { gte: now },
          },
          include: {
            patient: { select: { firstName: true, lastName: true } },
            doctor: { select: { firstName: true, lastName: true } },
          },
        });

        return {
          ...chair,
          occupancyState: activeAppointment
            ? activeAppointment.status === 'EN_ATENCION'
              ? 'OCUPADO'
              : 'RESERVADO'
            : chair.isActive
            ? 'DISPONIBLE'
            : 'MANTENIMIENTO',
          currentAppointment: activeAppointment || null,
        };
      }),
    );

    return chairsWithStatus;
  }

  /**
   * Valida colisión física de sillón dental
   */
  private async validateChairAvailability(
    chairId: string,
    start: Date,
    end: Date,
    excludeAppointmentId?: string,
  ) {
    const collision = await this.prisma.appointment.findFirst({
      where: {
        id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
        chairId,
        isDeleted: false,
        status: { notIn: ['CANCELADO', 'NO_SHOW'] },
        AND: [
          { startDateTime: { lt: end } },
          { endDateTime: { gt: start } },
        ],
      },
      include: {
        chair: true,
        patient: { select: { firstName: true, lastName: true } },
      },
    });

    if (collision) {
      const collisionStart = collision.startDateTime.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const collisionEnd = collision.endDateTime.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });

      throw new ConflictException({
        errorCode: 'ERR_CHAIR_COLLISION',
        detail: `El sillón '${collision.chair.name}' ya tiene una cita asignada de ${collisionStart} a ${collisionEnd} para ${collision.patient.firstName} ${collision.patient.lastName}.`,
      });
    }
  }

  /**
   * Valida que el profesional odontólogo no tenga dos citas simultáneas
   */
  private async validateDoctorAvailability(
    doctorId: string,
    start: Date,
    end: Date,
    excludeAppointmentId?: string,
  ) {
    const collision = await this.prisma.appointment.findFirst({
      where: {
        id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
        doctorId,
        isDeleted: false,
        status: { notIn: ['CANCELADO', 'NO_SHOW'] },
        AND: [
          { startDateTime: { lt: end } },
          { endDateTime: { gt: start } },
        ],
      },
      include: {
        chair: true,
        patient: { select: { firstName: true, lastName: true } },
      },
    });

    if (collision) {
      const collisionStart = collision.startDateTime.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const collisionEnd = collision.endDateTime.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });

      throw new ConflictException({
        errorCode: 'ERR_DOCTOR_COLLISION',
        detail: `El odontólogo ya tiene una cita asignada de ${collisionStart} a ${collisionEnd} en el sillón '${collision.chair.name}'.`,
      });
    }
  }
}
