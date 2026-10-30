import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface NotificationPayload {
  recipientPhone: string;
  recipientEmail?: string;
  patientName: string;
  doctorName: string;
  appointmentDateTime: Date;
  chairName: string;
  branchName: string;
  appointmentId: string;
}

export type NotificationType = 'CONFIRMATION' | 'REMINDER_48H' | 'REMINDER_24H' | 'CANCELLATION';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Envía confirmación transaccional inmediata tras agendar la cita vía WhatsApp / SMS / Email
   */
  async sendAppointmentBookingNotification(payload: NotificationPayload): Promise<boolean> {
    const formattedDate = payload.appointmentDateTime.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = payload.appointmentDateTime.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const message = `Estimado(a) ${payload.patientName}, su cita odontológica ha sido programada para el ${formattedDate} a las ${formattedTime} con el Dr.(a) ${payload.doctorName} en ${payload.branchName} (${payload.chairName}). Responda '1' para Confirmar o '2' para Cancelar.`;

    this.logger.log(`[WHATSAPP-DISPATCH] Para: ${payload.recipientPhone} | Mensaje: ${message}`);
    // En producción se conecta a la API oficial de Meta Cloud WhatsApp Business / Twilio
    return true;
  }

  /**
   * Envía recordatorio automático (48h o 24h antes)
   */
  async sendReminderNotification(
    payload: NotificationPayload,
    type: 'REMINDER_48H' | 'REMINDER_24H',
  ): Promise<boolean> {
    const formattedTime = payload.appointmentDateTime.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const timeframe = type === 'REMINDER_48H' ? 'en 48 horas' : 'mañana';

    const message = `Recordatorio SIGO-Dental: ${payload.patientName}, su cita es ${timeframe} a las ${formattedTime} con el Dr.(a) ${payload.doctorName}. Por favor responda '1' para Confirmar o '2' para Solicitar Reprogramación.`;

    this.logger.log(`[REMINDER-DISPATCH] Tipo: ${type} | Para: ${payload.recipientPhone} | Mensaje: ${message}`);
    return true;
  }

  /**
   * Procesa la respuesta interactiva del paciente recibida vía Webhook (1 = CONFIRMADO, 2 = CANCELADO)
   */
  async processInteractiveResponse(
    phone: string,
    responseOption: string,
  ): Promise<{ success: boolean; newStatus?: string; message: string }> {
    // Normalizar número telefónico
    const cleanPhone = phone.replace(/\D/g, '');

    // Buscar cita pendiente más próxima asociada a ese teléfono
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        isDeleted: false,
        status: { in: ['PROGRAMADO', 'CONFIRMADO'] },
        patient: {
          phone: { contains: cleanPhone.slice(-8) },
        },
        startDateTime: { gte: new Date() },
      },
      orderBy: { startDateTime: 'asc' },
      include: { patient: true },
    });

    if (!appointment) {
      return {
        success: false,
        message: 'No se encontró ninguna cita activa pendiente vinculada a este número.',
      };
    }

    if (responseOption === '1') {
      await this.prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: 'CONFIRMADO' },
      });
      this.logger.log(`[WEBHOOK] Cita ${appointment.id} confirmada automáticamente por paciente ${appointment.patient.firstName}`);
      return {
        success: true,
        newStatus: 'CONFIRMADO',
        message: `Gracias ${appointment.patient.firstName}, su cita ha sido CONFIRMADA con éxito.`,
      };
    } else if (responseOption === '2') {
      await this.prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: 'CANCELADO' },
      });
      this.logger.log(`[WEBHOOK] Cita ${appointment.id} cancelada automáticamente por paciente ${appointment.patient.firstName}`);
      return {
        success: true,
        newStatus: 'CANCELADO',
        message: `Su cita ha sido CANCELADA. Nuestro equipo de recepción se pondrá en contacto para reprogramarla.`,
      };
    }

    return {
      success: false,
      message: 'Opción no válida. Por favor responda 1 para Confirmar o 2 para Cancelar.',
    };
  }
}

